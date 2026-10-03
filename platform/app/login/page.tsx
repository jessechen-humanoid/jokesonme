import { redirect } from "next/navigation";
import { getCurrentUser, homeFor } from "@/lib/auth/current";
import { safeNextPath } from "@/lib/auth/session";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = safeNextPath(typeof sp.next === "string" ? sp.next : null);
  const user = await getCurrentUser();
  if (user?.status === "approved") redirect(homeFor(user));
  if (user) redirect("/pending");
  return (
    <main className="center">
      <div className="brand" style={{ marginBottom: 8 }}>看我笑話</div>
      <p className="page-sub" style={{ marginBottom: 28 }}>工作室後勤平台</p>
      {sp.error ? <div className="notice">登入沒有成功，請再試一次。</div> : null}
      <a className="btn btn-line btn-block" href={`/api/auth/login?next=${encodeURIComponent(next)}`}>用 LINE 登入</a>
    </main>
  );
}
