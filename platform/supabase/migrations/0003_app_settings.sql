-- 0003 平台設定（task 3.1）：目前只放「登記的 LINE 群組」。
-- Bot 第一次被拉進群組（或第一次在群組收到訊息）時自動登記；之後其他群組的訊息一律忽略。
create table app_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);
alter table app_settings enable row level security;
revoke all on app_settings from public, anon, authenticated;
grant select, insert, update, delete on app_settings to service_role;
select attach_audit('app_settings');

insert into _migrations (name) values ('0003_app_settings') on conflict do nothing;
