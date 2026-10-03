"use client";
// 待辦清單的互動層：打勾、認領、刪除先在畫面上生效，伺服器在背景存（樂觀更新）；
// 點待辦直接用已載入的資料打開面板，不再跟伺服器要一次。失敗時跳提示並以伺服器資料為準。
import { useOptimistic, useState, useTransition } from "react";
import { claimTodo, createTodo, deleteTodo, toggleDone, updateTodo } from "@/app/(app)/todos/actions";
import Link from "next/link";
import { formatDueLabel, formatMonthDay, formatTaipeiDateTime } from "@/lib/dates";
import ShowPicker, { type PickerData } from "@/components/show-picker";

export type BoardTodo = {
  id: string;
  title: string;
  dueDate: string | null;
  source: "command" | "template" | "manual";
  doneAt: string | null;
  doneBy: string | null;
  show: { id: string; name: string; performanceDate: string | null } | null;
  assignees: string[];
  sourceMessage: { text: string; userId: string; sentAt: string } | null;
};
export type BoardGroup = { key: string; title: string; performanceDate: string | null; todos: BoardTodo[] };

type Patch = { id: string; kind: "toggle" | "claim" | "delete"; me: string };

const SOURCE_LABEL = { command: "LINE /", template: "模板", manual: "手動" } as const;

function applyPatch(groups: BoardGroup[], p: Patch): BoardGroup[] {
  return groups
    .map((g) => ({
      ...g,
      todos: g.todos
        .filter((t) => !(p.kind === "delete" && t.id === p.id))
        .map((t) => {
          if (t.id !== p.id) return t;
          if (p.kind === "toggle") return t.doneAt ? { ...t, doneAt: null, doneBy: null } : { ...t, doneAt: new Date().toISOString(), doneBy: p.me };
          if (p.kind === "claim" && !t.assignees.includes(p.me)) return { ...t, assignees: [...t.assignees, p.me] };
          return t;
        }),
    }))
    .filter((g) => g.todos.length > 0);
}

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
}

export default function TodoBoard(props: {
  groups: BoardGroup[];
  names: Record<string, string>;
  picker: PickerData;
  assignable: { id: string; name: string }[];
  meId: string;
  showDone: boolean;
  emptyText: string;
  initialSelected: string | null;
  initialNew: boolean;
  /** 從演出頁開的新增面板預選這場 */
  initialShowId?: string | null;
  /** 演出頁有自己的＋選單，不顯示這裡的浮動按鈕 */
  showFab?: boolean;
}) {
  const [groups, patch] = useOptimistic(props.groups, applyPatch);
  const [, startTransition] = useTransition();
  const [selected, setSelected] = useState<string | "new" | null>(props.initialNew ? "new" : props.initialSelected);
  const [error, setError] = useState<string | null>(null);
  const name = (id: string) => props.names[id] ?? "成員";

  function run(p: Patch, action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      patch(p);
      try {
        await action();
      } catch {
        setError("剛剛的操作沒有存成功，請再試一次");
      }
    });
  }

  const all = groups.flatMap((g) => g.todos);
  const current = selected && selected !== "new" ? (all.find((t) => t.id === selected) ?? props.groups.flatMap((g) => g.todos).find((t) => t.id === selected)) : undefined;

  return (
    <>
      {error ? <div className="notice" role="alert">{error}</div> : null}
      {!groups.some((g) => g.todos.some((t) => !!t.doneAt === props.showDone)) ? (
        <p className="empty">{props.emptyText}</p>
      ) : (
        groups.map((g) => {
          const visible = g.todos.filter((t) => !!t.doneAt === props.showDone);
          if (!visible.length) return null;
          return (
            <section key={g.key}>
              <div className="section">
                {g.key !== "none" ? <Link href={`/shows/${g.key}`}><b>{g.title} ›</b></Link> : <b>{g.title}</b>}
                <span>{g.performanceDate ? `${formatMonthDay(g.performanceDate)}演出` : `${visible.length} 件`}</span>
              </div>
              {visible.map((t) => {
                const done = !!t.doneAt;
                return (
                  <div key={t.id} className={`card row ${done ? "done" : ""}`}>
                    <button
                      className="check"
                      type="button"
                      aria-label={done ? `把「${t.title}」改回未完成` : `完成「${t.title}」`}
                      onClick={() => run({ id: t.id, kind: "toggle", me: props.meId }, () => toggleDone(fd({ id: t.id, done: done ? "1" : "0" })))}
                    >
                      <i>{done ? "✓" : ""}</i>
                    </button>
                    <button className="row-main" type="button" onClick={() => setSelected(t.id)} style={{ background: "none", border: 0, padding: 0, textAlign: "left", cursor: "pointer" }}>
                      <div className="title">{t.title}</div>
                      <div className="meta">
                        {t.dueDate ? <span className="due">{formatDueLabel(t.dueDate)}</span> : null}
                        {t.assignees.length ? t.assignees.map((u) => <span key={u} className="tag">{name(u)}</span>) : <span className="tag free">未認領</span>}
                        <span>{SOURCE_LABEL[t.source]}</span>
                        {done && t.doneBy ? <span>{name(t.doneBy)} 完成</span> : null}
                      </div>
                    </button>
                  </div>
                );
              })}
            </section>
          );
        })
      )}

      {props.showFab !== false ? <button className="fab" type="button" aria-label="新增待辦" onClick={() => setSelected("new")}>+</button> : null}

      {selected ? (
        <Sheet
          key={selected}
          todo={current}
          picker={props.picker}
          initialShowId={props.initialShowId ?? null}
          assignable={props.assignable}
          meId={props.meId}
          name={name}
          onClose={() => setSelected(null)}
          onSubmit={(action, formData) => {
            setSelected(null);
            setError(null);
            startTransition(async () => {
              try {
                await action(formData);
              } catch {
                setError("剛剛的修改沒有存成功，請再試一次");
              }
            });
          }}
          onClaim={(id) => {
            run({ id, kind: "claim", me: props.meId }, () => claimTodo(fd({ id })));
          }}
          onDelete={(id) => {
            setSelected(null);
            run({ id, kind: "delete", me: props.meId }, () => deleteTodo(fd({ id })));
          }}
        />
      ) : null}
    </>
  );
}

