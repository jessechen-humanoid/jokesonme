"use client";
// 筆記清單（筆記分頁與演出頁共用；資料表仍叫 ideas。spec idea-library「Assign idea to a show」）。
// 頂端直接輸入就存（不開面板）；卡片：內容（點了編輯）、作者、時間、一個安靜的演出標籤（點了換演出）。
// 新增、換演出、封存先在畫面上生效（樂觀更新），背景再存。
import { useOptimistic, useRef, useState, useTransition } from "react";
import { assignIdea, createIdea, setIdeaArchived, updateIdea } from "@/app/(app)/ideas/actions";
import { formatTaipeiDateTime } from "@/lib/dates";
import ShowPicker, { type PickerData } from "@/components/show-picker";
import RichText from "@/components/rich-text";

export type IdeaView = { id: string; text: string; author: string; when: string; showId: string | null; showName: string | null; viaLine: boolean };
/** inbox = 未分演出、all = 全部、archived = 已封存、show = 某場演出頁 */
export type IdeaListMode = "inbox" | "all" | "archived" | "show";

type Patch =
  | { kind: "add"; idea: IdeaView }
  | { kind: "update"; id: string; text?: string; showId?: string | null; showName?: string | null }
  | { kind: "remove"; id: string };

function applyPatch(list: IdeaView[], p: Patch): IdeaView[] {
  if (p.kind === "add") return [p.idea, ...list];
  if (p.kind === "remove") return list.filter((i) => i.id !== p.id);
  return list.map((i) => (i.id === p.id ? { ...i, ...(p.text !== undefined ? { text: p.text } : {}), ...(p.showId !== undefined ? { showId: p.showId, showName: p.showName ?? null } : {}) } : i));
}

