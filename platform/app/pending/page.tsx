import { redirect } from "next/navigation";
import { getCurrentUser, homeFor } from "@/lib/auth/current";

export default async function PendingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.status === "approved") redirect(homeFor(user));
  return (
    <main className="center">
      <div className="brand" style={{ marginBottom: 16 }}>看我笑話</div>
      <div className="card">
        <p className="title" style={{ marginTop: 0 }}>
          {user.status === "revoked" ? "你的存取權已被停用" : "等待核准中"}
        </p>
        <p className="page-sub" style={{ lineHeight: 1.7 }}>
          {user.display_name}，{user.status === "revoked" ? "如需恢復請聯絡傑哥。" : "傑哥核准後，重新整理這頁就能進入。"}
        </p>
      </div>
      <form action="/api/auth/logout" method="post" style={{ marginTop: 12 }}>
        <button className="btn btn-ghost btn-block" type="submit">換一個 LINE 帳號</button>
      </form>
    </main>
  );
}
