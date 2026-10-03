-- 0009 演出表加「種類」（show-centric-planning；spec show-management「Show kind」）
-- performance = 演出／活動；ledger = 只在財務用的收支分類（會員、頻道、周邊、共同基金…）。
-- 企劃面（待辦、靈感、演出頁、LINE 按鈕）只列 performance；財務頁照舊列全部。
-- 只用精確名稱標記 2026-10-03 正式庫的 7 筆收支分類；之後平台建立的一律是 performance。
alter table shows add column kind text not null default 'performance'
  check (kind in ('performance', 'ledger'));

do $$
begin
  perform set_config('app.actor', 'migration', true);
  update shows set kind = 'ledger' where name in (
    '看我笑話會員',
    '會員與其他收支',
    '共同基金支出',
    '看我笑話頻道',
    '看我笑話商演 / 業配合作',
    '看我笑話小卡盲包 大阪和服篇',
    '看我笑話小卡盲包 現代問題研究中心篇'
  );
end $$;

-- status 只允許 active／archived（Archive a show）
update shows set status = 'active' where status not in ('active', 'archived');
alter table shows add constraint shows_status_check check (status in ('active', 'archived'));

insert into _migrations (name) values ('0009_show_kind') on conflict do nothing;
