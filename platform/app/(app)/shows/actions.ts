"use server";
// 新增演出（spec: show-management「Add new show」）：月號一定要有演出日期。
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAction } from "@/lib/auth/current";
import { db } from "@/lib/supabase";
import { ensureTemplateTodos, shiftTemplateTodos } from "@/lib/templates";

export async function createShow(fd: FormData) {
  const me = await requireAction("planning");
  const name = String(fd.get("name") ?? "").trim();
  const type = String(fd.get("type") ?? "other");
  const date = String(fd.get("performance_date") ?? "").trim();
  if (!name) redirect("/shows?new=1&err=name");
  if (!["monthly", "special", "other"].includes(type)) throw new Error("invalid type");
  if (type === "monthly" && !/^\d{4}-\d{2}-\d{2}$/.test(date)) redirect("/shows?new=1&err=date");
  const { data: created, error } = await db(`user:${me.id}`)
    .from("shows")
    .insert({ name, type, performance_date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null })
    .select("id")
    .single();
  if (error || !created) redirect(`/shows?new=1&err=${error?.code === "23505" ? "dup" : "save"}`);
  await ensureTemplateTodos(`user:${me.id}`, created.id); // 月號 → 依模板產生固定待辦
  revalidatePath("/shows");
  revalidatePath("/todos");
  redirect("/shows");
}

/** 編輯演出（名稱、類型、演出日期）；月號一定要有日期。 */
export async function updateShow(fd: FormData): Promise<{ ok: boolean; error?: string }> {
  const me = await requireAction("planning");
  const id = String(fd.get("id") ?? "");
  const name = String(fd.get("name") ?? "").trim();
  const type = String(fd.get("type") ?? "other");
  const date = String(fd.get("performance_date") ?? "").trim();
  const status = fd.get("archived") === "1" ? "archived" : "active"; // spec show-management「Archive a show」
  if (!name) return { ok: false, error: "請填寫演出名稱" };
  if (!["monthly", "special", "other"].includes(type)) return { ok: false, error: "類型不正確" };
  if (type === "monthly" && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: "月號一定要填演出日期" };
  const actor = `user:${me.id}` as const;
  const { data: before } = await db(actor).from("shows").select("performance_date").eq("id", id).single();
  const newDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
  const { error } = await db(actor).from("shows").update({ name, type, performance_date: newDate, status }).eq("id", id).eq("kind", "performance");
  if (error) return { ok: false, error: error.code === "23505" ? "已經有同名的演出" : "儲存失敗，請再試一次" };
  try {
    // 改演出日 → 未完成的模板待辦一起平移；變成月號且還沒有模板待辦 → 產生
    if (before?.performance_date && newDate && before.performance_date !== newDate) await shiftTemplateTodos(actor, id, before.performance_date, newDate);
    await ensureTemplateTodos(actor, id);
  } catch (e) {
    console.error("[shows] template todos failed", e);
    return { ok: false, error: "演出資訊已儲存，但模板待辦沒有產生成功，請再存一次" };
  }
  revalidatePath("/shows");
  revalidatePath(`/shows/${id}`);
  revalidatePath("/todos");
  return { ok: true };
}

/** 文件連結（rundown／簡報／問卷）：空白 = 移除。 */
export async function saveShowLink(fd: FormData): Promise<{ ok: boolean; error?: string }> {
  const me = await requireAction("planning");
  const showId = String(fd.get("show_id") ?? "");
  const kind = String(fd.get("kind") ?? "");
  const url = String(fd.get("url") ?? "").trim();
  if (!["rundown", "presentation", "survey"].includes(kind)) return { ok: false, error: "類型不正確" };
  const client = db(`user:${me.id}`);
  if (!url) {
    const { error } = await client.from("show_links").delete().eq("show_id", showId).eq("kind", kind);
    if (error) return { ok: false, error: "移除失敗" };
  } else {
    if (!/^https?:\/\//.test(url)) return { ok: false, error: "連結要以 https:// 開頭" };
    const { error } = await client.from("show_links").upsert({ show_id: showId, kind, url }, { onConflict: "show_id,kind" });
    if (error) return { ok: false, error: "儲存失敗，請再試一次" };
  }
  revalidatePath(`/shows/${showId}`);
  return { ok: true };
}
