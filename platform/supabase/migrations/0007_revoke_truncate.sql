-- 0007 收回 TRUNCATE（2026-10-03 在正式庫發現 Supabase 預設會給 service_role TRUNCATE）。
-- TRUNCATE 不觸發逐列 trigger：會跳過操作紀錄，也會繞過財務資料「只能軟刪除」。任何應用角色都不該有。
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('revoke truncate on %I from public, anon, authenticated, service_role', t);
  end loop;
end $$;
-- 財務資料只能軟刪除：明確收回 DELETE，不依賴預設權限
revoke delete on transactions, settlements, advance_repayments from public, anon, authenticated, service_role;

-- 之後新建的表也不給
alter default privileges in schema public revoke truncate on tables from public, anon, authenticated, service_role;

insert into _migrations (name) values ('0007_revoke_truncate') on conflict do nothing;
