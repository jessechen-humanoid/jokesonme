import Link from "next/link";
import { requirePage } from "@/lib/auth/current";
import { listLedger, listTransactions } from "@/lib/finance/data";
import { categoryShares, commonFund, memberEarnings, MEMBERS, showPnl, yearSummary, type CategoryShare, type ShowPnl } from "@/lib/finance/calc";
import { todayInTaipei } from "@/lib/dates";
import FinanceHead from "@/components/finance-head";
import LedgerButtons from "@/components/ledger-sheet";

const money = (n: number) => `${n > 0 ? "+" : n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString()}`;
const plain = (n: number) => `$${n.toLocaleString()}`;
const cls = (n: number) => (n >= 0 ? "pos" : "neg");

type SortKey = "name" | "income" | "expense" | "net";

export default async function AnalyticsPage({ searchParams }: PageProps<"/finance/analytics">) {
  const sp = await searchParams;
  const me = await requirePage("finance", "/finance/analytics");
  const actor = `user:${me.id}` as const;
  const [txs, settlements, repayments] = await Promise.all([
    listTransactions(actor), listLedger(actor, "settlements"), listLedger(actor, "advance_repayments"),
  ]);
  const sum = yearSummary(txs);
  const fund = commonFund(txs);
  const members = memberEarnings(txs, settlements, repayments);

  // 各專案損益排序（舊頁面：預設依淨利由高到低；專案名稱預設由小到大）
  const sortKey: SortKey = sp.sort === "name" || sp.sort === "income" || sp.sort === "expense" ? sp.sort : "net";
  const dir = sp.dir === "asc" || sp.dir === "desc" ? sp.dir : sortKey === "name" ? "asc" : "desc";
  const mul = dir === "asc" ? 1 : -1;
  const pnl = showPnl(txs).sort((a: ShowPnl, b: ShowPnl) =>
    sortKey === "name" ? a.name.localeCompare(b.name, "zh-Hant") * mul
      : sortKey === "expense" ? (Math.abs(a.expense) - Math.abs(b.expense)) * mul
        : (a[sortKey] - b[sortKey]) * mul,
  );
  const sortLink = (key: SortKey, label: string) => {
    const nextDir = sortKey === key ? (dir === "asc" ? "desc" : "asc") : key === "name" ? "asc" : "desc";
    return <Link href={`/finance/analytics?sort=${key}&dir=${nextDir}#pnl`}>{label}{sortKey === key ? (dir === "asc" ? " ▲" : " ▼") : ""}</Link>;
  };

  return (
    <main className="page">
      <FinanceHead me={me} active="analytics" title="財務分析" sub="年度累計" />
      <div className="content">
        <div className="grid-stats">
          <div className="card"><small>年度總收入</small><span className="amount pos">{money(sum.totalIncome)}</span></div>
          <div className="card"><small>年度總支出</small><span className="amount neg">{money(sum.totalExpense)}</span></div>
          <div className="card"><small>年度淨利</small><span className={`amount ${cls(sum.netProfit)}`}>{money(sum.netProfit)}</span></div>
        </div>

        <div className="section"><b>看我笑話共同基金</b></div>
        <div className="grid-stats">
          <div className="card"><small>共同收入</small><span className="amount pos">{money(fund.commonIncome)}</span></div>
          <div className="card"><small>共同支出</small><span className="amount neg">{money(fund.commonExpense)}</span></div>
          <div className="card"><small>共同淨利</small><span className={`amount ${cls(fund.commonNetProfit)}`}>{money(fund.commonNetProfit)}</span></div>
          <div className="card"><small>提撥 20%（累積）</small><span className={`amount ${cls(fund.fundReserved)}`}>{money(fund.fundReserved)}</span></div>
          <div className="card"><small>基金已動用</small><span className="amount neg">{money(-fund.fundUsed)}</span></div>
          <div className="card"><small>基金餘額</small><span className={`amount ${cls(fund.fundBalance)}`}>{money(fund.fundBalance)}</span></div>
        </div>

        <div className="section"><b>成員年度報表</b><span>左右滑動看全部欄位</span></div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>成員</th><th>已收款淨利</th><th>未收款淨利</th><th>代墊未結清</th><th>代墊已結清</th><th>年度分配淨利</th></tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.name}>
                  <td>{m.name}</td>
                  <td>{money(m.settled)}</td>
                  <td className={cls(m.unsettledNet)}>{money(m.unsettledNet)}</td>
                  <td className={m.advanceUnsettled !== 0 ? "neg" : ""} title={m.advanceUnsettled < 0 ? "超還：代墊已結清大於代墊總額" : undefined}>{plain(m.advanceUnsettled)}</td>
                  <td>{plain(m.advanceCleared)}</td>
                  <td className={cls(m.annualNet)} style={{ fontWeight: 700 }}>{money(m.annualNet)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <LedgerButtons members={MEMBERS} today={todayInTaipei()} />

        <Shares title="收入佔比" items={categoryShares(txs, "income")} kind="pos" />
        <Shares title="支出佔比" items={categoryShares(txs, "expense")} kind="neg" />

        <div className="section" id="pnl"><b>各專案損益</b><span>點欄位名稱排序</span></div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>{sortLink("name", "專案")}</th><th>{sortLink("income", "收入")}</th><th>{sortLink("expense", "支出")}</th><th>{sortLink("net", "淨利")}</th></tr>
            </thead>
            <tbody>
              {pnl.map((p) => (
                <tr key={p.name}>
                  <td style={{ whiteSpace: "normal", minWidth: 140 }}>{p.name}</td>
                  <td className="pos">{money(p.income)}</td>
                  <td className="neg">{money(p.expense)}</td>
                  <td className={cls(p.net)} style={{ fontWeight: 700 }}>{money(p.net)}</td>
                </tr>
              ))}
              <tr className="total">
                <td>合計</td>
                <td className="pos">{money(sum.totalIncome)}</td>
                <td className="neg">{money(sum.totalExpense)}</td>
                <td className={cls(sum.netProfit)}>{money(sum.netProfit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function Shares({ title, items, kind }: { title: string; items: CategoryShare[]; kind: "pos" | "neg" }) {
  return (
    <>
      <div className="section"><b>{title}</b></div>
      <div className="card">
        {items.length === 0 ? <p className="empty" style={{ padding: 8 }}>尚無{kind === "pos" ? "收入" : "支出"}紀錄</p> : items.map((c) => (
          <div key={c.name} style={{ marginBottom: 10 }}>
            <div className="row" style={{ justifyContent: "space-between", fontSize: "var(--fs-body)" }}>
              <span>{c.name}</span>
              <span style={{ color: "var(--text-secondary)" }}>${c.amount.toLocaleString()}（{c.pct.toFixed(1)}%）</span>
            </div>
            <div style={{ height: 8, background: "var(--surface-2)", borderRadius: 4, marginTop: 4 }}>
              <div style={{ width: `${c.pct}%`, height: 8, borderRadius: 4, background: kind === "pos" ? "var(--success)" : "var(--danger-fin)" }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
