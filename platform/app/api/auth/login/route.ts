import { NextResponse } from "next/server";
import { authorizeUrl } from "@/lib/auth/line-login";
import { safeNextPath } from "@/lib/auth/session";

const OAUTH_COOKIE = "jk_oauth";

function randomToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next"));
  const state = randomToken();
  const nonce = randomToken();
  const res = NextResponse.redirect(authorizeUrl(state, nonce));
  res.cookies.set(OAUTH_COOKIE, JSON.stringify({ state, nonce, next }), {
    httpOnly: true, secure: url.protocol === "https:", sameSite: "lax", path: "/", maxAge: 600,
  });
  return res;
}
