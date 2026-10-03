import { test } from "node:test";
import assert from "node:assert/strict";
import { applyFilter, compareTodos, groupByShow, type TodoView } from "./todos.ts";

const t = (id: string, over: Partial<TodoView> = {}): TodoView => ({
  id, title: id, dueDate: null, source: "manual", doneAt: null, doneBy: null, createdBy: null,
  createdAt: "2026-10-01T00:00:00Z", show: null, assignees: [], sourceMessage: null, ...over,
});

test("spec 範例：10/5、10/9、無日期 依序排列", () => {
  const list = [t("undated"), t("d9", { dueDate: "2026-10-09" }), t("d5", { dueDate: "2026-10-05" })];
  assert.deepEqual(list.sort(compareTodos).map((x) => x.id), ["d5", "d9", "undated"]);
});

test("篩選：我的、未認領、全部", () => {
  const list = [t("a", { assignees: ["U1"] }), t("b", { assignees: ["U2"] }), t("c")];
  assert.deepEqual(applyFilter(list, "mine", "U1").map((x) => x.id), ["a"]);
  assert.deepEqual(applyFilter(list, "unclaimed", "U1").map((x) => x.id), ["c"]);
  assert.equal(applyFilter(list, "all", "U1").length, 3);
});

test("分組：演出依日期、沒掛演出放最後", () => {
  const nov = { id: "S2", name: "11 月號", performanceDate: "2026-11-21" };
  const oct = { id: "S1", name: "10 月號", performanceDate: "2026-10-24" };
  const groups = groupByShow([t("x"), t("n", { show: nov }), t("o", { show: oct })]);
  assert.deepEqual(groups.map((g) => g.title), ["10 月號", "11 月號", "沒有掛演出"]);
});
