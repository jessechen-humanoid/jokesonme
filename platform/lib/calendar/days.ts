// 三層資料合併成「每日清單」（design「三層資料在伺服器合併成每日清單」）。
// 行事曆頁與 tag 傑瓜的「接下來 14 天」共用，避免兩邊算法不同。
import type { CalEvent } from "./ics.ts";

export type DayItem = { kind: "show" | "event" | "todo"; date: string; time: string | null; title: string; id?: string; href?: string };
export type InternalEvent = { id: string; date: string; time: string | null; title: string };
export type DueTodo = { id: string; title: string; dueDate: string };

const KIND_ORDER = { show: 0, event: 1, todo: 2 } as const;

/** 依日期分組；同一天內：整天的先、再依時間；同時間時演出、行程、待辦。 */
export function buildDays(from: string, to: string, shows: CalEvent[], events: InternalEvent[], todos: DueTodo[]): Map<string, DayItem[]> {
  const items: DayItem[] = [
    ...shows.map((s) => ({ kind: "show" as const, date: s.date, time: s.time, title: s.title })),
    ...events.map((e) => ({ kind: "event" as const, date: e.date, time: e.time, title: e.title, id: e.id })),
    ...todos.map((t) => ({ kind: "todo" as const, date: t.dueDate, time: null, title: t.title, id: t.id, href: "/todos?f=all" })),
  ].filter((i) => i.date >= from && i.date <= to);
  items.sort((a, b) =>
    a.date.localeCompare(b.date) ||
    (a.kind === "todo" ? 1 : 0) - (b.kind === "todo" ? 1 : 0) ||
    (a.time ?? "").localeCompare(b.time ?? "") ||
    KIND_ORDER[a.kind] - KIND_ORDER[b.kind],
  );
  const days = new Map<string, DayItem[]>();
  for (const i of items) days.set(i.date, [...(days.get(i.date) ?? []), i]);
  return days;
}

/** 「接下來 N 天的重要日子」：只有演出與內部行程（不含待辦），依時間排序。 */
export function importantDates(days: Map<string, DayItem[]>): DayItem[] {
  return [...days.values()].flat().filter((i) => i.kind !== "todo");
}

/** 月格：從該月 1 號所在週的週日開始，到月底所在週的週六（每格一個 YYYY-MM-DD）。 */
export function monthGrid(month: string): string[] {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const last = new Date(Date.UTC(y, m, 0));
  const start = new Date(first); start.setUTCDate(1 - first.getUTCDay());
  const end = new Date(last); end.setUTCDate(last.getUTCDate() + 6 - last.getUTCDay());
  const out: string[] = [];
  for (const d = start; d <= end; d.setUTCDate(d.getUTCDate() + 1)) out.push(d.toISOString().slice(0, 10));
  return out;
}

/** "2026-10" ± n 個月 */
export function shiftMonth(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7);
}
