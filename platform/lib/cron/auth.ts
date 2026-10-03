// 排程 route 只接受 worker.ts 帶來的 x-cron-secret；沒設 CRON_SECRET 時一律拒絕。
export function isCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("x-cron-secret") === secret;
}
