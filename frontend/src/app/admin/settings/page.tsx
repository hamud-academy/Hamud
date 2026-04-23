import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileSettingsClient from "./ProfileSettingsClient";

export default async function AdminSettingsPage() {
  const session = await auth();
  const sessionUser = session?.user as { id?: string; role?: string; name?: string | null; email?: string; image?: string | null } | undefined;
  if (sessionUser?.role !== "ADMIN") {
    redirect("/admin");
  }

  const dbUser = sessionUser?.id
    ? await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { name: true, email: true, image: true },
      })
    : null;

  return (
    <ProfileSettingsClient
      user={{
        name: dbUser?.name ?? sessionUser?.name ?? null,
        email: dbUser?.email ?? sessionUser?.email ?? "",
        image: dbUser?.image ?? sessionUser?.image ?? null,
      }}
    />
  );
}
