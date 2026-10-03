-- 本機資料庫測試：audit-log 與核心資料表（task 2.2、2.3）。任何斷言失敗都會 raise，psql 以非 0 結束。
\set ON_ERROR_STOP on

-- 1. 沒有 actor 的寫入要被拒絕
do $$
begin
  begin
    insert into shows (name) values ('無 actor 測試');
    raise exception 'FAIL: insert without actor succeeded';
  exception when others then
    if sqlerrm not like 'audit: missing actor%' then raise; end if;
  end;
end $$;

-- 2. app.actor 有設 → 寫入成功並留下 audit 列（含改前改後）
begin;
set local app.actor = 'migration';
insert into shows (name, type) values ('第 2 季 10 月號', 'other');
update shows set name = '第 2 季 10 月號（改）' where name = '第 2 季 10 月號';
commit;
do $$
declare n int;
begin
  select count(*) into n from audit_log where table_name = 'shows' and actor = 'migration' and op in ('INSERT','UPDATE');
  if n <> 2 then raise exception 'FAIL: expected 2 audit rows for shows, got %', n; end if;
  select count(*) into n from audit_log
   where table_name = 'shows' and op = 'UPDATE'
     and old_values ->> 'name' = '第 2 季 10 月號' and new_values ->> 'name' = '第 2 季 10 月號（改）';
  if n <> 1 then raise exception 'FAIL: update audit row missing old/new values'; end if;
end $$;

-- 3. actor 由 request.headers 的 x-actor 帶入（模擬 PostgREST）
begin;
select set_config('request.headers', '{"x-actor":"user:U123"}', true);
insert into shows (name) values ('header actor 測試');
commit;
do $$
begin
  if not exists (select 1 from audit_log where actor = 'user:U123' and table_name = 'shows') then
    raise exception 'FAIL: x-actor header not used as actor';
  end if;
end $$;

-- 4. audit_log 只能新增：service_role 刪除／修改／清空都要失敗
set role service_role;
do $$
begin
  begin delete from audit_log; raise exception 'FAIL: service_role delete succeeded';
  exception when insufficient_privilege then null; end;
  begin update audit_log set actor = 'x'; raise exception 'FAIL: service_role update succeeded';
  exception when insufficient_privilege then null; end;
  begin truncate audit_log; raise exception 'FAIL: service_role truncate succeeded';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
-- 就算是 owner，trigger 也擋 delete
do $$
begin
  begin delete from audit_log; raise exception 'FAIL: owner delete succeeded';
  exception when others then
    if sqlerrm not like 'audit_log is append-only%' then raise; end if;
  end;
end $$;

-- 5. 每張應用表都有 audit trigger 且 RLS 開啟
do $$
declare missing text;
begin
  select string_agg(c.relname, ', ') into missing
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r'
     and c.relname not in ('audit_log', '_migrations')
     and (not c.relrowsecurity
          or (c.relname <> 'line_messages'
              and not exists (select 1 from pg_trigger t where t.tgrelid = c.oid and t.tgname = 'audit_row')));
  if missing is not null then raise exception 'FAIL: tables missing audit trigger or RLS: %', missing; end if;
end $$;

-- 6. anon 讀不到任何表
set role anon;
do $$
begin
  begin perform 1 from shows; raise exception 'FAIL: anon can read shows';
  exception when insufficient_privilege then null; end;
  begin perform 1 from audit_log; raise exception 'FAIL: anon can read audit_log';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- 7. 月號沒有演出日要被擋
do $$
begin
  perform set_config('app.actor', 'migration', true);
  begin
    insert into shows (name, type) values ('缺日期月號', 'monthly');
    raise exception 'FAIL: monthly show without date accepted';
  exception when check_violation then null; end;
end $$;

\echo 'ALL DB TESTS PASSED'
