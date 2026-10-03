import { test } from "node:test";
import assert from "node:assert/strict";
import { validateEvent } from "./events.ts";

test("內部行程輸入驗證", () => {
  assert.deepEqual(validateEvent({ date: "2026-10-12", time: "19:00", title: " 討論 11 月號 " }), { date: "2026-10-12", time: "19:00", title: "討論 11 月號", notes: "" });
  assert.deepEqual(validateEvent({ date: "2026-10-12", time: "", title: "排練" }), { date: "2026-10-12", time: null, title: "排練", notes: "" });
  assert.deepEqual(validateEvent({ date: "2026-10-12", title: "  " }), { error: "請填寫標題" });
  assert.deepEqual(validateEvent({ date: "10/12", title: "x" }), { error: "日期格式不正確" });
  assert.deepEqual(validateEvent({ date: "2026-10-12", time: "25:00", title: "x" }), { error: "時間格式要像 19:00" });
});
