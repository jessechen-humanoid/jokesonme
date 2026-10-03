import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { eventsInRange, expandRule, parseStamp } from "./ics.ts";

test("spec 範例：UTC 轉台北、整天", () => {
  assert.deepEqual(parseStamp("", "20261017T113000Z"), { date: "2026-10-17", time: "19:30" });
  assert.deepEqual(parseStamp("VALUE=DATE", "20261016"), { date: "2026-10-16", time: null });
  assert.deepEqual(parseStamp("TZID=Asia/Taipei", "20260210T210000"), { date: "2026-02-10", time: "21:00" });
  assert.deepEqual(parseStamp("", "20261017T200000Z"), { date: "2026-10-18", time: "04:00" }, "跨日");
});

const ics = (body: string) => `BEGIN:VCALENDAR\r\n${body}\r\nEND:VCALENDAR\r\n`;
const ev = (lines: string[]) => ["BEGIN:VEVENT", ...lines, "END:VEVENT"].join("\r\n");

test("WEEKLY＋COUNT、EXDATE、單次改期、取消", () => {
  const text = ics([
    ev(["UID:a", "DTSTART;TZID=Asia/Taipei:20261005T190000", "RRULE:FREQ=WEEKLY;COUNT=4", "EXDATE;TZID=Asia/Taipei:20261012T190000", "SUMMARY:排練"]),
    ev(["UID:a", "RECURRENCE-ID;TZID=Asia/Taipei:20261019T190000", "DTSTART;TZID=Asia/Taipei:20261020T200000", "SUMMARY:排練（改期）"]),
    ev(["UID:b", "DTSTART:20261008T110000Z", "STATUS:CANCELLED", "SUMMARY:取消的"]),
  ].join("\r\n"));
  assert.deepEqual(eventsInRange(text, "2026-10-01", "2026-10-31").map((e) => `${e.date} ${e.time} ${e.title}`), [
    "2026-10-05 19:00 排練", "2026-10-20 20:00 排練（改期）", "2026-10-26 19:00 排練",
  ]);
});

test("WEEKLY BYDAY 與 UNTIL", () => {
  assert.deepEqual(expandRule("2026-10-05", "FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=20261014", "2026-12-31"), ["2026-10-05", "2026-10-07", "2026-10-12", "2026-10-14"]);
});

test("MONTHLY BYMONTHDAY（實際資料的寫法）", () => {
  assert.deepEqual(expandRule("2026-02-10", "FREQ=MONTHLY;BYMONTHDAY=10", "2026-05-31"), ["2026-02-10", "2026-03-10", "2026-04-10", "2026-05-10"]);
});

test("實際公開日曆（2026-10-03 快照）：38 筆活動，10 月的時間正確", () => {
  const text = readFileSync(new URL("./fixtures/show-calendar-20261003.ics", import.meta.url), "utf8");
  const all = eventsInRange(text, "2025-01-01", "2026-12-31");
  const uids = new Set(all.map((e) => e.uid));
  assert.equal(uids.size, 38);
  const oct = eventsInRange(text, "2026-10-01", "2026-10-31").map((e) => `${e.date} ${e.time} ${e.title}`);
  assert.ok(oct.includes("2026-10-17 19:30 看我笑話｜喜劇拼盤 10 月號"), oct.join("\n"));
  assert.ok(oct.includes("2026-10-10 21:00 看我笑話會員每月限定內容上線！"), "每月 10 號的重複活動");
});
