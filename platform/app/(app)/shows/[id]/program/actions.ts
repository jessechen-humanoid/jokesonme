"use server";
// 節目表的寫入（spec: program-sheet）。寫入以本人為 actor。
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAction } from "@/lib/auth/current";
import { addItem, copyProgram, deleteItem, moveItem, setStartTime, updateItem, validateItem } from "@/lib/program";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");
const page = (showId: string) => `/shows/${showId}/program`;

export async function saveItem(fd: FormData) {
  const me = await requireAction("planning");
  const showId = str(fd, "show_id");
  const id = str(fd, "id");
  const item = validateItem({ name: str(fd, "name"), kind: str(fd, "kind"), minutes: str(fd, "minutes"), content: str(fd, "content"), props: str(fd, "props"), sound: str(fd, "sound"), projection: str(fd, "projection") });
  if ("error" in item) redirect(`${page(showId)}?${id ? `edit=${id}` : "new=1"}&err=${encodeURIComponent(item.error)}`);
  if (id) await updateItem(`user:${me.id}`, id, item);
  else await addItem(`user:${me.id}`, showId, item);
  revalidatePath(page(showId));
  redirect(page(showId));
}

export async function removeItem(fd: FormData) {
  const me = await requireAction("planning");
  await deleteItem(`user:${me.id}`, str(fd, "id"), me.id);
  revalidatePath(page(str(fd, "show_id")));
  redirect(page(str(fd, "show_id")));
}

export async function move(fd: FormData) {
  const me = await requireAction("planning");
  await moveItem(`user:${me.id}`, str(fd, "show_id"), str(fd, "id"), str(fd, "dir") === "up" ? -1 : 1);
  revalidatePath(page(str(fd, "show_id")));
}

export async function saveStart(fd: FormData) {
  const me = await requireAction("planning");
  const time = str(fd, "start");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) redirect(`${page(str(fd, "show_id"))}?err=${encodeURIComponent("開始時間格式要像 19:00")}`);
  await setStartTime(`user:${me.id}`, str(fd, "show_id"), time);
  revalidatePath(page(str(fd, "show_id")));
}

export async function copyFrom(fd: FormData) {
  const me = await requireAction("planning");
  const showId = str(fd, "show_id");
  const r = await copyProgram(`user:${me.id}`, showId, str(fd, "source"));
  const err = { ok: "", "not-empty": "這場已經有節目表，不能整份複製", "empty-source": "那場沒有節目表" }[r];
  revalidatePath(page(showId));
  redirect(err ? `${page(showId)}?err=${encodeURIComponent(err)}` : page(showId));
}
