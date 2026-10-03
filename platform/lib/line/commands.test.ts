import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCommand } from "./commands.ts";

// spec 範例表：Slash command todo creation
test("/訂 10/20 的場地 @柏文 → 待辦，柏文為負責人", () => {
  const text = "/訂 10/20 的場地 @柏文";
  const index = text.indexOf("@柏文");
  assert.deepEqual(parseCommand({ text, mentions: [{ index, length: 3, userId: "U_bowen" }] }), {
    kind: "todo",
    title: "訂 10/20 的場地",
    assigneeUserIds: ["U_bowen"],
  });
});

test("／買膠帶（全形）→ 待辦、未認領", () => {
  assert.deepEqual(parseCommand({ text: "／買膠帶" }), { kind: "todo", title: "買膠帶", assigneeUserIds: [] });
});

test("斜線不在開頭不觸發", () => {
  assert.deepEqual(parseCommand({ text: "明天 1/20 開會" }), { kind: "none" });
  assert.deepEqual(parseCommand({ text: "https://example.com/a" }), { kind: "none" });
});

test("只有 / 且沒引用 → 用法說明", () => {
  assert.deepEqual(parseCommand({ text: "/" }), { kind: "usage" });
  assert.deepEqual(parseCommand({ text: " ／ " }), { kind: "usage" });
});

// spec 範例表：Hash command idea capture
test("#讓觀眾投票決定結局 → 靈感", () => {
  assert.deepEqual(parseCommand({ text: "#讓觀眾投票決定結局" }), { kind: "idea", text: "讓觀眾投票決定結局" });
  assert.deepEqual(parseCommand({ text: "＃即興劇加計時器" }), { kind: "idea", text: "即興劇加計時器" });
});

test("# 不在開頭不觸發；只有 # 回用法", () => {
  assert.deepEqual(parseCommand({ text: "今天 #1 的組合很好笑" }), { kind: "none" });
  assert.deepEqual(parseCommand({ text: "#" }), { kind: "usage" });
});

// Quote-reply commands
test("回覆某則訊息只打 / 或 # → 用被回覆的訊息", () => {
  assert.deepEqual(parseCommand({ text: "/", quotedMessageId: "M1" }), { kind: "todo-from-quote", quotedMessageId: "M1" });
  assert.deepEqual(parseCommand({ text: "＃", quotedMessageId: "M2" }), { kind: "idea-from-quote", quotedMessageId: "M2" });
});

test("回覆時有寫內容，照一般指令處理", () => {
  assert.deepEqual(parseCommand({ text: "#加上計時器", quotedMessageId: "M3" }), { kind: "idea", text: "加上計時器" });
});

test("一般聊天不觸發", () => {
  assert.deepEqual(parseCommand({ text: "週六誰可以去搬道具" }), { kind: "none" });
});

test("重複 mention 同一人只算一次", () => {
  const text = "/搬道具 @巧達 @巧達";
  const r = parseCommand({
    text,
    mentions: [
      { index: text.indexOf("@巧達"), length: 3, userId: "U_q" },
      { index: text.lastIndexOf("@巧達"), length: 3, userId: "U_q" },
    ],
  });
  assert.deepEqual(r, { kind: "todo", title: "搬道具", assigneeUserIds: ["U_q"] });
});

// spec 範例表（team-calendar-and-simple-commands）：/ ＋ 類型詞
test("/靈感 內容 → 靈感；/說明 → 小抄；類型詞後要接空白或結尾", () => {
  assert.deepEqual(parseCommand({ text: "/靈感 讓觀眾投票決定結局" }), { kind: "idea", text: "讓觀眾投票決定結局" });
  assert.deepEqual(parseCommand({ text: "／靈感　全形空白也可以" }), { kind: "idea", text: "全形空白也可以" });
  assert.deepEqual(parseCommand({ text: "/說明" }), { kind: "usage" });
  assert.deepEqual(parseCommand({ text: "/靈感會議要訂場地" }), { kind: "todo", title: "靈感會議要訂場地", assigneeUserIds: [] });
  assert.deepEqual(parseCommand({ text: "/行程表要更新" }), { kind: "todo", title: "行程表要更新", assigneeUserIds: [] });
});

test("/靈感 沒內容：有引用存被回覆的訊息，沒引用回小抄", () => {
  assert.deepEqual(parseCommand({ text: "/靈感", quotedMessageId: "Q1" }), { kind: "idea-from-quote", quotedMessageId: "Q1" });
  assert.deepEqual(parseCommand({ text: "/靈感" }), { kind: "usage" });
});

test("/行程 年份與時間（spec Example: year and time）", () => {
  const today = "2026-10-03";
  assert.deepEqual(parseCommand({ text: "/行程 10/12 19:00 討論 11 月號", today }), { kind: "event", date: "2026-10-12", time: "19:00", title: "討論 11 月號" });
  assert.deepEqual(parseCommand({ text: "/行程 1/5 排練", today }), { kind: "event", date: "2027-01-05", time: null, title: "排練" });
  assert.deepEqual(parseCommand({ text: "/行程 10/3 晚上聚餐", today }), { kind: "event", date: "2026-10-03", time: null, title: "晚上聚餐" });
  assert.deepEqual(parseCommand({ text: "/行程 13/40 開會", today }), { kind: "usage" });
  assert.deepEqual(parseCommand({ text: "/行程 10/12", today }), { kind: "usage" });
  assert.deepEqual(parseCommand({ text: "/行程 10/12 19:00", today }), { kind: "usage" });
  assert.deepEqual(parseCommand({ text: "/行程", today }), { kind: "usage" });
});

test("/行程 邊界：2/30 無效、9:5 不算時間、全形斜線與 @人 挖掉", () => {
  const today = "2026-10-03";
  assert.deepEqual(parseCommand({ text: "/行程 2/30 開會", today }), { kind: "usage" });
  assert.deepEqual(parseCommand({ text: "/行程 10/12 9:30 早會", today }), { kind: "event", date: "2026-10-12", time: "09:30", title: "早會" });
  assert.deepEqual(parseCommand({ text: "/行程 10/12 25:00 開會", today }), { kind: "usage" });
  const text = "/行程 10／12 排練 @傑瓜";
  assert.deepEqual(parseCommand({ text, today, mentions: [{ index: text.indexOf("@"), length: 3, isSelf: true }] }), { kind: "event", date: "2026-10-12", time: null, title: "排練" });
});
