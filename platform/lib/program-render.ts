// 節目表的輸出（spec: program-sheet「Rundown copy」「Copy for Claude」）。純函式，瀏覽器與伺服器都能用。
// 不呼叫任何語言模型：Claude 那份只是把資料整理成文字，讓 Jesse 自己貼。
import { formatMonthDay } from "./dates.ts";

export type ProgramItem = { name: string; kind: string; minutes: number; content: string; props: string; sound: string; projection: string };

export const RUNDOWN_HEADERS = ["節目順序", "時間", "預計時間點", "內容", "道具", "音效", "投影"] as const;

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
// 跨午夜照 24 小時制往上加（23:50 + 20 → 24:10），不換日
const fmt = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

/** 每段的開始／結束時間：由開始時間逐段累加。 */
export function withTimes(start: string, items: Pick<ProgramItem, "minutes">[]): { from: string; to: string }[] {
  let t = toMinutes(start);
  return items.map((i) => {
    const from = t;
    t += i.minutes;
    return { from: fmt(from), to: fmt(t) };
  });
}

const bullets = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => `• ${l}`);

/** 表格的每一列（7 欄，對應 RUNDOWN_HEADERS）；儲存格內換行用 \n。 */
export function rundownRows(start: string, items: ProgramItem[]): string[][] {
  const times = withTimes(start, items);
  return items.map((i, n) => [
    i.kind ? `${i.name}\n${i.kind}` : i.name,
    `${i.minutes} min`,
    `${times[n].from} - ${times[n].to}`,
    bullets(i.content).join("\n"),
    i.props.trim(),
    i.sound.trim(),
    i.projection.trim(),
  ]);
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const cell = (tag: "th" | "td", s: string) => `<${tag} style="border:1px solid #999;padding:4px 6px;vertical-align:top">${esc(s).replace(/\n/g, "<br>")}</${tag}>`;

/** 貼進 Google Doc 會變成表格的 HTML。 */
export function rundownHtml(start: string, items: ProgramItem[]): string {
  const head = `<tr>${RUNDOWN_HEADERS.map((h) => cell("th", h)).join("")}</tr>`;
  const body = rundownRows(start, items).map((r) => `<tr>${r.map((c) => cell("td", c)).join("")}</tr>`).join("");
  return `<table style="border-collapse:collapse">${head}${body}</table>`;
}

/** 純文字版（tab 分隔、儲存格內換行改成「 / 」），給不吃 HTML 的地方。 */
export function rundownText(start: string, items: ProgramItem[]): string {
  return [RUNDOWN_HEADERS.join("\t"), ...rundownRows(start, items).map((r) => r.map((c) => c.replace(/\n/g, " / ")).join("\t"))].join("\n");
}

/** 複製給 Claude 的文字：整份節目表＋簡報指令。 */
export function claudePrompt(show: { name: string; performanceDate: string | null }, start: string, items: ProgramItem[]): string {
  const times = withTimes(start, items);
  const lines = [`演出：${show.name}${show.performanceDate ? `｜${formatMonthDay(show.performanceDate)}` : ""}`, "", "節目表："];
  items.forEach((i, n) => {
    lines.push(`${times[n].from} - ${times[n].to} ${i.name}${i.kind ? `（${i.kind}）` : ""}`);
    for (const l of bullets(i.content)) lines.push(`  ${l}`);
    if (i.props.trim()) lines.push(`  道具：${i.props.trim()}`);
    if (i.sound.trim()) lines.push(`  音效：${i.sound.trim()}`);
    if (i.projection.trim()) lines.push(`  投影：${i.projection.trim()}`);
  });
  lines.push("", "請依這份節目表，幫每一段擬投影簡報的文字（每頁標題＋1–3 行重點），企劃段落附規則說明頁，結尾加宣傳與問卷頁。");
  return lines.join("\n");
}
