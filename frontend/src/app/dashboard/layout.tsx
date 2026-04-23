import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DashboardShell from "@/components/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const user = session.user as { role?: string };
  if (user.role === "ADMIN") {
    redirect("/admin");
  }
  if (user.role === "INSTRUCTOR") {
    redirect("/teacher");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
