// 應援匯入的資料出口（取代舊 GAS getShows / batchImportTransactions，回傳格式相同）。
// 每筆都驗證專案、分類、金額；全部合格才寫入。寫入後重算受影響專案的稅務預留。
import { requireAction } from "@/lib/auth/current";
import { db } from "@/lib/supabase";
import { listShows } from "@/lib/shows";
import { syncTaxReserve } from "@/lib/finance/data";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/finance/calc";
import { todayInTaipei } from "@/lib/dates";
import { logEvent } from "@/lib/audit";

const CATEGORIES = new Set<string>([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]);

export async function GET(): Promise<Response> {
  try {
    const me = await requireAction("finance");
    const shows = await listShows(`user:${me.id}`);
    return Response.json({ success: true, data: shows.map((s) => ({ name: s.name })) });
  } catch {
    return Response.json({ success: false, error: "沒有權限" }, { status: 403 });
  }
}

type Incoming = { showName?: string; category?: string; notes?: string; amount?: number };

export async function POST(request: Request): Promise<Response> {
  let me;
  try {
    me = await requireAction("finance");
  } catch {
    return Response.json({ success: false, error: "沒有權限" }, { status: 403 });
  }
  const actor = `user:${me.id}` as const;
  const body = (await request.json().catch(() => null)) as { transactions?: Incoming[] } | null;
  const list = body?.transactions;
  if (!Array.isArray(list) || list.length === 0) return Response.json({ success: false, error: "沒有要匯入的交易資料" });
  if (list.length > 2000) return Response.json({ success: false, error: "一次最多匯入 2000 筆" });

  const shows = new Map((await listShows(actor)).map((s) => [s.name, s.id]));
  const today = todayInTaipei(); // 舊版用瀏覽器的 UTC 日期，台灣早上 8 點前會變成前一天；這裡改用台北日期
  const rows = [];
  for (const [i, t] of list.entries()) {
    const showId = shows.get((t.showName ?? "").trim());
    const amount = Number(t.amount);
    const category = (t.category ?? "").trim();
    if (!showId) return Response.json({ success: false, error: `第 ${i + 1} 筆的專案「${t.showName}」不存在` });
    if (!CATEGORIES.has(category)) return Response.json({ success: false, error: `第 ${i + 1} 筆的分類「${category}」不正確` });
    if (!Number.isFinite(amount) || amount === 0) return Response.json({ success: false, error: `第 ${i + 1} 筆的金額不正確` });
    rows.push({
      show_id: showId, category, notes: (t.notes ?? "").trim(), amount, advanced_by: null, excluded_members: [],
      date: today, recorded_by: "應援匯入", paid_by_fund: false, auto_generated: false,
    });
  }
  const { error } = await db(actor).from("transactions").insert(rows);
  if (error) return Response.json({ success: false, error: error.message });
  for (const showId of new Set(rows.map((r) => r.show_id))) await syncTaxReserve(actor, showId);
  await logEvent(actor, "finance.import", { rows: rows.length });
  return Response.json({ success: true, data: { count: rows.length } });
}
