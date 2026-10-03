-- 本機資料庫測試：財務表（task 10.2）
\set ON_ERROR_STOP on
begin;
set local app.actor = 'migration';
insert into shows (id, name) values ('00000000-0000-0000-0000-0000000000a1', '財務測試專案');
insert into transactions (id, show_id, category, amount, date) values ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000a1', '演出票房', 1000, '2026-10-01');
commit;

-- service_role 不能真的刪除財務資料
set role service_role;
do $$
begin
  begin delete from transactions; raise exception 'FAIL: service_role hard-deleted a transaction';
  exception when insufficient_privilege then null; end;
  begin truncate transactions; raise exception 'FAIL: service_role truncated transactions';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- 收入不能標成共同基金支付
do $$
begin
  perform set_config('app.actor', 'migration', true);
  begin
    insert into transactions (show_id, category, amount, date, paid_by_fund) values ('00000000-0000-0000-0000-0000000000a1', '演出票房', 500, '2026-10-01', true);
    raise exception 'FAIL: income paid by fund accepted';
  exception when check_violation then null; end;
end $$;

-- 軟刪除會留下 audit
begin;
set local app.actor = 'user:U_test';
update transactions set deleted_at = now(), deleted_by = 'U_test' where id = '00000000-0000-0000-0000-0000000000b1';
commit;
do $$
begin
  if not exists (select 1 from audit_log where table_name = 'transactions' and row_id = '00000000-0000-0000-0000-0000000000b1' and op = 'UPDATE' and actor = 'user:U_test') then
    raise exception 'FAIL: soft delete not audited';
  end if;
  if (select count(*) from transactions where id = '00000000-0000-0000-0000-0000000000b1') <> 1 then
    raise exception 'FAIL: soft-deleted row vanished';
  end if;
end $$;
\echo 'FINANCE TESTS PASSED'
