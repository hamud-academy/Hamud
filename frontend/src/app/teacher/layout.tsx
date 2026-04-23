import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/site-config";
import TeacherAppShell from "./TeacherAppShell";

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const sessionUser = session?.user as { id?: string; name?: string; email?: string; role?: string; image?: string | null } | undefined;
  if (!session?.user || sessionUser?.role !== "INSTRUCTOR") {
    redirect("/login");
  }

  const [siteConfig, dbUser] = await Promise.all([
    getSiteConfig(),
    sessionUser?.id
      ? prisma.user.findUnique({
          where: { id: sessionUser.id },
          select: { name: true, image: true },
        })
      : null,
  ]);
  const userName = dbUser?.name ?? sessionUser?.name ?? sessionUser?.email ?? "Teacher";
  const userImage = dbUser?.image ?? sessionUser?.image ?? null;
  const siteName = siteConfig.siteName || "Teacher";
  const logoUrl = siteConfig.logoUrl || "";

  return (
    <TeacherAppShell siteName={siteName} logoUrl={logoUrl} userName={userName} userImage={userImage}>
      {children}
    </TeacherAppShell>
  );
}
