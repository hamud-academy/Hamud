import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LanguageProvider } from "@/components/LanguageProvider";
import { prisma } from "@/lib/prisma";
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

  const sessionUser = session.user as {
    id?: string;
    role?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  if (sessionUser.role === "ADMIN") {
    redirect("/admin");
  }
  if (sessionUser.role === "INSTRUCTOR") {
    redirect("/teacher");
  }

  const dbUser = sessionUser.id
    ? await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { name: true, image: true },
      })
    : null;

  return (
    <LanguageProvider>
      <DashboardShell
        userName={dbUser?.name ?? sessionUser.name ?? sessionUser.email ?? undefined}
        userImage={dbUser?.image ?? sessionUser.image ?? null}
      >
        {children}
      </DashboardShell>
    </LanguageProvider>
  );
}
