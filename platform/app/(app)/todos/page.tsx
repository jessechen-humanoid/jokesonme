import Link from "next/link";
import { requirePage } from "@/lib/auth/current";
import { applyFilter, assignableUsers, groupByShow, listTodos, listUsers, nameMap, type Filter } from "@/lib/todos";
import { daysBetween, listPerformances, pickableShows, toPickerData } from "@/lib/shows";
import { formatMonthDay, todayInTaipei } from "@/lib/dates";
import { displayName } from "@/lib/auth/users";
import Avatar from "@/components/avatar";
import TodoBoard from "@/components/todo-board";

function q(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const s = sp.toString();
  return s ? `/todos?${s}` : "/todos";
}

// 待辦（首頁）。頁頭：數字只在 chip 出現一次，下面一行「下一場」可點進演出頁（spec todo-board）。
export default async function TodosPage({ searchParams }: PageProps<"/todos">) {
  const sp = await searchParams;
  const filter: Filter = sp.f === "all" || sp.f === "unclaimed" ? sp.f : "mine";
  const showDone = sp.done === "1";
  const me = await requirePage("todos", q({ f: filter === "mine" ? undefined : filter }));
  const actor = `user:${me.id}` as const;
  const [todos, users, shows] = await Promise.all([listTodos(actor), listUsers(actor), listPerformances(actor)]);
  const names = Object.fromEntries(nameMap(users));
  const today = todayInTaipei();
  const pick = pickableShows(shows, today);

  const open = todos.filter((t) => !t.doneAt);
  const counts = {
    mine: applyFilter(open, "mine", me.id).length,
    all: open.length,
    unclaimed: applyFilter(open, "unclaimed", me.id).length,
  };
  const doneParam = showDone ? "1" : undefined;
  const next = pick.next;

  return (
    <main className="page">
      <header className="head">
        <div className="head-top">
          <div className="brand">看我笑話</div>
          <Avatar user={me} />
        </div>
        <h1 className="page-title">待辦</h1>
        <div className="chips" style={{ marginTop: 10 }}>
          <Link className={`chip ${filter === "mine" ? "on" : ""}`} href={q({ done: doneParam })}>我的 {counts.mine}</Link>
          <Link className={`chip ${filter === "all" ? "on" : ""}`} href={q({ f: "all", done: doneParam })}>全部 {counts.all}</Link>
          <Link className={`chip ${filter === "unclaimed" ? "on" : ""}`} href={q({ f: "unclaimed", done: doneParam })}>未認領 {counts.unclaimed}</Link>
        </div>
        {next ? (
          <Link className="next-line" href={`/shows/${next.id}`}>
            <span>下一場・還有 {daysBetween(today, next.performanceDate!)} 天</span>
            <b>{next.name}・{formatMonthDay(next.performanceDate!)} ›</b>
          </Link>
        ) : (
          <Link className="next-line" href="/shows"><span>還沒排下一場演出</span><b>到演出補日期 ›</b></Link>
        )}
      </header>

      <div className="content">
        {showDone ? <div className="notice">正在看已完成的待辦</div> : null}
        <TodoBoard
          key={`${filter}-${doneParam ?? ""}`}
          groups={groupByShow(applyFilter(todos, filter, me.id))}
          names={names}
          picker={toPickerData(pick)}
          assignable={assignableUsers(users).map((u) => ({ id: u.id, name: displayName(u) }))}
          meId={me.id}
          showDone={showDone}
          emptyText={showDone ? "還沒有完成的待辦" : filter === "mine" ? "你目前沒有待辦。可以到「全部」或「未認領」看看。" : "目前沒有待辦。在群組打「/內容」就會建立一筆。"}
          initialSelected={typeof sp.t === "string" ? sp.t : null}
          initialNew={sp.new === "1"}
          today={today}
        />
        <Link className="toggle-done" href={q({ f: filter === "mine" ? undefined : filter, done: showDone ? undefined : "1" })}>
          {showDone ? "回到未完成" : "看已完成的待辦"}
        </Link>
      </div>
    </main>
  );
}
