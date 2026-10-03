import { test } from "node:test";
import assert from "node:assert/strict";
import { planTemplateTodos } from "./templates.ts";

test("spec 範例：演出日 10/24 的截止日計算與預設負責人對應", () => {
  const items = [
    { id: "a", title: "確認卡司", offsetDays: -21, defaultAssignee: "傑哥", sortOrder: 1 },
    { id: "b", title: "前一天確認", offsetDays: -1, defaultAssignee: "大弋", sortOrder: 2 },
    { id: "c", title: "剪輯說明", offsetDays: 7, defaultAssignee: null, sortOrder: 3 },
  ];
  const plan = planTemplateTodos(items, "2026-10-24", new Map([["傑哥", "U_jesse"]]));
  assert.deepEqual(plan.map((p) => [p.dueDate, p.assigneeUserId]), [["2026-10-03", "U_jesse"], ["2026-10-23", null], ["2026-10-31", null]]);
});
