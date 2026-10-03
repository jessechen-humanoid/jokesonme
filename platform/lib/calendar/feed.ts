// 演出公開日曆的抓取（design「公開日曆快取與最後一次成功副本」）。
// 平台只讀、絕不寫回 Google 日曆。成功時留一份副本在 app_settings，讀不到時用副本。
import { db } from "../supabase.ts";

export const ICS_KEY = "show_calendar_ics";
export const FETCHED_AT_KEY = "show_calendar_fetched_at";
const CACHE_SECONDS = 600;
// 副本內容沒變時，最多一天才刷新一次時間戳（app_settings 有 audit，避免每 10 分鐘留一筆紀錄）
const REFRESH_COPY_MS = 24 * 60 * 60 * 1000;

export type Feed =
  | { status: "live"; text: string; fetchedAt: string }
  | { status: "stale"; text: string; fetchedAt: string }
  | { status: "missing" };

export type CopyStore = {
  load(): Promise<{ text: string; fetchedAt: string } | null>;
  save(text: string, fetchedAt: string): Promise<void>;
};

type Fetcher = (url: string) => Promise<string>;

/** Google 每次回應的 DTSTAMP 與活動順序都會變，比對內容前先正規化。 */
export function fingerprint(text: string): string {
  return (text.replace(/\r\n/g, "\n").match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ?? []).map((e) => e.replace(/^DTSTAMP[:;].*\n/gm, "")).sort().join("\n");
}

/** 成功 → live（必要時更新副本）；失敗有副本 → stale；失敗無副本 → missing。 */
export async function loadFeed(url: string, fetcher: Fetcher, store: CopyStore, now = new Date()): Promise<Feed> {
  let text: string | null = null;
  try {
    text = await fetcher(url);
    if (!text.includes("BEGIN:VCALENDAR")) text = null;
  } catch (e) {
    console.error("演出日曆讀取失敗", e);
  }
  const copy = await store.load().catch(() => null);
  if (text === null) return copy ? { status: "stale", ...copy } : { status: "missing" };
  const fetchedAt = now.toISOString();
  const outdated = !copy || fingerprint(copy.text) !== fingerprint(text) || now.getTime() - Date.parse(copy.fetchedAt) > REFRESH_COPY_MS;
  if (outdated) await store.save(text, fetchedAt).catch((e) => console.error("演出日曆副本寫入失敗", e));
  return { status: "live", text, fetchedAt };
}

/** Cloudflare 邊緣快取 600 秒；本機開發時 cf 選項被忽略。 */
export const cachedFetch: Fetcher = async (url) => {
  const res = await fetch(url, { cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true } } as RequestInit);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
};

export function supabaseCopyStore(): CopyStore {
  const client = db("calendar-sync");
  return {
    async load() {
      const { data, error } = await client.from("app_settings").select("key,value").in("key", [ICS_KEY, FETCHED_AT_KEY]);
      if (error) throw error;
      const text = data.find((r) => r.key === ICS_KEY)?.value;
      const fetchedAt = data.find((r) => r.key === FETCHED_AT_KEY)?.value;
      return text && fetchedAt ? { text, fetchedAt } : null;
    },
    async save(text, fetchedAt) {
      const updated_at = new Date().toISOString();
      const { error } = await client.from("app_settings").upsert([
        { key: ICS_KEY, value: text, updated_at },
        { key: FETCHED_AT_KEY, value: fetchedAt, updated_at },
      ]);
      if (error) throw error;
    },
  };
}

export function showCalendarFeed(): Promise<Feed> {
  const url = process.env.SHOW_CALENDAR_ICS_URL;
  if (!url) return Promise.resolve({ status: "missing" });
  return loadFeed(url, cachedFetch, supabaseCopyStore());
}
