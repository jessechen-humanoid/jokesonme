// LINE webhook 簽章驗證：x-line-signature = base64(HMAC-SHA256(channel secret, 原始 body))。
// 用 Web Crypto，Cloudflare Workers 與 Node 都能跑。

function toBase64(bytes: ArrayBuffer): string {
  let bin = "";
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin);
}

/** 長度固定時逐字比較，避免用 === 洩漏時間差。 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signBody(channelSecret: string, rawBody: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(channelSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toBase64(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody)));
}

export async function verifySignature(channelSecret: string, rawBody: string, signature: string | null): Promise<boolean> {
  if (!signature || !channelSecret) return false;
  return safeEqual(await signBody(channelSecret, rawBody), signature);
}
