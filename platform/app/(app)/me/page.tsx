import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current";
import { displayName } from "@/lib/auth/users";
import { redirect } from "next/navigation";

const ROLE_LABEL = { admin: "管理員", member: "成員", finance_partner: "財務夥伴" } as const;

export default async function MePage() {
  const me = await getCurrentUser();
  if (!me || me.status !== "approved" || !me.role) redirect("/login");
  return (
    <main className="page">
      <header className="head">
        <div className="brand" style={{ marginBottom: 12 }}>看我笑話</div>
        <h1 className="page-title">{displayName(me)}</h1>
        <p className="page-sub">{ROLE_LABEL[me.role]}・LINE：{me.display_name}</p>
      </header>
      <div className="content">
        {me.role === "admin" ? (
          <>
            <Link className="card" style={{ display: "block" }} href="/admin/users"><div className="title">登入核准</div></Link>
            <Link className="card" style={{ display: "block" }} href="/admin/template"><div className="title">月號模板</div></Link>
            <Link className="card" style={{ display: "block" }} href="/admin/push"><div className="title">LINE 推播用量與演出提醒預覽</div></Link>
          </>
        ) : null}
        <form action="/api/auth/logout" method="post">
          <button className="btn btn-ghost btn-block" type="submit">登出</button>
        </form>
      </div>
    </main>
  );
}
