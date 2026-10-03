import Link from "next/link";
import { requirePage } from "@/lib/auth/current";
import { applyFilter, assignableUsers, groupByShow, listTodos, listUsers, nameMap, type Filter } from "@/lib/todos";
import { daysBetween, listShows, nextShow } from "@/lib/shows";
import { todayInTaipei } from "@/lib/dates";
import { displayName } from "@/lib/auth/users";
import Avatar from "@/components/avatar";
import TodoBoard from "@/components/todo-board";

function q(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const s = sp.toString();
  return s ? `/todos?${s}` : "/todos";
}

export default async function TodosPage({ searchParams }: PageProps<"/todos">) {
  const sp = await searchParams;
  const filter: Filter = sp.f === "all" || sp.f === "unclaimed" ? sp.f : "mine";
  const showDone = sp.done === "1";
  const me = await requirePage("todos", q({ f: filter === "mine" ? undefined : filter }));
  const actor = `user:${me.id}` as const;
  const [todos, users, shows] = await Promise.all([listTodos(actor), listUsers(actor), listShows(actor)]);
  const names = Object.fromEntries(nameMap(users));
  const today = todayInTaipei();

  const open = todos.filter((t) => !t.doneAt);
  const counts = {
    mine: applyFilter(open, "mine", me.id).length,
    all: open.length,
    unclaimed: applyFilter(open, "unclaimed", me.id).length,
  };
  const upcoming = nextShow(shows, today);
  const doneParam = showDone ? "1" : undefined;

  return (
    <main className="page">
      <header className="head">
        <div className="head-top">
          <div className="brand">看我笑話</div>
          <Avatar user={me} />
        </div>
        <div className="chips">
          <Link className={`chip ${filter === "mine" ? "on" : ""}`} href={q({ done: doneParam })}>我的待辦 {counts.mine}</Link>
          <Link className={`chip ${filter === "all" ? "on" : ""}`} href={q({ f: "all", done: doneParam })}>全部 {counts.all}</Link>
          <Link className={`chip ${filter === "unclaimed" ? "on" : ""}`} href={q({ f: "unclaimed", done: doneParam })}>未認領 {counts.unclaimed}</Link>
        </div>
        <div className="stats">
          <div className="stat"><b>{counts.mine}</b><span>我的待辦</span></div>
          <div className="stat">
            <b>{upcoming ? daysBetween(today, upcoming.performanceDate!) : "–"}</b>
            <span>{upcoming ? `天後 ${upcoming.name}` : "還沒排演出"}</span>
          </div>
          <div className="stat"><b>{counts.unclaimed}</b><span>未認領</span></div>
        </div>
      </header>

      <div className="content">
        {showDone ? <div className="notice">正在看已完成的待辦</div> : null}
        <TodoBoard
          key={`${filter}-${doneParam ?? ""}`}
          groups={groupByShow(applyFilter(todos, filter, me.id))}
          names={names}
          shows={shows.map((s) => ({ id: s.id, name: s.name, performanceDate: s.performanceDate }))}
          assignable={assignableUsers(users).map((u) => ({ id: u.id, name: displayName(u) }))}
          meId={me.id}
          showDone={showDone}
          emptyText={showDone ? "還沒有完成的待辦" : filter === "mine" ? "你目前沒有待辦。可以到「全部」或「未認領」看看。" : "目前沒有待辦"}
          initialSelected={typeof sp.t === "string" ? sp.t : null}
          initialNew={sp.new === "1"}
        />
        <Link className="toggle-done" href={q({ f: filter === "mine" ? undefined : filter, done: showDone ? undefined : "1" })}>
          {showDone ? "回到未完成" : "看已完成的待辦"}
        </Link>
      </div>
    </main>
  );
}
