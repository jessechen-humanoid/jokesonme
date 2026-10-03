import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDays, importantDates } from "./days.ts";

test("三層合併：範圍外剔除、同日排序、重要日子不含待辦", () => {
  const days = buildDays(
    "2026-10-01", "2026-10-31",
    [{ uid: "s", title: "看我笑話｜喜劇拼盤 10 月號", location: "", date: "2026-10-17", time: "19:30" }, { uid: "x", title: "範圍外", location: "", date: "2026-11-01", time: null }],
    [{ id: "e1", date: "2026-10-17", time: "14:00", title: "彩排" }, { id: "e2", date: "2026-10-12", time: "19:00", title: "討論 11 月號" }],
    [{ id: "t1", title: "Rundown 製作", dueDate: "2026-10-17" }],
  );
  assert.deepEqual([...days.keys()], ["2026-10-12", "2026-10-17"]);
  assert.deepEqual(days.get("2026-10-17")!.map((i) => `${i.kind}:${i.title}`), ["event:彩排", "show:看我笑話｜喜劇拼盤 10 月號", "todo:Rundown 製作"]);
  assert.equal(days.get("2026-10-17")![2].href, "/todos?f=all");
  assert.deepEqual(importantDates(days).map((i) => i.title), ["討論 11 月號", "彩排", "看我笑話｜喜劇拼盤 10 月號"]);
});

test("整天的排在有時間的前面", () => {
  const days = buildDays("2026-10-01", "2026-10-31", [{ uid: "a", title: "整天活動", location: "", date: "2026-10-16", time: null }], [{ id: "e", date: "2026-10-16", time: "09:00", title: "早上會議" }], []);
  assert.deepEqual(days.get("2026-10-16")!.map((i) => i.title), ["整天活動", "早上會議"]);
});

test("月格從週日開始到週六結束；跨年換月", async () => {
  const { monthGrid, shiftMonth } = await import("./days.ts");
  const g = monthGrid("2026-10"); // 10/1 是週四
  assert.equal(g[0], "2026-09-27");
  assert.equal(g.at(-1), "2026-10-31"); // 10/31 是週六
  assert.equal(g.length % 7, 0);
  assert.equal(shiftMonth("2026-12", 1), "2027-01");
  assert.equal(shiftMonth("2026-01", -1), "2025-12");
});
