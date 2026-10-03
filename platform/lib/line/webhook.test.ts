import { test } from "node:test";
import assert from "node:assert/strict";
import { handleEvents, type CapturedMessage, type WebhookStore } from "./webhook.ts";
import { signBody, verifySignature } from "./signature.ts";

function fakeStore(registered: string | null = "G1") {
  const s = {
    group: registered as string | null,
    messages: new Map<string, CapturedMessage>(),
    todos: [] as { title: string; assigneeUserIds: string[]; createdBy: string; sourceMessageId: string }[],
    ideas: [] as { text: string; authorUserId: string; sourceMessageId: string }[],
    ensured: [] as string[],
    summaries: [] as string[][],
  };
  const store: WebhookStore = {
    async getRegisteredGroup() { return s.group; },
    async registerGroup(g) { if (!s.group) s.group = g; },
    async saveMessage(m) { if (s.messages.has(m.id)) return false; s.messages.set(m.id, m); return true; },
    async getMessage(id) { return s.messages.get(id) ?? null; },
    async createTodo(t) { s.todos.push(t); },
    async createIdea(i) { s.ideas.push(i); },
    async ensureUsers(_g, ids) { s.ensured.push(...ids); },
    async mentionSummary(only) { s.summaries.push(only); return `SUMMARY:${only.join(",")}`; },
  };
  const replies: string[] = [];
  return { s, store, replies, reply: async (_t: string, text: string) => { replies.push(text); } };
}

const msg = (id: string, text: string, extra: Record<string, unknown> = {}, groupId = "G1", userId = "U_jesse") => ({
  type: "message", replyToken: "R" + id, timestamp: 1790000000000,
  source: { type: "group", groupId, userId },
  message: { id, type: "text", text, ...extra },
});

test("一般聊天：存一列、不回覆", async () => {
  const f = fakeStore();
  const r = await handleEvents([msg("1", "週六誰可以去搬道具")], f.store, f.reply);
  assert.deepEqual(r, ["captured"]);
  assert.deepEqual(f.s.ensured, [], "一般聊天不查 profile");
  assert.equal(f.s.messages.get("1")?.text, "週六誰可以去搬道具");
  assert.deepEqual(f.replies, []);
});

test("LINE 重送同一事件：只存一列、指令不重複建立", async () => {
  const f = fakeStore();
  const ev = msg("2", "/買膠帶");
  await handleEvents([ev], f.store, f.reply);
  const r = await handleEvents([ev], f.store, f.reply);
  assert.deepEqual(r, ["duplicate"]);
  assert.equal(f.s.messages.size, 1);
  assert.equal(f.s.todos.length, 1);
});

test("其他群組的訊息被忽略", async () => {
  const f = fakeStore("G1");
  const r = await handleEvents([msg("3", "hi", {}, "G_other")], f.store, f.reply);
  assert.deepEqual(r, ["ignored:other-group"]);
  assert.equal(f.s.messages.size, 0);
});

test("尚未登記群組時，第一個群組自動登記", async () => {
  const f = fakeStore(null);
  await handleEvents([{ type: "join", timestamp: 0, source: { type: "group", groupId: "G9" } }], f.store, f.reply);
  assert.equal(f.s.group, "G9");
});

test("/指令＋mention：建立待辦、回覆含負責人、沒有推播", async () => {
  const f = fakeStore();
  const text = "/訂 10/20 的場地 @柏文";
  const ev = msg("4", text, { mention: { mentionees: [{ index: text.indexOf("@柏文"), length: 3, userId: "U_bowen", type: "user" }] } });
  await handleEvents([ev], f.store, f.reply);
  assert.deepEqual(f.s.todos, [{ title: "訂 10/20 的場地", assigneeUserIds: ["U_bowen"], createdBy: "U_jesse", sourceMessageId: "4" }]);
  assert.deepEqual(f.replies, ["已建立待辦：訂 10/20 的場地（柏文）"]);
  assert.deepEqual(f.s.ensured, ["U_jesse", "U_bowen"]);
});

