import Link from "next/link";
import { requirePage } from "@/lib/auth/current";
import { showCalendarFeed } from "@/lib/calendar/feed";
import { eventsInRange } from "@/lib/calendar/ics";
import { buildDays, monthGrid, shiftMonth, type DayItem } from "@/lib/calendar/days";
import { listEvents } from "@/lib/events";
import { listTodos } from "@/lib/todos";
import { formatMonthDay, formatTaipeiStamp, todayInTaipei } from "@/lib/dates";
import Avatar from "@/components/avatar";
import { removeEvent, saveEvent } from "./actions";

const KIND_LABEL = { show: "演出", event: "行程", todo: "待辦" } as const;
const WEEK = ["日", "一", "二", "三", "四", "五", "六"];

// 行事曆（spec: team-calendar「Calendar page with three layers」）：演出（公開日曆、唯讀）＋內部行程＋待辦截止日。
export default async function CalendarPage({ searchParams }: PageProps<"/calendar">) {
  const sp = await searchParams;
  const me = await requirePage("planning", "/calendar");
  const today = todayInTaipei();
  const month = typeof sp.m === "string" && /^\d{4}-\d{2}$/.test(sp.m) ? sp.m : today.slice(0, 7);
  const grid = monthGrid(month);
  const [from, to] = [grid[0], grid.at(-1)!];
  const picked = typeof sp.d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.d) && grid.includes(sp.d) ? sp.d : today.startsWith(month) ? today : `${month}-01`;

  const actor = `user:${me.id}` as const;
  const [feed, events, todos] = await Promise.all([showCalendarFeed(), listEvents(actor, from, to), listTodos(actor)]);
  const shows = "text" in feed ? eventsInRange(feed.text, from, to) : [];
  const due = todos.filter((t) => t.dueDate && !t.doneAt).map((t) => ({ id: t.id, title: t.title, dueDate: t.dueDate! }));
  const days = buildDays(from, to, shows, events, due);
  const dayItems = days.get(picked) ?? [];
  const editing = typeof sp.edit === "string" ? events.find((e) => e.id === sp.edit) : undefined;
  const sheetOpen = sp.new === "1" || editing;
  const err = typeof sp.err === "string" ? sp.err : undefined;
  const [y, m] = month.split("-").map(Number);
  const href = (q: Record<string, string>) => `/calendar?${new URLSearchParams({ m: month, d: picked, ...q })}`;

  return (
    <main className="page">
      <header className="head">
        <div className="head-top"><div className="brand">看我笑話</div><Avatar user={me} /></div>
        <h1 className="page-title">行事曆</h1>
      </header>
      <div className="content">
        {feed.status === "stale" ? <div className="notice">演出資料停在 {formatTaipeiStamp(feed.fetchedAt)}</div> : null}
        {feed.status === "missing" ? <div className="notice">演出資料讀不到，目前只顯示內部行程與待辦。</div> : null}
        <section>
          <div className="cal-nav">
            <Link href={`/calendar?m=${shiftMonth(month, -1)}`} aria-label="上個月">‹</Link>
            <b>{y} 年 {m} 月</b>
            <Link href={`/calendar?m=${shiftMonth(month, 1)}`} aria-label="下個月">›</Link>
          </div>
          <div className="cal-grid" role="grid">
            {WEEK.map((w) => <div key={w} className="cal-wd">{w}</div>)}
            {grid.map((d) => {
              const items = days.get(d) ?? [];
              const cls = ["cal-day", d.startsWith(month) ? "" : "out", d === today ? "today" : "", d === picked ? "on" : ""].join(" ");
              return (
                <Link key={d} href={`/calendar?m=${month}&d=${d}`} className={cls} aria-label={`${formatMonthDay(d)}，${items.length} 項`}>
                  <span className="cal-num">{Number(d.slice(8))}</span>
                  <span className="cal-dots">
                    {items.slice(0, 4).map((i, n) => <i key={n} className={i.kind} />)}
                  </span>
                  <span className="cal-titles">
                    {items.filter((i) => i.kind !== "todo").slice(0, 2).map((i, n) => <em key={n} className={i.kind}>{i.title}</em>)}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="cal-legend"><span><i className="show" />演出</span><span><i className="event" />內部行程</span><span><i className="todo" />待辦截止</span></div>
        </section>
        <section>
          <div className="section"><b>{formatMonthDay(picked)}</b><span>{dayItems.length ? `${dayItems.length} 項` : ""}</span></div>
          {dayItems.length ? dayItems.map((i, n) => <DayRow key={n} item={i} editHref={i.kind === "event" ? href({ edit: i.id! }) : undefined} />) : <p className="empty">這天沒有安排</p>}
        </section>
      </div>
      <Link className="fab" href={href({ new: "1" })} aria-label="新增內部行程">+</Link>

      {sheetOpen ? (
        <div className="sheet-backdrop">
          <Link href={href({})} aria-label="關閉" style={{ position: "absolute", inset: 0 }} />
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="event-sheet" style={{ position: "relative" }}>
            <h2 id="event-sheet">{editing ? "編輯內部行程" : "新增內部行程"}</h2>
            <p className="meta" style={{ marginBottom: 12 }}>只存在平台，不會出現在觀眾看的演出日曆。</p>
            {err ? <div className="notice">{err}</div> : null}
            <form action={saveEvent}>
              {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
              <label className="field"><span>標題</span><input className="input" name="title" required maxLength={100} defaultValue={editing?.title} placeholder="例如：討論 11 月號" /></label>
              <div className="cal-form-row">
                <label className="field"><span>日期</span><input className="input" type="date" name="date" required defaultValue={editing?.date ?? picked} /></label>
                <label className="field"><span>時間（選填）</span><input className="input" type="time" name="time" defaultValue={editing?.time ?? ""} /></label>
              </div>
              <label className="field"><span>備註（選填）</span><textarea className="input" name="notes" rows={3} maxLength={1000} defaultValue={editing?.notes} /></label>
              <div className="actions">
                <button className="btn btn-primary" type="submit">{editing ? "儲存" : "新增"}</button>
                <Link className="btn btn-ghost" href={href({})}>取消</Link>
              </div>
            </form>
            {editing ? (
              <form action={removeEvent} style={{ marginTop: 8 }}>
                <input type="hidden" name="id" value={editing.id} />
                <input type="hidden" name="date" value={editing.date} />
                <button className="btn btn-danger" type="submit">刪除這個行程</button>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}

function DayRow({ item, editHref }: { item: DayItem; editHref?: string }) {
  const body = (
    <>
      <span className="cal-time">{item.kind === "todo" ? "截止" : item.time ?? "整天"}</span>
      <span className="cal-item-title">{item.title}</span>
      <span className={`cal-kind ${item.kind}`}>{KIND_LABEL[item.kind]}</span>
    </>
  );
  const cls = `cal-item ${item.kind}`;
  if (editHref) return <Link href={editHref} className={cls}>{body}</Link>;
  if (item.href) return <Link href={item.href} className={cls}>{body}</Link>;
  return <div className={cls}>{body}</div>;
}
