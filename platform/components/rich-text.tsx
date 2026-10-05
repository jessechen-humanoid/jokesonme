// 把 lib/markdown 的結構畫成 React 元素（不用 dangerouslySetInnerHTML，原始 HTML 只會是文字）。
import { Fragment, type ReactNode } from "react";
import { parseMarkdown, type Block, type Inline } from "@/lib/markdown";

function inline(nodes: Inline[]): ReactNode {
  return nodes.map((n, i) => {
    switch (n.t) {
      case "text": return <Fragment key={i}>{n.v}</Fragment>;
      case "br": return <br key={i} />;
      case "b": return <strong key={i}>{inline(n.c)}</strong>;
      case "i": return <em key={i}>{inline(n.c)}</em>;
      case "code": return <code key={i}>{n.v}</code>;
      case "link": return <a key={i} href={n.href} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{inline(n.c)}</a>;
    }
  });
}

function block(b: Block, i: number): ReactNode {
  switch (b.t) {
    case "p": return <p key={i}>{inline(b.c)}</p>;
    case "h": return b.level === 1 ? <h3 key={i}>{inline(b.c)}</h3> : b.level === 2 ? <h4 key={i}>{inline(b.c)}</h4> : <h5 key={i}>{inline(b.c)}</h5>;
    case "ul": return <ul key={i}>{b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}</ul>;
    case "ol": return <ol key={i} start={b.start}>{b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}</ol>;
    case "quote": return <blockquote key={i}>{inline(b.c)}</blockquote>;
    case "hr": return <hr key={i} />;
  }
}

export default function RichText({ text }: { text: string }) {
  return <div className="rich">{parseMarkdown(text).map(block)}</div>;
}
