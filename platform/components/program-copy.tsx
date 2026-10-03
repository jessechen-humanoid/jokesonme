"use client";
// 「複製 Rundown」「複製給 Claude」（design「複製到剪貼簿同時放 HTML 與純文字」）。
// 內容在伺服器先產好當 props 傳進來，點擊當下直接寫剪貼簿（iOS Safari 需要在同一個點擊事件內）。
import { useState } from "react";

async function copy(text: string, html?: string): Promise<"ok" | "text-only"> {
  if (html && typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([text], { type: "text/plain" }) })]);
    return "ok";
  }
  await navigator.clipboard.writeText(text);
  return html ? "text-only" : "ok";
}

export default function ProgramCopy({ html, text, prompt }: { html: string; text: string; prompt: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const run = (fn: () => Promise<"ok" | "text-only">, label: string) => {
    fn()
      .then((r) => setMsg(r === "ok" ? `已複製${label}` : `已複製${label}（純文字版，這個瀏覽器不支援表格格式）`))
      .catch(() => setMsg("複製失敗，請長按選取"));
  };
  return (
    <div className="program-copy">
      <div className="actions">
        <button className="btn btn-primary" type="button" onClick={() => run(() => copy(text, html), " Rundown")}>複製 Rundown</button>
        <button className="btn btn-ghost" type="button" onClick={() => run(() => copy(prompt), "給 Claude 的指令")}>複製給 Claude</button>
      </div>
      {msg ? <p className="meta" role="status" style={{ marginTop: 8 }}>{msg}</p> : null}
    </div>
  );
}
