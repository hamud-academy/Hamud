import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LiveLessonsImageForm from "./LiveLessonsImageForm";

export default async function LiveLessonsImagePage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") redirect("/admin");

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Live Lessons</h1>
      <p className="text-slate-600 mb-6">
        Manage the Live lessons page content, image, features, buttons, and class cards.
      </p>
      <LiveLessonsImageForm />
    </div>
  );
}
