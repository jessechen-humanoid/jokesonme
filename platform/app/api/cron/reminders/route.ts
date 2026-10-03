// 每天 10:00（台北）由 worker.ts 的排程呼叫。REMINDERS_LIVE=1 才會真的推播，否則只記 log。
import { isCronRequest } from "@/lib/cron/auth";
import { runReminders } from "@/lib/reminder-run";

export async function POST(request: Request): Promise<Response> {
  if (!isCronRequest(request)) return new Response("unauthorized", { status: 401 });
  try {
    const result = await runReminders({ send: true });
    console.log("[reminders]", JSON.stringify(result.map((r) => ({ show: r.showName, open: r.openTodos, sent: r.sent, skipped: r.skipped }))));
    return Response.json({ ok: true, result });
  } catch (e) {
    console.error("[reminders] failed", e);
    return Response.json({ ok: false }, { status: 500 });
  }
}
