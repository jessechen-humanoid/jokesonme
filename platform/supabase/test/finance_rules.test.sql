-- 本機資料庫測試：0013 財務規則（寫入＋重算同交易、冪等匯入、排除成員正規化、專案參與成員）與 0019 稅務預留依年度分開
\set ON_ERROR_STOP on
begin;
set local app.actor = 'migration';
insert into shows (id, name, type) values ('00000000-0000-0000-0000-0000000000c1', '規則測試專場', 'special');
commit;

-- 手動新增收入 → 自動產生 3% 預留；新增退款 → 預留跟著減少；全在函式內完成
do $$
begin
  perform set_config('app.actor', 'user:U_rules', true);
  perform finance_save_transaction(null, '00000000-0000-0000-0000-0000000000c1',
    '{"category":"演出票房","notes":"票","amount":10000,"excluded_members":["柏文","傑哥","傑哥"],"date":"2026-10-01"}'::jsonb);
end $$;

do $$
declare
  v_id uuid;
  v_reserve numeric;
  v_excluded text[];
begin
  perform set_config('app.actor', 'user:U_rules', true);
  select id, excluded_members into v_id, v_excluded from transactions where show_id = '00000000-0000-0000-0000-0000000000c1' and category = '演出票房' and deleted_at is null;
  if v_excluded <> array['傑哥', '柏文'] then raise exception 'FAIL: excluded_members 沒有正規化：%', v_excluded; end if;
  select amount into v_reserve from transactions where show_id = '00000000-0000-0000-0000-0000000000c1' and auto_generated and deleted_at is null;
  if v_reserve <> -300 then raise exception 'FAIL: 預留應為 -300，實際 %', v_reserve; end if;

  perform finance_save_transaction(null, '00000000-0000-0000-0000-0000000000c1',
    '{"category":"退款","notes":"退","amount":-2000,"excluded_members":["傑哥","柏文"],"date":"2026-10-05"}'::jsonb);
  select amount into v_reserve from transactions where show_id = '00000000-0000-0000-0000-0000000000c1' and auto_generated and deleted_at is null;
  if v_reserve <> -240 then raise exception 'FAIL: 退款後預留應為 -240，實際 %', v_reserve; end if;

  -- 平台手續費不扣
  perform finance_save_transaction(null, '00000000-0000-0000-0000-0000000000c1',
    '{"category":"平台手續","notes":"費","amount":-350,"excluded_members":[],"date":"2026-10-05"}'::jsonb);
  select amount into v_reserve from transactions where show_id = '00000000-0000-0000-0000-0000000000c1' and auto_generated and deleted_at is null;
  if v_reserve <> -240 then raise exception 'FAIL: 手續費不該影響預留，實際 %', v_reserve; end if;

  -- 非成員名字被拒絕
  begin
    perform finance_save_transaction(null, '00000000-0000-0000-0000-0000000000c1',
      '{"category":"演出票房","notes":"x","amount":1,"excluded_members":["某人"],"date":"2026-10-05"}'::jsonb);
    raise exception 'FAIL: 非成員名字被接受';
  exception when check_violation then null; end;
end $$;

-- 冪等匯入：同 oen_key 第二次略過；受影響專案重算
do $$
declare
  r jsonb;
  v_rows jsonb := '[
    {"show_id":"00000000-0000-0000-0000-0000000000c1","category":"演出票房","notes":"a","amount":1000,"date":"2026-10-10","excluded_members":["傑哥","柏文"],"recorded_by":"應援匯入","oen_key":"oen:C1:income"},
    {"show_id":"00000000-0000-0000-0000-0000000000c1","category":"平台手續","notes":"a","amount":-35,"date":"2026-10-10","excluded_members":[],"recorded_by":"應援匯入","oen_key":"oen:C1:fee"}
  ]'::jsonb;
  v_reserve numeric;
begin
  perform set_config('app.actor', 'user:U_rules', true);
  r := finance_import_transactions(v_rows);
  if (r->>'inserted')::int <> 2 or (r->>'skipped')::int <> 0 then raise exception 'FAIL: 第一次匯入 %', r; end if;
  r := finance_import_transactions(v_rows);
  if (r->>'inserted')::int <> 0 or (r->>'skipped')::int <> 2 then raise exception 'FAIL: 第二次匯入應全部略過 %', r; end if;
  if (select count(*) from transactions where oen_key is not null and deleted_at is null) <> 2 then raise exception 'FAIL: 重複匯入寫入了'; end if;
  select amount into v_reserve from transactions where show_id = '00000000-0000-0000-0000-0000000000c1' and auto_generated and deleted_at is null;
  if v_reserve <> -270 then raise exception 'FAIL: 匯入後預留應為 (10000-2000+1000)×3%% = -270，實際 %', v_reserve; end if;
