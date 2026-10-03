import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, formatDueLabel, formatMonthDay, formatTaipeiDateTime, todayInTaipei } from "./dates.ts";

test("formatMonthDay：spec 範例表", () => {
  assert.equal(formatMonthDay("2026-10-21"), "10/21（三）");
  assert.equal(formatMonthDay("2026-10-07"), "10/7（三）");
  assert.equal(formatMonthDay("2026-10-24"), "10/24（六）");
  // 一週七天各驗一次，避免星期對照表錯位抓不到
  const week = ["2026-10-04", "2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09", "2026-10-10"];
  assert.deepEqual(week.map(formatMonthDay), ["10/4（日）", "10/5（一）", "10/6（二）", "10/7（三）", "10/8（四）", "10/9（五）", "10/10（六）"]);
});

test("formatDueLabel 加上「前」且不含 D-", () => {
  const label = formatDueLabel("2026-10-21");
  assert.equal(label, "10/21（三）前");
  assert.ok(!label.includes("D-"));
});

test("格式錯誤要丟錯", () => {
  assert.throws(() => formatMonthDay("2026/10/21"));
});

test("todayInTaipei：UTC 16:30 已是台北隔天", () => {
  assert.equal(todayInTaipei(new Date("2026-10-03T16:30:00Z")), "2026-10-04");
  assert.equal(todayInTaipei(new Date("2026-10-03T15:59:00Z")), "2026-10-03");
});

test("addDays 跨月", () => {
  assert.equal(addDays("2026-10-24", -21), "2026-10-03");
  assert.equal(addDays("2026-10-24", 7), "2026-10-31");
  assert.equal(addDays("2026-10-31", 1), "2026-11-01");
});

test("訊息時間用台北日期：UTC 10/3 18:30 是台北 10/4 凌晨", () => {
  assert.match(formatTaipeiDateTime("2026-10-03T18:30:00Z"), /^10\/4（日） /);
  assert.match(formatTaipeiDateTime("2026-10-03T02:25:00Z"), /^10\/3（六） /);
});
