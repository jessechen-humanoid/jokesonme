-- 0004 一般聊天只保留 14 天（task 3.3；design.md「一般聊天只保留 14 天」）
-- 1. line_messages 是原始聊天輸入，不寫進 audit_log（會讓儲存量翻倍）。
-- 2. purge_line_messages(keep_days)：只刪 line_messages 裡「超過 keep_days 天、且沒被待辦或靈感引用」的列。
--    keep_days 下限 14 寫死在函式內：參數錯了最多也只刪 14 天前的一般聊天，不可能刪到近期訊息或待辦／靈感的出處。

drop trigger if exists audit_row on line_messages;

create or replace function purge_line_messages(keep_days int default 14) returns int
language plpgsql security definer set search_path = public as $$
declare
  n int;
begin
  if keep_days is null or keep_days < 14 then
    raise exception 'purge_line_messages: keep_days must be >= 14 (got %)', keep_days;
  end if;
  delete from line_messages m
   where m.sent_at < now() - make_interval(days => keep_days)
     and not exists (select 1 from todo_sources s where s.line_message_id = m.id)
     and not exists (select 1 from ideas i where i.line_message_id = m.id);
  get diagnostics n = row_count;
  return n;
end $$;

revoke all on function purge_line_messages(int) from public, anon, authenticated;
grant execute on function purge_line_messages(int) to service_role;

insert into _migrations (name) values ('0004_message_retention') on conflict do nothing;
