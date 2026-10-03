"use server";
// 待辦的寫入（spec: todo-board）。每個 action 先過角色守門，寫入一律以本人為 actor（操作紀錄記得到是誰）。
import { revalidatePath } from "next/cache";
import { requireAction } from "@/lib/auth/current";
import { db } from "@/lib/supabase";

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}
function dateOrNull(v: string): string | null {
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

export async function toggleDone(fd: FormData) {
  const me = await requireAction("todos");
  const id = str(fd, "id");
  const done = str(fd, "done") === "1";
  const { error } = await db(`user:${me.id}`)
    .from("todos")
    .update(done ? { done_at: null, done_by: null } : { done_at: new Date().toISOString(), done_by: me.id })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/todos");
}

export async function claimTodo(fd: FormData) {
  const me = await requireAction("todos");
  const id = str(fd, "id");
  const { error } = await db(`user:${me.id}`).from("todo_assignees").upsert({ todo_id: id, user_id: me.id }, { ignoreDuplicates: true });
  if (error) throw new Error(error.message);
  revalidatePath("/todos");
}

async function setAssignees(actorId: string, todoId: string, userIds: string[]) {
  const client = db(`user:${actorId}`);
  const { data, error } = await client.from("todo_assignees").select("user_id").eq("todo_id", todoId);
  if (error) throw new Error(error.message);
  const current = new Set((data ?? []).map((r: { user_id: string }) => r.user_id));
  const wanted = new Set(userIds);
  const remove = [...current].filter((u) => !wanted.has(u));
  const add = [...wanted].filter((u) => !current.has(u));
  if (remove.length) {
    const { error: e } = await client.from("todo_assignees").delete().eq("todo_id", todoId).in("user_id", remove);
    if (e) throw new Error(e.message);
  }
  if (add.length) {
    const { error: e } = await client.from("todo_assignees").insert(add.map((u) => ({ todo_id: todoId, user_id: u })));
    if (e) throw new Error(e.message);
  }
}

export async function createTodo(fd: FormData) {
  const me = await requireAction("todos");
  const title = str(fd, "title");
  if (!title) throw new Error("title required");
  const { data, error } = await db(`user:${me.id}`)
    .from("todos")
    .insert({ title, due_date: dateOrNull(str(fd, "due_date")), show_id: str(fd, "show_id") || null, source: "manual", created_by: me.id })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "create failed");
  await setAssignees(me.id, data.id, fd.getAll("assignees").filter((v): v is string => typeof v === "string" && v !== ""));
  revalidatePath("/todos");
}

export async function updateTodo(fd: FormData) {
  const me = await requireAction("todos");
  const id = str(fd, "id");
  const title = str(fd, "title");
  if (!title) throw new Error("title required");
  const { error } = await db(`user:${me.id}`)
    .from("todos")
    .update({ title, due_date: dateOrNull(str(fd, "due_date")), show_id: str(fd, "show_id") || null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await setAssignees(me.id, id, fd.getAll("assignees").filter((v): v is string => typeof v === "string" && v !== ""));
  revalidatePath("/todos");
}

export async function deleteTodo(fd: FormData) {
  const me = await requireAction("todos");
  const { error } = await db(`user:${me.id}`).from("todos").update({ deleted_at: new Date().toISOString() }).eq("id", str(fd, "id"));
  if (error) throw new Error(error.message);
  revalidatePath("/todos");
}
