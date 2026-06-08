import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ProfilePageClient from "./ProfilePageClient";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/profile");
  }

  const user = session.user as { id?: string; name?: string; email?: string; image?: string };

  return (
    <ProfilePageClient
      userId={user.id ?? ""}
      currentName={user.name ?? ""}
      currentEmail={user.email ?? ""}
      currentImage={user.image ?? null}
    />
  );
}
