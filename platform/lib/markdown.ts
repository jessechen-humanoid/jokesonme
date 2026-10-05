// 靈感內容的 Markdown 子集（spec idea-library「Idea text renders Markdown」）。
// 只產生資料結構，由 components/rich-text.tsx 用 React 元素畫出來；不產生 HTML 字串，原始 HTML 一律當文字。

export type Inline =
  | { t: "text"; v: string }
  | { t: "br" }
  | { t: "b"; c: Inline[] }
  | { t: "i"; c: Inline[] }
  | { t: "code"; v: string }
  | { t: "link"; href: string; c: Inline[] };

export type Block =
  | { t: "p"; c: Inline[] }
  | { t: "h"; level: 1 | 2 | 3; c: Inline[] }
  | { t: "ul"; items: Inline[][] }
  | { t: "ol"; start: number; items: Inline[][] }
  | { t: "quote"; c: Inline[] }
  | { t: "hr" };

// 依序：`程式碼`、**粗體**、[文字](http 網址)、裸網址、*斜體*（星號後面要緊接文字，避免「3 * 4」被吃掉）
const INLINE = /(`[^`\n]+`)|(\*\*(?=\S)[^*\n]+?\*\*)|(\[[^\]\n]+\]\(https?:\/\/[^\s)]+\))|(https?:\/\/[^\s<>"「」（）]+)|(\*(?=[^\s*])[^*\n]+?(?<=\S)\*)/g;
// 裸網址結尾的標點不算網址（「網址 https://x.tw/a。」）
const TRAILING = /[.,!?;:，。！？；：、）」』]+$/;

export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  const text = (v: string) => {
    if (!v) return;
    const last = out[out.length - 1];
    if (last?.t === "text") last.v += v;
    else out.push({ t: "text", v });
  };
  let at = 0;
  for (const m of s.matchAll(INLINE)) {
    const [tok] = m;
    const i = m.index!;
    text(s.slice(at, i));
    at = i + tok.length;
    if (m[1]) out.push({ t: "code", v: tok.slice(1, -1) });
    else if (m[2]) out.push({ t: "b", c: parseInline(tok.slice(2, -2)) });
    else if (m[3]) {
      const sep = tok.indexOf("](");
      out.push({ t: "link", href: tok.slice(sep + 2, -1), c: parseInline(tok.slice(1, sep)) });
    } else if (m[4]) {
      const trail = TRAILING.exec(tok)?.[0] ?? "";
      const href = tok.slice(0, tok.length - trail.length);
      out.push({ t: "link", href, c: [{ t: "text", v: href }] });
      text(trail);
    } else out.push({ t: "i", c: parseInline(tok.slice(1, -1)) });
  }
  text(s.slice(at));
  return out;
}

/** 多行接成一段：行與行之間放換行。 */
function joinLines(lines: string[]): Inline[] {
  return lines.flatMap((l, n) => (n ? [{ t: "br" } as Inline, ...parseInline(l)] : parseInline(l)));
}

export function parseMarkdown(src: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  let quote: string[] = [];
  let list: { kind: "ul" | "ol"; start: number; items: string[] } | null = null;
  const flush = () => {
    if (para.length) blocks.push({ t: "p", c: joinLines(para) });
    if (quote.length) blocks.push({ t: "quote", c: joinLines(quote) });
    if (list) blocks.push(list.kind === "ul" ? { t: "ul", items: list.items.map(parseInline) } : { t: "ol", start: list.start, items: list.items.map(parseInline) });
    para = []; quote = []; list = null;
  };

  for (const raw of src.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    let m: RegExpExecArray | null;
    if (!line.trim()) { flush(); continue; }
    if ((m = /^(#{1,3})\s+(.+)$/.exec(line))) {
      flush();
      blocks.push({ t: "h", level: m[1].length as 1 | 2 | 3, c: parseInline(m[2].trim()) });
    } else if (/^\s*-{3,}\s*$/.test(line)) {
      flush();
      blocks.push({ t: "hr" });
    } else if ((m = /^\s*[-*]\s+(.+)$/.exec(line))) {
      if (list?.kind !== "ul") { flush(); list = { kind: "ul", start: 1, items: [] }; }
      list.items.push(m[1].trim());
    } else if ((m = /^\s*(\d{1,3})[.)]\s+(.+)$/.exec(line))) {
      if (list?.kind !== "ol") { flush(); list = { kind: "ol", start: Number(m[1]), items: [] }; }
      list.items.push(m[2].trim());
    } else if ((m = /^\s*>\s?(.*)$/.exec(line))) {
      if (!quote.length) flush();
      quote.push(m[1]);
    } else {
      if (list || quote.length) flush();
      para.push(line.trim());
    }
  }
  flush();
  return blocks;
}
