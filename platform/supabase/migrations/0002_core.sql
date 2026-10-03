-- 0002 核心資料表（task 2.3）：使用者、演出、待辦、靈感、LINE 訊息與推播、演出模板。
-- 每張表 RLS 開、無 policy（瀏覽器不直連），掛 audit trigger，只給 service_role 讀寫。

create type user_role   as enum ('admin', 'member', 'finance_partner');
create type user_status as enum ('pending', 'approved', 'revoked');
create type show_type   as enum ('monthly', 'special', 'other');
create type todo_source as enum ('command', 'template', 'manual');
create type link_kind   as enum ('rundown', 'presentation', 'survey');

-- 使用者：以 LINE userId 為主鍵（Bot 與 LINE Login 同一 Provider，userId 一致）
create table users (
  id           text primary key,              -- LINE userId
  display_name text not null,                 -- LINE 顯示名稱
  member_name  text,                          -- 對應的成員名（傑哥、柏文…）；財務夥伴可為 null
  picture_url  text,
  role         user_role,                     -- 核准時由管理員指定；pending 時為 null
  status       user_status not null default 'pending',
  approved_by  text references users(id),
  approved_at  timestamptz,
  created_at   timestamptz not null default now(),
  check (status <> 'approved' or role is not null)
);

create table shows (
  id               uuid primary key default gen_random_uuid(),
  name             text not null unique,
  type             show_type not null default 'other',
  performance_date date,
  status           text not null default 'active',
  created_at       timestamptz not null default now(),
  check (type <> 'monthly' or performance_date is not null)
);

-- LINE 群組訊息原文（line-group-capture）
create table line_messages (
  id                text primary key,             -- LINE message id（冪等）
  group_id          text not null,
  user_id           text not null,                -- 發話者 LINE userId（不一定已登入平台）
  sent_at           timestamptz not null,
  text              text not null,
  mentions          jsonb not null default '[]',  -- [{userId, index, length}]
  quoted_message_id text,
  created_at        timestamptz not null default now()
);
create index line_messages_sent_idx on line_messages (group_id, sent_at desc);

create table todos (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (length(btrim(title)) > 0),
  show_id     uuid references shows(id) on delete set null,
  due_date    date,
  source      todo_source not null,
  template_item_id uuid,                         -- source=template 時的來源模板項目
  created_by  text,                              -- LINE userId（可能尚未登入平台）
  done_at     timestamptz,
  done_by     text,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now(),
  check ((done_at is null) = (done_by is null))
);
create index todos_open_idx on todos (due_date nulls last) where done_at is null and deleted_at is null;
create index todos_show_idx on todos (show_id);

create table todo_assignees (
  todo_id uuid not null references todos(id) on delete cascade,
  user_id text not null,                         -- LINE userId
  primary key (todo_id, user_id)
);
-- 待辦 ↔ 原始群組訊息（Todo source traceability）
create table todo_sources (
  todo_id         uuid not null references todos(id) on delete cascade,
  line_message_id text not null references line_messages(id),
  primary key (todo_id, line_message_id)
);

create table ideas (
  id              uuid primary key default gen_random_uuid(),
  text            text not null check (length(btrim(text)) > 0),
  author_user_id  text,                          -- LINE userId
  show_id         uuid references shows(id) on delete set null,
  line_message_id text references line_messages(id),
  archived_at     timestamptz,
  created_at      timestamptz not null default now()
);
create index ideas_library_idx on ideas (created_at desc) where show_id is null and archived_at is null;

create table show_links (
  id      uuid primary key default gen_random_uuid(),
  show_id uuid not null references shows(id) on delete cascade,
  kind    link_kind not null,
  url     text not null check (url ~ '^https?://'),
  unique (show_id, kind)
);

-- 推播紀錄：每月用量 = 次數 × recipient_count（Push only for reminders）
create table line_pushes (
  id              uuid primary key default gen_random_uuid(),
  show_id         uuid references shows(id) on delete set null,
  sent_on         date not null,
  recipient_count int not null check (recipient_count > 0),
  ok              boolean not null,
  error           text,
  created_at      timestamptz not null default now()
);

create table show_templates (
  id        uuid primary key default gen_random_uuid(),
  show_type show_type not null unique
);
create table show_template_items (
  id               uuid primary key default gen_random_uuid(),
  template_id      uuid not null references show_templates(id) on delete cascade,
  title            text not null,
  offset_days      int not null,                 -- 相對演出日（負數 = 演出前）
  default_assignee text,                          -- LINE userId
  sort_order       int not null default 0
);
alter table todos add constraint todos_template_item_fk
  foreign key (template_item_id) references show_template_items(id) on delete set null;

do $$
declare t text;
begin
  foreach t in array array['users','shows','line_messages','todos','todo_assignees','todo_sources',
                           'ideas','show_links','line_pushes','show_templates','show_template_items'] loop
    execute format('alter table %I enable row level security', t);
    execute format('revoke all on %I from public, anon, authenticated', t);
    execute format('grant select, insert, update, delete on %I to service_role', t);
    perform attach_audit(t::regclass);
  end loop;
end $$;

insert into _migrations (name) values ('0002_core') on conflict do nothing;
