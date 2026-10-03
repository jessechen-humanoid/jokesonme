// LINE Login（OAuth 2.1 / OpenID Connect）。ID token 一律交給 LINE 的 verify 端點驗證，不自己解 JWT。

export type LineProfile = { userId: string; name: string; picture: string | null };

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} 未設定`);
  return v;
}

export function appUrl(): string {
  return (process.env.APP_URL || "https://jokesonme.jesse-chen.workers.dev").replace(/\/$/, "");
}

export function callbackUrl(): string {
  return `${appUrl()}/api/auth/callback/line`;
}

export function authorizeUrl(state: string, nonce: string): string {
  const q = new URLSearchParams({
    response_type: "code",
    client_id: env("LINE_LOGIN_CHANNEL_ID"),
    redirect_uri: callbackUrl(),
    state,
    scope: "openid profile",
    nonce,
    bot_prompt: "normal", // 登入時附「加傑瓜好友」選項
  });
  return `https://access.line.me/oauth2/v2.1/authorize?${q}`;
}

export async function exchangeCode(code: string): Promise<string> {
  const res = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl(),
      client_id: env("LINE_LOGIN_CHANNEL_ID"),
      client_secret: env("LINE_LOGIN_CHANNEL_SECRET"),
    }),
  });
  if (!res.ok) throw new Error(`LINE token ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { id_token?: string };
  if (!data.id_token) throw new Error("LINE token response has no id_token");
  return data.id_token;
}

/** 向 LINE 驗證 ID token；nonce 有給就一併比對。 */
export async function verifyIdToken(idToken: string, nonce?: string): Promise<LineProfile> {
  const body = new URLSearchParams({ id_token: idToken, client_id: env("LINE_LOGIN_CHANNEL_ID") });
  if (nonce) body.set("nonce", nonce);
  const res = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`LINE verify ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const p = (await res.json()) as { sub?: string; name?: string; picture?: string };
  if (!p.sub) throw new Error("LINE verify response has no sub");
  return { userId: p.sub, name: p.name ?? "LINE 使用者", picture: p.picture ?? null };
}
