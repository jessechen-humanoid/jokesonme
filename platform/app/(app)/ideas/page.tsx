import Link from "next/link";
import { requirePage } from "@/lib/auth/current";
import { listIdeas } from "@/lib/ideas";
import { listPerformances, pickableShows, toPickerData } from "@/lib/shows";
import { listUsers, nameMap } from "@/lib/todos";
import { todayInTaipei } from "@/lib/dates";
import Avatar from "@/components/avatar";
import IdeaList, { type IdeaListMode } from "@/components/idea-list";

// 靈感分頁（spec idea-library「Idea library page」）：還沒歸位／全部／已封存。
export default async function IdeasPage({ searchParams }: PageProps<"/ideas">) {
  const sp = await searchParams;
  const mode: IdeaListMode = sp.v === "all" ? "all" : sp.v === "archived" ? "archived" : "inbox";
  const me = await requirePage("ideas", "/ideas");
  const actor = `user:${me.id}` as const;
  const [active, archived, shows, users] = await Promise.all([
    listIdeas(actor, {}),
    mode === "archived" ? listIdeas(actor, { archived: true }) : Promise.resolve([]),
    listPerformances(actor),
    listUsers(actor),
  ]);
  const names = nameMap(users);
  const showNames = new Map(shows.map((s) => [s.id, s.name]));
  const inbox = active.filter((i) => !i.showId);
  const list = mode === "inbox" ? inbox : mode === "all" ? active : archived;
  const tab = (v: IdeaListMode, label: string) => (
    <Link className={`chip ${mode === v ? "on" : ""}`} href={v === "inbox" ? "/ideas" : `/ideas?v=${v}`}>{label}</Link>
  );

  return (
    <main className="page">
      <header className="head">
        <div className="head-top"><div className="brand">看我笑話</div><Avatar user={me} /></div>
        <h1 className="page-title">靈感</h1>
        <div className="chips" style={{ marginBottom: 0, marginTop: 10 }}>
          {tab("inbox", `還沒歸位 ${inbox.length}`)}
          {tab("all", `全部 ${active.length}`)}
          {tab("archived", "已封存")}
        </div>
      </header>
      <div className="content">
        <IdeaList
          key={mode}
          ideas={list.map((i) => ({
            id: i.id, text: i.text, author: names.get(i.authorUserId ?? "") ?? "成員", when: i.source?.sentAt ?? i.createdAt,
            showId: i.showId, showName: i.showId ? (showNames.get(i.showId) ?? null) : null, viaLine: !!i.source,
          }))}
          picker={toPickerData(pickableShows(shows, todayInTaipei()))}
          mode={mode}
          contextShowId={null}
          emptyText={
            mode === "inbox" ? <>都歸位了。<br />在群組打「#內容」，靈感會先存到這裡。</> : mode === "all" ? "還沒有靈感" : "沒有封存的靈感"
          }
          allowCreate={mode !== "archived"}
        />
      </div>
    </main>
  );
}
