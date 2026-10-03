// 群組指令解析（spec: line-group-capture）。純字串規則，不呼叫任何語言模型。
//   `/` 或 `／` 開頭：第一個詞是「靈感」「行程」「說明」就照類型處理，其餘都是待辦。
//   `#` 或 `＃` 開頭 → 靈感（舊寫法，照樣支援但小抄不再介紹）。
//   只打符號：有引用（LINE 回覆功能）→ 用被回覆的訊息；沒引用 → 回小抄。
import { todayInTaipei } from "../dates.ts";

export type Mention = { index: number; length: number; userId?: string; isSelf?: boolean };

export type CommandInput = {
  text: string;
  mentions?: Mention[];
  quotedMessageId?: string | null;
  /** 台北的今天（YYYY-MM-DD），`/行程` 決定年份用；測試時固定。 */
  today?: string;
};

export type Command =
  | { kind: "none" }
  | { kind: "usage" }
  | { kind: "todo"; title: string; assigneeUserIds: string[] }
  | { kind: "idea"; text: string }
  | { kind: "event"; date: string; time: string | null; title: string }
  | { kind: "todo-from-quote"; quotedMessageId: string }
  | { kind: "idea-from-quote"; quotedMessageId: string };

const TODO_PREFIXES = ["/", "／"];
const IDEA_PREFIXES = ["#", "＃"];

export const QUOTE_MISSING_TEXT = "找不到被回覆的那則訊息（可能是傑瓜加入群組前、或超過 14 天的訊息）。請改用「#內容」或「/內容」直接輸入。";

export const USAGE_TEXT = [
  "傑瓜小抄：開頭打 / 就好",
  "/內容 → 建待辦（加 @人 就是負責人）",
  "/靈感 內容 → 存進靈感庫",
  "/行程 10/12 19:00 內容 → 記到行事曆（時間可省略）",
  "/說明 → 再看一次這張小抄",
  "想知道誰要做什麼：tag 傑瓜",
].join("\n");

/** 把 mention 的文字（例如「@柏文」）從原文挖掉，再整理空白。index/length 以原文的 UTF-16 位置計。 */
function stripMentions(text: string, mentions: Mention[]): string {
  const sorted = [...mentions].sort((a, b) => b.index - a.index);
  let out = text;
  for (const m of sorted) {
    if (m.index < 0 || m.index + m.length > out.length) continue;
    out = out.slice(0, m.index) + out.slice(m.index + m.length);
  }
  return out.replace(/\s+/g, " ").trim();
}

/** 類型詞後面要接空白或結尾才算（`/靈感會議要訂場地` 仍是待辦）。回傳類型詞後的內容，不是就回 null。 */
function afterKeyword(body: string, keyword: string): string | null {
  if (!body.startsWith(keyword)) return null;
  const rest = body.slice(keyword.length);
  if (rest !== "" && !/^\s/.test(rest)) return null;
  return rest.trim();
}

/** `/行程` 後面：M/D［HH:MM］標題。年份取台北「今天或之後」最近的那一天；格式不對回 null。 */
export function parseEventArgs(rest: string, today: string): { date: string; time: string | null; title: string } | null {
  const m = /^(\d{1,2})[/／](\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?=\s|$))?\s+(.+)$/.exec(rest.replace(/：/g, ":"));
  if (!m) return null;
  const [, mo, d, hh, mm, title] = m;
  if (hh === undefined && /^\d{1,2}:\d{2}(\s|$)/.test(title)) return null; // 只有時間沒有標題、或時間不合法
  const month = Number(mo), day = Number(d);
  let time: string | null = null;
  if (hh !== undefined) {
    if (Number(hh) > 23 || Number(mm) > 59) return null;
    time = `${hh.padStart(2, "0")}:${mm}`;
  }
  const year = Number(today.slice(0, 4));
  for (const y of [year, year + 1]) {
    const dt = new Date(Date.UTC(y, month - 1, day));
    if (dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== day) return null; // 13/40、2/30
    const iso = dt.toISOString().slice(0, 10);
    if (iso >= today) return { date: iso, time, title: title.trim() };
  }
  return null;
}

export function parseCommand(input: CommandInput): Command {
  const mentions = input.mentions ?? [];
  const trimmed = input.text.trim();
  const first = trimmed.charAt(0);
  const isTodo = TODO_PREFIXES.includes(first);
  const isIdea = IDEA_PREFIXES.includes(first);
  if (!isTodo && !isIdea) return { kind: "none" };

  const body = trimmed.slice(1).trim();
  if (body === "") {
    if (input.quotedMessageId) {
      return isTodo
        ? { kind: "todo-from-quote", quotedMessageId: input.quotedMessageId }
        : { kind: "idea-from-quote", quotedMessageId: input.quotedMessageId };
    }
    return { kind: "usage" };
  }

  if (isIdea) return { kind: "idea", text: body };

  // `/` ＋ 類型詞：在挖掉 @ 的文字上判斷（tag 傑瓜不會混進標題）
  const plain = stripMentions(input.text, mentions).replace(/^\s*[/／]/, "").trim();
  if (afterKeyword(plain, "說明") === "") return { kind: "usage" };
  const idea = afterKeyword(plain, "靈感");
  if (idea !== null) {
    if (idea) return { kind: "idea", text: idea };
    return input.quotedMessageId ? { kind: "idea-from-quote", quotedMessageId: input.quotedMessageId } : { kind: "usage" };
  }
  const eventArgs = afterKeyword(plain, "行程");
  if (eventArgs !== null) {
    const ev = parseEventArgs(eventArgs, input.today ?? todayInTaipei());
    return ev ? { kind: "event", ...ev } : { kind: "usage" };
  }

  // 待辦：mention 位置是相對原文，先在原文上挖掉 mention，再去掉前導空白與斜線。
  const withoutMentions = stripMentions(input.text, mentions);
  const title = withoutMentions.slice(withoutMentions.indexOf(first) + 1).trim();
  // tag 傑瓜本身（isSelf）的文字會從標題挖掉，但傑瓜不會變成負責人
  const assigneeUserIds = [...new Set(mentions.filter((m) => !m.isSelf).map((m) => m.userId).filter((id): id is string => !!id))];
  if (title === "") {
    // 只有 @人 沒有內容，視同沒寫內容
    return input.quotedMessageId ? { kind: "todo-from-quote", quotedMessageId: input.quotedMessageId } : { kind: "usage" };
  }
  return { kind: "todo", title, assigneeUserIds };
}
