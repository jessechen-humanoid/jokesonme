import { NextResponse } from "next/server";
import { appUrl } from "@/lib/auth/line-login";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function POST(): Promise<Response> {
  const res = NextResponse.redirect(`${appUrl()}/login`, { status: 303 });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
