import Link from "next/link";
import type { UserRow } from "@/lib/auth/users";
import { displayName } from "@/lib/auth/users";

export default function Avatar({ user }: { user: UserRow }) {
  const name = displayName(user);
  return (
    <Link href="/me" className="avatar" aria-label={`${name} 的帳號`}>
      {user.picture_url ? <img src={user.picture_url} alt="" /> : name.slice(0, 1)}
    </Link>
  );
}
