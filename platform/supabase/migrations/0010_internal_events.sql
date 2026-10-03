-- 0010 內部行程（team-calendar-and-simple-commands；spec team-calendar「Internal events」）
-- 會議、排練等只存在平台的日期，絕不寫回觀眾訂閱的 Google 公開日曆。軟刪除、全程操作紀錄。
create table internal_events (
  id          uuid primary key default gen_random_uuid(),
  event_date  date not null,
  event_time  time,                                   -- null = 整天／沒寫時間
  title       text not null check (length(btrim(title)) > 0),
  notes       text not null default '',
  created_by  text,                                   -- LINE userId（網頁或群組 /行程）
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  deleted_by  text
);
create index internal_events_date_idx on internal_events (event_date) where deleted_at is null;

alter table internal_events enable row level security;
revoke all on internal_events from public, anon, authenticated, service_role;
grant select, insert, update on internal_events to service_role;   -- 不給 DELETE／TRUNCATE：只能軟刪除
select attach_audit('internal_events');

insert into _migrations (name) values ('0010_internal_events') on conflict do nothing;
