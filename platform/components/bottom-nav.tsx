"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/todos", label: "待辦", areas: ["admin", "member"] },
  { href: "/ideas", label: "靈感", areas: ["admin", "member"] },
  { href: "/shows", label: "企劃", areas: ["admin", "member"] },
  { href: "/finance", label: "財務", areas: ["admin", "member", "finance_partner"] },
];

export default function BottomNav({ role }: { role: string }) {
  const path = usePathname();
  return (
    <nav className="nav" aria-label="主要導覽">
      <div className="nav-inner">
        <div className="nav-brand">看我笑話</div>
        {ITEMS.filter((i) => i.areas.includes(role)).map((i) => (
          <Link key={i.href} href={i.href} className={path.startsWith(i.href) ? "on" : ""}>
            <i />
            {i.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
