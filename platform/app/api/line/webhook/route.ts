import { verifySignature } from "@/lib/line/signature";
import { handleEvents } from "@/lib/line/webhook";
import { supabaseWebhookStore } from "@/lib/line/store";
import { replyText } from "@/lib/line/api";

export async function POST(request: Request): Promise<Response> {
  const raw = await request.text();
  const ok = await verifySignature(process.env.LINE_CHANNEL_SECRET ?? "", raw, request.headers.get("x-line-signature"));
  if (!ok) return new Response("invalid signature", { status: 401 });

  let events: Parameters<typeof handleEvents>[0] = [];
  try {
    events = (JSON.parse(raw) as { events?: typeof events }).events ?? [];
  } catch {
    return new Response("ok", { status: 200 });
  }
  try {
    const handled = await handleEvents(events, supabaseWebhookStore(), replyText);
    console.log("[line-webhook]", handled.join(","));
  } catch (err) {
    // 仍回 200：LINE 收到非 2xx 會重送，問題記在 log 裡查。
    console.error("[line-webhook] failed", err);
  }
  return new Response("ok", { status: 200 });
}
