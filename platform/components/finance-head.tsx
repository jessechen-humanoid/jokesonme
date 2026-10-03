import Link from "next/link";
import Avatar from "@/components/avatar";
import type { UserRow } from "@/lib/auth/users";

// Google Sheet 的「財務預估」分頁（預估留在 Sheet 編輯，2026-10-03 Jesse 決定）
const FORECAST_URL = "https://docs.google.com/spreadsheets/d/1sM-ST9lTjvCk7a0ppjSX48-zvhSOc16oYXEaVp3qisI/edit";

export default function FinanceHead({ me, active, title, sub }: { me: UserRow; active: "transactions" | "analytics" | "import"; title: string; sub?: string }) {
  const tab = (key: typeof active, href: string, label: string) => (
    <Link className={`chip ${active === key ? "on" : ""}`} href={href}>{label}</Link>
  );
  return (
    <header className="head">
      <div className="head-top">
        <div className="brand">看我笑話</div>
        <Avatar user={me} />
      </div>
      <div className="chips">
        {tab("transactions", "/finance/transactions", "收支紀錄")}
        {tab("analytics", "/finance/analytics", "財務分析")}
        {/* 匯入頁跑舊程式，必須整頁載入，所以用一般連結 */}
        <a className={`chip ${active === "import" ? "on" : ""}`} href="/finance/import">應援匯入</a>
        <a className="chip" href={FORECAST_URL} target="_blank" rel="noreferrer">財務預估 ↗</a>
      </div>
      <h1 className="page-title">{title}</h1>
      {sub ? <p className="page-sub">{sub}</p> : null}
    </header>
  );
}
