// 演出前提醒（spec: pre-show-reminders）。純函式：哪幾場今天要提醒、訊息內容怎麼寫。
import { addDays, formatDueLabel, formatMonthDay } from "./dates.ts";

export const REMINDER_DAYS_BEFORE = [3, 1] as const;
export const MONTHLY_PUSH_QUOTA = 200;
const MAX_ITEMS = 15;

export type ReminderShow = { id: string; name: string; performanceDate: string | null };
export type ReminderTodo = { title: string; dueDate: string | null; assignees: string[] };

/** 演出日剛好是今天 +3 或 +1 天的演出。 */
export function showsToRemind<T extends ReminderShow>(shows: T[], today: string): T[] {
  const targets = new Set(REMINDER_DAYS_BEFORE.map((d) => addDays(today, d)));
  return shows.filter((s) => s.performanceDate && targets.has(s.performanceDate));
}

/** 推播文字：實際日期、每件待辦的負責人與截止日、連到該場企劃頁。不寫 D-3 這種相對日期。 */
export function reminderText(show: ReminderShow, todos: ReminderTodo[], names: (id: string) => string, link: string): string {
  const sorted = [...todos].sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"));
  const lines = sorted.slice(0, MAX_ITEMS).map((t) => {
    const who = t.assignees.length ? t.assignees.map(names).join("、") : "未認領";
    return `・${t.title}（${who}）${t.dueDate ? ` ${formatDueLabel(t.dueDate)}` : ""}`;
  });
  if (sorted.length > MAX_ITEMS) lines.push(`…還有 ${sorted.length - MAX_ITEMS} 件`);
  return [
    `「${show.name}」${formatMonthDay(show.performanceDate!)}演出，還有 ${todos.length} 件事沒完成：`,
    ...lines,
    "",
    `看全部：${link}`,
  ].join("\n");
}

/** 本月推播用量：每次推播算群組人數則（LINE 依收件人數計費）。 */
export function monthlyUsage(pushes: { sentOn: string; recipientCount: number; ok: boolean }[], today: string): number {
  const month = today.slice(0, 7);
  return pushes.filter((p) => p.ok && p.sentOn.startsWith(month)).reduce((s, p) => s + p.recipientCount, 0);
}
