import { test } from "node:test";
import assert from "node:assert/strict";
import { buttonLabel, parsePostback, showQuickReply } from "./quick-reply.ts";

const U = (n: number) => `00000000-0000-0000-0000-00000000000${n}`;
const labels = (q: ReturnType<typeof showQuickReply>) => q?.items.map((i) => i.action.label) ?? null;

test("spec 範例：沒有接下來的演出 → 不帶按鈕", () => {
  assert.equal(showQuickReply("idea", U(1), []), null);
});

test("spec 範例：一場 → 該場＋先放著", () => {
  assert.deepEqual(labels(showQuickReply("idea", U(1), [{ id: U(2), name: "看我笑話 10 月號" }])), ["10 月號", "先放著"]);
});

test("spec 範例：四場 → 前三場＋先放著，data 格式正確", () => {
  const q = showQuickReply("todo", U(1), [
    { id: U(2), name: "看我笑話 10 月號" }, { id: U(3), name: "看我笑話 11 月號" }, { id: U(4), name: "看我笑話 12 月號" }, { id: U(5), name: "2026 好竹弋漫才專場 《直球》" },
  ]);
  assert.deepEqual(labels(q), ["10 月號", "11 月號", "12 月號", "先放著"]);
  assert.equal(q!.items[0].action.data, `v=1&t=todo&id=${U(1)}&show=${U(2)}`);
  assert.equal(q!.items[3].action.data, `v=1&t=todo&id=${U(1)}&show=none`);
});

test("label 去掉「看我笑話 」並截到 20 字", () => {
  assert.equal(buttonLabel("看我笑話 10 月號"), "10 月號");
  assert.equal([...buttonLabel("2026 支薪好友專場 TRY OUT 《向下管理》")].length, 20);
});

test("postback 解析：正常、先放著、壞資料、舊版本", () => {
  assert.deepEqual(parsePostback(`v=1&t=idea&id=${U(1)}&show=${U(2)}`), { kind: "idea", id: U(1), show: U(2) });
  assert.deepEqual(parsePostback(`v=1&t=todo&id=${U(1)}&show=none`), { kind: "todo", id: U(1), show: null });
  assert.equal(parsePostback("v=2&t=idea&id=x&show=none"), null);
  assert.equal(parsePostback(`v=1&t=show&id=${U(1)}&show=none`), null);
  assert.equal(parsePostback("garbage"), null);
});
