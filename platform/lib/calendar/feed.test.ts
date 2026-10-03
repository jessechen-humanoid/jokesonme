import { test } from "node:test";
import assert from "node:assert/strict";
import { loadFeed, type CopyStore } from "./feed.ts";

const ICS = "BEGIN:VCALENDAR\nEND:VCALENDAR";
const NOW = new Date("2026-10-03T10:00:00Z");
function memStore(initial: { text: string; fetchedAt: string } | null) {
  const saves: string[] = [];
  let copy = initial;
  const store: CopyStore = { load: async () => copy, save: async (text, fetchedAt) => { saves.push(fetchedAt); copy = { text, fetchedAt }; } };
  return { store, saves };
}
const fail = async () => { throw new Error("network"); };

test("成功：回 live 並存副本", async () => {
  const { store, saves } = memStore(null);
  const feed = await loadFeed("u", async () => ICS, store, NOW);
  assert.deepEqual(feed, { status: "live", text: ICS, fetchedAt: NOW.toISOString() });
  assert.deepEqual(saves, [NOW.toISOString()]);
});

test("成功但內容與一天內的副本相同：不重寫副本", async () => {
  const { store, saves } = memStore({ text: ICS, fetchedAt: "2026-10-03T02:00:00.000Z" });
  assert.equal((await loadFeed("u", async () => ICS, store, NOW)).status, "live");
  assert.deepEqual(saves, []);
});

test("失敗有副本：回 stale 與副本的抓取時間", async () => {
  const { store, saves } = memStore({ text: ICS, fetchedAt: "2026-10-02T00:00:00.000Z" });
  assert.deepEqual(await loadFeed("u", fail, store, NOW), { status: "stale", text: ICS, fetchedAt: "2026-10-02T00:00:00.000Z" });
  assert.deepEqual(saves, []);
});

test("失敗無副本：回 missing；回應不是 iCal 也算失敗", async () => {
  assert.deepEqual(await loadFeed("u", fail, memStore(null).store, NOW), { status: "missing" });
  assert.deepEqual(await loadFeed("u", async () => "<html>login</html>", memStore(null).store, NOW), { status: "missing" });
});

test("只有 DTSTAMP 與活動順序不同：視為相同、不重寫副本", async () => {
  const a = "BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTAMP:20261003T000000Z\nUID:1\nEND:VEVENT\nBEGIN:VEVENT\nDTSTAMP:20261003T000000Z\nUID:2\nEND:VEVENT\nEND:VCALENDAR";
  const b = "BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTAMP:20261003T000500Z\nUID:2\nEND:VEVENT\nBEGIN:VEVENT\nDTSTAMP:20261003T000500Z\nUID:1\nEND:VEVENT\nEND:VCALENDAR";
  const { store, saves } = memStore({ text: a, fetchedAt: "2026-10-03T09:00:00.000Z" });
  await loadFeed("u", async () => b, store, NOW);
  assert.deepEqual(saves, []);
  await loadFeed("u", async () => b.replace("UID:2", "UID:3"), store, NOW);
  assert.equal(saves.length, 1);
});
