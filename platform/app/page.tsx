import { redirect } from "next/navigation";
import { getCurrentUser, homeFor } from "@/lib/auth/current";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.status !== "approved") redirect("/pending");
  redirect(homeFor(user));
}
