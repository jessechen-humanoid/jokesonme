import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePage } from "@/lib/auth/current";
import { db } from "@/lib/supabase";
import { listIdeas } from "@/lib/ideas";
import { listPerformances, pickableShows, SHOW_TYPE_LABEL, type ShowType, toPickerData } from "@/lib/shows";
import { assignableUsers, groupByShow, listTodos, listUsers, nameMap } from "@/lib/todos";
import { formatMonthDay, todayInTaipei } from "@/lib/dates";
import { displayName } from "@/lib/auth/users";
import Avatar from "@/components/avatar";
import IdeaList from "@/components/idea-list";
import TodoBoard from "@/components/todo-board";
import AddMenu from "@/components/add-menu";
import { ShowInfoButton, ShowLinks } from "@/components/show-editor";

// 每場演出的頁面（spec show-planning-page）：這場的待辦、文件、靈感；＋ 建立的東西自動屬於這場。
export default async function ShowPlanningPage({ params, searchParams }: PageProps<"/shows/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const me = await requirePage("planning", `/shows/${id}`);
  const actor = `user:${me.id}` as const;
  const { data: show } = await db(actor).from("shows").select("id, name, type, kind, performance_date, status").eq("id", id).maybeSingle<{ id: string; name: string; type: ShowType; kind: string; performance_date: string | null; status: string }>();
  if (!show || show.kind !== "performance") notFound();
  const [ideas, shows, users, todos, linksRes] = await Promise.all([
    listIdeas(actor, { showId: id }), listPerformances(actor), listUsers(actor), listTodos(actor),
    db(actor).from("show_links").select("kind, url").eq("show_id", id),
  ]);
  const names = nameMap(users);
  const picker = toPickerData(pickableShows(shows, todayInTaipei()));
  const showTodos = todos.filter((t) => t.show?.id === id);
  const links = Object.fromEntries(((linksRes.data ?? []) as { kind: string; url: string }[]).map((l) => [l.kind, l.url]));
  const newKind = sp.new === "todo" || sp.new === "idea" ? sp.new : null;

  return (
    <main className="page">
      <header className="head">
        <div className="head-top"><Link href="/shows" className="brand">‹ 演出</Link><Avatar user={me} /></div>
        <h1 className="page-title">{show.name}</h1>
        <p className="page-sub" style={{ marginBottom: 12 }}>
          {SHOW_TYPE_LABEL[show.type]}・{show.performance_date ? `${formatMonthDay(show.performance_date)}演出` : "還沒填演出日期"}{show.status === "archived" ? "・已歸檔" : ""}
        </p>
        <ShowInfoButton show={{ id: show.id, name: show.name, type: show.type, performanceDate: show.performance_date, status: show.status }} />
      </header>
      <div className="content">
        <TodoBoard
          key={`todos-${newKind ?? ""}`}
          groups={groupByShow(showTodos).map((g) => ({ ...g, title: "待辦" }))}
          names={Object.fromEntries(names)}
          picker={picker}
          assignable={assignableUsers(users).map((u) => ({ id: u.id, name: displayName(u) }))}
          meId={me.id}
          showDone={false}
          emptyText="這場還沒有待辦。按右下角 ＋ 新增。"
          initialSelected={null}
          initialNew={newKind === "todo"}
          initialShowId={id}
          showFab={false}
        />

        <div className="section"><b>文件</b></div>
        <ShowLinks showId={id} links={links} />

        <div className="section"><b>靈感</b><span>{ideas.length} 則</span></div>
        <IdeaList
          key={`ideas-${newKind ?? ""}`}
          ideas={ideas.map((i) => ({ id: i.id, text: i.text, author: names.get(i.authorUserId ?? "") ?? "成員", when: i.source?.sentAt ?? i.createdAt, showId: i.showId, showName: show.name, viaLine: !!i.source }))}
          picker={picker}
          mode="show"
          contextShowId={id}
          emptyText="這場還沒有靈感。到「靈感」把靈感歸過來，或按右下角 ＋ 新增。"
          allowCreate={false}
          initialNew={newKind === "idea"}
        />
      </div>
      <AddMenu base={`/shows/${id}`} />
    </main>
  );
}
