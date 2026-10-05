import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMarkdown, parseInline } from "./markdown.ts";

// spec Example: parsing
test("標題＋條列＋粗體", () => {
  assert.deepEqual(parseMarkdown("## 規則\n- 兩隊輪流\n- **限時** 1 分鐘"), [
    { t: "h", level: 2, c: [{ t: "text", v: "規則" }] },
    { t: "ul", items: [[{ t: "text", v: "兩隊輪流" }], [{ t: "b", c: [{ t: "text", v: "限時" }] }, { t: "text", v: " 1 分鐘" }]] },
  ]);
});

test("段落內換行保留", () => {
  assert.deepEqual(parseMarkdown("第一行\n第二行"), [{ t: "p", c: [{ t: "text", v: "第一行" }, { t: "br" }, { t: "text", v: "第二行" }] }]);
});

test("HTML 原樣顯示為文字；單獨的 - 不是空條列", () => {
  assert.deepEqual(parseMarkdown("<b>x</b>"), [{ t: "p", c: [{ t: "text", v: "<b>x</b>" }] }]);
  assert.deepEqual(parseMarkdown("-"), [{ t: "p", c: [{ t: "text", v: "-" }] }]);
});

test("空行分段、編號清單、引用、分隔線", () => {
  assert.deepEqual(parseMarkdown("A\n\nB").map((b) => b.t), ["p", "p"]);
  assert.deepEqual(parseMarkdown("1. 大喜利\n2. 即興"), [{ t: "ol", start: 1, items: [[{ t: "text", v: "大喜利" }], [{ t: "text", v: "即興" }]] }]);
  assert.deepEqual(parseMarkdown("> 引用一\n> 引用二"), [{ t: "quote", c: [{ t: "text", v: "引用一" }, { t: "br" }, { t: "text", v: "引用二" }] }]);
  assert.deepEqual(parseMarkdown("上\n---\n下").map((b) => b.t), ["p", "hr", "p"]);
  assert.deepEqual(parseMarkdown("#沒空白不是標題"), [{ t: "p", c: [{ t: "text", v: "#沒空白不是標題" }] }]);
});

test("行內：連結、自動連結、斜體、程式碼；只接受 http(s)", () => {
  assert.deepEqual(parseInline("看 [這裡](https://a.tw/x) 或 https://b.tw/y?z=1 結束"), [
    { t: "text", v: "看 " }, { t: "link", href: "https://a.tw/x", c: [{ t: "text", v: "這裡" }] },
    { t: "text", v: " 或 " }, { t: "link", href: "https://b.tw/y?z=1", c: [{ t: "text", v: "https://b.tw/y?z=1" }] }, { t: "text", v: " 結束" },
  ]);
  assert.deepEqual(parseInline("[壞](javascript:alert(1))"), [{ t: "text", v: "[壞](javascript:alert(1))" }]);
  assert.deepEqual(parseInline("*斜* 與 `code`"), [{ t: "i", c: [{ t: "text", v: "斜" }] }, { t: "text", v: " 與 " }, { t: "code", v: "code" }]);
  assert.deepEqual(parseInline("3 * 4 * 5"), [{ t: "text", v: "3 * 4 * 5" }]);
  assert.deepEqual(parseInline("網址 https://x.tw/a。"), [{ t: "text", v: "網址 " }, { t: "link", href: "https://x.tw/a", c: [{ t: "text", v: "https://x.tw/a" }] }, { t: "text", v: "。" }]);
});
