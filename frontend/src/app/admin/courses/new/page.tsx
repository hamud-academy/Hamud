import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CreateCourseForm from "./CreateCourseForm";

export default async function AdminNewCoursePage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    redirect("/admin");
  }

  const [categories, instructors] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } }),
    prisma.user.findMany({
      where: { role: "INSTRUCTOR" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Courses
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Add new course</h1>
        </div>
        <p className="text-slate-500 mb-8">
          Fill in the details below. You can then add modules and lessons on the curriculum page.
        </p>

        {categories.length === 0 || instructors.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-800">
            <p className="font-medium">
              {categories.length === 0 && instructors.length === 0
                ? "No categories or instructors. Add them in the seed and try again."
                : categories.length === 0
                  ? "No categories. Add them in the seed."
                  : "No instructors. Add them in the seed."}
            </p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 md:p-8 max-w-3xl">
            <CreateCourseForm categories={categories} instructors={instructors} />
          </div>
        )}
      </div>
    </div>
  );
}
