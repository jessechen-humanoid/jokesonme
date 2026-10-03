// 節目表的讀寫（spec: program-sheet）。輸出格式在 program-render.ts。
import { db, type Actor } from "./supabase.ts";
import type { ProgramItem } from "./program-render.ts";

export type ProgramRow = ProgramItem & { id: string; position: number };

const FIELDS = "id, position, name, kind, minutes, content, props, sound, projection";

/** 表單來的值先驗證；回傳錯誤訊息或乾淨的段落。 */
export function validateItem(raw: Record<keyof ProgramItem, string>): ProgramItem | { error: string } {
  const name = raw.name.trim();
  if (!name) return { error: "請填寫段落名稱" };
  if (name.length > 100) return { error: "名稱最多 100 字" };
  if (!/^\d{1,3}$/.test(raw.minutes.trim()) || Number(raw.minutes) > 600) return { error: "時長請填 0–600 的整數（分鐘）" };
  const clip = (s: string) => s.trim().slice(0, 2000);
  return { name, kind: clip(raw.kind).slice(0, 30), minutes: Number(raw.minutes), content: clip(raw.content), props: clip(raw.props), sound: clip(raw.sound), projection: clip(raw.projection) };
}

export async function listProgram(actor: Actor, showId: string): Promise<ProgramRow[]> {
  const { data, error } = await db(actor).from("program_items").select(FIELDS).eq("show_id", showId).is("deleted_at", null).order("position");
  if (error) throw new Error(`list program: ${error.message}`);
  return (data ?? []) as ProgramRow[];
}

/** 演出頁入口用：每場的段落數與總分鐘。 */
export async function programSummary(actor: Actor, showId: string): Promise<{ count: number; minutes: number }> {
  const items = await listProgram(actor, showId);
  return { count: items.length, minutes: items.reduce((s, i) => s + i.minutes, 0) };
}

export async function addItem(actor: Actor, showId: string, item: ProgramItem): Promise<void> {
  const items = await listProgram(actor, showId);
  const position = items.length ? Math.max(...items.map((i) => i.position)) + 1 : 1;
  const { error } = await db(actor).from("program_items").insert({ show_id: showId, position, ...item });
  if (error) throw new Error(`add item: ${error.message}`);
}

export async function updateItem(actor: Actor, id: string, item: ProgramItem): Promise<void> {
  const { error } = await db(actor).from("program_items").update(item).eq("id", id).is("deleted_at", null);
  if (error) throw new Error(`update item: ${error.message}`);
}

export async function deleteItem(actor: Actor, id: string, by: string): Promise<void> {
  const { error } = await db(actor).from("program_items").update({ deleted_at: new Date().toISOString(), deleted_by: by }).eq("id", id).is("deleted_at", null);
  if (error) throw new Error(`delete item: ${error.message}`);
}

/** 上移／下移：和相鄰那段交換 position。已在最上／最下時不動。 */
export async function moveItem(actor: Actor, showId: string, id: string, dir: -1 | 1): Promise<void> {
  const items = await listProgram(actor, showId);
  const i = items.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= items.length) return;
  const client = db(actor);
  for (const [row, position] of [[items[i], items[j].position], [items[j], items[i].position]] as const) {
    const { error } = await client.from("program_items").update({ position }).eq("id", row.id);
    if (error) throw new Error(`move item: ${error.message}`);
  }
}

export async function setStartTime(actor: Actor, showId: string, time: string): Promise<void> {
  const { error } = await db(actor).from("shows").update({ program_start_time: time }).eq("id", showId);
  if (error) throw new Error(`set start: ${error.message}`);
}

/** 其他有節目表的演出（演出日期新到舊），給「從上一場複製」選。 */
export async function showsWithProgram(actor: Actor, exceptShowId: string): Promise<{ id: string; name: string }[]> {
  const { data, error } = await db(actor)
    .from("shows")
    .select("id, name, performance_date, program_items!inner(id)")
    .is("program_items.deleted_at", null)
    .eq("kind", "performance")
    .neq("id", exceptShowId)
    .order("performance_date", { ascending: false, nullsFirst: false });
  if (error) throw new Error(`shows with program: ${error.message}`);
  return (data ?? []).map((s) => ({ id: s.id as string, name: s.name as string }));
}

/** 整份複製（開始時間＋段落）。目標已有段落時拒絕，避免覆蓋。 */
export async function copyProgram(actor: Actor, targetShowId: string, sourceShowId: string): Promise<"ok" | "not-empty" | "empty-source"> {
  if ((await listProgram(actor, targetShowId)).length) return "not-empty";
  const source = await listProgram(actor, sourceShowId);
  if (!source.length) return "empty-source";
  const client = db(actor);
  const { data: src } = await client.from("shows").select("program_start_time").eq("id", sourceShowId).single();
  if (src) await setStartTime(actor, targetShowId, src.program_start_time);
  const { error } = await client.from("program_items").insert(
    source.map((s, n) => ({ show_id: targetShowId, position: n + 1, name: s.name, kind: s.kind, minutes: s.minutes, content: s.content, props: s.props, sound: s.sound, projection: s.projection })),
  );
  if (error) throw new Error(`copy program: ${error.message}`);
  return "ok";
}
