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
