"use server";
// 新增演出（spec: show-management「Add new show」）：月號一定要有演出日期。
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAction } from "@/lib/auth/current";
import { db } from "@/lib/supabase";

export async function createShow(fd: FormData) {
  const me = await requireAction("planning");
  const name = String(fd.get("name") ?? "").trim();
  const type = String(fd.get("type") ?? "other");
  const date = String(fd.get("performance_date") ?? "").trim();
  if (!name) redirect("/shows?new=1&err=name");
  if (!["monthly", "special", "other"].includes(type)) throw new Error("invalid type");
  if (type === "monthly" && !/^\d{4}-\d{2}-\d{2}$/.test(date)) redirect("/shows?new=1&err=date");
  const { error } = await db(`user:${me.id}`)
    .from("shows")
    .insert({ name, type, performance_date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null });
  if (error) redirect(`/shows?new=1&err=${error.code === "23505" ? "dup" : "save"}`);
  revalidatePath("/shows");
  revalidatePath("/todos");
  redirect("/shows");
}
