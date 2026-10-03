"use client";
// 演出頁的＋：選「待辦」或「靈感」，新增面板會預選這場演出。
import Link from "next/link";
import { useState } from "react";

export default function AddMenu({ base }: { base: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open ? (
        <div className="add-menu">
          <Link href={`${base}?new=todo`} onClick={() => setOpen(false)}>新增待辦</Link>
          <Link href={`${base}?new=idea`} onClick={() => setOpen(false)}>新增靈感</Link>
        </div>
      ) : null}
      <button className="fab" type="button" aria-label="新增待辦或靈感" aria-expanded={open} onClick={() => setOpen((v) => !v)}>{open ? "×" : "+"}</button>
    </>
  );
}
