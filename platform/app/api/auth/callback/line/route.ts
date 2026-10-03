import { NextResponse } from "next/server";
import { exchangeCode, verifyIdToken, appUrl } from "@/lib/auth/line-login";
import { recordLogin } from "@/lib/auth/users";
import { SESSION_COOKIE, safeNextPath, sessionCookieOptions, signSession } from "@/lib/auth/session";

const OAUTH_COOKIE = "jk_oauth";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const fail = (why: string) => {
    console.error("[auth] callback failed:", why);
    return NextResponse.redirect(`${appUrl()}/login?error=1`);
  };
  const raw = request.headers.get("cookie")?.match(/(?:^|;\s*)jk_oauth=([^;]+)/)?.[1];
  let saved: { state?: string; nonce?: string; next?: string } = {};
  try {
    saved = raw ? JSON.parse(decodeURIComponent(raw)) : {};
  } catch {
    return fail("bad oauth cookie");
  }
  const code = url.searchParams.get("code");
  if (url.searchParams.get("error")) return fail(`LINE error ${url.searchParams.get("error")}`);
  if (!code || !saved.state || url.searchParams.get("state") !== saved.state) return fail("state mismatch");

  try {
    const profile = await verifyIdToken(await exchangeCode(code), saved.nonce);
    const user = await recordLogin(profile, "web");
    const dest = user.status === "approved" ? safeNextPath(saved.next) : "/pending";
    const res = NextResponse.redirect(`${appUrl()}${dest}`);
    res.cookies.set(SESSION_COOKIE, await signSession(process.env.AUTH_SECRET ?? "", user.id), sessionCookieOptions(url.protocol === "https:"));
    res.cookies.delete(OAUTH_COOKIE);
    return res;
  } catch (err) {
    return fail(String(err));
  }
}
