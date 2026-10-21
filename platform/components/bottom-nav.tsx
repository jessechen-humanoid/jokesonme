"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconCalendar, IconMic, IconMoney, IconNote, IconTodo } from "@/components/icons";

// 手機底部分頁列、電腦左側欄（spec mobile-first-ui「Icon navigation」）。「靈感」畫面上叫「筆記」，路徑不變。
const ITEMS = [
  { href: "/todos", label: "待辦", Icon: IconTodo, areas: ["admin", "member"] },
  { href: "/ideas", label: "筆記", Icon: IconNote, areas: ["admin", "member"] },
  { href: "/shows", label: "演出", Icon: IconMic, areas: ["admin", "member"] },
  { href: "/calendar", label: "行事曆", Icon: IconCalendar, areas: ["admin", "member"] },
  { href: "/finance", label: "財務", Icon: IconMoney, areas: ["admin", "member", "finance_partner"] },
];

export default function BottomNav({ role }: { role: string }) {
  const path = usePathname();
  return (
    <nav className="nav" aria-label="主要導覽">
      <div className="nav-inner">
        <div className="nav-brand">看我笑話</div>
        {ITEMS.filter((i) => i.areas.includes(role)).map(({ href, label, Icon }) => {
          const on = path.startsWith(href);
          return (
            <Link key={href} href={href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>
              <Icon />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
