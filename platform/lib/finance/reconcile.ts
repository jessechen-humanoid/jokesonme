// 對帳：新程式（lib/finance/calc.ts）算出的數字 vs 舊平台程式算出的標準答案（scripts/legacy-oracle.mts）。
// 規則（spec: Reconciliation gate）：每一項差額都必須是 0；金額比到小數第 2 位（舊畫面顯示到小數 3 位）。
import { commonFund, deriveSettleStatus, memberEarnings, showPnl, yearSummary, type Ledger, type Tx } from "./calc.ts";

export type Oracle = {
  counts: Record<string, number>;
  summary: Record<string, number>;
  commonFund: Record<string, number>;
  members: { name: string; settled: number; unsettledNet: number; advanceUnsettled: number; advanceCleared: number; annualNet: number }[];
  shows: { name: string; income: number; expense: number; net: number }[];
  settleStatus: Record<string, { status: string; reimbursedAmount: number }>;
};
export type Check = { check: string; old: string | number; new: string | number; pass: boolean };

const same = (a: number, b: number) => Math.abs(Math.round(a * 100) - Math.round(b * 100)) === 0;

export function reconcile(oracle: Oracle, txs: Tx[], settlements: Ledger[], repayments: Ledger[], counts: Record<string, number>): Check[] {
  const out: Check[] = [];
  const num = (check: string, o: number | undefined, n: number) =>
    out.push({ check, old: o ?? "（舊的沒有）", new: n, pass: o !== undefined && same(o, n) });

  for (const k of Object.keys(oracle.counts)) num(`筆數：${k}`, oracle.counts[k], counts[k] ?? NaN);

  const s = yearSummary(txs);
  num("年度總收入", oracle.summary["年度總收入"], s.totalIncome);
  num("年度總支出", oracle.summary["年度總支出"], s.totalExpense);
  num("年度淨利", oracle.summary["年度淨利"], s.netProfit);

  const f = commonFund(txs);
  num("共同收入", oracle.commonFund["共同收入"], f.commonIncome);
  num("共同支出", oracle.commonFund["共同支出"], f.commonExpense);
  num("共同淨利", oracle.commonFund["共同淨利"], f.commonNetProfit);
  num("基金提撥 20%", oracle.commonFund["提撥 20%（累積）"], f.fundReserved);
  num("基金已動用", oracle.commonFund["基金已動用"], -f.fundUsed);
  num("基金餘額", oracle.commonFund["基金餘額"], f.fundBalance);

  const mine = new Map(memberEarnings(txs, settlements, repayments).map((m) => [m.name, m]));
  for (const o of oracle.members) {
    const n = mine.get(o.name);
    for (const [k, label] of [["settled", "已收款淨利"], ["unsettledNet", "未收款淨利"], ["advanceUnsettled", "代墊未結清"], ["advanceCleared", "代墊已結清"], ["annualNet", "年度分配淨利"]] as const) {
      num(`${o.name} ${label}`, o[k], n ? n[k] : NaN);
    }
  }

  const pnl = new Map(showPnl(txs).map((p) => [p.name, p]));
  for (const o of oracle.shows) {
    const n = pnl.get(o.name);
    num(`專案「${o.name}」收入`, o.income, n?.income ?? NaN);
    num(`專案「${o.name}」支出`, o.expense, n?.expense ?? NaN);
  }
  if (pnl.size !== oracle.shows.length) out.push({ check: "有收支的專案數", old: oracle.shows.length, new: pnl.size, pass: false });

  const st = deriveSettleStatus(txs, repayments);
  let settleMismatch = 0;
  for (const [id, o] of Object.entries(oracle.settleStatus)) {
    const n = st.get(id);
    if (!n || n.status !== o.status || !same(n.reimbursedAmount, o.reimbursedAmount)) {
      settleMismatch++;
      out.push({ check: `代墊結清 ${id}`, old: `${o.status} ${o.reimbursedAmount}`, new: n ? `${n.status} ${n.reimbursedAmount}` : "（沒有）", pass: false });
    }
  }
  out.push({ check: "代墊結清狀態（逐筆）", old: Object.keys(oracle.settleStatus).length, new: st.size, pass: settleMismatch === 0 && st.size === Object.keys(oracle.settleStatus).length });
  return out;
}