function Sheet({
  todo, picker, initialShowId, assignable, meId, name, onClose, onSubmit, onClaim, onDelete,
}: {
  todo?: BoardTodo; picker: PickerData; initialShowId: string | null; assignable: { id: string; name: string }[]; meId: string; name: (id: string) => string;
  onClose: () => void; onSubmit: (action: (f: FormData) => Promise<void>, f: FormData) => void;
  onClaim: (id: string) => void; onDelete: (id: string) => void;
}) {
  const assigned = new Set(todo?.assignees ?? []);
  const [showId, setShowId] = useState<string | null>(todo ? (todo.show?.id ?? null) : initialShowId);
  // 已指派但不在可指派名單（例如還沒核准的人）也要列出，避免儲存時被默默移除
  const pickable = [...assignable, ...[...assigned].filter((id) => !assignable.some((u) => u.id === id)).map((id) => ({ id, name: name(id) }))];
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="sheet-title">{todo ? "待辦詳情" : "新增待辦"}</h2>
        {todo?.sourceMessage ? (
          <div className="source">
            <small>LINE 群組・{name(todo.sourceMessage.userId)}・{formatTaipeiDateTime(todo.sourceMessage.sentAt)}</small>
            {todo.sourceMessage.text}
          </div>
        ) : todo?.source === "template" ? (
          <div className="source"><small>來源</small>演出模板自動產生</div>
        ) : null}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(todo ? updateTodo : createTodo, new FormData(e.currentTarget));
          }}
        >
          {todo ? <input type="hidden" name="id" value={todo.id} /> : null}
          <label className="field">
            <span>內容</span>
            <textarea className="textarea" name="title" defaultValue={todo?.title ?? ""} required maxLength={500} autoFocus={!todo} />
          </label>
          <label className="field">
            <span>截止日</span>
            <input className="input" type="date" name="due_date" defaultValue={todo?.dueDate ?? ""} />
          </label>
          <div className="field">
            <span>演出</span>
            <ShowPicker data={picker} value={showId} onChange={setShowId} name="show_id" />
          </div>
          <fieldset className="field" style={{ border: 0, padding: 0, margin: "0 0 14px" }}>
            <span>負責人（可複選，不選就是未認領）</span>
            <div className="picks">
              {pickable.map((u) => (
                <label key={u.id} className="pick">
                  <input type="checkbox" name="assignees" value={u.id} defaultChecked={assigned.has(u.id)} />
                  <span>{u.name}{u.id === meId ? "（我）" : ""}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="actions">
            <button className="btn btn-primary" type="submit">{todo ? "儲存" : "新增"}</button>
            <button className="btn btn-ghost" type="button" onClick={onClose}>取消</button>
          </div>
        </form>
        {todo ? (
          <div className="actions" style={{ marginTop: 16 }}>
            {!todo.assignees.includes(meId) ? (
              <button className="btn btn-ghost" type="button" onClick={() => onClaim(todo.id)}>我來認領</button>
            ) : null}
            <button className="btn btn-danger" type="button" onClick={() => onDelete(todo.id)}>刪除這個待辦</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
