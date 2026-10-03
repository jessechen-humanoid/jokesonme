import { requirePage } from "@/lib/auth/current";
import { listUsers } from "@/lib/todos";
import { MEMBER_NAMES } from "@/lib/members";
import { displayName, type UserRow } from "@/lib/auth/users";
import Avatar from "@/components/avatar";
import { approveUser, revokeUser } from "./actions";

const ROLE_LABEL = { admin: "管理員", member: "成員", finance_partner: "財務夥伴" } as const;

export default async function AdminUsersPage() {
  const me = await requirePage("admin", "/admin/users");
  const users = await listUsers(`user:${me.id}`);
  const pending = users.filter((u) => u.status === "pending");
  const approved = users.filter((u) => u.status === "approved");
  const revoked = users.filter((u) => u.status === "revoked");

  return (
    <main className="page">
      <header className="head">
        <div className="head-top">
          <div className="brand">看我笑話</div>
          <Avatar user={me} />
        </div>
        <h1 className="page-title">登入核准</h1>
        <p className="page-sub">等待核准 {pending.length} 人・已核准 {approved.length} 人</p>
      </header>
      <div className="content">
        <div className="section"><b>等待核准</b><span>{pending.length} 人</span></div>
        {pending.length === 0 ? <p className="empty">沒有等待核准的人</p> : pending.map((u) => <ApproveCard key={u.id} u={u} />)}

        <div className="section"><b>已核准</b><span>{approved.length} 人</span></div>
        {approved.map((u) => (
          <div key={u.id} className="card">
            <UserLine u={u} />
            <div className="meta"><span className="tag">{ROLE_LABEL[u.role!]}</span></div>
            {u.id !== me.id ? (
              <details style={{ marginTop: 10 }}>
                <summary style={{ fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>修改身分或停用</summary>
                <ApproveForm u={u} label="更新" />
                <form action={revokeUser} style={{ marginTop: 8 }}>
                  <input type="hidden" name="id" value={u.id} />
                  <button className="btn btn-danger" type="submit">停用這個帳號</button>
                </form>
              </details>
            ) : null}
          </div>
        ))}

        {revoked.length ? (
          <>
            <div className="section"><b>已停用</b><span>{revoked.length} 人</span></div>
            {revoked.map((u) => <ApproveCard key={u.id} u={u} label="恢復並核准" />)}
          </>
        ) : null}
      </div>
    </main>
  );
}

function UserLine({ u }: { u: UserRow }) {
  return (
    <div className="title">
      {displayName(u)}
      {u.member_name && u.member_name !== u.display_name ? <span style={{ color: "var(--text-muted)", fontSize: 13 }}>（LINE：{u.display_name}）</span> : null}
      {!u.last_login_at ? <span style={{ color: "var(--text-muted)", fontSize: 12 }}>・尚未登入過，從群組自動建立</span> : null}
    </div>
  );
}

function ApproveCard({ u, label = "核准" }: { u: UserRow; label?: string }) {
  return (
    <div className="card">
      <UserLine u={u} />
      <ApproveForm u={u} label={label} />
    </div>
  );
}

function ApproveForm({ u, label }: { u: UserRow; label: string }) {
  return (
    <form action={approveUser} style={{ marginTop: 10 }}>
      <input type="hidden" name="id" value={u.id} />
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <select className="select" name="role" defaultValue={u.role ?? "member"} style={{ flex: "1 1 120px" }} aria-label="身分">
          <option value="member">成員</option>
          <option value="finance_partner">財務夥伴</option>
          <option value="admin">管理員</option>
        </select>
        <select className="select" name="member_name" defaultValue={u.member_name ?? ""} style={{ flex: "1 1 120px" }} aria-label="對應成員">
          <option value="">不是 8 位成員</option>
          {MEMBER_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <button className="btn btn-primary" type="submit">{label}</button>
      </div>
    </form>
  );
}
