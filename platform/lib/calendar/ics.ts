// 最小的 iCal 解析（design「自己寫最小的 iCal 解析」；spec team-calendar「Read-only public show calendar sync」）。
// 支援：DTSTART／DTEND 的 UTC（Z）、TZID=Asia/Taipei、VALUE=DATE（整天）；SUMMARY、LOCATION、UID、STATUS；
// RRULE 的 FREQ=DAILY／WEEKLY／MONTHLY、INTERVAL、COUNT、UNTIL、BYDAY（週幾）、BYMONTHDAY；EXDATE；RECURRENCE-ID（單次改期）。
// 其他寫法：只顯示第一次並記 log。所有時間轉成台北（UTC+8，台灣沒有日光節約）。

export type CalEvent = { uid: string; title: string; location: string; date: string; time: string | null };

type Stamp = { date: string; time: string | null };
type Raw = {
  uid: string; title: string; location: string; start: Stamp; rrule: string | null;
  exdates: Set<string>; recurrenceId: string | null; cancelled: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");
const isoDate = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

function unfold(text: string): string[] {
  return text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "").split("\n");
}

function unescape(v: string): string {
  return v.replace(/\\n/gi, "\n").replace(/\\([,;\\])/g, "$1");
}

/** 「20261017T113000Z」「20261017T193000」（台北）「20261016」（整天）→ 台北的日期與時間 */
export function parseStamp(params: string, value: string): Stamp | null {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(value.trim());
  if (!m) return null;
  const [, y, mo, d, hh, mi, , z] = m;
  if (!hh || /VALUE=DATE(?!-)/.test(params)) return { date: `${y}-${mo}-${d}`, time: null };
  if (z) {
    const t = new Date(Date.UTC(+y, +mo - 1, +d, +hh + 8, +mi));
    return { date: isoDate(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()), time: `${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}` };
  }
  if (params && !/TZID=Asia\/Taipei/.test(params) && /TZID=/.test(params)) console.warn("[ics] 非台北時區，當作台北時間處理", params);
  return { date: `${y}-${mo}-${d}`, time: `${hh}:${mi}` };
}

function parseRaw(text: string): Raw[] {
  const out: Raw[] = [];
  let cur: Partial<Raw> & { exdates?: Set<string> } | null = null;
  for (const line of unfold(text)) {
    if (line === "BEGIN:VEVENT") { cur = { exdates: new Set(), rrule: null, recurrenceId: null, cancelled: false, location: "", title: "" }; continue; }
    if (line === "END:VEVENT") {
      if (cur?.uid && cur.start) out.push(cur as Raw);
      cur = null;
      continue;
    }
    if (!cur) continue;
    const i = line.indexOf(":");
    if (i < 0) continue;
    const head = line.slice(0, i);
    const value = line.slice(i + 1);
    const [name, ...rest] = head.split(";");
    const params = rest.join(";");
    switch (name) {
      case "UID": cur.uid = value; break;
      case "SUMMARY": cur.title = unescape(value); break;
      case "LOCATION": cur.location = unescape(value); break;
      case "STATUS": cur.cancelled = value === "CANCELLED"; break;
      case "RRULE": cur.rrule = value; break;
      case "DTSTART": { const s = parseStamp(params, value); if (s) cur.start = s; break; }
      case "RECURRENCE-ID": { const s = parseStamp(params, value); if (s) cur.recurrenceId = s.date; break; }
      case "EXDATE": for (const v of value.split(",")) { const s = parseStamp(params, v); if (s) cur.exdates!.add(s.date); } break;
    }
  }
  return out;
}

const DAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function addDaysIso(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return isoDate(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}

/** 展開重複規則，回傳每次的日期（台北）。 */
export function expandRule(startDate: string, rrule: string, rangeEnd: string): string[] {
  const p = Object.fromEntries(rrule.split(";").map((kv) => kv.split("=") as [string, string]));
  const interval = Math.max(1, Number(p.INTERVAL ?? 1));
  const count = p.COUNT ? Number(p.COUNT) : Infinity;
  const until = p.UNTIL ? (parseStamp(p.UNTIL.length > 8 ? "" : "VALUE=DATE", p.UNTIL)?.date ?? rangeEnd) : rangeEnd;
  const last = until < rangeEnd ? until : rangeEnd;
  const dates: string[] = [];
  const push = (d: string) => { if (d >= startDate && d <= last && dates.length < count) dates.push(d); };
  const [sy, sm, sd] = startDate.split("-").map(Number);
  const LIMIT = 1000;

  if (p.FREQ === "DAILY") {
    for (let i = 0, d = startDate; i < LIMIT && d <= last && dates.length < count; i++, d = addDaysIso(d, interval)) push(d);
  } else if (p.FREQ === "WEEKLY") {
    const startDow = new Date(Date.UTC(sy, sm - 1, sd)).getUTCDay();
    const days = p.BYDAY ? p.BYDAY.split(",").map((c: string) => DAY_CODES.indexOf(c.slice(-2))).filter((x: number) => x >= 0).sort() : [startDow];
    const weekStart = addDaysIso(startDate, -startDow);
    for (let w = 0; w < LIMIT && dates.length < count; w++) {
      const base = addDaysIso(weekStart, w * 7 * interval);
      if (base > last) break;
      for (const dow of days) push(addDaysIso(base, dow));
    }
  } else if (p.FREQ === "MONTHLY") {
    const monthDays = p.BYMONTHDAY ? p.BYMONTHDAY.split(",").map(Number) : [sd];
    for (let k = 0; k < LIMIT && dates.length < count; k++) {
      const total = sm - 1 + k * interval;
      const y = sy + Math.floor(total / 12);
      const m = (total % 12) + 1;
      if (isoDate(y, m, 1) > last) break;
      const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
      for (const md of monthDays) if (md >= 1 && md <= dim) push(isoDate(y, m, md));
    }
  } else {
    console.warn("[ics] 不支援的重複規則，只顯示第一次", rrule);
    push(startDate);
  }
  return dates;
}

/** 解析並展開到 [from, to]（含頭尾，台北日期），依日期、時間排序。 */
export function eventsInRange(text: string, from: string, to: string): CalEvent[] {
  const raws = parseRaw(text);
  const overrides = new Map<string, Set<string>>(); // uid → 被單次改期取代的原日期
  for (const r of raws) if (r.recurrenceId) overrides.set(r.uid, (overrides.get(r.uid) ?? new Set()).add(r.recurrenceId));
  const out: CalEvent[] = [];
  for (const r of raws) {
    if (r.cancelled) continue;
    const dates = r.rrule && !r.recurrenceId ? expandRule(r.start.date, r.rrule, to) : [r.start.date];
    for (const d of dates) {
      if (d < from || d > to) continue;
      if (r.exdates.has(d)) continue;
      if (!r.recurrenceId && r.rrule && overrides.get(r.uid)?.has(d)) continue;
      out.push({ uid: r.uid, title: r.title, location: r.location, date: d, time: r.start.time });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""));
}
