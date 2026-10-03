import { requirePage } from "@/lib/auth/current";
import { db } from "@/lib/supabase";
import { addDays, formatMonthDay, todayInTaipei } from "@/lib/dates";
import { monthlyUsage, MONTHLY_PUSH_QUOTA } from "@/lib/reminders";
import { runReminders } from "@/lib/reminder-run";
import { remindersLive } from "@/lib/line/push";
import Avatar from "@/components/avatar";

// 推播用量（spec: Push only for reminders）與接下來幾天的提醒預覽（只預覽，不送出）。
export default async function PushPage() {
  const me = await requirePage("admin", "/admin/push");
  const today = todayInTaipei();
  const { data } = await db(`user:${me.id}`).from("line_pushes").select("sent_on, recipient_count, ok");
  const used = monthlyUsage((data ?? []).map((p: { sent_on: string; recipient_count: number; ok: boolean }) => ({ sentOn: p.sent_on, recipientCount: p.recipient_count, ok: p.ok })), today);
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i));
  const previews = (await Promise.all(days.map(async (d) => ({ day: d, items: await runReminders({ today: d, send: false }) })))).filter((p) => p.items.length);

  return (
    <main className="page">
      <header className="head">
        <div className="head-top"><div className="brand">看我笑話</div><Avatar user={me} /></div>
        <h1 className="page-title">LINE 推播</h1>
        <p className="page-sub">本月已用 {used} / {MONTHLY_PUSH_QUOTA} 則・推播{remindersLive() ? "已開啟" : "未開啟（只預覽）"}</p>
      </header>
      <div className="content">
        <div className="notice">演出前 3 天與前 1 天的早上 10 點，會在群組推播該場未完成的待辦。每次推播依群組人數計算則數。</div>
        <div className="section"><b>未來 14 天的提醒預覽</b></div>
        {previews.length === 0 ? <p className="empty">未來 14 天沒有要提醒的演出（演出要有日期，且有未完成的待辦）</p> : previews.map((p) => (
          p.items.map((r) => (
            <div key={`${p.day}-${r.showId}`} className="card">
              <div className="meta" style={{ marginTop: 0, marginBottom: 8 }}><span className="due">{formatMonthDay(p.day)} 10:00</span><span>{r.skipped ?? ""}</span></div>
              <div className="source" style={{ marginBottom: 0 }}>{r.text}</div>
            </div>
          ))
        ))}
      </div>
    </main>
  );
}
