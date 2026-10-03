// 每日 03:30（台北）刪除超過 14 天、未被待辦或靈感引用的一般聊天（spec: Ordinary chat retention）。
// 天數下限寫死在資料庫函式 purge_line_messages 裡；這裡只傳 14。
import { isCronRequest } from "@/lib/cron/auth";
import { db } from "@/lib/supabase";

export async function POST(request: Request): Promise<Response> {
  if (!isCronRequest(request)) return new Response("unauthorized", { status: 401 });
  const { data, error } = await db("line-bot").rpc("purge_line_messages", { keep_days: 14 });
  if (error) {
    console.error("[cron] purge_line_messages failed", error.message);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true, deleted: data });
}
