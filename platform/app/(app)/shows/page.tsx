import Link from "next/link";
import { requirePage } from "@/lib/auth/current";
import { listShows, SHOW_TYPE_LABEL } from "@/lib/shows";
import { formatMonthDay, todayInTaipei } from "@/lib/dates";
import Avatar from "@/components/avatar";
import { createShow } from "./actions";

const ERRORS: Record<string, string> = {
  name: "請填寫演出名稱",
  date: "月號一定要填演出日期",
  dup: "已經有同名的演出",
  save: "儲存失敗，請再試一次",
};

export default async function ShowsPage({ searchParams }: PageProps<"/shows">) {
  const sp = await searchParams;
  const me = await requirePage("planning", "/shows");
  const shows = await listShows(`user:${me.id}`);
  const today = todayInTaipei();
  const upcoming = shows.filter((s) => !s.performanceDate || s.performanceDate >= today).reverse();
  const past = shows.filter((s) => s.performanceDate && s.performanceDate < today);
  const err = typeof sp.err === "string" ? ERRORS[sp.err] : undefined;

  return (
    <main className="page">
      <header className="head">
        <div className="head-top"><div className="brand">看我笑話</div><Avatar user={me} /></div>
        <h1 className="page-title">企劃</h1>
        <p className="page-sub">每場演出的靈感、待辦與文件</p>
      </header>
      <div className="content">
        <div className="section"><b>接下來</b><span>{upcoming.length} 場</span></div>
        {upcoming.length === 0 ? <p className="empty">還沒有排演出，按右下角 + 新增</p> : upcoming.map((s) => <ShowCard key={s.id} s={s} />)}
        {past.length ? (
          <>
            <div className="section"><b>已演出</b><span>{past.length} 場</span></div>
            {past.map((s) => <ShowCard key={s.id} s={s} />)}
          </>
        ) : null}
      </div>
      <Link className="fab" href="/shows?new=1" aria-label="新增演出">+</Link>

      {sp.new === "1" ? (
        <div className="sheet-backdrop">
          <Link href="/shows" aria-label="關閉" style={{ position: "absolute", inset: 0 }} />
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="new-show" style={{ position: "relative" }}>
            <h2 id="new-show">新增演出</h2>
            {err ? <div className="notice">{err}</div> : null}
            <form action={createShow}>
              <label className="field"><span>演出名稱</span><input className="input" name="name" required maxLength={100} placeholder="例如：第 2 季 11 月號" /></label>
              <label className="field">
                <span>類型</span>
                <select className="select" name="type" defaultValue="monthly">
                  <option value="monthly">月號</option>
                  <option value="special">專場</option>
                  <option value="other">其他</option>
                </select>
              </label>
              <label className="field"><span>演出日期（月號必填）</span><input className="input" type="date" name="performance_date" /></label>
              <div className="actions">
                <button className="btn btn-primary" type="submit">新增</button>
                <Link className="btn btn-ghost" href="/shows">取消</Link>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function ShowCard({ s }: { s: { id: string; name: string; type: keyof typeof SHOW_TYPE_LABEL; performanceDate: string | null } }) {
  return (
    <div className="card">
      <div className="title">{s.name}</div>
      <div className="meta">
        {s.performanceDate ? <span className="due">{formatMonthDay(s.performanceDate)}演出</span> : <span>未定日期</span>}
        <span className="tag">{SHOW_TYPE_LABEL[s.type]}</span>
      </div>
    </div>
  );
}
