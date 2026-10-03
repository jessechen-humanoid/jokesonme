-- 0001 操作紀錄（spec: audit-log；design.md「操作紀錄用資料庫觸發器」）
-- 每張應用資料表掛 audit_row()，任何新增／修改／刪除都自動寫進 audit_log。
-- actor 來源：伺服器每個請求帶 `x-actor` header（PostgREST 放進 request.headers），
-- 或直連資料庫的腳本用 `set local app.actor = '...'`。兩者皆無 → 拒絕寫入，不留匿名紀錄。
-- audit_log 只能新增：所有應用角色撤銷 update/delete/truncate，再加阻擋 trigger 當第二道防線。
-- 注意：持有 postgres 角色（SUPABASE_DB_URL）的人仍能停用 trigger，這是「防竄改」不是「不可竄改」。

create table if not exists _migrations (
  name       text primary key,
  applied_at timestamptz not null default now()
);

create table audit_log (
  id         bigint generated always as identity primary key,
  at         timestamptz not null default now(),
  actor      text not null,                 -- 'user:<line_user_id>' 或系統：line-bot / reminder-job / migration
  kind       text not null check (kind in ('data', 'event')),
  table_name text,                          -- kind=data 時的資料表
  row_id     text,
  op         text,                          -- INSERT / UPDATE / DELETE，或事件名稱如 auth.login / finance.export
  old_values jsonb,
  new_values jsonb,
  detail     jsonb
);
create index audit_log_at_idx on audit_log (at desc);
create index audit_log_actor_idx on audit_log (actor, at desc);
create index audit_log_row_idx on audit_log (table_name, row_id);
alter table audit_log enable row level security;

-- 目前這次請求的操作者；沒有就回 null。
create or replace function app_actor() returns text
language plpgsql stable as $$
declare
  a text;
begin
  a := nullif(current_setting('app.actor', true), '');
  if a is null then
    begin
      a := nullif((nullif(current_setting('request.headers', true), '')::json ->> 'x-actor'), '');
    exception when others then
      a := null;
    end;
  end if;
  return a;
end $$;

create or replace function audit_row() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  a   text := app_actor();
  rid text;
begin
  if a is null then
    raise exception 'audit: missing actor for % on %', tg_op, tg_table_name
      using hint = 'server requests must send x-actor; scripts must set app.actor';
  end if;
  if tg_op = 'DELETE' then
    rid := to_jsonb(old) ->> 'id';
  else
    rid := to_jsonb(new) ->> 'id';
  end if;
  insert into audit_log (actor, kind, table_name, row_id, op, old_values, new_values)
  values (
    a, 'data', tg_table_name, rid, tg_op,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end $$;

-- 新的應用資料表在同一支 migration 裡呼叫 select attach_audit('表名');
create or replace function attach_audit(tbl regclass) returns void
language plpgsql as $$
begin
  execute format(
    'create trigger audit_row after insert or update or delete on %s for each row execute function audit_row()',
    tbl
  );
end $$;

create or replace function audit_log_block() returns trigger
language plpgsql as $$
begin
  raise exception 'audit_log is append-only (% blocked)', tg_op;
end $$;

create trigger audit_log_no_update_delete before update or delete on audit_log
  for each row execute function audit_log_block();
create trigger audit_log_no_truncate before truncate on audit_log
  for each statement execute function audit_log_block();

-- 權限：瀏覽器不直連（anon/authenticated 一律沒有）；後端 service_role 只能讀與新增。
revoke all on audit_log from public, anon, authenticated, service_role;
grant select, insert on audit_log to service_role;
grant usage, select on sequence audit_log_id_seq to service_role;

insert into _migrations (name) values ('0001_audit') on conflict do nothing;