end $$;

-- 專案參與成員：設定並套用到現有列（手續費不動），預留重新分組
do $$
declare
  r jsonb;
  n int;
begin
  perform set_config('app.actor', 'user:U_rules', true);
  r := finance_set_show_participants('00000000-0000-0000-0000-0000000000c1', array['巧達', '芭樂', '又又', '兔子', '大弋', '竹節蟲'], true);
  if (r->>'updated')::int <> 3 then raise exception 'FAIL: 應更新 3 筆（票房、退款、匯入票房），實際 %', r; end if;
  select count(*) into n from transactions where show_id = '00000000-0000-0000-0000-0000000000c1' and category = '平台手續' and excluded_members = '{}' and deleted_at is null;
  if n <> 2 then raise exception 'FAIL: 平台手續費應維持全員共同'; end if;
  select count(*) into n from transactions where show_id = '00000000-0000-0000-0000-0000000000c1' and auto_generated and deleted_at is null;
  if n <> 1 then raise exception 'FAIL: 應只剩一筆自動預留，實際 %', n; end if;
  if (select excluded_members from transactions where show_id = '00000000-0000-0000-0000-0000000000c1' and auto_generated and deleted_at is null)
     <> array['巧達', '芭樂', '又又', '兔子', '大弋', '竹節蟲'] then
    raise exception 'FAIL: 預留沒有換到新分組';
  end if;
  if (select default_excluded_members from shows where id = '00000000-0000-0000-0000-0000000000c1') <> array['巧達', '芭樂', '又又', '兔子', '大弋', '竹節蟲'] then
    raise exception 'FAIL: 專案設定沒存';
  end if;
end $$;

-- 刪除收入 → 預留跟著調整；自動列不能刪
do $$
declare
  v_id uuid;
  v_reserve numeric;
begin
  perform set_config('app.actor', 'user:U_rules', true);
  select id into v_id from transactions where show_id = '00000000-0000-0000-0000-0000000000c1' and category = '退款' and deleted_at is null;
  perform finance_delete_transaction(v_id, 'U_rules');
  select amount into v_reserve from transactions where show_id = '00000000-0000-0000-0000-0000000000c1' and auto_generated and deleted_at is null;
  if v_reserve <> -330 then raise exception 'FAIL: 刪退款後預留應為 11000×3%% = -330，實際 %', v_reserve; end if;
  select id into v_id from transactions where show_id = '00000000-0000-0000-0000-0000000000c1' and auto_generated and deleted_at is null;
  begin
    perform finance_delete_transaction(v_id, 'U_rules');
    raise exception 'FAIL: 自動預留被刪了';
  exception when raise_exception then
    if sqlerrm like 'FAIL%' then raise; end if;
  end;
end $$;

-- 0019 稅務預留依年度分開（spec tax-reserve-calculation「Automatic tax reserve expense per show and allocation group」的跨年範例）：
-- 某年度的預留只看該年度的收入與退款；其他年度的收支變動不會改到它
begin;
set local app.actor = 'migration';
insert into shows (id, name, type) values ('00000000-0000-0000-0000-0000000000c2', '跨年測試科目', 'other');
commit;

do $$
declare
  c2 constant uuid := '00000000-0000-0000-0000-0000000000c2';
  v_2026_id uuid;
  v_income_2027 uuid;
  v_move uuid;
  n int;
  r record;
