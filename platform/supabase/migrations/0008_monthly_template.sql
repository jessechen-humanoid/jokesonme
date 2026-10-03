-- 0008 月號模板草稿（task 9.1）：以舊 Checklist 模板 23 項為底，補上「演出前／後幾天」。
-- default_assignee 存成員名字（傑哥、大弋…），產生待辦時再對應到已核准的帳號；對不到就是未認領。
-- 內容是草稿，Jesse 在「月號模板」頁確認或修改後才正式使用。
comment on column show_template_items.default_assignee is '成員名字（傑哥、柏文…）；產生待辦時對應到 users.member_name';

do $$
declare tid uuid;
begin
  perform set_config('app.actor', 'migration', true);
  insert into show_templates (show_type) values ('monthly') on conflict (show_type) do nothing;
  select id into tid from show_templates where show_type = 'monthly';
  if exists (select 1 from show_template_items where template_id = tid) then return; end if;
  insert into show_template_items (template_id, title, offset_days, default_assignee, sort_order) values
    (tid, '確認本月期間限定作品邀約與內容', -21, null, 10),
    (tid, '確認本月演出組合與段子長度', -14, null, 20),
    (tid, '本月期間限定組合明信片繪製', -14, '柏文', 30),
    (tid, '確認企劃 1', -10, null, 40),
    (tid, '確認企劃 2', -10, null, 50),
    (tid, '確認企劃 3', -10, null, 60),
    (tid, '明信片送印', -10, null, 70),
    (tid, '麥克風租借確認', -7, '大弋', 80),
    (tid, 'DV 租借確認（記憶卡、腳本、電池）', -7, '芭樂', 90),
    (tid, '燈音控人員確認', -7, '大弋', 100),
    (tid, '拍攝人員確認', -7, '兔子', 110),
    (tid, '周邊商品人員確認', -7, null, 120),
    (tid, 'Rundown 製作', -5, '大弋', 130),
    (tid, '演出簡報製作', -3, '傑哥', 140),
    (tid, '簡報放所有成員的演出宣傳', -3, '傑哥', 150),
    (tid, '公關票確認', -3, '傑哥', 160),
    (tid, '明信片取件', -3, null, 170),
    (tid, '標記所有音樂／音效 cue 點', -2, '大弋', 180),
    (tid, '演後問卷製作', -2, '傑哥', 190),
    (tid, '影片檔案提供給剪輯師', 2, null, 200),
    (tid, '企劃 1 剪輯說明', 3, null, 210),
    (tid, '企劃 2 剪輯說明', 3, null, 220),
    (tid, '企劃 3 剪輯說明', 3, null, 230);
end $$;

insert into _migrations (name) values ('0008_monthly_template') on conflict do nothing;
