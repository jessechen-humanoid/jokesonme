// LINE webhook 核心邏輯（spec: line-group-capture）。儲存與回覆都由外部注入，方便測試。
// 原則：驗簽失敗回 401；其他任何狀況都回 200（LINE 會重送失敗的事件，重送靠 message id 冪等擋掉）。
import { parseCommand, QUOTE_MISSING_TEXT, USAGE_TEXT, type Mention } from "./commands.ts";

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
  createTodo(input: { title: string; assigneeUserIds: string[]; createdBy: string; sourceMessageId: string }): Promise<void>;
  createIdea(input: { text: string; authorUserId: string; sourceMessageId: string }): Promise<void>;
  /** 作者或被 @ 的人還不在 users 時，用群組成員 profile 建一列 pending（讓待辦能顯示名字）。失敗不影響指令。 */
  ensureUsers(groupId: string, userIds: string[]): Promise<void>;
}

export type Reply = (replyToken: string, text: string) => Promise<void>;

type LineMention = { index: number; length: number; userId?: string; type?: string };
type LineEvent = {
  type: string;
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

  if (ev.type === "join") {
    return (await ensureGroup(groupId, store)) ? "joined" : "ignored:other-group";
  }
  if (ev.type !== "message" || ev.message?.type !== "text" || !ev.message.text) return `ignored:${ev.type}`;
  if (!(await ensureGroup(groupId, store))) return "ignored:other-group";

  const mentions: Mention[] = (ev.message.mention?.mentionees ?? [])
    .filter((m) => (m.type ?? "user") === "user")
    .map((m) => ({ index: m.index, length: m.length, userId: m.userId }));
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

  const cmd = parseCommand({ text: msg.text, mentions, quotedMessageId: msg.quotedMessageId });
  const send = async (text: string) => {
    if (ev.replyToken) await reply(ev.replyToken, text);
  };

  if (cmd.kind !== "none" && cmd.kind !== "usage") {
    await store.ensureUsers(groupId, [msg.userId, ...mentions.map((m) => m.userId).filter((u): u is string => !!u)]).catch((e) => {
      console.error("[line-webhook] ensureUsers failed", e);
    });
  }

  switch (cmd.kind) {
    case "none":
      return "captured";
    case "usage":
      await send(USAGE_TEXT);
      return "usage";
    case "todo": {
      await store.createTodo({ title: cmd.title, assigneeUserIds: cmd.assigneeUserIds, createdBy: msg.userId, sourceMessageId: msg.id });
      const names = mentionNames(msg.text, mentions);
      await send(`已建立待辦：${cmd.title}${names.length ? `（${names.join("、")}）` : "（未認領）"}`);
      return "todo";
    }
    case "idea":
      await store.createIdea({ text: cmd.text, authorUserId: msg.userId, sourceMessageId: msg.id });
      await send("已存進靈感庫");
      return "idea";
    case "todo-from-quote":
    case "idea-from-quote": {
      const quoted = await store.getMessage(cmd.quotedMessageId);
      if (!quoted) {
        await send(QUOTE_MISSING_TEXT);
        return "usage:quote-missing";
      }
      if (cmd.kind === "todo-from-quote") {
        await store.createTodo({ title: quoted.text, assigneeUserIds: [], createdBy: msg.userId, sourceMessageId: quoted.id });
        await send(`已建立待辦：${quoted.text}（未認領）`);
        return "todo:quote";
      }
      await store.createIdea({ text: quoted.text, authorUserId: quoted.userId, sourceMessageId: quoted.id });
      await send("已存進靈感庫");
      return "idea:quote";
    }
  }
}
