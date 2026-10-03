// 自訂 Cloudflare Worker 入口（wrangler.toml 的 main 指向這裡），照 OpenNext「Custom Worker」寫法：
// fetch 轉交給 cf:build 產出的 .open-next/worker.js，scheduled 叫醒排程 route。
// 參考：https://opennext.js.org/cloudflare/howtos/custom-worker
// tsconfig.json 把本檔 exclude，避免 tsc 順著 import 把整包 bundle 拉進來推型別。

// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- 見檔頭說明
// @ts-ignore `.open-next/worker.js` is generated at build time
import { default as handler } from "./.open-next/worker.js";

type ScheduledController = { cron: string; scheduledTime: number };
type Env = { CRON_SECRET?: string; APP_URL?: string } & Record<string, unknown>;
type ExecutionContext = { waitUntil(promise: Promise<unknown>): void; passThroughOnException(): void };

/** cron 表達式 → 排程 route。必須跟 wrangler.toml 的 crons 一致。 */
const CRON_ROUTES: Record<string, string> = {
  "0 2 * * *": "/api/cron/reminders", // 台北 10:00 演出前推播
  "30 19 * * *": "/api/cron/purge-messages", // 台北 03:30 刪除超過 14 天的一般聊天
};

async function runCron(env: Env, ctx: ExecutionContext, cron: string): Promise<void> {
  const path = CRON_ROUTES[cron];
  if (!path) {
    console.error(`[cron] 未知的 cron 表達式 ${cron}`);
    return;
  }
  const origin = env.APP_URL || "https://jokesonme.internal";
  const req = new Request(new URL(path, origin), {
    method: "POST",
    headers: { "x-cron-secret": env.CRON_SECRET ?? "" },
  });
  try {
    const res: Response = await handler.fetch(req, env, ctx);
    const text = (await res.text()).slice(0, 500);
    (res.ok ? console.log : console.error)(`[cron] POST ${path} -> ${res.status} ${text}`);
  } catch (err) {
    console.error(`[cron] POST ${path} threw`, err);
  }
}

const worker = {
  fetch: handler.fetch,
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runCron(env, ctx, controller.cron));
  },
};

export default worker;
