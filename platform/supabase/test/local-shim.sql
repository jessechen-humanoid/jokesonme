-- 只給本機測試用：模擬 Supabase 內建的三個角色。正式 Supabase 已經有，不要對正式庫跑。
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;
-- 模擬 Supabase 的預設權限：新表自動給 service_role 全部權限（含 TRUNCATE），讓本機測試能抓到正式庫才有的問題
alter default privileges in schema public grant all on tables to service_role;
