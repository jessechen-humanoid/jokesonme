import { test } from "node:test";
import assert from "node:assert/strict";
import { monthlyUsage, reminderText, showsToRemind } from "./reminders.ts";

const show = { id: "S1", name: "第 2 季 10 月號", performanceDate: "2026-10-24" };

test("spec 範例：10/21 與 10/23 提醒 10/24 的演出，10/22 不提醒", () => {
  assert.equal(showsToRemind([show], "2026-10-21").length, 1);
  assert.equal(showsToRemind([show], "2026-10-23").length, 1);
  assert.equal(showsToRemind([show], "2026-10-22").length, 0);
  assert.equal(showsToRemind([{ ...show, performanceDate: null }], "2026-10-21").length, 0);
});

test("訊息含實際日期、負責人、未認領、連結，沒有 D- 寫法", () => {
  const text = reminderText(
    show,
    [
      { title: "Rundown 製作", dueDate: "2026-10-19", assignees: ["U_dayi"] },
      { title: "公關票確認", dueDate: "2026-10-21", assignees: [] },
    ],
    (id) => (id === "U_dayi" ? "大弋" : "成員"),
    "https://liff.line.me/X/shows/S1",
  );
  assert.match(text, /10\/24（六）演出，還有 2 件事沒完成/);
  assert.match(text, /・Rundown 製作（大弋） 10\/19（一）前/);
  assert.match(text, /・公關票確認（未認領） 10\/21（三）前/);
  assert.match(text, /https:\/\/liff\.line\.me\/X\/shows\/S1/);
  assert.ok(!/D-\d/.test(text));
});

test("本月用量：兩次推播 × 8 人 = 16，失敗與上個月的不算", () => {
  assert.equal(monthlyUsage([
    { sentOn: "2026-10-21", recipientCount: 8, ok: true },
    { sentOn: "2026-10-23", recipientCount: 8, ok: true },
    { sentOn: "2026-10-23", recipientCount: 8, ok: false },
    { sentOn: "2026-09-30", recipientCount: 8, ok: true },
  ], "2026-10-25"), 16);
});
