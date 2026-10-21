"use client";
// 演出頁的待辦（spec show-planning-page「Monthly planning page」）：手機預設收成一張摘要卡（未完成件數、最近截止日），
// 點開才展開完整清單；電腦（≥ 900px）右欄有空間，CSS 讓清單恆展開。
import Link from "next/link";
import { useState } from "react";
import { IconChevron, IconPlus } from "@/components/icons";
import { dueUrgency, formatMonthDay } from "@/lib/dates";

export default function ShowTodos({ open: openCount, total, nextDue, today, newHref, initialOpen, children }: {
  open: number; total: number; nextDue: string | null; today: string; newHref: string; initialOpen: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(initialOpen);
  const done = total - openCount;
  return (
    <div className="show-todos">
      <button type="button" className="summary-card" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="row-main">
          <b>待辦</b>
          <span className="meta">
            <span>未完成 {openCount} 件</span>
            {nextDue ? <span className={`due ${dueUrgency(nextDue, today, false)}`}>最近截止 {formatMonthDay(nextDue)}</span> : null}
            {total ? <span>已完成 {done}／{total}</span> : null}
          </span>
          {total ? <span className="progress" aria-hidden="true"><i style={{ width: `${(done / total) * 100}%` }} /></span> : null}
        </span>
        <IconChevron className="chev" />
      </button>
      <div className={`show-todos-body${open ? " open" : ""}`}>
        <Link className="btn btn-ghost btn-block" href={newHref} style={{ marginBottom: 12 }}><IconPlus />新增待辦</Link>
        {children}
      </div>
    </div>
  );
}
