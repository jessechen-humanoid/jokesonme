import { test } from "node:test";
import assert from "node:assert/strict";
import { validateItem } from "./program.ts";

const raw = (o: Partial<Record<string, string>>) => ({ name: "又兔了", kind: "漫才", minutes: "7", content: "", props: "", sound: "", projection: "", ...o });

test("段落驗證：時長 0–600 整數、名稱不可空白", () => {
  assert.deepEqual(validateItem(raw({})), { name: "又兔了", kind: "漫才", minutes: 7, content: "", props: "", sound: "", projection: "" });
  assert.equal((validateItem(raw({ minutes: "0" })) as { minutes: number }).minutes, 0);
  for (const m of ["-5", "abc", "601", "7.5", ""]) assert.deepEqual(validateItem(raw({ minutes: m })), { error: "時長請填 0–600 的整數（分鐘）" }, m);
  assert.deepEqual(validateItem(raw({ name: "  " })), { error: "請填寫段落名稱" });
});
