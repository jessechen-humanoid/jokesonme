// 一次性（2026-10-03，Jesse 確認）：依公開行事曆補演出日期、類型、歸檔；月號照模板產生待辦。
// 只動下面列出的演出名稱；每一筆都寫入操作紀錄（actor = migration）。
import { db } from "../lib/supabase.ts";
import { ensureTemplateTodos } from "../lib/templates.ts";

type Plan = { name: string; type?: "monthly" | "special" | "other"; date?: string; status?: "active" | "archived"; kind?: "performance" | "ledger" };
const PLAN: Plan[] = [
  { name: "看我笑話 10 月號", type: "monthly", date: "2026-10-17" },
  { name: "看我笑話 11 月號", type: "monthly", date: "2026-11-21" },
  { name: "看我笑話 12 月號", type: "monthly", date: "2026-12-19" },
  { name: "看我笑話第 2 季 After Party", type: "other", date: "2026-12-19" },
  { name: "看我笑話 9 月號", date: "2026-09-19", status: "archived" },
  { name: "2026 支薪好友喜劇專場 《向上管理》", date: "2026-09-05", status: "archived" },
  { name: "現代問題維修中心 9 月號", date: "2026-09-12", status: "archived" },
  { name: "2026 又兔了喜劇專場 《續杯：一杯撤》", kind: "ledger" }, // 單一組合專場：只留在財務
];

const client = db("migration");
for (const p of PLAN) {
  const patch: Record<string, string> = {};
  if (p.type) patch.type = p.type;
  if (p.date) patch.performance_date = p.date;
  if (p.status) patch.status = p.status;
  if (p.kind) patch.kind = p.kind;
  const { data, error } = await client.from("shows").update(patch).eq("name", p.name).select("id");
  if (error || !data?.length) throw new Error(`更新失敗：${p.name} ${error?.message ?? "找不到"}`);
  const created = p.type === "monthly" ? await ensureTemplateTodos("migration", data[0].id) : 0;
  console.log(`✓ ${p.name}${created ? `（產生 ${created} 筆模板待辦）` : ""}`);
}
