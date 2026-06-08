import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDiplomaConfig } from "@/lib/diploma-config";
import { prisma } from "@/lib/prisma";
import TeachersPageClient from "./TeachersPageClient";

export default async function AdminTeachersPage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    redirect("/admin");
  }

  const [courses, diplomaConfig] = await Promise.all([
    prisma.course.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true, slug: true },
    }),
    getDiplomaConfig(),
  ]);

  const diplomaPrograms = diplomaConfig.programs
    .filter((program) => program.status === "PUBLISHED")
    .map((program) => ({ id: program.id, title: program.title, slug: program.slug }))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="p-4 sm:p-6 md:p-8">
        <TeachersPageClient courses={courses} diplomaPrograms={diplomaPrograms} />
      </div>
    </div>
  );
}
