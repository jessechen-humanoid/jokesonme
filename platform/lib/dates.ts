// 日期顯示一律用實際日期「M/D（週）」，不出現 D-3 這種相對寫法（spec: todo-board「Absolute date display」）。

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"] as const;

/** 解析資料庫的 date 字串（YYYY-MM-DD）。格式不對就丟錯，避免默默顯示錯日期。 */
function parseIsoDate(iso: string): { y: number; m: number; d: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`invalid date: ${iso}`);
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

/** 2026-10-21 → 「10/21（三）」 */
export function formatMonthDay(iso: string): string {
  const { y, m, d } = parseIsoDate(iso);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${m}/${d}（${WEEKDAYS[weekday]}）`;
}

/** 截止日標籤：2026-10-21 → 「10/21（三）前」 */
export function formatDueLabel(iso: string): string {
  return `${formatMonthDay(iso)}前`;
}

/** 台北時間的今天（YYYY-MM-DD），排程判斷「今天」一律用這個。 */
export function todayInTaipei(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(now);
}

/** 時間戳記（ISO）→ 台北時間「10/3（六）上午10:25」，用在訊息來源顯示。 */
export function formatTaipeiDateTime(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  const time = d.toLocaleTimeString("zh-TW", { timeZone: "Asia/Taipei", hour: "2-digit", minute: "2-digit" });
  return `${formatMonthDay(todayInTaipei(d))} ${time}`;
}

/** 日期加減天數：addDays("2026-10-24", -3) → "2026-10-21" */
export function addDays(iso: string, days: number): string {
  const { y, m, d } = parseIsoDate(iso);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** 時間戳記（ISO）→ 台北時間「10/3（六）14:00」（24 小時制）。 */
export function formatTaipeiStamp(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Taipei", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
  return `${formatMonthDay(todayInTaipei(d))} ${time}`;
}