begin
  perform set_config('app.actor', 'user:U_rules', true);

  -- 只有 2026 的收入 → 一筆 2026 的預留
  perform finance_save_transaction(null, c2, '{"category":"付費會員","notes":"12 月","amount":100000,"excluded_members":[],"date":"2026-12-20"}'::jsonb);
  select count(*) into n from transactions where show_id = c2 and auto_generated and deleted_at is null;
  if n <> 1 then raise exception 'FAIL: 只有 2026 收入時應有 1 筆預留，實際 %', n; end if;
  select id, amount, date into r from transactions where show_id = c2 and auto_generated and deleted_at is null;
  if r.amount <> -3000 or r.date <> date '2026-12-20' then raise exception 'FAIL: 2026 預留應為 -3000（2026-12-20），實際 %（%）', r.amount, r.date; end if;
  v_2026_id := r.id;

  -- 2027 再進一筆收入 → 2026 那筆不動，另外多一筆 2027 的預留
  v_income_2027 := finance_save_transaction(null, c2, '{"category":"付費會員","notes":"1 月","amount":10000,"excluded_members":[],"date":"2027-01-05"}'::jsonb);
  select amount, date into r from transactions where id = v_2026_id and deleted_at is null;
  if not found or r.amount <> -3000 or r.date <> date '2026-12-20' then
    raise exception 'FAIL: 2027 進收入後，2026 的預留被改動或合併了（應維持 -3000、2026-12-20），實際 %（%）', r.amount, r.date;
  end if;
  select count(*) into n from transactions where show_id = c2 and auto_generated and deleted_at is null and date = date '2027-01-05' and amount = -300;
  if n <> 1 then raise exception 'FAIL: 2027 應另有一筆 -300（2027-01-05）的預留'; end if;

  -- 2027 的退款只扣 2027 的基礎：(10000 − 4000) × 3% = 180，日期跟著 2027 最新一筆
  perform finance_save_transaction(null, c2, '{"category":"退款","notes":"退","amount":-4000,"excluded_members":[],"date":"2027-02-01"}'::jsonb);
  select count(*) into n from transactions where show_id = c2 and auto_generated and deleted_at is null and date = date '2027-02-01' and amount = -180;
  if n <> 1 then raise exception 'FAIL: 2027 退款後，2027 的預留應為 -180（2027-02-01）'; end if;
  if (select amount from transactions where id = v_2026_id and deleted_at is null) is distinct from -3000 then raise exception 'FAIL: 2027 的退款改到了 2026 的預留'; end if;

  -- 2027 只剩退款：基礎以 0 為下限，不產生 2027 的預留，也不回頭扣 2026
  perform finance_delete_transaction(v_income_2027, 'U_rules');
  select count(*) into n from transactions where show_id = c2 and auto_generated and deleted_at is null;
  if n <> 1 then raise exception 'FAIL: 2027 只有退款時應只剩 2026 那一筆預留，實際 % 筆', n; end if;
  select amount, date into r from transactions where id = v_2026_id and deleted_at is null;
  if not found or r.amount <> -3000 or r.date <> date '2026-12-20' then raise exception 'FAIL: 2027 只有退款時，2026 的預留應維持 -3000（2026-12-20）'; end if;

  -- 改日期跨年：兩個年度都重算（另一個分組，免得跟上面混在一起）
  v_move := finance_save_transaction(null, c2, '{"category":"其他收入","notes":"搬","amount":10000,"excluded_members":["傑哥"],"date":"2026-12-28"}'::jsonb);
  select count(*) into n from transactions where show_id = c2 and auto_generated and deleted_at is null and excluded_members = array['傑哥'] and date = date '2026-12-28' and amount = -300;
  if n <> 1 then raise exception 'FAIL: 搬日期前應有一筆 2026 的 -300'; end if;
  perform finance_save_transaction(v_move, null, '{"category":"其他收入","notes":"搬","amount":10000,"excluded_members":["傑哥"],"date":"2027-01-03"}'::jsonb);
  select count(*) into n from transactions where show_id = c2 and auto_generated and deleted_at is null and excluded_members = array['傑哥'];
  if n <> 1 then raise exception 'FAIL: 搬日期後這個分組應只有一筆預留，實際 %', n; end if;
  if not exists (select 1 from transactions where show_id = c2 and auto_generated and deleted_at is null and excluded_members = array['傑哥'] and date = date '2027-01-03' and amount = -300) then
    raise exception 'FAIL: 搬日期後預留應落在 2027-01-03';
  end if;
  if (select amount from transactions where id = v_2026_id and deleted_at is null) is distinct from -3000 then raise exception 'FAIL: 別的分組搬日期改到了共同分組 2026 的預留'; end if;
end $$;

-- 唯一索引確實存在（測試庫沒有重複資料）
do $$
begin
  if not exists (select 1 from pg_indexes where indexname = 'transactions_auto_reserve_uq' and indexdef ilike '%excluded_members%' and indexdef ilike '%year%') then
    raise exception 'FAIL: transactions_auto_reserve_uq 不存在，或沒有把年度算進去（0019）';
  end if;
  if not exists (select 1 from pg_indexes where indexname = 'transactions_oen_key_uq') then raise exception 'FAIL: 缺 transactions_oen_key_uq'; end if;
end $$;
\echo 'FINANCE RULES TESTS PASSED'
