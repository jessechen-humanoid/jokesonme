"use client";
// 企劃頁的互動：編輯演出資訊、編輯三份文件連結。
import { useState, useTransition } from "react";
import { saveShowLink, updateShow } from "@/app/(app)/shows/actions";

const LINK_LABEL = { rundown: "Rundown", presentation: "簡報", survey: "問卷" } as const;
type Kind = keyof typeof LINK_LABEL;

export function ShowInfoButton({ show }: { show: { id: string; name: string; type: string; performanceDate: string | null; status: string } }) {
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <>
      <button className="btn btn-ghost" type="button" onClick={() => setOpen(true)} style={{ background: "rgba(255,255,255,.9)" }}>編輯演出資訊</button>
      {open ? (
        <div className="sheet-backdrop" onClick={() => setOpen(false)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="show-edit" onClick={(e) => e.stopPropagation()}>
            <h2 id="show-edit">編輯演出資訊</h2>
            {err ? <div className="notice" role="alert">{err}</div> : null}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                start(async () => {
                  const r = await updateShow(fd).catch(() => ({ ok: false, error: "儲存失敗，請再試一次" }));
                  if (r.ok) setOpen(false);
                  else setErr(r.error ?? "儲存失敗");
                });
              }}
            >
              <input type="hidden" name="id" value={show.id} />
              <label className="field"><span>演出名稱</span><input className="input" name="name" required maxLength={100} defaultValue={show.name} /></label>
              <label className="field">
                <span>類型</span>
                <select className="select" name="type" defaultValue={show.type}>
                  <option value="monthly">月號</option>
                  <option value="special">專場</option>
                  <option value="other">其他</option>
                </select>
              </label>
              <label className="field"><span>演出日期（月號必填）</span><input className="input" type="date" name="performance_date" defaultValue={show.performanceDate ?? ""} /></label>
              <label className="check-line">
                <input type="checkbox" name="archived" value="1" defaultChecked={show.status === "archived"} />
                已演出，歸檔（不再出現在「接下來」與下一場捷徑；財務頁仍看得到）
              </label>
              <div className="actions">
                <button className="btn btn-primary" type="submit" disabled={pending}>{pending ? "儲存中…" : "儲存"}</button>
                <button className="btn btn-ghost" type="button" onClick={() => setOpen(false)}>取消</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function ShowLinks({ showId, links }: { showId: string; links: Partial<Record<Kind, string>> }) {
  const [editing, setEditing] = useState<Kind | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <>
      {err ? <div className="notice" role="alert">{err}</div> : null}
      {(Object.keys(LINK_LABEL) as Kind[]).map((k) => (
        <div key={k} className="card row" style={{ alignItems: "center" }}>
          <div className="row-main">
            <div className="title">{LINK_LABEL[k]}</div>
            {links[k] ? <a href={links[k]} target="_blank" rel="noreferrer" className="meta" style={{ color: "var(--brand-deep)", wordBreak: "break-all" }}>{links[k]}</a> : <div className="meta">還沒有連結</div>}
          </div>
          <button className="btn btn-ghost" type="button" onClick={() => setEditing(k)}>{links[k] ? "修改" : "加連結"}</button>
        </div>
      ))}
      {editing ? (
        <div className="sheet-backdrop" onClick={() => setEditing(null)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="link-edit" onClick={(e) => e.stopPropagation()}>
            <h2 id="link-edit">{LINK_LABEL[editing]}連結</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                start(async () => {
                  const r = await saveShowLink(fd).catch(() => ({ ok: false, error: "儲存失敗，請再試一次" }));
                  if (r.ok) {
                    setEditing(null);
                    setErr(null);
                  } else setErr(r.error ?? "儲存失敗");
                });
              }}
            >
              <input type="hidden" name="show_id" value={showId} />
              <input type="hidden" name="kind" value={editing} />
              <label className="field"><span>網址（清空 = 移除）</span><input className="input" name="url" type="url" inputMode="url" defaultValue={links[editing] ?? ""} placeholder="https://docs.google.com/..." autoFocus /></label>
              <div className="actions">
                <button className="btn btn-primary" type="submit" disabled={pending}>{pending ? "儲存中…" : "儲存"}</button>
                <button className="btn btn-ghost" type="button" onClick={() => setEditing(null)}>取消</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
