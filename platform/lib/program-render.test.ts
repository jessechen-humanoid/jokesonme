import { test } from "node:test";
import assert from "node:assert/strict";
import { withTimes, rundownRows, rundownHtml, rundownText, claudePrompt, type ProgramItem } from "./program-render.ts";

const item = (name: string, minutes: number, extra: Partial<ProgramItem> = {}): ProgramItem =>
  ({ name, kind: "", minutes, content: "", props: "", sound: "", projection: "", ...extra });

// spec Example: cue times
test("時間點由開始時間逐段累加", () => {
  assert.deepEqual(withTimes("19:00", [item("觀眾進場", 30), item("開場", 5), item("Talking", 10)]).map((t) => `${t.from} - ${t.to}`),
    ["19:00 - 19:30", "19:30 - 19:35", "19:35 - 19:45"]);
  assert.deepEqual(withTimes("23:50", [item("A", 20)]).map((t) => `${t.from} - ${t.to}`), ["23:50 - 24:10"]);
  assert.deepEqual(withTimes("19:30", [item("中場", 0)]).map((t) => `${t.from} - ${t.to}`), ["19:30 - 19:30"]);
  assert.deepEqual(withTimes("19:00:00", [item("A", 5)])[0], { from: "19:00", to: "19:05" });
});

// spec Example: row cells
test("每列欄位：節目順序兩行、時長、內容轉條列", () => {
  const rows = rundownRows("19:45", [
    item("又兔了", 7, { kind: "漫才", content: "接下來讓我們歡迎 — 又兔了！\n\n", props: "stand x1" }),
    item("開場", 5),
  ]);
  assert.deepEqual(rows[0], ["又兔了\n漫才", "7 min", "19:45 - 19:52", "• 接下來讓我們歡迎 — 又兔了！", "stand x1", "", ""]);
  assert.deepEqual(rows[1], ["開場", "5 min", "19:52 - 19:57", "", "", "", ""]);
});

test("HTML 表格：7 個欄名、換行轉 <br>、跳脫特殊字元", () => {
  const html = rundownHtml("19:00", [item("A&B <x>", 5, { content: "第一行\n第二行" })]);
  for (const h of ["節目順序", "時間", "預計時間點", "內容", "道具", "音效", "投影"]) assert.ok(html.includes(`<th`) && html.includes(h), h);
  assert.ok(html.startsWith("<table"));
  assert.ok(html.includes("A&amp;B &lt;x&gt;"));
  assert.ok(html.includes("• 第一行<br>• 第二行"));
});

test("純文字：tab 分隔、第一列是欄名", () => {
  const lines = rundownText("19:00", [item("A", 5, { content: "x\ny" })]).split("\n");
  assert.equal(lines[0], "節目順序\t時間\t預計時間點\t內容\t道具\t音效\t投影");
  assert.equal(lines[1], "A\t5 min\t19:00 - 19:05\t• x / • y\t\t\t");
});

// spec Scenario: Prompt contents
test("給 Claude 的文字：含演出名稱、日期、每段時間點與內容，最後是簡報指令", () => {
  const text = claudePrompt({ name: "看我笑話第 2 季 10 月號", performanceDate: "2026-10-17" }, "19:00",
    [item("觀眾進場", 30), item("又兔了", 7, { kind: "漫才", projection: "組名大字" }), item("結尾", 10, { content: "宣傳會員" })]);
  for (const s of ["演出：看我笑話第 2 季 10 月號｜10/17（六）", "19:00 - 19:30 觀眾進場", "19:30 - 19:37 又兔了（漫才）", "投影：組名大字", "19:37 - 19:47 結尾", "宣傳會員"]) assert.ok(text.includes(s), s);
  assert.match(text.trim().split("\n").at(-1)!, /簡報/);
});
