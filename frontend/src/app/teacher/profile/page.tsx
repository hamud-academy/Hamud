import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import ProfileForm from "@/app/dashboard/profile/ProfileForm";

export default async function TeacherProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/teacher/profile");

  const user = session.user as { id?: string; name?: string; email?: string; image?: string | null };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <div className="py-6 pr-6 md:py-8 md:pr-8">
        <div className="max-w-xl">
          <div className="mb-6">
            <Link href="/teacher" className="text-sm text-slate-600 hover:text-teal-600">
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
      </div>
    </div>
  );
}
