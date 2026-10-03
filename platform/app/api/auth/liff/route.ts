import { NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/auth/line-login";
import { recordLogin } from "@/lib/auth/users";
import { SESSION_COOKIE, safeNextPath, sessionCookieOptions, signSession } from "@/lib/auth/session";

export async function POST(request: Request): Promise<Response> {
  let body: { idToken?: string; next?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.idToken) return NextResponse.json({ error: "missing idToken" }, { status: 400 });
  try {
    const user = await recordLogin(await verifyIdToken(body.idToken), "liff");
    const next = user.status === "approved" ? safeNextPath(body.next) : "/pending";
    const res = NextResponse.json({ next });
    res.cookies.set(SESSION_COOKIE, await signSession(process.env.AUTH_SECRET ?? "", user.id), sessionCookieOptions(new URL(request.url).protocol === "https:"));
    return res;
  } catch (err) {
    console.error("[auth] liff failed", err);
    return NextResponse.json({ error: "verify failed" }, { status: 401 });
  }
}
