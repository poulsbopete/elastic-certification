import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
