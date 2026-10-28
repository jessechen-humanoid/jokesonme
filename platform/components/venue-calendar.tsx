"use client";
// 2027 大廳帶狀節目月曆：仿 Google 日曆月檢視，切換 3–12 月；格子裡是大廳場次與我們要訂的帶狀節目。
import { useState } from "react";
import { SLOT_TIME, bookings2027, hallEvents2027, holidays2027, isOpenMicSunday } from "@/lib/venue-availability-2027";

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

const bookingByDate = new Map(bookings2027.map((b) => [b.date, b]));

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
  const booking = bookings2027.find((b) => b.month === month)!;

  return (
    <>
      <section className="vc-year">
        <h2>訂場清單</h2>
        <div className="vc-table">
          <table>
            <thead><tr><th>月</th><th>日期</th><th>時段</th><th>距看我笑話</th><th>狀態</th></tr></thead>
            <tbody>
              {bookings2027.map((b) => (
                <tr key={b.month} aria-current={b.month === month} onClick={() => setMonth(b.month)}>
                  <td className="m">{b.month}月</td>
                  <td className="d">{md(b.date)}（{weekday(b.date)}）</td>
                  <td>{b.slot} {SLOT_TIME[b.slot]}</td>
                  <td className={b.gap === "距 1 天" || b.gap === "距 6 天" ? "bad" : "ok"}>{b.gap}</td>
                  <td><span className={`vc-status ${b.status === "已確認" ? "done" : ""}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="vc-hint">點任一列可以切到那個月的月曆。</p>
      </section>

      <section className="vc">
        <div className="vc-bar">
          <div className="vc-nav">
            <button type="button" aria-label="上個月" disabled={month === 3} onClick={() => setMonth(month - 1)}>‹</button>
            <button type="button" aria-label="下個月" disabled={month === 12} onClick={() => setMonth(month + 1)}>›</button>
          </div>
          <b className="vc-title">2027年{month}月</b>
          <div className="vc-months">
            {bookings2027.map((b) => (
              <button type="button" key={b.month} aria-pressed={b.month === month} onClick={() => setMonth(b.month)}>{b.month}月</button>
            ))}
          </div>
        </div>
        <div className="vc-grid">
          {HEAD.map((h) => <div className="vc-dow" key={h}>{h}</div>)}
          {monthDays(month).map((d) => {
            const key = iso(d);
            const out = d.getUTCMonth() !== month - 1;
            const wd = d.getUTCDay();
            const mine = out ? undefined : bookingByDate.get(key);
            const holiday = holidays2027[key];
            const cls = ["vc-cell", out && "out", !out && (wd === 0 || wd === 6) && "we", mine && "rec"].filter(Boolean).join(" ");
            return (
              <div className={cls} key={key}>
                <div className="vc-num">{d.getUTCDate() === 1 ? <><em>{d.getUTCMonth() + 1}月 </em>1日</> : d.getUTCDate()}</div>
                {holiday ? <div className="vc-hol" title={holiday}>{holiday}</div> : null}
                {mine ? <div className="vc-ev pick" title={`帶狀節目 ${SLOT_TIME[mine.slot]}（${mine.status}）`}>★ 帶狀節目 {mine.slot}</div> : null}
                {(hallEvents2027[key] ?? []).map(([time, title], i) => (
                  <div className={`vc-ev${title.includes("看我笑話") ? " ours" : ""}`} key={i} title={`${clock(time)} ${title}`}>{clock(time)} {title}</div>
                ))}
                {isOpenMicSunday(key) ? <div className="vc-ev om" title="漫才 open mic（依 2026/11/15 起隔週週日晚上推算）">晚上 漫才 open mic</div> : null}
              </div>
            );
          })}
        </div>
        <div className="vc-legend">
          <span><i className="sw pick" />帶狀節目（要訂的場次）</span>
          <span><i className="dot ours" />看我笑話已訂</span>
          <span><i className="dot om" />漫才 open mic（推算）</span>
          <span><i className="dot" />別人已訂</span>
          <span className="hol-key">紅字＝節日或連假</span>
        </div>
      </section>

      <section className="vc-detail">
        <div>
          <p className="venue-eyebrow">{month} 月場次</p>
          <p className="vc-big">{md(booking.date)}<small className={booking.sunday ? "sun" : undefined}>週{weekday(booking.date)} {booking.slot}</small></p>
          <div className="vc-chips">
            <span className={`vc-status ${booking.status === "已確認" ? "done" : ""}`}>{booking.status}</span>
            <span className={`vc-chip ${booking.gap === "距 1 天" || booking.gap === "距 6 天" ? "warn" : "good"}`}>{booking.gap}</span>
          </div>
        </div>
        <div className="vc-detail-body">
          <p><b>{SLOT_TIME[booking.slot]}</b>・大廳・公開售票演出</p>
          {booking.note ? <p className="vc-note">{booking.note}</p> : null}
        </div>
      </section>
    </>
  );
}
