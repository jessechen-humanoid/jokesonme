-- 本機資料庫測試：internal_events（task 1.1）
\set ON_ERROR_STOP on
do $$
begin
  begin
    insert into internal_events (event_date, title) values ('2026-10-12', '無 actor');
    raise exception 'FAIL: insert without actor succeeded';
  exception when others then
    if sqlerrm not like 'audit: missing actor%' then raise; end if;
  end;
end $$;
begin;
set local app.actor = 'user:U_test';
insert into internal_events (id, event_date, event_time, title) values ('00000000-0000-0000-0000-0000000000e1', '2026-10-12', '19:00', '討論 11 月號');
update internal_events set deleted_at = now(), deleted_by = 'U_test' where id = '00000000-0000-0000-0000-0000000000e1';
commit;
do $$
begin
  if (select count(*) from audit_log where table_name = 'internal_events' and row_id = '00000000-0000-0000-0000-0000000000e1') <> 2 then
    raise exception 'FAIL: expected insert + soft-delete audit rows';
  end if;
end $$;
set role service_role;
do $$
begin
  begin delete from internal_events; raise exception 'FAIL: service_role hard-deleted';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set role anon;
do $$
begin
  begin perform 1 from internal_events; raise exception 'FAIL: anon can read';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
\echo 'INTERNAL EVENTS TESTS PASSED'
