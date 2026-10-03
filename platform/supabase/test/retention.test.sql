-- 本機資料庫測試：一般聊天保留 14 天（task 3.3）。
\set ON_ERROR_STOP on
begin;
set local app.actor = 'migration';
insert into line_messages (id, group_id, user_id, sent_at, text) values
  ('old_plain',  'G', 'U', now() - interval '19 days', '週六誰可以去搬道具'),
  ('new_plain',  'G', 'U', now() - interval '10 days', '週六誰可以去搬道具'),
  ('old_todo',   'G', 'U', now() - interval '49 days', '/買膠帶'),
  ('old_quoted', 'G', 'U', now() - interval '49 days', '最後一段讓觀眾投票');
insert into todos (id, title, source) values ('00000000-0000-0000-0000-000000000001', '買膠帶', 'command');
insert into todo_sources (todo_id, line_message_id) values ('00000000-0000-0000-0000-000000000001', 'old_todo');
insert into ideas (text, line_message_id) values ('最後一段讓觀眾投票', 'old_quoted');
commit;

-- line_messages 不再寫 audit
do $$
begin
  if exists (select 1 from audit_log where table_name = 'line_messages' and row_id = 'old_plain') then
    raise exception 'FAIL: line_messages still audited';
  end if;
end $$;

-- 3 天要被拒絕，且什麼都沒刪
do $$
begin
  begin
    perform purge_line_messages(3);
    raise exception 'FAIL: 3-day window accepted';
  exception when others then
    if sqlerrm not like 'purge_line_messages: keep_days must be >= 14%' then raise; end if;
  end;
  if (select count(*) from line_messages where id in ('old_plain','new_plain','old_todo','old_quoted')) <> 4 then
    raise exception 'FAIL: rejected call deleted rows';
  end if;
end $$;

-- service_role 執行 14 天：只刪 old_plain
set role service_role;
do $$
declare n int;
begin
  n := purge_line_messages(14);
  if n <> 1 then raise exception 'FAIL: expected 1 deleted, got %', n; end if;
end $$;
reset role;
do $$
declare kept text;
begin
  select string_agg(id, ',' order by id) into kept from line_messages where id in ('old_plain','new_plain','old_todo','old_quoted');
  if kept <> 'new_plain,old_quoted,old_todo' then raise exception 'FAIL: kept rows = %', kept; end if;
end $$;

-- anon 不能呼叫
set role anon;
do $$
begin
  begin perform purge_line_messages(14); raise exception 'FAIL: anon can purge';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

\echo 'RETENTION TESTS PASSED'
