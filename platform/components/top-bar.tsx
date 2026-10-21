import Link from "next/link";
import Avatar from "@/components/avatar";
import { IconChevronLeft } from "@/components/icons";
import type { UserRow } from "@/lib/auth/users";

// 每頁頂端的精簡頂列（spec mobile-first-ui「Page header economy」）：頁名＋頭像，子頁有返回；不重複品牌名。
export default function TopBar({ me, title, back, sub, actions }: {
  me: UserRow; title: string; back?: { href: string; label: string }; sub?: React.ReactNode; actions?: React.ReactNode;
}) {
  return (
    <header className="topbar">
      <div className="topbar-main">
        {back ? <Link className="back" href={back.href}><IconChevronLeft className="chev" />{back.label}</Link> : null}
        <h1 className="page-title">{title}</h1>
        {sub ? <div className="page-sub">{sub}</div> : null}
      </div>
      <div className="topbar-actions">
        {actions}
        <Avatar user={me} />
      </div>
    </header>
  );
}
