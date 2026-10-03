// LINE webhook 核心邏輯（spec: line-group-capture）。儲存與回覆都由外部注入，方便測試。
// 原則：驗簽失敗回 401；其他任何狀況都回 200（LINE 會重送失敗的事件，重送靠 message id 冪等擋掉）。
import { parseCommand, QUOTE_MISSING_TEXT, USAGE_TEXT, type Mention } from "./commands.ts";
import { parsePostback, showQuickReply, type LineTextMessage } from "./quick-reply.ts";

export type CapturedMessage = {
  id: string;
  groupId: string;
  userId: string;
  sentAt: string; // ISO
  text: string;
  mentions: Mention[];
  quotedMessageId: string | null;
};

export interface WebhookStore {
  getRegisteredGroup(): Promise<string | null>;
  registerGroup(groupId: string): Promise<void>;
  /** 新存入回 true；已存在（LINE 重送）回 false。 */
  saveMessage(msg: CapturedMessage): Promise<boolean>;
  getMessage(id: string): Promise<CapturedMessage | null>;
  /** 回傳新待辦的 id（給按鈕用） */
  createTodo(input: { title: string; assigneeUserIds: string[]; createdBy: string; sourceMessageId: string }): Promise<string>;
  /** 回傳新靈感的 id（給按鈕用） */
  createIdea(input: { text: string; authorUserId: string; sourceMessageId: string }): Promise<string>;
  /** 接下來的演出（pickableShows 的 upcoming，下一場第一；永遠不含 ledger） */
  upcomingShows(): Promise<{ id: string; name: string }[]>;
  /** 把靈感或待辦掛到演出；目標不存在回 missing */
  assignToShow(kind: "idea" | "todo", id: string, showId: string): Promise<{ status: "ok"; showName: string } | { status: "missing" }>;
  /** 靈感或待辦是否還在（先放著時用） */
  exists(kind: "idea" | "todo", id: string): Promise<boolean>;
  /** 作者或被 @ 的人還不在 users 時，用群組成員 profile 建一列 pending（讓待辦能顯示名字）。失敗不影響指令。 */
  ensureUsers(groupId: string, userIds: string[]): Promise<void>;
  /** tag 傑瓜時回覆的待辦一覽文字。 */
  mentionSummary(onlyUserIds: string[]): Promise<string>;
}

export type Reply = (replyToken: string, message: string | LineTextMessage) => Promise<void>;

type LineMention = { index: number; length: number; userId?: string; type?: string; isSelf?: boolean };
type LineEvent = {
  type: string;
  postback?: { data: string };
  replyToken?: string;
  timestamp: number;
  source?: { type: string; groupId?: string; userId?: string };
  message?: {
    id: string;
    type: string;
    text?: string;
    quotedMessageId?: string;
    mention?: { mentionees?: LineMention[] };
  };
};

export type WebhookResult = { status: number; handled: string[] };

/** 把 mention 文字（@柏文）從原文取出，用在回覆訊息裡顯示負責人名字。 */
function mentionNames(text: string, mentions: Mention[]): string[] {
  return mentions.map((m) => text.slice(m.index, m.index + m.length).replace(/^@/, "").trim()).filter(Boolean);
}

export async function handleEvents(events: LineEvent[], store: WebhookStore, reply: Reply): Promise<string[]> {
  const handled: string[] = [];
  for (const ev of events) {
    try {
      handled.push(await handleEvent(ev, store, reply));
    } catch (err) {
      console.error("[line-webhook] event failed", ev.type, err);
      handled.push(`error:${ev.type}`);
    }
  }
  return handled;
}

async function ensureGroup(groupId: string, store: WebhookStore): Promise<boolean> {
  const registered = await store.getRegisteredGroup();
  if (!registered) {
    await store.registerGroup(groupId);
    return true;
  }
  return registered === groupId;
}

