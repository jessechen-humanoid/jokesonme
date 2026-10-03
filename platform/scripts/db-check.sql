-- 正式庫唯讀檢查（task 2.3 驗證）：不寫任何資料。
select 'migrations: ' || string_agg(name, ', ' order by name) from _migrations;
select 'tables missing audit/RLS: ' || coalesce(string_agg(c.relname, ', '), '無')
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public' and c.relkind = 'r' and c.relname not in ('audit_log', '_migrations')
   and (not c.relrowsecurity or (c.relname <> 'line_messages' and not exists (select 1 from pg_trigger t where t.tgrelid = c.oid and t.tgname = 'audit_row')));
select 'anon 可讀的表: ' || coalesce(string_agg(table_name, ', '), '無')
  from information_schema.role_table_grants where grantee = 'anon' and table_schema = 'public' and privilege_type = 'SELECT';
select 'service_role 對 audit_log 的權限: ' || string_agg(privilege_type, ', ' order by privilege_type)
  from information_schema.role_table_grants where grantee = 'service_role' and table_name = 'audit_log';
select '有 TRUNCATE 權限的應用角色: ' || coalesce(string_agg(distinct grantee || '→' || table_name, ', '), '無')
  from information_schema.role_table_grants where table_schema = 'public' and privilege_type = 'TRUNCATE' and grantee in ('anon', 'authenticated', 'service_role');