export default function IdeaList(props: {
  ideas: IdeaView[]; picker: PickerData; mode: IdeaListMode; contextShowId: string | null; emptyText: React.ReactNode;
  /** 頂端輸入框（已封存不顯示） */
  composer: boolean;
  me: string;
}) {
  const [ideas, patch] = useOptimistic(props.ideas, applyPatch);
  const [, start] = useTransition();
  const [editing, setEditing] = useState<IdeaView | null>(null);
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
  /** 換到某場（null = 不掛演出）；離開目前檢視就從清單移除。 */
  const assign = (i: IdeaView, to: string | null) => {
    const leaves = props.mode === "inbox" ? to !== null : props.mode === "show" ? to !== props.contextShowId : false;
    run(
      () => assignIdea(fd({ id: i.id, show_id: to ?? "", from_show_id: i.showId ?? "" })),
      leaves ? { kind: "remove", id: i.id } : { kind: "update", id: i.id, showId: to, showName: showName(to) },
    );
  };

  return (
    <>
      {props.composer ? (
        <Composer
          picker={props.picker}
          fixedShowId={props.mode === "show" ? props.contextShowId : null}
          onSave={(text, showId) => {
            const temp: IdeaView = { id: `tmp-${Date.now()}`, text, author: props.me, when: new Date().toISOString(), showId, showName: showName(showId), viaLine: false };
            const stays = props.mode !== "inbox" || showId === null;
            run(() => createIdea(fd({ text, show_id: showId ?? "" })), stays ? { kind: "add", idea: temp } : undefined);
          }}
        />
      ) : null}
      {error ? <div className="notice" role="alert">{error}</div> : null}
      {ideas.length === 0 ? <div className="empty">{props.emptyText}</div> : null}
      <div className="note-list">
        {ideas.map((i) => {
          const editable = props.mode !== "archived" && !i.id.startsWith("tmp-");
          return (
            <article key={i.id} className="note">
              {/* 內容含標題、條列等區塊元素，不能放在 <button> 裡；改用可點、可用鍵盤操作的 div */}
              <div
                className={`idea-body${editable ? " editable" : ""}`}
                role={editable ? "button" : undefined}
                tabIndex={editable ? 0 : undefined}
                onClick={() => editable && setEditing(i)}
                onKeyDown={(e) => { if (editable && (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) { e.preventDefault(); setEditing(i); } }}
              >
                <RichText text={i.text} />
              </div>
              <div className="note-foot">
                <div className="meta">
                  <span>{i.author}</span>
                  <span>{formatTaipeiDateTime(i.when)}</span>
                  {i.viaLine ? <span className="tag">LINE</span> : null}
                </div>
                {props.mode === "archived" ? (
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => run(() => setIdeaArchived(fd({ id: i.id, archive: "0", show_id: i.showId ?? "" })), { kind: "remove", id: i.id })}>還原</button>
                ) : props.mode !== "show" && editable ? (
                  <button className={`show-tag${i.showId ? "" : " none"}`} type="button" onClick={() => setPicking(i)} aria-label={i.showName ? `演出：${i.showName}，點了換演出` : "選演出"}>
                    {i.showName ?? "選演出"}
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {picking ? (
        <div className="sheet-backdrop" onClick={() => setPicking(null)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="pick-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="pick-title">放到哪一場？</h2>
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
          idea={editing}
          picker={props.picker}
          onClose={() => setEditing(null)}
          onSave={(text, showId) => {
            const target = editing;
            setEditing(null);
            if (text !== target.text) run(() => updateIdea(fd({ id: target.id, text, show_id: target.showId ?? "" })), { kind: "update", id: target.id, text });
            if (showId !== target.showId) assign(target, showId);
          }}
          onArchive={(i) => {
            setEditing(null);
            run(() => setIdeaArchived(fd({ id: i.id, archive: "1", show_id: i.showId ?? "" })), { kind: "remove", id: i.id });
          }}
        />
      ) : null}
    </>
  );
}

/** 頂端直接寫：打字、（筆記頁可選演出）、按存。⌘／Ctrl＋Enter 也能存。 */
function Composer({ picker, fixedShowId, onSave }: { picker: PickerData; fixedShowId: string | null; onSave: (text: string, showId: string | null) => void }) {
  const [text, setText] = useState("");
  const [showId, setShowId] = useState<string | null>(fixedShowId);
  const [picking, setPicking] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const name = showId ? ([picker.next, ...picker.upcoming, ...picker.more].find((s) => s?.id === showId)?.name ?? null) : null;
  const submit = () => {
    const t = text.trim();
    if (!t) return ref.current?.focus();
    onSave(t, showId);
    setText("");
    if (!fixedShowId) setShowId(null);
  };
  return (
    <form className="composer" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <textarea
        ref={ref}
        aria-label="寫筆記"
        placeholder="寫下筆記或靈感…（支援 Markdown）"
        value={text}
        maxLength={4000}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); } }}
      />
      <div className="composer-bar">
        {fixedShowId ? <span className="composer-hint">存到這場</span> : (
          <button type="button" className={`show-tag${showId ? "" : " none"}`} onClick={() => setPicking(true)}>{name ?? "不掛演出"}</button>
        )}
        <span className="spacer" />
        <button className="btn btn-primary btn-sm" type="submit" disabled={!text.trim()}>存</button>
      </div>
      {picking ? (
        <div className="sheet-backdrop" onClick={() => setPicking(false)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="composer-pick" onClick={(e) => e.stopPropagation()}>
            <h2 id="composer-pick">放到哪一場？</h2>
            <ShowPicker data={picker} value={showId} onChange={(to) => { setShowId(to); setPicking(false); }} />
          </div>
        </div>
      ) : null}
    </form>
  );
}

function IdeaEditSheet(props: {
  idea: IdeaView; picker: PickerData; onClose: () => void; onSave: (text: string, showId: string | null) => void; onArchive: (i: IdeaView) => void;
}) {
  const [showId, setShowId] = useState<string | null>(props.idea.showId);
  return (
    <div className="sheet-backdrop" onClick={props.onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="idea-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="idea-title">編輯筆記</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const text = String(new FormData(e.currentTarget).get("text") ?? "").trim();
            if (text) props.onSave(text, showId);
          }}
        >
          <label className="field">
            <span>內容</span>
            <textarea className="textarea" name="text" required maxLength={4000} autoFocus defaultValue={props.idea.text} style={{ minHeight: 160 }} />
          </label>
          <div className="field">
            <span>演出</span>
            <ShowPicker data={props.picker} value={showId} onChange={setShowId} />
          </div>
          <div className="actions">
            <button className="btn btn-primary" type="submit">儲存</button>
            <button className="btn btn-ghost" type="button" onClick={props.onClose}>取消</button>
          </div>
        </form>
        <div className="actions" style={{ marginTop: 16 }}>
          <button className="btn btn-danger" type="button" onClick={() => props.onArchive(props.idea)}>封存這則筆記</button>
        </div>
      </div>
    </div>
  );
}
