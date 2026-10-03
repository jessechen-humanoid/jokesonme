import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// 先不開 R2 快取（同 Jebby Dashboard：此 Cloudflare 帳號尚未啟用 R2）。
export default defineCloudflareConfig({});