test("#靈感：存進靈感庫並回覆", async () => {
  const f = fakeStore();
  await handleEvents([msg("5", "#讓觀眾投票決定結局")], f.store, f.reply);
  assert.deepEqual(f.s.ideas, [{ text: "讓觀眾投票決定結局", authorUserId: "U_jesse", sourceMessageId: "5" }]);
  assert.deepEqual(f.replies, ["已存進靈感庫"]);
});

test("回覆別人的訊息打 #：存被回覆那則，作者記原發言者", async () => {
  const f = fakeStore();
  await handleEvents([msg("6", "最後一段讓觀眾投票", {}, "G1", "U_bowen")], f.store, f.reply);
  await handleEvents([msg("7", "#", { quotedMessageId: "6" }, "G1", "U_qiao")], f.store, f.reply);
  assert.deepEqual(f.s.ideas, [{ text: "最後一段讓觀眾投票", authorUserId: "U_bowen", sourceMessageId: "6" }]);
});

test("回覆一則沒存到的訊息：不建立、說明找不到原文", async () => {
  const f = fakeStore();
  const r = await handleEvents([msg("8", "#", { quotedMessageId: "old" })], f.store, f.reply);
  assert.deepEqual(r, ["usage:quote-missing"]);
  assert.equal(f.s.ideas.length, 0);
  assert.match(f.replies[0], /找不到被回覆的那則訊息/);
});

test("簽章：正確通過、竄改失敗、缺少失敗", async () => {
  const body = '{"events":[]}';
  const sig = await signBody("secret123", body);
  assert.equal(await verifySignature("secret123", body, sig), true);
  assert.equal(await verifySignature("secret123", body + " ", sig), false);
  assert.equal(await verifySignature("secret123", body, null), false);
});

test("tag 傑瓜：回覆待辦一覽（reply），不建立任何東西", async () => {
  const f = fakeStore();
  const text = "@傑瓜 這週誰要做什麼";
  const r = await handleEvents([msg("20", text, { mention: { mentionees: [{ index: 0, length: 3, userId: "U_bot", type: "user", isSelf: true }] } })], f.store, f.reply);
  assert.deepEqual(r, ["summary"]);
  assert.deepEqual(f.s.summaries, [[]]);
  assert.deepEqual(f.replies, ["SUMMARY:"]);
  assert.equal(f.s.todos.length + f.s.ideas.length, 0);
});

test("tag 傑瓜＋柏文：只問柏文", async () => {
  const f = fakeStore();
  const text = "@傑瓜 @柏文";
  await handleEvents([msg("21", text, { mention: { mentionees: [
    { index: 0, length: 3, userId: "U_bot", type: "user", isSelf: true },
    { index: 4, length: 3, userId: "U_bowen", type: "user" },
  ] } })], f.store, f.reply);
  assert.deepEqual(f.s.summaries, [["U_bowen"]]);
});

test("「/買膠帶 @傑瓜」仍是待辦，傑瓜不會變成負責人", async () => {
  const f = fakeStore();
  const text = "/買膠帶 @傑瓜";
  await handleEvents([msg("22", text, { mention: { mentionees: [{ index: text.indexOf("@傑瓜"), length: 3, userId: "U_bot", type: "user", isSelf: true }] } })], f.store, f.reply);
  assert.equal(f.s.todos.length, 1);
  assert.equal(f.s.todos[0].title, "買膠帶");
  assert.deepEqual(f.s.todos[0].assigneeUserIds, []);
  assert.equal(f.s.summaries.length, 0);
});

test("一般聊天有 tag 別人（沒 tag 傑瓜）：不回覆", async () => {
  const f = fakeStore();
  await handleEvents([msg("23", "@柏文 晚點打給你", { mention: { mentionees: [{ index: 0, length: 3, userId: "U_bowen", type: "user" }] } })], f.store, f.reply);
  assert.deepEqual(f.replies, []);
});
