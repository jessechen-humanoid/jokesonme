// 內部行程（spec: team-calendar「Internal events」）：只存在平台，不寫回公開日曆。
// 網頁與群組 `/行程` 共用這組函式（design「動作函式共用、預留自然語言入口」）。
import { db, type Actor } from "./supabase.ts";
import type { InternalEvent } from "./calendar/days.ts";

export type EventRow = InternalEvent & { notes: string; createdBy: string | null };
export type EventInput = { date: string; time: string | null; title: string; notes: string };

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/** 表單或指令來的值先驗證；回傳錯誤訊息或乾淨的輸入。 */
export function validateEvent(raw: { date: string; time?: string | null; title: string; notes?: string }): EventInput | { error: string } {
  const title = raw.title.trim();
  const time = raw.time?.trim() ? raw.time.trim().slice(0, 5) : null;
  if (!title) return { error: "請填寫標題" };
  if (title.length > 100) return { error: "標題最多 100 字" };
  if (!DATE.test(raw.date) || Number.isNaN(Date.parse(`${raw.date}T00:00:00Z`))) return { error: "日期格式不正確" };
  if (time && !TIME.test(time)) return { error: "時間格式要像 19:00" };
  return { date: raw.date, time, title, notes: (raw.notes ?? "").trim().slice(0, 1000) };
}

export async function listEvents(actor: Actor, from: string, to: string): Promise<EventRow[]> {
  const { data, error } = await db(actor)
    .from("internal_events")
    .select("id, event_date, event_time, title, notes, created_by")
    .is("deleted_at", null)
    .gte("event_date", from)
    .lte("event_date", to)
    .order("event_date")
    .order("event_time", { nullsFirst: true });
  if (error) throw new Error(`list events: ${error.message}`);
  return (data ?? []).map((r) => ({
    id: r.id, date: r.event_date, time: r.event_time ? String(r.event_time).slice(0, 5) : null,
    title: r.title, notes: r.notes, createdBy: r.created_by,
  }));
}

export async function createEvent(actor: Actor, input: EventInput, createdBy: string | null): Promise<string> {
  const { data, error } = await db(actor)
    .from("internal_events")
    .insert({ event_date: input.date, event_time: input.time, title: input.title, notes: input.notes, created_by: createdBy })
    .select("id")
    .single();
  if (error || !data) throw new Error(`create event: ${error?.message}`);
  return data.id;
}

export async function updateEvent(actor: Actor, id: string, input: EventInput): Promise<void> {
  const { error } = await db(actor)
    .from("internal_events")
    .update({ event_date: input.date, event_time: input.time, title: input.title, notes: input.notes })
    .eq("id", id)
    .is("deleted_at", null);
  if (error) throw new Error(`update event: ${error.message}`);
}

/** 軟刪除：留下 deleted_at／deleted_by，audit 看得到。 */
export async function deleteEvent(actor: Actor, id: string, by: string): Promise<void> {
  const { error } = await db(actor)
    .from("internal_events")
    .update({ deleted_at: new Date().toISOString(), deleted_by: by })
    .eq("id", id)
    .is("deleted_at", null);
  if (error) throw new Error(`delete event: ${error.message}`);
}
