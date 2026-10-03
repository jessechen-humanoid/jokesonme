// users 表的讀寫：登入時建立或更新、取目前使用者。
import { db } from "../supabase.ts";
import { logEvent } from "../audit.ts";
import type { LineProfile } from "./line-login.ts";
import type { Role, UserStatus } from "./access.ts";

export type UserRow = {
  id: string;
  display_name: string;
  member_name: string | null;
  picture_url: string | null;
  role: Role | null;
  status: UserStatus;
  last_login_at: string | null;
};

export const USER_COLUMNS = "id, display_name, member_name, picture_url, role, status, last_login_at";

export async function getUser(id: string): Promise<UserRow | null> {
  const { data, error } = await db(`user:${id}`).from("users").select(USER_COLUMNS).eq("id", id).maybeSingle<UserRow>();
  if (error) throw new Error(`read user: ${error.message}`);
  return data;
}

/** 登入成功：沒有就建一列 pending；有就更新名字、大頭照、登入時間。回傳最新的使用者資料。 */
export async function recordLogin(p: LineProfile, via: "web" | "liff"): Promise<UserRow> {
  const client = db(`user:${p.userId}`);
  const now = new Date().toISOString();
  const existing = await getUser(p.userId);
  if (existing) {
    const { error } = await client
      .from("users")
      .update({ display_name: p.name, picture_url: p.picture, last_login_at: now })
      .eq("id", p.userId);
    if (error) throw new Error(`update user: ${error.message}`);
  } else {
    const { error } = await client
      .from("users")
      .insert({ id: p.userId, display_name: p.name, picture_url: p.picture, status: "pending", last_login_at: now });
    if (error) throw new Error(`insert user: ${error.message}`);
  }
  await logEvent(`user:${p.userId}`, "auth.login", { via });
  const user = await getUser(p.userId);
  if (!user) throw new Error("user vanished after login");
  return user;
}

/** 顯示用名字：成員名優先，其次 LINE 顯示名稱。 */
export function displayName(u: Pick<UserRow, "member_name" | "display_name"> | null | undefined): string {
  return u?.member_name || u?.display_name || "成員";
}
