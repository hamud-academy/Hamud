import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/profile");
  }

  const user = session.user as { id?: string; name?: string; email?: string; image?: string };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-slate-600 hover:text-violet-600"
        >
          ← Back to Dashboard
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Profile</h1>
      <p className="text-slate-600 mb-6">Update your photo, email, username and password.</p>
      <ProfileForm
        userId={user.id ?? ""}
        currentName={user.name ?? ""}
        currentEmail={user.email ?? ""}
        currentImage={user.image ?? null}
      />
    </div>
  );
}
