-- 本機資料庫測試：program_items（program-sheet task 1.1）
\set ON_ERROR_STOP on
begin;
set local app.actor = 'migration';
insert into shows (id, name, type, performance_date) values ('00000000-0000-0000-0000-00000000c0a1', '節目表測試場', 'monthly', '2026-11-21');
commit;
do $$
begin
  if (select program_start_time from shows where id = '00000000-0000-0000-0000-00000000c0a1') <> '19:00' then
    raise exception 'FAIL: default start time';
  end if;
  begin
    insert into program_items (show_id, position, name, minutes) values ('00000000-0000-0000-0000-00000000c0a1', 1, '無 actor', 5);
    raise exception 'FAIL: insert without actor succeeded';
  exception when others then
    if sqlerrm not like 'audit: missing actor%' then raise; end if;
  end;
end $$;
begin;
set local app.actor = 'user:U_test';
do $$
begin
  begin
    insert into program_items (show_id, position, name, minutes) values ('00000000-0000-0000-0000-00000000c0a1', 1, '負時長', -5);
    raise exception 'FAIL: negative minutes accepted';
  exception when check_violation then null; end;
  begin
    insert into program_items (show_id, position, name, minutes) values ('00000000-0000-0000-0000-00000000c0a1', 1, '  ', 5);
    raise exception 'FAIL: blank name accepted';
  exception when check_violation then null; end;
end $$;
insert into program_items (id, show_id, position, name, kind, minutes) values ('00000000-0000-0000-0000-00000000c0b1', '00000000-0000-0000-0000-00000000c0a1', 1, '又兔了', '漫才', 7);
update program_items set deleted_at = now(), deleted_by = 'U_test' where id = '00000000-0000-0000-0000-00000000c0b1';
commit;
do $$
begin
  if (select count(*) from audit_log where table_name = 'program_items' and row_id = '00000000-0000-0000-0000-00000000c0b1') <> 2 then
    raise exception 'FAIL: expected insert + soft-delete audit rows';
  end if;
end $$;
set role service_role;
do $$
begin
  begin delete from program_items; raise exception 'FAIL: service_role hard-deleted';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set role anon;
do $$
begin
  begin perform 1 from program_items; raise exception 'FAIL: anon can read';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
\echo 'PROGRAM ITEMS TESTS PASSED'
