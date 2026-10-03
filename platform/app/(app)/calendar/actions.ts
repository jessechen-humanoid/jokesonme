"use server";
// 內部行程的網頁新增／編輯／刪除（spec: team-calendar「Internal events」）。寫入以本人為 actor。
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAction } from "@/lib/auth/current";
import { createEvent, deleteEvent, updateEvent, validateEvent } from "@/lib/events";

function back(fd: FormData, extra = ""): string {
  const date = String(fd.get("date") ?? "");
  const m = /^\d{4}-\d{2}/.test(date) ? date.slice(0, 7) : "";
  return `/calendar?m=${m}&d=${date}${extra}`;
}

export async function saveEvent(fd: FormData) {
  const me = await requireAction("planning");
  const id = String(fd.get("id") ?? "");
  const input = validateEvent({
    date: String(fd.get("date") ?? ""), time: String(fd.get("time") ?? ""),
    title: String(fd.get("title") ?? ""), notes: String(fd.get("notes") ?? ""),
  });
  if ("error" in input) redirect(back(fd, `&${id ? `edit=${id}` : "new=1"}&err=${encodeURIComponent(input.error)}`));
  if (id) await updateEvent(`user:${me.id}`, id, input);
  else await createEvent(`user:${me.id}`, input, me.id);
  revalidatePath("/calendar");
  redirect(back(fd));
}

export async function removeEvent(fd: FormData) {
  const me = await requireAction("planning");
  await deleteEvent(`user:${me.id}`, String(fd.get("id") ?? ""), me.id);
  revalidatePath("/calendar");
  redirect(back(fd));
}
