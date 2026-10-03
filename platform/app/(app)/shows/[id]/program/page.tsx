import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePage } from "@/lib/auth/current";
import { db } from "@/lib/supabase";
import { listProgram, showsWithProgram } from "@/lib/program";
import { claudePrompt, rundownHtml, rundownText, withTimes } from "@/lib/program-render";
import { formatMonthDay } from "@/lib/dates";
import Avatar from "@/components/avatar";
import ProgramCopy from "@/components/program-copy";
import { copyFrom, move, removeItem, saveItem, saveStart } from "./actions";

const TEXT_FIELDS = [
  { name: "content", label: "內容（一行一點）", rows: 5 },
  { name: "props", label: "道具", rows: 2 },
  { name: "sound", label: "音效", rows: 2 },
  { name: "projection", label: "投影", rows: 2 },
] as const;

// 節目表頁（spec: program-sheet「Program sheet editing page」）
export default async function ProgramPage({ params, searchParams }: PageProps<"/shows/[id]/program">) {
  const { id } = await params;
  const sp = await searchParams;
  const me = await requirePage("planning", `/shows/${id}/program`);
  const actor = `user:${me.id}` as const;
  const { data: show } = await db(actor).from("shows").select("id, name, kind, performance_date, program_start_time").eq("id", id).maybeSingle<{ id: string; name: string; kind: string; performance_date: string | null; program_start_time: string }>();
  if (!show || show.kind !== "performance") notFound();
  const items = await listProgram(actor, id);
  const sources = items.length ? [] : await showsWithProgram(actor, id);
  const start = show.program_start_time.slice(0, 5);
  const times = withTimes(start, items);
  const total = items.reduce((s, i) => s + i.minutes, 0);
  const editing = typeof sp.edit === "string" ? items.find((i) => i.id === sp.edit) : undefined;
  const err = typeof sp.err === "string" ? sp.err : undefined;
  const base = `/shows/${id}/program`;

  return (
    <main className="page">
      <header className="head">
        <div className="head-top"><Link href={`/shows/${id}`} className="brand">‹ {show.name}</Link><Avatar user={me} /></div>
        <h1 className="page-title">節目表</h1>
        <p className="page-sub">{show.performance_date ? `${formatMonthDay(show.performance_date)}演出・` : ""}{items.length} 段・共 {total} 分鐘</p>
      </header>
      <div className="content">
        {err && !(sp.new === "1" || editing) ? <div className="notice" role="alert">{err}</div> : null}
        <section>
          <form action={saveStart} className="program-start">
            <input type="hidden" name="show_id" value={id} />
            <label><span>開始時間（第一段，通常是觀眾進場）</span><input className="input" type="time" name="start" defaultValue={start} required /></label>
            <button className="btn btn-ghost" type="submit">更新</button>
          </form>
        </section>

        {items.length ? (
          <section>
            <ProgramCopy html={rundownHtml(start, items)} text={rundownText(start, items)} prompt={claudePrompt({ name: show.name, performanceDate: show.performance_date }, start, items)} />
          </section>
        ) : null}

        <section>
          <div className="section"><b>段落</b><span>{items.length ? `${times[0].from} – ${times.at(-1)!.to}` : ""}</span></div>
          {items.length ? (
            items.map((it, n) => (
              <div key={it.id} className="program-item">
                <Link href={`${base}?edit=${it.id}`} className="program-main">
                  <span className="program-time">{times[n].from}<br /><small>{it.minutes} 分</small></span>
                  <span className="program-name">{it.name}{it.kind ? <span className="tag">{it.kind}</span> : null}
                    {it.content ? <small>{it.content.split("\n").filter((l) => l.trim())[0]}</small> : null}
                  </span>
                </Link>
                <form action={move} className="program-move">
                  <input type="hidden" name="show_id" value={id} />
                  <input type="hidden" name="id" value={it.id} />
                  <button type="submit" name="dir" value="up" disabled={n === 0} aria-label={`${it.name} 上移`}>↑</button>
                  <button type="submit" name="dir" value="down" disabled={n === items.length - 1} aria-label={`${it.name} 下移`}>↓</button>
                </form>
              </div>
            ))
          ) : (
            <>
              <p className="empty">還沒有段落。按右下角 ＋ 一段一段加{sources.length ? "，或從其他場整份複製再改" : ""}。</p>
              {sources.length ? (
                <form action={copyFrom} className="program-start">
                  <input type="hidden" name="show_id" value={id} />
                  <label><span>從這場複製</span>
                    <select className="select" name="source" defaultValue={sources[0].id}>
                      {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </label>
                  <button className="btn btn-ghost" type="submit">複製</button>
                </form>
              ) : null}
            </>
          )}
        </section>
      </div>
      <Link className="fab" href={`${base}?new=1`} aria-label="新增段落">+</Link>

      {sp.new === "1" || editing ? (
        <div className="sheet-backdrop">
          <Link href={base} aria-label="關閉" style={{ position: "absolute", inset: 0 }} />
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="item-sheet" style={{ position: "relative" }}>
            <h2 id="item-sheet">{editing ? "編輯段落" : "新增段落"}</h2>
            {err ? <div className="notice" role="alert">{err}</div> : null}
            <form action={saveItem}>
              <input type="hidden" name="show_id" value={id} />
              {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
              <label className="field"><span>名稱</span><input className="input" name="name" required maxLength={100} defaultValue={editing?.name} placeholder="例如：又兔了、企劃 1. 看我戀愛" /></label>
              <div className="cal-form-row">
                <label className="field"><span>類型（選填）</span><input className="input" name="kind" maxLength={30} defaultValue={editing?.kind} placeholder="漫才、企劃…" /></label>
                <label className="field"><span>時長（分鐘）</span><input className="input" name="minutes" inputMode="numeric" required defaultValue={editing?.minutes ?? ""} placeholder="7" /></label>
              </div>
              {TEXT_FIELDS.map((f) => (
                <label key={f.name} className="field"><span>{f.label}</span><textarea className="textarea" name={f.name} rows={f.rows} maxLength={2000} defaultValue={editing?.[f.name]} /></label>
              ))}
              <div className="actions">
                <button className="btn btn-primary" type="submit">{editing ? "儲存" : "新增"}</button>
                <Link className="btn btn-ghost" href={base}>取消</Link>
              </div>
            </form>
            {editing ? (
              <form action={removeItem} style={{ marginTop: 8 }}>
                <input type="hidden" name="show_id" value={id} />
                <input type="hidden" name="id" value={editing.id} />
                <button className="btn btn-danger" type="submit">刪除這段</button>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
