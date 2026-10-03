"use server";
// 靈感的寫入（spec: Assign idea to a show）。
import { revalidatePath } from "next/cache";
import { requireAction } from "@/lib/auth/current";
import { db } from "@/lib/supabase";

const str = (fd: FormData, k: string) => (typeof fd.get(k) === "string" ? String(fd.get(k)).trim() : "");

function refresh(showIds: (string | null | undefined)[] = []) {
  revalidatePath("/ideas");
  revalidatePath("/shows");
  for (const id of showIds) if (id) revalidatePath(`/shows/${id}`);
}

export async function createIdea(fd: FormData) {
  const me = await requireAction("ideas");
  const text = str(fd, "text");
  if (!text) throw new Error("請填寫靈感內容");
  const showId = str(fd, "show_id") || null;
  const { error } = await db(`user:${me.id}`).from("ideas").insert({ text, author_user_id: me.id, show_id: showId });
  if (error) throw new Error(error.message);
  refresh([showId]);
}

export async function updateIdea(fd: FormData) {
  const me = await requireAction("ideas");
  const id = str(fd, "id");
  const text = str(fd, "text");
  if (!text) throw new Error("請填寫靈感內容");
  const { error } = await db(`user:${me.id}`).from("ideas").update({ text }).eq("id", id);
  if (error) throw new Error(error.message);
  refresh([str(fd, "show_id")]);
}

/** 指派到某場演出；show_id 空字串 = 退回靈感庫。 */
export async function assignIdea(fd: FormData) {
  const me = await requireAction("ideas");
  const id = str(fd, "id");
  const showId = str(fd, "show_id") || null;
  const { error } = await db(`user:${me.id}`).from("ideas").update({ show_id: showId }).eq("id", id);
  if (error) throw new Error(error.message);
  refresh([showId, str(fd, "from_show_id")]);
}

export async function setIdeaArchived(fd: FormData) {
  const me = await requireAction("ideas");
  const archive = str(fd, "archive") === "1";
  const { error } = await db(`user:${me.id}`).from("ideas").update({ archived_at: archive ? new Date().toISOString() : null }).eq("id", str(fd, "id"));
  if (error) throw new Error(error.message);
  refresh([str(fd, "show_id")]);
}
