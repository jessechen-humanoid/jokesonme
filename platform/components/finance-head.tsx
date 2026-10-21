import Link from "next/link";
import TopBar from "@/components/top-bar";
import type { UserRow } from "@/lib/auth/users";

// Google Sheet 的「財務預估」分頁（預估留在 Sheet 編輯，2026-10-03 Jesse 決定）
const FORECAST_URL = "https://docs.google.com/spreadsheets/d/1sM-ST9lTjvCk7a0ppjSX48-zvhSOc16oYXEaVp3qisI/edit";

// 財務各頁共用頁首：頂列＋五個分頁（標籤縮短到 375px 一行放得下）
export default function FinanceHead({ me, active, title, sub }: { me: UserRow; active: "transactions" | "log" | "analytics" | "import"; title: string; sub?: string }) {
  const tab = (key: typeof active, href: string, label: string) => (
    <Link className={active === key ? "on" : ""} href={href} aria-current={active === key ? "page" : undefined}>{label}</Link>
  );
  return (
    <>
      <TopBar me={me} title={title} sub={sub} />
      <nav className="seg-tabs" aria-label="財務分頁">
        {tab("transactions", "/finance/transactions", "收支")}
        {tab("log", "/finance/log", "逐筆")}
        {tab("analytics", "/finance/analytics", "分析")}
        {/* 匯入頁跑舊程式，必須整頁載入，所以用一般連結 */}
        <a className={active === "import" ? "on" : ""} href="/finance/import">匯入</a>
        <a href={FORECAST_URL} target="_blank" rel="noreferrer" title="財務預估（Google Sheet）">預估 ↗</a>
      </nav>
    </>
  );
}
