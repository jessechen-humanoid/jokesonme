import { test } from "node:test";
import assert from "node:assert/strict";
import { planReserveSync } from "./reserve.ts";

test("沒變的不動、金額變的更新、新分組新增、消失的分組軟刪除、重複的多餘列刪掉", () => {
  const plan = planReserveSync(
    [
      { id: "a", excludedMembers: [], amount: -300, date: "2026-10-01" },
      { id: "b", excludedMembers: ["傑哥"], amount: -30, date: "2026-10-01" },
      { id: "c", excludedMembers: ["柏文"], amount: -60, date: "2026-10-01" },
      { id: "d", excludedMembers: [], amount: -300, date: "2026-10-01" },
    ],
    [
      { excludedMembers: [], amount: -300, date: "2026-10-01" },
      { excludedMembers: ["傑哥"], amount: -45, date: "2026-10-02" },
      { excludedMembers: ["又又"], amount: -12, date: "2026-10-02" },
    ],
  );
  assert.deepEqual(plan.updates, [{ id: "b", amount: -45, date: "2026-10-02" }]);
  assert.deepEqual(plan.inserts, [{ excludedMembers: ["又又"], amount: -12, date: "2026-10-02" }]);
  assert.deepEqual(plan.removes.sort(), ["c", "d"]);
});

test("收入全刪光：所有自動預留都軟刪除", () => {
  const plan = planReserveSync([{ id: "a", excludedMembers: [], amount: -300, date: "2026-10-01" }], []);
  assert.deepEqual(plan, { inserts: [], updates: [], removes: ["a"] });
});
