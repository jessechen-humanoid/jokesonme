// 群組指令解析（spec: line-group-capture）。純字串規則，不呼叫任何語言模型。
//   `/` 或 `／` 開頭 → 待辦；`#` 或 `＃` 開頭 → 靈感。
//   只打符號：有引用（LINE 回覆功能）→ 用被回覆的訊息；沒引用 → 回用法說明。

export type Mention = { index: number; length: number; userId?: string };

export type CommandInput = {
  text: string;
  mentions?: Mention[];
  quotedMessageId?: string | null;
};

export type Command =
  | { kind: "none" }
  | { kind: "usage" }
  | { kind: "todo"; title: string; assigneeUserIds: string[] }
  | { kind: "idea"; text: string }
  | { kind: "todo-from-quote"; quotedMessageId: string }
  | { kind: "idea-from-quote"; quotedMessageId: string };

const TODO_PREFIXES = ["/", "／"];
const IDEA_PREFIXES = ["#", "＃"];

export const QUOTE_MISSING_TEXT = "找不到被回覆的那則訊息（可能是傑瓜加入群組前、或超過 14 天的訊息）。請改用「#內容」或「/內容」直接輸入。";

export const USAGE_TEXT = "用法：「/內容」建立待辦（可 @人 指定負責人），「#內容」存進靈感庫；回覆某則訊息只打 / 或 #，會存下被回覆的那則。";

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

  // 待辦：mention 位置是相對原文，先在原文上挖掉 mention，再去掉前導空白與斜線。
  const withoutMentions = stripMentions(input.text, mentions);
  const title = withoutMentions.slice(withoutMentions.indexOf(first) + 1).trim();
  const assigneeUserIds = [...new Set(mentions.map((m) => m.userId).filter((id): id is string => !!id))];
  if (title === "") {
    // 只有 @人 沒有內容，視同沒寫內容
    return input.quotedMessageId ? { kind: "todo-from-quote", quotedMessageId: input.quotedMessageId } : { kind: "usage" };
  }
  return { kind: "todo", title, assigneeUserIds };
}
