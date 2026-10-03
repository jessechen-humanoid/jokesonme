// tag 傑瓜時的待辦一覽（spec: bot-mention-summary）。只產生文字，由 webhook 用免費的 reply 送出。
import { formatDueLabel } from "../dates.ts";

export type SummaryTodo = { title: string; dueDate: string | null; assignees: string[] };
const PER_PERSON = 5;

const byDue = (a: SummaryTodo, b: SummaryTodo) => (a.dueDate ?? "9999-99-99").localeCompare(b.dueDate ?? "9999-99-99");
const line = (t: SummaryTodo) => `・${t.title}${t.dueDate ? ` ${formatDueLabel(t.dueDate)}` : ""}`;

function block(title: string, todos: SummaryTodo[]): string[] {
  const sorted = [...todos].sort(byDue);
  const out = [title, ...sorted.slice(0, PER_PERSON).map(line)];
  if (sorted.length > PER_PERSON) out.push(`…還有 ${sorted.length - PER_PERSON} 件`);
  return out;
}

/**
 * @param onlyUserIds 訊息裡另外 tag 的人；有給就只列這些人（不列未認領）。
 * @param order 人名的排列順序（例如成員順序）；不在裡面的排後面。
 */
export function mentionSummary(todos: SummaryTodo[], name: (id: string) => string, link: string, onlyUserIds: string[] = [], order: string[] = []): string {
  const people = new Map<string, SummaryTodo[]>();
  const unclaimed: SummaryTodo[] = [];
  for (const t of todos) {
    if (!t.assignees.length) unclaimed.push(t);
    for (const u of t.assignees) people.set(u, [...(people.get(u) ?? []), t]);
  }
  const rank = (id: string) => {
    const i = order.indexOf(name(id));
    return i === -1 ? order.length : i;
  };
  const ids = (onlyUserIds.length ? onlyUserIds : [...people.keys()]).sort((a, b) => rank(a) - rank(b) || name(a).localeCompare(name(b), "zh-Hant"));
  const blocks: string[][] = [];
  for (const id of ids) {
    const list = people.get(id) ?? [];
    blocks.push(list.length ? block(`【${name(id)}】`, list) : [`【${name(id)}】`, "・目前沒有待辦"]);
  }
  if (!onlyUserIds.length && unclaimed.length) blocks.push(block("【未認領】", unclaimed));
  if (!blocks.length) return `目前沒有未完成的待辦。\n\n看全部：${link}`;
  return `${blocks.map((b) => b.join("\n")).join("\n\n")}\n\n看全部：${link}`.slice(0, 4900);
}
