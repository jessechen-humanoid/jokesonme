import { test } from "node:test";
import assert from "node:assert/strict";
import { mentionSummary } from "./summary.ts";

const names: Record<string, string> = { U_dayi: "大弋", U_bowen: "柏文" };
const name = (id: string) => names[id] ?? "成員";

test("spec 範例：依負責人分組、最後是未認領、附連結", () => {
  const text = mentionSummary(
    [
      { title: "Rundown 製作", dueDate: "2026-10-19", assignees: ["U_dayi"] },
      { title: "公關票確認", dueDate: "2026-10-21", assignees: [] },
    ],
    name, "https://liff.line.me/X/todos",
  );
  assert.equal(text, "【大弋】\n・Rundown 製作 10/19（一）前\n\n【未認領】\n・公關票確認 10/21（三）前\n\n看全部：https://liff.line.me/X/todos");
});

test("沒有待辦", () => {
  assert.match(mentionSummary([], name, "L"), /^目前沒有未完成的待辦/);
});

test("另外 tag 柏文：只列柏文，不列別人與未認領", () => {
  const text = mentionSummary(
    [
      { title: "A", dueDate: null, assignees: ["U_dayi"] },
      { title: "B", dueDate: "2026-10-05", assignees: ["U_bowen"] },
      { title: "C", dueDate: null, assignees: [] },
    ],
    name, "L", ["U_bowen"],
  );
  assert.equal(text, "【柏文】\n・B 10/5（一）前\n\n看全部：L");
});

test("每人最多 5 件，近的先列", () => {
  const todos = Array.from({ length: 7 }, (_, i) => ({ title: `T${i}`, dueDate: `2026-10-${String(20 - i).padStart(2, "0")}`, assignees: ["U_dayi"] }));
  const text = mentionSummary(todos, name, "L");
  assert.match(text, /^【大弋】\n・T6 10\/14/);
  assert.match(text, /…還有 2 件/);
});

// team-calendar-and-simple-commands：spec Example: reply body
test("先列接下來 14 天（演出＋行程、早的先），再列待辦", async () => {
  const { datesBlock } = await import("./summary.ts");
  const dates = datesBlock([
    { kind: "event", date: "2026-10-12", time: "19:00", title: "討論 11 月號" },
    { kind: "show", date: "2026-10-17", time: "19:30", title: "看我笑話｜喜劇拼盤 10 月號" },
  ]);
  const text = mentionSummary(
    [{ title: "Rundown 製作", dueDate: "2026-10-19", assignees: ["U_dayi"] }, { title: "公關票確認", dueDate: "2026-10-21", assignees: [] }],
    (id) => (id === "U_dayi" ? "大弋" : "?"), "L", [], [], dates,
  );
  assert.ok(text.startsWith("【接下來 14 天】\n・10/12（一）19:00 討論 11 月號\n・10/17（六）19:30 看我笑話｜喜劇拼盤 10 月號\n\n【大弋】\n・Rundown 製作 10/19（一）前"), text);
  assert.match(text, /【未認領】\n・公關票確認 10\/21（三）前/);
});

test("沒有待辦、沒有日子；整天的不顯示時間；超過 10 項收合", async () => {
  const { datesBlock } = await import("./summary.ts");
  const text = mentionSummary([], name, "L", [], [], datesBlock([]));
  assert.match(text, /【接下來 14 天】\n・沒有演出或行程\n\n目前沒有未完成的待辦/);
  assert.deepEqual(datesBlock([{ kind: "show", date: "2026-10-16", time: null, title: "整天活動" }]).slice(1), ["・10/16（五）整天活動"]);
  const many = Array.from({ length: 12 }, (_, i) => ({ kind: "event" as const, date: "2026-10-12", time: null, title: `e${i}` }));
  const b = datesBlock(many);
  assert.equal(b.length, 11); // 標題＋10 行
  assert.equal(b.at(-1), "…還有 3 項");
});
