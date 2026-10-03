import Link from "next/link";
import { requirePage } from "@/lib/auth/current";
import { listIdeas } from "@/lib/ideas";
import { listShows } from "@/lib/shows";
import { listUsers, nameMap } from "@/lib/todos";
import Avatar from "@/components/avatar";
import IdeaList from "@/components/idea-list";

export default async function IdeasPage({ searchParams }: PageProps<"/ideas">) {
  const sp = await searchParams;
  const archived = sp.archived === "1";
  const me = await requirePage("ideas", "/ideas");
  const actor = `user:${me.id}` as const;
  const [ideas, shows, users] = await Promise.all([listIdeas(actor, { library: !archived, archived }), listShows(actor), listUsers(actor)]);
  const names = nameMap(users);
  return (
    <main className="page">
      <header className="head">
        <div className="head-top"><div className="brand">看我笑話</div><Avatar user={me} /></div>
        <div className="chips">
          <Link className={`chip ${!archived ? "on" : ""}`} href="/ideas">靈感庫</Link>
          <Link className={`chip ${archived ? "on" : ""}`} href="/ideas?archived=1">已封存</Link>
        </div>
        <h1 className="page-title">{archived ? "已封存的靈感" : "靈感庫"}</h1>
        <p className="page-sub">{archived ? "封存的靈感可以還原" : "群組裡打「#內容」就會存到這裡，指派到演出後會移到該場的企劃頁"}</p>
      </header>
      <div className="content">
        <IdeaList
          key={archived ? "a" : "l"}
          ideas={ideas.map((i) => ({ id: i.id, text: i.text, author: names.get(i.authorUserId ?? "") ?? "成員", when: i.source?.sentAt ?? i.createdAt, showId: i.showId, viaLine: !!i.source }))}
          shows={shows.map((s) => ({ id: s.id, name: s.name }))}
          archived={archived}
          contextShowId={null}
          emptyText={archived ? "沒有封存的靈感" : "靈感庫是空的。在群組打「#內容」或按右下角 + 新增。"}
          allowCreate={!archived}
        />
      </div>
    </main>
  );
}
