import Link from "next/link";
import TopBar from "@/components/top-bar";
import { requirePage } from "@/lib/auth/current";
import { venueAvailability2027 } from "@/lib/venue-availability-2027";

type Venue = (typeof venueAvailability2027)[number];
type SlotName = "pm" | "eve";

const MONTHS = ["1 月", "2 月", "3 月", "4 月", "5 月", "6 月", "7 月", "8 月", "9 月", "10 月", "11 月", "12 月"];
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function occurrenceDate(month: number, weekday: 0 | 6, ordinal: number) {
  const first = new Date(Date.UTC(2027, month - 1, 1)).getUTCDay();
  const day = 1 + ((weekday - first + 7) % 7) + (ordinal - 1) * 7;
  return `2027-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getVenue(name: string) {
  return venueAvailability2027.find((venue) => venue.name === name)!;
}

function dateLabel(date: string) {
  const month = Number(date.slice(5, 7));
  const day = Number(date.slice(8, 10));
  const weekday = new Date(`${date}T12:00:00+08:00`).getDay();
  return `${month}/${day}（週${WEEKDAYS[weekday]}）`;
}

function Slot({ venue, date, slot }: { venue: Venue; date: string; slot: SlotName }) {
  const item = venue.days[date as keyof typeof venue.days]?.[slot];
  if (!item) return <span className="venue-slot unavailable"><b>{slot === "pm" ? "下午" : "晚間"}</b>無資料</span>;
  return (
    <span className={`venue-slot ${item.open ? "available" : "booked"}`} title={item.open ? "行事曆目前沒有活動" : item.conflicts.join("、")}>
      <b>{slot === "pm" ? "下午" : "晚間"}</b>
      <span>{item.open ? "有空" : "已有活動"}</span>
      {!item.open && item.conflicts.length ? <small>{item.conflicts.join("、")}</small> : null}
    </span>
  );
}

function Recommendation({ venueName, weekday, ordinal, slot, label }: {
  venueName: string; weekday: 0 | 6; ordinal: number; slot: SlotName; label: string;
}) {
  const venue = getVenue(venueName);
  const dates = Array.from({ length: 10 }, (_, index) => occurrenceDate(index + 3, weekday, ordinal));
  const openCount = dates.filter((date) => venue.days[date as keyof typeof venue.days]?.[slot].open).length;
  return (
    <article className="venue-recommendation">
      <div className="venue-recommendation-top">
        <div>
          <p className="venue-recommendation-hall">{venueName}</p>
          <h3>{label}</h3>
          <p className="venue-recommendation-meta">每月一次・2027 年 3–12 月</p>
        </div>
        <div className={`venue-score ${openCount === 10 ? "perfect" : "partial"}`} aria-label={`${openCount} 個月份有空` }>
          <b>{openCount}<small>/10</small></b><span>目前有空</span>
        </div>
      </div>
      <div className="venue-date-track" aria-label={`建議日期，目前 ${openCount} 個日期有空`}>
        {dates.map((date) => {
          const open = venue.days[date as keyof typeof venue.days]?.[slot].open ?? false;
          return <span className={open ? "free" : "busy"} key={date} title={`${dateLabel(date)} ${open ? "有空" : "已有活動"}`}>{date.slice(5, 7)}/{Number(date.slice(8, 10))}</span>;
        })}
      </div>
      {openCount < dates.length ? <p className="venue-rec-note">{dates.filter((date) => !venue.days[date as keyof typeof venue.days]?.[slot].open).map((date) => `${dateLabel(date)}：${venue.days[date as keyof typeof venue.days]?.[slot].conflicts.join("、") || "已有活動"}`).join("；")}</p> : null}
    </article>
  );
}

function MonthSchedule({ venue, month }: { venue: Venue; month: number }) {
  const monthKey = String(month).padStart(2, "0");
  const days = Object.entries(venue.days)
    .filter(([date]) => date.slice(5, 7) === monthKey)
    .sort(([a], [b]) => a.localeCompare(b));
  const openCount = days.reduce((total, [, slots]) => total + Number(slots.pm.open) + Number(slots.eve.open), 0);
  return (
    <details className="venue-month">
      <summary><b>{MONTHS[month - 1]}</b><span>{openCount} 個空檔時段</span><i aria-hidden="true">⌄</i></summary>
      <div className="venue-month-days">
        {days.map(([date]) => (
          <div className="venue-day" key={date}>
            <b className="venue-day-date">{dateLabel(date)}</b>
            <Slot venue={venue} date={date} slot="pm" />
            <Slot venue={venue} date={date} slot="eve" />
          </div>
        ))}
      </div>
    </details>
  );
}

function VenueSchedule({ venue }: { venue: Venue }) {
  const freeSlotCount = Object.values(venue.days).reduce((total, day) => total + Number(day.pm.open) + Number(day.eve.open), 0);
  return (
    <section className="venue-hall">
      <div className="venue-hall-heading">
        <div><p className="venue-eyebrow">週六、週日</p><h2>{venue.name}</h2></div>
        <span>{freeSlotCount} 個空檔時段</span>
      </div>
      <p className="venue-hall-intro">逐月查看週末下午與晚間；有活動的時段會列出行事曆標題。</p>
      <div className="venue-month-list">{MONTHS.map((_, index) => <MonthSchedule key={index + 1} venue={venue} month={index + 1} />)}</div>
    </section>
  );
}

export default async function VenueAvailabilityPage() {
  const me = await requirePage("ideas", "/ideas/venue-availability");
  const mainHall = getVenue("大廳");
  const smallHall = getVenue("小廳");
  const earlySundayEveDates = Array.from({ length: 10 }, (_, index) => occurrenceDate(index + 3, 0, 1));
  const earlySundayEveOpen = earlySundayEveDates.filter((date) => mainHall.days[date as keyof typeof mainHall.days]?.eve.open).length;

  return (
    <main className="page venue-page">
      <TopBar me={me} title="2027 場地檔期" back={{ href: "/ideas", label: "筆記" }} sub="大廳與小廳｜週末下午、晚間" />
      <div className="content">
        <section className="venue-intro">
          <div className="venue-eyebrow">每月一次的系列節目</div>
          <h2>建議先鎖定這兩個固定時段</h2>
          <p>從 2027 年 3 月排到 12 月，兩種排法目前都能連續十個月避開行事曆上的活動。</p>
          <div className="venue-recommendations">
            <Recommendation venueName="大廳" weekday={0} ordinal={3} slot="eve" label="每月第三個週日・晚間 18:00–22:00" />
            <Recommendation venueName="小廳" weekday={6} ordinal={1} slot="pm" label="每月第一個週六・下午 13:30–17:30" />
          </div>
          <div className="venue-alternatives">
            <p><b>小廳備選：</b>每月第二個或第四個週六下午，目前也都是 10/10 個月有空。</p>
            <p><b>大廳月初排法：</b>每月第一個週日晚間目前 {earlySundayEveOpen}/10 個月有空；3/7 已有活動。</p>
          </div>
        </section>

        <section className="venue-method-note">
          <b>怎麼看</b>
          <span>「有空」代表這份行事曆目前沒有活動登記，不等於已完成租借。下午以 13:30–17:30、晚間以 18:00–22:00 對照；實際可租時段仍以場地方回覆為準。資料依 2026/10/26 的公開行事曆快照整理。</span>
        </section>

        <VenueSchedule venue={mainHall} />
        <VenueSchedule venue={smallHall} />
      </div>
      <Link className="venue-back-link" href="/ideas">回到筆記</Link>
    </main>
  );
}
