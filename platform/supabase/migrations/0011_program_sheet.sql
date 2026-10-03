-- 0011 節目表（program-sheet；spec program-sheet「Program sheet data」）
-- 每場演出一份：開始時間放 shows（第一段開始＝通常是觀眾進場），段落一列一段、依 position 排序。軟刪除、全程操作紀錄。
alter table shows add column program_start_time time not null default '19:00';

create table program_items (
  id          uuid primary key default gen_random_uuid(),
  show_id     uuid not null references shows(id),
  position    integer not null,
  name        text not null check (length(btrim(name)) > 0),
  kind        text not null default '',               -- 類型：漫才、企劃、開場…（自由文字）
  minutes     integer not null check (minutes between 0 and 600),
  content     text not null default '',
  props       text not null default '',
  sound       text not null default '',
  projection  text not null default '',
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  deleted_by  text
);
create index program_items_show_idx on program_items (show_id, position) where deleted_at is null;

alter table program_items enable row level security;
revoke all on program_items from public, anon, authenticated, service_role;
grant select, insert, update on program_items to service_role;   -- 不給 DELETE／TRUNCATE：只能軟刪除
select attach_audit('program_items');

insert into _migrations (name) values ('0011_program_sheet') on conflict do nothing;
