// 演出前提醒的執行：找出今天要提醒的演出 → 組訊息 → （開啟時）推播並記錄用量。
import { db } from "./supabase.ts";
import { todayInTaipei } from "./dates.ts";
import { listShows } from "./shows.ts";
import { listTodos, listUsers, nameMap } from "./todos.ts";
import { reminderText, showsToRemind } from "./reminders.ts";
import { groupMemberCount, pushToGroup, remindersLive } from "./line/push.ts";

export type ReminderPreview = { showId: string; showName: string; openTodos: number; text: string; sent: boolean; skipped?: string };

export async function runReminders(opts: { today?: string; send: boolean }): Promise<ReminderPreview[]> {
  const actor = "reminder-job" as const;
  const today = opts.today ?? todayInTaipei();
  const [shows, todos, users] = await Promise.all([listShows(actor), listTodos(actor), listUsers(actor)]);
  const names = nameMap(users);
  const liffId = process.env.LIFF_ID ?? "";
  const { data: group } = await db(actor).from("app_settings").select("value").eq("key", "line_group_id").maybeSingle();
  const out: ReminderPreview[] = [];
  for (const show of showsToRemind(shows, today)) {
    const open = todos.filter((t) => t.show?.id === show.id && !t.doneAt);
    const text = reminderText(show, open, (id) => names.get(id) ?? "成員", `https://liff.line.me/${liffId}/shows/${show.id}`);
    if (!open.length) {
      out.push({ showId: show.id, showName: show.name, openTodos: 0, text, sent: false, skipped: "沒有未完成的待辦，不推播" });
      continue;
    }
    if (!opts.send || !remindersLive() || !group?.value) {
      out.push({ showId: show.id, showName: show.name, openTodos: open.length, text, sent: false, skipped: !group?.value ? "還沒有登記群組" : "預覽模式，沒有送出" });
      continue;
    }
    let ok = false;
    let error: string | null = null;
    let recipients = 0;
    try {
      recipients = await groupMemberCount(group.value);
      await pushToGroup(group.value, text);
      ok = true;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
    // 失敗也記一筆，但不自動重送（避免重複推播浪費額度）
    await db(actor).from("line_pushes").insert({ show_id: show.id, sent_on: today, recipient_count: Math.max(recipients, 1), ok, error });
    out.push({ showId: show.id, showName: show.name, openTodos: open.length, text, sent: ok, skipped: error ?? undefined });
  }
  return out;
}
