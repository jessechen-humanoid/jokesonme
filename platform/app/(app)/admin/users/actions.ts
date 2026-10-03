"use server";
// 管理員核准／撤銷（spec: Pending approval allowlist）。資料變動由 trigger 記，另寫一筆語意清楚的事件。
import { revalidatePath } from "next/cache";
import { requireAction } from "@/lib/auth/current";
import { db } from "@/lib/supabase";
import { logEvent } from "@/lib/audit";
import { MEMBER_NAMES } from "@/lib/members";
import type { Role } from "@/lib/auth/access";

const ROLES: Role[] = ["admin", "member", "finance_partner"];

function str(fd: FormData, k: string) {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
}

export async function approveUser(fd: FormData) {
  const me = await requireAction("admin");
  const id = str(fd, "id");
  const role = str(fd, "role") as Role;
  if (!ROLES.includes(role)) throw new Error("invalid role");
  const memberName = str(fd, "member_name");
  if (memberName && !(MEMBER_NAMES as readonly string[]).includes(memberName)) throw new Error("invalid member name");
  if (id === me.id && role !== "admin") throw new Error("不能把自己的管理員身分拿掉");
  const { error } = await db(`user:${me.id}`)
    .from("users")
    .update({ status: "approved", role, member_name: memberName || null, approved_by: me.id, approved_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await logEvent(`user:${me.id}`, "auth.approve", { user: id, role, member_name: memberName || null });
  revalidatePath("/admin/users");
}

export async function revokeUser(fd: FormData) {
  const me = await requireAction("admin");
  const id = str(fd, "id");
  if (id === me.id) throw new Error("不能撤銷自己");
  const { error } = await db(`user:${me.id}`).from("users").update({ status: "revoked" }).eq("id", id);
  if (error) throw new Error(error.message);
  await logEvent(`user:${me.id}`, "auth.revoke", { user: id });
  revalidatePath("/admin/users");
}
