"use client";
// 靈感清單（靈感庫與企劃頁共用）。指派、封存先在畫面上生效（樂觀更新），背景再存。
import { useOptimistic, useState, useTransition } from "react";
import { assignIdea, createIdea, setIdeaArchived, updateIdea } from "@/app/(app)/ideas/actions";
import { formatTaipeiDateTime } from "@/lib/dates";

export type IdeaView = { id: string; text: string; author: string; when: string; showId: string | null; viaLine: boolean };
type Show = { id: string; name: string };

/** 文字裡的網址變成可點的連結，其餘原樣（含換行）。 */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? <a key={i} href={p} target="_blank" rel="noreferrer" style={{ color: "var(--brand-deep)", wordBreak: "break-all" }}>{p}</a> : <span key={i}>{p}</span>,
      )}
    </>
  );
}

export default function IdeaList(props: {
  ideas: IdeaView[]; shows: Show[]; archived: boolean; contextShowId: string | null; emptyText: string; allowCreate: boolean;
}) {
  const [ideas, hide] = useOptimistic(props.ideas, (list: IdeaView[], id: string) => list.filter((i) => i.id !== id));
  const [, start] = useTransition();
  const [editing, setEditing] = useState<IdeaView | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<void>, hideId?: string) => {
    setError(null);
    start(async () => {
      if (hideId) hide(hideId);
      try {
        await fn();
      } catch {
        setError("剛剛的操作沒有存成功，請再試一次");
      }
    });
  };
  const fd = (o: Record<string, string>) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(o)) f.set(k, v);
    return f;
  };

  return (
    <>
      {error ? <div className="notice" role="alert">{error}</div> : null}
      {ideas.length === 0 ? <p className="empty">{props.emptyText}</p> : null}
      {ideas.map((i) => (
        <div key={i.id} className="card">
          <div className="title" style={{ whiteSpace: "pre-wrap" }}><Linkified text={i.text} /></div>
          <div className="meta">
            <span className="tag">{i.author}</span>
            <span>{formatTaipeiDateTime(i.when)}</span>
            {i.viaLine ? <span>LINE #</span> : null}
          </div>
          <div className="row" style={{ gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {!props.archived ? (
              <select
                className="select"
                style={{ flex: "1 1 160px", minHeight: 40 }}
                aria-label="指派到演出"
                value={i.showId ?? ""}
                onChange={(e) => {
                  const to = e.target.value;
                  const leaves = props.contextShowId !== null ? to !== props.contextShowId : to !== "";
                  run(() => assignIdea(fd({ id: i.id, show_id: to, from_show_id: i.showId ?? "" })), leaves ? i.id : undefined);
                }}
              >
                <option value="">放在靈感庫（未指派）</option>
                {props.shows.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            ) : null}
            {!props.archived ? <button className="btn btn-ghost" type="button" onClick={() => setEditing(i)}>編輯</button> : null}
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => run(() => setIdeaArchived(fd({ id: i.id, archive: props.archived ? "0" : "1", show_id: i.showId ?? "" })), i.id)}
            >
              {props.archived ? "還原" : "封存"}
            </button>
          </div>
        </div>
      ))}

      {props.allowCreate ? (
        <button className="fab" type="button" aria-label="新增靈感" onClick={() => setEditing("new")} style={{ border: 0, cursor: "pointer" }}>+</button>
      ) : null}

      {editing ? (
        <div className="sheet-backdrop" onClick={() => setEditing(null)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="idea-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="idea-title">{editing === "new" ? "新增靈感" : "編輯靈感"}</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const isNew = editing === "new";
                setEditing(null);
                run(() => (isNew ? createIdea(f) : updateIdea(f)));
              }}
            >
              {editing !== "new" ? <input type="hidden" name="id" value={editing.id} /> : null}
              <input type="hidden" name="show_id" value={editing !== "new" ? (editing.showId ?? "") : (props.contextShowId ?? "")} />
              <label className="field">
                <span>靈感內容</span>
                <textarea className="textarea" name="text" required maxLength={4000} autoFocus defaultValue={editing !== "new" ? editing.text : ""} style={{ minHeight: 140 }} />
              </label>
              <div className="actions">
                <button className="btn btn-primary" type="submit">{editing === "new" ? "新增" : "儲存"}</button>
                <button className="btn btn-ghost" type="button" onClick={() => setEditing(null)}>取消</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
