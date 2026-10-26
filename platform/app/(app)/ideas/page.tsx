import Link from "next/link";
import { requirePage } from "@/lib/auth/current";
import { listIdeas } from "@/lib/ideas";
import { listPerformances, pickableShows, toPickerData } from "@/lib/shows";
import { listUsers, nameMap } from "@/lib/todos";
import { todayInTaipei } from "@/lib/dates";
import { displayName } from "@/lib/auth/users";
import TopBar from "@/components/top-bar";
import IdeaList, { type IdeaListMode } from "@/components/idea-list";

// 筆記分頁（spec idea-library「Idea library page」；資料表與路徑仍叫 ideas）：全部（預設）／未分演出／已封存。
export default async function IdeasPage({ searchParams }: PageProps<"/ideas">) {
  const sp = await searchParams;
  const mode: IdeaListMode = sp.v === "inbox" ? "inbox" : sp.v === "archived" ? "archived" : "all";
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
  const tab = (v: IdeaListMode, label: React.ReactNode) => (
    <Link className={mode === v ? "on" : ""} href={v === "all" ? "/ideas" : `/ideas?v=${v}`}>{label}</Link>
  );

  return (
    <main className="page">
      <TopBar me={me} title="筆記" />
      <Link href="/ideas/venue-availability" className="venue-entry-link">
        <span><b>2027 場地檔期</b><small>大廳帶狀節目每月建議日與月曆</small></span>
        <span aria-hidden="true">查看 ›</span>
      </Link>
      <nav className="seg-tabs" aria-label="篩選筆記">
        {tab("all", <>全部 <span className="count">{active.length}</span></>)}
        {tab("inbox", <>未分演出 <span className="count">{inbox.length}</span></>)}
        {tab("archived", "已封存")}
      </nav>
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
          composer={mode !== "archived"}
          me={displayName(me)}
          emptyText={
            mode === "archived" ? "沒有封存的筆記" : <>還沒有筆記。<br />在上面直接寫，或在群組打「/筆記 內容」。</>
          }
        />
      </div>
    </main>
  );
}