async function handleEvent(ev: LineEvent, store: WebhookStore, reply: Reply): Promise<string> {
  const groupId = ev.source?.type === "group" ? ev.source.groupId : undefined;
  if (!groupId) return "ignored:not-group";

  if (ev.type === "postback") {
    if (!(await ensureGroup(groupId, store))) return "ignored:other-group";
    return handlePostback(ev, store, reply); // postback 沒有訊息 id，不寫 line_messages
  }

  if (ev.type === "join") {
    return (await ensureGroup(groupId, store)) ? "joined" : "ignored:other-group";
  }
  if (ev.type !== "message" || ev.message?.type !== "text" || !ev.message.text) return `ignored:${ev.type}`;
  if (!(await ensureGroup(groupId, store))) return "ignored:other-group";

  const mentions: Mention[] = (ev.message.mention?.mentionees ?? [])
    .filter((m) => (m.type ?? "user") === "user")
    .map((m) => ({ index: m.index, length: m.length, userId: m.userId, isSelf: m.isSelf === true }));
  const msg: CapturedMessage = {
    id: ev.message.id,
    groupId,
    userId: ev.source?.userId ?? "unknown",
    sentAt: new Date(ev.timestamp).toISOString(),
    text: ev.message.text,
    mentions,
    quotedMessageId: ev.message.quotedMessageId ?? null,
  };

  const isNew = await store.saveMessage(msg);
  if (!isNew) return "duplicate";

  // tag 傑瓜本身不算「人」：「/買膠帶 @傑瓜」仍是待辦，標題不含 @傑瓜、傑瓜也不是負責人
  const people = mentions.filter((m) => !m.isSelf);
  const cmd = parseCommand({ text: msg.text, mentions, quotedMessageId: msg.quotedMessageId });
  const send = async (message: string | LineTextMessage) => {
    if (ev.replyToken) await reply(ev.replyToken, message);
  };
  /** 確認訊息＋「要歸到哪一場？」按鈕；沒有接下來的演出就只回文字。 */
  const confirm = async (kind: "idea" | "todo", id: string, text: string, withButtonsText: string) => {
    const quickReply = showQuickReply(kind, id, await store.upcomingShows().catch(() => []));
    await send(quickReply ? { type: "text", text: withButtonsText, quickReply } : text);
  };

  if (cmd.kind !== "none" && cmd.kind !== "usage") {
    await store.ensureUsers(groupId, [msg.userId, ...people.map((m) => m.userId).filter((u): u is string => !!u)]).catch((e) => {
      console.error("[line-webhook] ensureUsers failed", e);
    });
  }

  switch (cmd.kind) {
    case "none": {
      if (!mentions.some((m) => m.isSelf)) return "captured";
      // tag 傑瓜：回覆待辦一覽（reply 免費，不推播）；另外 tag 的人 = 只看他們
      await send(await store.mentionSummary(people.map((m) => m.userId).filter((u): u is string => !!u)));
      return "summary";
    }
    case "usage":
      await send(USAGE_TEXT);
      return "usage";
    case "todo": {
      const id = await store.createTodo({ title: cmd.title, assigneeUserIds: cmd.assigneeUserIds, createdBy: msg.userId, sourceMessageId: msg.id });
      const names = mentionNames(msg.text, people);
      const text = `已建立待辦：${cmd.title}${names.length ? `（${names.join("、")}）` : "（未認領）"}`;
      await confirm("todo", id, text, text);
      return "todo";
    }
    case "idea": {
      const id = await store.createIdea({ text: cmd.text, authorUserId: msg.userId, sourceMessageId: msg.id });
      await confirm("idea", id, "已存進靈感庫", "已存進靈感庫，要歸到哪一場？");
      return "idea";
    }
    case "todo-from-quote":
    case "idea-from-quote": {
      const quoted = await store.getMessage(cmd.quotedMessageId);
      if (!quoted) {
        await send(QUOTE_MISSING_TEXT);
        return "usage:quote-missing";
      }
      if (cmd.kind === "todo-from-quote") {
        const id = await store.createTodo({ title: quoted.text, assigneeUserIds: [], createdBy: msg.userId, sourceMessageId: quoted.id });
        const text = `已建立待辦：${quoted.text}（未認領）`;
        await confirm("todo", id, text, text);
        return "todo:quote";
      }
      const id = await store.createIdea({ text: quoted.text, authorUserId: quoted.userId, sourceMessageId: quoted.id });
      await confirm("idea", id, "已存進靈感庫", "已存進靈感庫，要歸到哪一場？");
      return "idea:quote";
    }
  }
}

/** 按下「要歸到哪一場？」按鈕（spec line-group-capture「Postback assigns the idea or todo to a show」）。 */
async function handlePostback(ev: LineEvent, store: WebhookStore, reply: Reply): Promise<string> {
  const data = parsePostback(ev.postback?.data ?? "");
  if (!data) {
    console.warn("[line-webhook] ignored malformed postback", ev.postback?.data);
    return "postback:ignored";
  }
  const send = async (text: string) => {
    if (ev.replyToken) await reply(ev.replyToken, text); // 群組 postback 若沒帶 replyToken，照樣寫入、略過回覆
  };
  if (data.show === null) {
    if (!(await store.exists(data.kind, data.id))) {
      await send("這則已經不在了");
      return "postback:missing";
    }
    await send(data.kind === "idea" ? "好，先放在靈感庫" : "好，先不掛演出");
    return "postback:none";
  }
  const r = await store.assignToShow(data.kind, data.id, data.show);
  if (r.status === "missing") {
    await send("這則已經不在了");
    return "postback:missing";
  }
  await send(`已歸到「${r.showName}」`);
  return "postback:assigned";
}
