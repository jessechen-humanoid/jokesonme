import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePage } from "@/lib/auth/current";
import { db } from "@/lib/supabase";
import { listIdeas } from "@/lib/ideas";
import { listShows, SHOW_TYPE_LABEL, type ShowType } from "@/lib/shows";
import { compareTodos, listTodos, listUsers, nameMap } from "@/lib/todos";
import { formatDueLabel, formatMonthDay } from "@/lib/dates";
import Avatar from "@/components/avatar";
import IdeaList from "@/components/idea-list";
import { ShowInfoButton, ShowLinks } from "@/components/show-editor";

// 每場演出的企劃頁（spec: show-planning-page）：靈感、待辦、三份文件連結。
export default async function ShowPlanningPage({ params }: PageProps<"/shows/[id]">) {
  const { id } = await params;
  const me = await requirePage("planning", `/shows/${id}`);
  const actor = `user:${me.id}` as const;
  const { data: show } = await db(actor).from("shows").select("id, name, type, performance_date").eq("id", id).maybeSingle<{ id: string; name: string; type: ShowType; performance_date: string | null }>();
  if (!show) notFound();
  const [ideas, shows, users, todos, linksRes] = await Promise.all([
    listIdeas(actor, { showId: id }), listShows(actor), listUsers(actor), listTodos(actor),
    db(actor).from("show_links").select("kind, url").eq("show_id", id),
  ]);
  const names = nameMap(users);
  const showTodos = todos.filter((t) => t.show?.id === id);
  const open = showTodos.filter((t) => !t.doneAt).sort(compareTodos);
  const done = showTodos.filter((t) => t.doneAt);
  const links = Object.fromEntries(((linksRes.data ?? []) as { kind: string; url: string }[]).map((l) => [l.kind, l.url]));

  return (
    <main className="page">
      <header className="head">
        <div className="head-top"><Link href="/shows" className="brand" style={{ fontSize: 20 }}>‹ 企劃</Link><Avatar user={me} /></div>
        <h1 className="page-title">{show.name}</h1>
        <p className="page-sub" style={{ marginBottom: 12 }}>
          {SHOW_TYPE_LABEL[show.type]}・{show.performance_date ? `${formatMonthDay(show.performance_date)}演出` : "還沒填演出日期"}
        </p>
        <ShowInfoButton show={{ id: show.id, name: show.name, type: show.type, performanceDate: show.performance_date }} />
      </header>
      <div className="content">
        <div className="section"><b>待辦</b><span>未完成 {open.length}・已完成 {done.length}</span></div>
        {open.length === 0 ? <p className="empty">這場沒有未完成的待辦</p> : open.map((t) => (
          <Link key={t.id} href={`/todos?f=all&t=${t.id}`} className="card" style={{ display: "block" }}>
            <div className="title">{t.title}</div>
            <div className="meta">
              {t.dueDate ? <span className="due">{formatDueLabel(t.dueDate)}</span> : null}
              {t.assignees.length ? t.assignees.map((u) => <span key={u} className="tag">{names.get(u) ?? "成員"}</span>) : <span className="tag free">未認領</span>}
            </div>
          </Link>
        ))}

        <div className="section"><b>文件</b></div>
        <ShowLinks showId={id} links={links} />

        <div className="section"><b>靈感</b><span>{ideas.length} 則</span></div>
        <IdeaList
          ideas={ideas.map((i) => ({ id: i.id, text: i.text, author: names.get(i.authorUserId ?? "") ?? "成員", when: i.source?.sentAt ?? i.createdAt, showId: i.showId, viaLine: !!i.source }))}
          shows={shows.map((s) => ({ id: s.id, name: s.name }))}
          archived={false}
          contextShowId={id}
          emptyText="還沒有靈感。到靈感庫把靈感指派過來，或按右下角 + 新增。"
          allowCreate
        />
      </div>
    </main>
  );
}
