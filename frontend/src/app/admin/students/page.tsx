import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import StudentsPageClient from "./StudentsPageClient";

export default async function AdminStudentsPage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    redirect("/admin");
  }

  const courses = await prisma.course.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true, slug: true },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="p-4 sm:p-6 md:p-8">
        <StudentsPageClient courses={courses} />
      </div>
    </div>
  );
}
