import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current";
import BottomNav from "@/components/bottom-nav";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.status !== "approved" || !user.role) redirect("/pending");
  return (
    <>
      {children}
      <BottomNav role={user.role} />
    </>
  );
}
