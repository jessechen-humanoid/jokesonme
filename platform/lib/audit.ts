// 非資料變動的操作紀錄事件（登入、核准、匯出…）。資料變動由資料庫 trigger 自動記，不用呼叫這裡。
import { db, type Actor } from "./supabase.ts";

export async function logEvent(actor: Actor, op: string, detail: Record<string, unknown> = {}): Promise<void> {
  const { error } = await db(actor).from("audit_log").insert({ actor, kind: "event", op, detail });
  if (error) console.error("[audit] logEvent failed", op, error.message);
}
