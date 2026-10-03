// 待辦的讀取與排序（spec: todo-board）。寫入在 app/(app)/todos/actions.ts。
import { db, type Actor } from "./supabase.ts";
import { displayName, type UserRow } from "./auth/users.ts";

export type TodoSource = "command" | "template" | "manual";

export type TodoView = {
  id: string;
  title: string;
  dueDate: string | null;
  source: TodoSource;
  doneAt: string | null;
  doneBy: string | null;
  createdBy: string | null;
  createdAt: string;
  show: { id: string; name: string; performanceDate: string | null } | null;
  assignees: string[]; // LINE userId
  sourceMessage: { text: string; userId: string; sentAt: string } | null;
};

export type Filter = "mine" | "all" | "unclaimed";

type Row = {
  id: string; title: string; due_date: string | null; source: TodoSource; done_at: string | null; done_by: string | null;
  created_by: string | null; created_at: string;
  shows: { id: string; name: string; performance_date: string | null } | null;
  todo_assignees: { user_id: string }[];
  todo_sources: { line_messages: { text: string; user_id: string; sent_at: string } | null }[];
};

export async function listTodos(actor: Actor): Promise<TodoView[]> {
  const { data, error } = await db(actor)
    .from("todos")
    .select("id, title, due_date, source, done_at, done_by, created_by, created_at, shows(id, name, performance_date), todo_assignees(user_id), todo_sources(line_messages(text, user_id, sent_at))")
    .is("deleted_at", null)
    .returns<Row[]>();
  if (error) throw new Error(`list todos: ${error.message}`);
  return (data ?? []).map((r) => ({
    id: r.id, title: r.title, dueDate: r.due_date, source: r.source, doneAt: r.done_at, doneBy: r.done_by,
    createdBy: r.created_by, createdAt: r.created_at,
    show: r.shows ? { id: r.shows.id, name: r.shows.name, performanceDate: r.shows.performance_date } : null,
    assignees: r.todo_assignees.map((a) => a.user_id),
    sourceMessage: r.todo_sources[0]?.line_messages
      ? { text: r.todo_sources[0].line_messages.text, userId: r.todo_sources[0].line_messages.user_id, sentAt: r.todo_sources[0].line_messages.sent_at }
      : null,
  }));
}

/** spec「Todo ordering」：有截止日的依日期由近到遠，沒截止日的排後面；同日依建立時間。 */
export function compareTodos(a: Pick<TodoView, "dueDate" | "createdAt">, b: Pick<TodoView, "dueDate" | "createdAt">): number {
  if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1;
  if (a.dueDate && !b.dueDate) return -1;
  if (!a.dueDate && b.dueDate) return 1;
  return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
}

export function applyFilter(todos: TodoView[], filter: Filter, me: string): TodoView[] {
  if (filter === "mine") return todos.filter((t) => t.assignees.includes(me));
  if (filter === "unclaimed") return todos.filter((t) => t.assignees.length === 0);
  return todos;
}

export type TodoGroup = { key: string; title: string; performanceDate: string | null; todos: TodoView[] };

/** 依演出分組：有演出日的依日期，再來沒日期的演出，最後「沒有掛演出」。 */
export function groupByShow(todos: TodoView[]): TodoGroup[] {
  const map = new Map<string, TodoGroup>();
  for (const t of todos) {
    const key = t.show?.id ?? "none";
    if (!map.has(key)) map.set(key, { key, title: t.show?.name ?? "沒有掛演出", performanceDate: t.show?.performanceDate ?? null, todos: [] });
    map.get(key)!.todos.push(t);
  }
  const groups = [...map.values()];
  for (const g of groups) g.todos.sort(compareTodos);
  return groups.sort((a, b) => {
    if (a.key === "none") return 1;
    if (b.key === "none") return -1;
    if (a.performanceDate && b.performanceDate) return a.performanceDate < b.performanceDate ? -1 : 1;
    if (a.performanceDate) return -1;
    if (b.performanceDate) return 1;
    return a.title.localeCompare(b.title, "zh-Hant");
  });
}

export async function listUsers(actor: Actor): Promise<UserRow[]> {
  const { data, error } = await db(actor)
    .from("users")
    .select("id, display_name, member_name, picture_url, role, status, last_login_at")
    .returns<UserRow[]>();
  if (error) throw new Error(`list users: ${error.message}`);
  return data ?? [];
}

export function nameMap(users: UserRow[]): Map<string, string> {
  return new Map(users.map((u) => [u.id, displayName(u)]));
}

/** 可以被指派的人：已核准的管理員與成員（財務夥伴不接待辦）。 */
export function assignableUsers(users: UserRow[]): UserRow[] {
  return users
    .filter((u) => u.status === "approved" && (u.role === "admin" || u.role === "member"))
    .sort((a, b) => displayName(a).localeCompare(displayName(b), "zh-Hant"));
}
