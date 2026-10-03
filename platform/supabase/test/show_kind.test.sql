-- 本機資料庫測試：shows.kind（show-centric-planning task 1.2）
\set ON_ERROR_STOP on
begin;
set local app.actor = 'migration';
insert into shows (name) values ('UI 新增的演出測試');
commit;
do $$
begin
  if (select kind from shows where name = 'UI 新增的演出測試') <> 'performance' then
    raise exception 'FAIL: new show default kind is not performance';
  end if;
  begin
    perform set_config('app.actor', 'migration', true);
    update shows set kind = 'other' where name = 'UI 新增的演出測試';
    raise exception 'FAIL: invalid kind accepted';
  exception when check_violation then null; end;
  begin
    update shows set status = 'whatever' where name = 'UI 新增的演出測試';
    raise exception 'FAIL: invalid status accepted';
  exception when check_violation then null; end;
end $$;
\echo 'SHOW KIND TESTS PASSED'
