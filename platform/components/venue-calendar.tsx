"use client";
// 2027 大廳帶狀節目月曆：仿 Google 日曆月檢視，切換 3–12 月；格子裡是大廳場次、建議日（實心）與備選（虛線）。
import { useState } from "react";
import { hallEvents2027, holidays2027, isOpenMicSunday, monthPicks2027 } from "@/lib/venue-availability-2027";

const WEEKDAYS = "日一二三四五六";
const HEAD = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"];

const iso = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
const md = (date: string) => `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`;
const weekday = (date: string) => WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()];

/** 「20:00」→「下午8點」，跟 Google 日曆的寫法一樣 */
function clock(hm: string) {
  if (!hm) return "";
  const [h, m] = hm.split(":").map(Number);
  const part = h < 12 ? "上午" : h === 12 ? "中午" : "下午";
  return `${part}${h > 12 ? h - 12 : h}${m ? `:${String(m).padStart(2, "0")}` : "點"}`;
}

const pickByDate = new Map(monthPicks2027.map((p) => [p.date, p]));
const altByDate = new Map(monthPicks2027.flatMap((p) => p.alts.map((a) => [a[0], a] as const)));

function monthDays(month: number) {
  const first = new Date(Date.UTC(2027, month - 1, 1));
  const last = new Date(Date.UTC(2027, month, 0));
  const start = new Date(first);
  start.setUTCDate(1 - ((first.getUTCDay() + 6) % 7));
  const end = new Date(last);
  end.setUTCDate(last.getUTCDate() + (6 - ((last.getUTCDay() + 6) % 7)));
  const days: Date[] = [];
  for (const d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) days.push(new Date(d));
  return days;
}

export default function VenueCalendar() {
  const [month, setMonth] = useState(3);
  const pick = monthPicks2027.find((p) => p.month === month)!;

  return (
    <>
      <section className="vc">
        <div className="vc-bar">
          <div className="vc-nav">
            <button type="button" aria-label="上個月" disabled={month === 3} onClick={() => setMonth(month - 1)}>‹</button>
            <button type="button" aria-label="下個月" disabled={month === 12} onClick={() => setMonth(month + 1)}>›</button>
          </div>
          <b className="vc-title">2027年{month}月</b>
          <div className="vc-months">
            {monthPicks2027.map((p) => (
              <button type="button" key={p.month} className={p.tradeoff ? "flag" : undefined} aria-pressed={p.month === month} onClick={() => setMonth(p.month)}>{p.month}月</button>
            ))}
          </div>
        </div>
        <div className="vc-grid">
          {HEAD.map((h) => <div className="vc-dow" key={h}>{h}</div>)}
          {monthDays(month).map((d) => {
            const key = iso(d);
            const out = d.getUTCMonth() !== month - 1;
            const wd = d.getUTCDay();
            const isPick = !out && pickByDate.has(key);
            const alt = out ? undefined : altByDate.get(key);
            const holiday = holidays2027[key];
            const cls = ["vc-cell", out && "out", !out && (wd === 0 || wd === 6) && "we", isPick && "rec"].filter(Boolean).join(" ");
            return (
              <div className={cls} key={key}>
                <div className="vc-num">{d.getUTCDate() === 1 ? <><em>{d.getUTCMonth() + 1}月 </em>1日</> : d.getUTCDate()}</div>
                {holiday ? <div className="vc-hol" title={holiday}>{holiday}</div> : null}
                {isPick ? <div className="vc-ev pick" title="建議：帶狀節目 下午場 13:30–17:30">★ 下午1:30 帶狀節目</div> : null}
                {alt ? <div className="vc-ev alt" title={`備選：${alt[1]}（${alt[2]}）`}>備選 {alt[1] === "晚上" ? "晚上6點" : "下午1:30"}</div> : null}
                {(hallEvents2027[key] ?? []).map(([time, title], i) => (
                  <div className={`vc-ev${title.includes("看我笑話") ? " ours" : ""}`} key={i} title={`${clock(time)} ${title}`}>{clock(time)} {title}</div>
                ))}
                {isOpenMicSunday(key) ? <div className="vc-ev om" title="漫才 open mic（依 2026/11/15 起隔週週日晚上推算）">晚上 漫才 open mic</div> : null}
              </div>
            );
          })}
        </div>
        <div className="vc-legend">
          <span><i className="sw pick" />建議日</span>
          <span><i className="sw alt" />備選</span>
          <span><i className="dot ours" />看我笑話已訂</span>
          <span><i className="dot om" />漫才 open mic（推算）</span>
          <span><i className="dot" />別人已訂</span>
          <span className="hol-key">紅字＝節日或連假</span>
        </div>
      </section>

      <section className="vc-detail">
        <div>
          <p className="venue-eyebrow">{month} 月建議</p>
          <p className="vc-big">{md(pick.date)}<small className={pick.sunday ? "sun" : undefined}>{pick.when}</small></p>
          <div className="vc-chips">{pick.chips.map(([tone, text]) => <span className={`vc-chip ${tone}`} key={text}>{text}</span>)}</div>
        </div>
        <div className="vc-detail-body">
          <p>{pick.note}</p>
          <div>
            <p className="venue-eyebrow">備選</p>
            {pick.alts.map(([date, slot, why]) => (
              <p className="vc-alt" key={date}><b>{md(date)}（{weekday(date)}）{slot}</b><span>{why}</span></p>
            ))}
          </div>
        </div>
      </section>

      <section className="vc-year">
        <h2>全年總表</h2>
        <div className="vc-table">
          <table>
            <thead><tr><th>月</th><th>建議日</th><th>時段</th><th>距看我笑話</th><th>取捨</th></tr></thead>
            <tbody>
              {monthPicks2027.map((p) => {
                const gap = p.chips.filter(([tone, t]) => tone !== "warn" || t.startsWith("距"));
                const cost = p.chips.filter(([tone, t]) => tone === "warn" && !t.startsWith("距")).map(([, t]) => t);
                return (
                  <tr key={p.month} aria-current={p.month === month} onClick={() => setMonth(p.month)}>
                    <td className="m">{p.month}月</td>
                    <td className="d">{md(p.date)}（{weekday(p.date)}）</td>
                    <td className={p.sunday ? "bad" : undefined}>{p.when}</td>
                    <td>{gap.map(([tone, t]) => <span className={tone === "warn" ? "bad" : tone === "good" ? "ok" : "same"} key={t}>{t}</span>)}</td>
                    <td className={cost.length ? "bad" : undefined}>{cost.join("、") || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="vc-hint">點任一列可以切到那個月的月曆。</p>
      </section>
    </>
  );
}
