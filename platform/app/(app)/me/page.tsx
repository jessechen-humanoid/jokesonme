import Link from "next/link";
import TopBar from "@/components/top-bar";
import { IconChevron } from "@/components/icons";
import { getCurrentUser } from "@/lib/auth/current";
import { displayName } from "@/lib/auth/users";
import { redirect } from "next/navigation";

const ROLE_LABEL = { admin: "管理員", member: "成員", finance_partner: "財務夥伴" } as const;

export default async function MePage() {
  const me = await getCurrentUser();
  if (!me || me.status !== "approved" || !me.role) redirect("/login");
  return (
    <main className="page">
      <TopBar me={me} title={displayName(me)} sub={<>{ROLE_LABEL[me.role]}・LINE：{me.display_name}</>} />
      <div className="content">
        {me.role === "admin" ? (
          <>
            <section>
              <Link className="card link-row" href="/admin/users"><span className="row-main">登入核准</span><IconChevron className="chev" /></Link>
              <Link className="card link-row" href="/admin/template"><span className="row-main">月號模板</span><IconChevron className="chev" /></Link>
            </section>
          </>
        ) : null}
        <form action="/api/auth/logout" method="post">
          <button className="btn btn-ghost btn-block" type="submit">登出</button>
        </form>
      </div>
    </main>
  );
}
