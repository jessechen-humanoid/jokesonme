-- 0005 users.last_login_at（task 4.3）：null = 這列是 Bot 從群組自動建立、本人還沒登入過平台。
alter table users add column last_login_at timestamptz;
insert into _migrations (name) values ('0005_users_login') on conflict do nothing;
