import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/site-config";
import AdminAppShell from "./AdminAppShell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const sessionUser = session?.user as { id?: string; name?: string; email?: string; role?: string; image?: string | null } | undefined;
  if (!session?.user) redirect("/login");
  if (sessionUser?.role === "INSTRUCTOR") redirect("/teacher");
  if (sessionUser?.role !== "ADMIN") redirect("/login");

  const [siteConfig, dbUser] = await Promise.all([
    getSiteConfig(),
    sessionUser?.id
      ? prisma.user.findUnique({
          where: { id: sessionUser.id },
          select: { name: true, image: true },
        })
      : null,
  ]);
  const userName = dbUser?.name ?? sessionUser?.name ?? sessionUser?.email ?? "Admin";
  const userImage = dbUser?.image ?? sessionUser?.image ?? null;
  const siteName = siteConfig.siteName || "Admin";
  const logoUrl = siteConfig.logoUrl || "";

  return (
    <AdminAppShell siteName={siteName} logoUrl={logoUrl} userName={userName} userImage={userImage} role={sessionUser?.role}>
      {children}
    </AdminAppShell>
  );
}
