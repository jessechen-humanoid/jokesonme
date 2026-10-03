"use client";
// 靈感清單（靈感分頁與演出頁共用；spec idea-library「Assign idea to a show」）。
// 卡片：內容（點了編輯）、作者、時間、「→ 下一場」一鍵歸位、「其他…」開選演出面板；封存在編輯面板裡。
// 歸位、封存先在畫面上生效（樂觀更新），背景再存。
import { useOptimistic, useState, useTransition } from "react";
import { assignIdea, createIdea, setIdeaArchived, updateIdea } from "@/app/(app)/ideas/actions";
import { formatTaipeiDateTime } from "@/lib/dates";
import ShowPicker, { type PickerData } from "@/components/show-picker";

export type IdeaView = { id: string; text: string; author: string; when: string; showId: string | null; showName: string | null; viaLine: boolean };
/** inbox = 還沒歸位、all = 全部、archived = 已封存、show = 某場演出頁 */
export type IdeaListMode = "inbox" | "all" | "archived" | "show";

type Patch = { id: string; showId?: string | null; showName?: string | null; remove?: boolean };

function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a key={i} href={p} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: "var(--brand-deep)", wordBreak: "break-all" }}>{p}</a>
        ) : <span key={i}>{p}</span>,
      )}
    </>
  );
}

export default function IdeaList(props: {
  ideas: IdeaView[]; picker: PickerData; mode: IdeaListMode; contextShowId: string | null; emptyText: React.ReactNode; allowCreate: boolean;
  /** 一進來就打開新增面板（演出頁的＋選單用） */
  initialNew?: boolean;
}) {
  const [ideas, patch] = useOptimistic(props.ideas, (list: IdeaView[], p: Patch) =>
    p.remove ? list.filter((i) => i.id !== p.id) : list.map((i) => (i.id === p.id ? { ...i, showId: p.showId ?? null, showName: p.showName ?? null } : i)),
  );
  const [, start] = useTransition();
  const [editing, setEditing] = useState<IdeaView | "new" | null>(props.initialNew ? "new" : null);
  const [picking, setPicking] = useState<IdeaView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const showName = (id: string | null) =>
    id ? ([props.picker.next, ...props.picker.upcoming, ...props.picker.more].find((s) => s?.id === id)?.name ?? null) : null;

  const run = (fn: () => Promise<void>, p?: Patch) => {
    setError(null);
    start(async () => {
      if (p) patch(p);
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
  /** 歸到某場（null = 退回還沒歸位）；離開目前檢視就從清單移除。 */
  const assign = (i: IdeaView, to: string | null) => {
    const leaves = props.mode === "inbox" ? to !== null : props.mode === "show" ? to !== props.contextShowId : false;
    run(() => assignIdea(fd({ id: i.id, show_id: to ?? "", from_show_id: i.showId ?? "" })), { id: i.id, showId: to, showName: showName(to), remove: leaves });
  };
  const next = props.picker.next;

  return (
    <>
      {error ? <div className="notice" role="alert">{error}</div> : null}
      {ideas.length === 0 ? <div className="empty">{props.emptyText}</div> : null}
      {ideas.map((i) => (
        <div key={i.id} className="card">
          <button type="button" className="title" onClick={() => props.mode !== "archived" && setEditing(i)} style={{ whiteSpace: "pre-wrap", background: "none", border: 0, padding: 0, textAlign: "left", width: "100%", cursor: props.mode === "archived" ? "default" : "pointer" }}>
            <Linkified text={i.text} />
          </button>
          <div className="meta">
            <span className="tag">{i.author}</span>
            <span>{formatTaipeiDateTime(i.when)}</span>
            {i.viaLine ? <span>LINE</span> : null}
            {props.mode === "all" && i.showName ? <span className="tag">{i.showName}</span> : null}
          </div>
          <div className="actions" style={{ marginTop: 10 }}>
            {props.mode === "archived" ? (
              <button className="btn btn-ghost" type="button" onClick={() => run(() => setIdeaArchived(fd({ id: i.id, archive: "0", show_id: i.showId ?? "" })), { id: i.id, remove: true })}>還原</button>
            ) : (
              <>
                {next && i.showId !== next.id ? (
                  <button className="btn btn-primary" type="button" onClick={() => assign(i, next.id)}>→ {next.name}</button>
                ) : null}
                <button className="btn btn-ghost" type="button" onClick={() => setPicking(i)}>其他…</button>
              </>
            )}
          </div>
        </div>
      ))}

      {props.allowCreate ? (
        <button className="fab" type="button" aria-label="新增靈感" onClick={() => setEditing("new")}>+</button>
      ) : null}

      {picking ? (
        <div className="sheet-backdrop" onClick={() => setPicking(null)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="pick-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="pick-title">歸到哪一場？</h2>
            <ShowPicker
              data={props.picker}
              value={picking.showId}
              onChange={(to) => {
                const target = picking;
                setPicking(null);
                if (to !== target.showId) assign(target, to);
              }}
            />
          </div>
        </div>
      ) : null}

      {editing ? (
        <IdeaEditSheet
          idea={editing === "new" ? null : editing}
          picker={props.picker}
          defaultShowId={props.contextShowId}
          onClose={() => setEditing(null)}
          onSave={(f, isNew) => {
            setEditing(null);
            run(() => (isNew ? createIdea(f) : updateIdea(f)));
          }}
          onArchive={(i) => {
            setEditing(null);
            run(() => setIdeaArchived(fd({ id: i.id, archive: "1", show_id: i.showId ?? "" })), { id: i.id, remove: true });
          }}
        />
      ) : null}
    </>
  );
}

function IdeaEditSheet(props: {
  idea: IdeaView | null; picker: PickerData; defaultShowId: string | null;
  onClose: () => void; onSave: (f: FormData, isNew: boolean) => void; onArchive: (i: IdeaView) => void;
}) {
  const isNew = props.idea === null;
  const [showId, setShowId] = useState<string | null>(isNew ? props.defaultShowId : (props.idea?.showId ?? null));
  return (
    <div className="sheet-backdrop" onClick={props.onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="idea-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="idea-title">{isNew ? "新增靈感" : "編輯靈感"}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            props.onSave(new FormData(e.currentTarget), isNew);
          }}
        >
          {props.idea ? <input type="hidden" name="id" value={props.idea.id} /> : null}
          <label className="field">
            <span>靈感內容</span>
            <textarea className="textarea" name="text" required maxLength={4000} autoFocus defaultValue={props.idea?.text ?? ""} style={{ minHeight: 140 }} />
          </label>
          {isNew ? (
            <div className="field">
              <span>歸到哪一場</span>
              <ShowPicker data={props.picker} value={showId} onChange={setShowId} name="show_id" />
            </div>
          ) : (
            <input type="hidden" name="show_id" value={props.idea?.showId ?? ""} />
          )}
          <div className="actions">
            <button className="btn btn-primary" type="submit">{isNew ? "新增" : "儲存"}</button>
            <button className="btn btn-ghost" type="button" onClick={props.onClose}>取消</button>
          </div>
        </form>
        {props.idea ? (
          <div className="actions" style={{ marginTop: 16 }}>
            <button className="btn btn-danger" type="button" onClick={() => props.onArchive(props.idea!)}>封存這則靈感</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
