"use server";
// 月號模板編輯（spec: Monthly show template：只有管理員可以改）。改模板不影響已建立的待辦。
import { revalidatePath } from "next/cache";
import { requireAction } from "@/lib/auth/current";
import { db } from "@/lib/supabase";
import { MEMBER_NAMES } from "@/lib/members";

const str = (fd: FormData, k: string) => (typeof fd.get(k) === "string" ? String(fd.get(k)).trim() : "");

function parse(fd: FormData) {
  const title = str(fd, "title");
  const offset = Number(str(fd, "offset_days"));
  const assignee = str(fd, "default_assignee");
  if (!title) throw new Error("請填寫項目名稱");
  if (!Number.isInteger(offset) || offset < -120 || offset > 60) throw new Error("天數要是 -120 到 60 的整數");
  if (assignee && !(MEMBER_NAMES as readonly string[]).includes(assignee)) throw new Error("負責人不正確");
  return { title, offset_days: offset, default_assignee: assignee || null };
}

export async function saveTemplateItem(fd: FormData) {
  const me = await requireAction("admin");
  const client = db(`user:${me.id}`);
  const row = parse(fd);
  const id = str(fd, "id");
  if (id) {
    const { error } = await client.from("show_template_items").update(row).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data: t } = await client.from("show_templates").select("id").eq("show_type", "monthly").single();
    const { data: last } = await client.from("show_template_items").select("sort_order").eq("template_id", t!.id).order("sort_order", { ascending: false }).limit(1).maybeSingle();
    const { error } = await client.from("show_template_items").insert({ ...row, template_id: t!.id, sort_order: (last?.sort_order ?? 0) + 10 });
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/template");
}

export async function deleteTemplateItem(fd: FormData) {
  const me = await requireAction("admin");
  const { error } = await db(`user:${me.id}`).from("show_template_items").delete().eq("id", str(fd, "id"));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/template");
}
