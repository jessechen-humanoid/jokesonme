-- 0019 稅務預留依年度分開（change tax-reserve-per-year；Jesse 2026-11-12 同意）
-- 原本（0013）每個專案每個分組只有一筆自動預留，日期跟著該組最新一筆收入走。跨年之後同一科目再進收入，
-- 那筆預留會連金額帶日期搬到新的一年：去年已經分完的數字被改掉，兩年的預留全算在新年度。
-- 現在改成「專案 × 排除成員分組 × 台北日曆年」各一筆：某年度的預留只看該年度的收入與退款。
--   - 年度 = transactions.date 的年份（date 是台北的民用日期，與 lib/finance/calc.ts 的 yearOf 相同）
--   - 基礎 = 該年度該組的收入 − 退款（最低 0）；預留 = round(基礎 × 3%)；日期 = 該年度該組最新一筆計入列的日期
--   - 跨年退款扣在退款當年：當年沒有收入可扣時基礎為 0，不產生負的預留，也不回頭改前一年
-- 規則必須與 lib/finance/calc.ts 的 taxReservesForShow 一致（scripts/check-tax-reserves.mts 會拿兩邊比對）。
-- 不更新、不刪除任何既有資料列：現有資料全在 2026 年，新規則算出來的結果與現況相同。

create or replace function finance_sync_tax_reserve(p_show_id uuid) returns void
language plpgsql as $$
declare
  v_show_name text;
  r record;
begin
  perform pg_advisory_xact_lock(hashtext('finance_tax_reserve'), hashtext(p_show_id::text));
  select name into v_show_name from shows where id = p_show_id;
  if v_show_name is null then
    raise exception 'finance_sync_tax_reserve: 專案 % 不存在', p_show_id;
  end if;

  for r in
    with counted as (
      -- 算進 3% 基礎的列：所有正數收入，加上退款（「退款」分類、或收入分類的負數列）。平台手續費等支出不扣。
      select excluded_members, extract(year from date)::int as yr, amount, date
        from transactions
       where show_id = p_show_id and deleted_at is null
         and not (auto_generated and category = '稅務預留')
         and (amount > 0 or category in ('退款', '演出票房', '付費會員', '商演合作', '周邊商品', '品牌贊助', '其他收入'))
    ), grouped as (
      select excluded_members, yr, round(greatest(sum(amount), 0) * 0.03) as reserve, max(date) as latest
        from counted group by excluded_members, yr
    ), desired as (
      select excluded_members, yr, -reserve as amount, latest as date
        from grouped where reserve > 0 and v_show_name <> '共同基金支出'
    ), existing as (
      -- 現有的自動預留以「分組＋自身日期的年度」對應；預留的日期永遠取自同年度的計入列，所以對應穩定
      select id, excluded_members, extract(year from date)::int as yr, amount, date,
             row_number() over (partition by excluded_members, extract(year from date)::int order by sort_order) as rn
        from transactions
       where show_id = p_show_id and deleted_at is null and auto_generated and category = '稅務預留'
    )
    select coalesce(d.excluded_members, e.excluded_members) as excluded_members,
           d.amount as want_amount, d.date as want_date,
           e.id as existing_id, e.amount as have_amount, e.date as have_date, e.rn
      from desired d full join existing e on e.excluded_members = d.excluded_members and e.yr = d.yr
     -- 先處理要軟刪除的列，再新增或更新，才不會在過程中撞到「每專案每分組每年度一筆」的唯一索引
     order by (d.amount is null or e.rn > 1) desc
  loop
    if r.existing_id is null then
      insert into transactions (show_id, category, notes, amount, advanced_by, excluded_members, date, recorded_by, paid_by_fund, auto_generated)
      values (p_show_id, '稅務預留', '系統自動：營所稅預留 3%', r.want_amount, null, r.excluded_members, r.want_date, '系統', false, true);
    elsif r.want_amount is null or r.rn > 1 then
      -- 這組這一年不再需要預留，或同組同年多出來的重複列：軟刪除
      update transactions set deleted_at = now(), deleted_by = '系統' where id = r.existing_id;
    elsif r.have_amount <> r.want_amount or r.have_date <> r.want_date then
      update transactions set amount = r.want_amount, date = r.want_date where id = r.existing_id;
    end if;
  end loop;
end $$;

-- 函式只給後端（service_role）呼叫（create or replace 會保留原本的權限，這裡再明確設一次）
revoke all on function finance_sync_tax_reserve(uuid) from public, anon, authenticated;
grant execute on function finance_sync_tax_reserve(uuid) to service_role;

-- 自動稅務預留：每專案每分組「每年度」最多一筆。
-- 現有資料若已有同專案同分組同年度的重複列，建索引會失敗、整支 migration 不會記為已套用；
-- 請先用 finance_sync_tax_reserve 逐專案整理後再重跑。
drop index if exists transactions_auto_reserve_uq;
create unique index transactions_auto_reserve_uq on transactions (show_id, excluded_members, (extract(year from date)::int))
  where auto_generated and category = '稅務預留' and deleted_at is null;

insert into _migrations (name) values ('0019_tax_reserve_per_year') on conflict do nothing;
