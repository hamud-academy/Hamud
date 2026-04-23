import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CoursesPageClient from "./CoursesPageClient";

export default async function AdminCoursesPage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    redirect("/login");
  }

  const [courses, categories, instructors] = await Promise.all([
    prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true, slug: true } },
        instructor: { select: { name: true, email: true } },
        _count: {
          select: { modules: true, enrollments: true },
        },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } }),
    prisma.user.findMany({
      where: { role: "INSTRUCTOR" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  const coursesSerialized = courses.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    price: Number(c.price),
    published: c.published,
    category: c.category,
    instructor: c.instructor,
    _count: c._count,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="p-4 sm:p-6 md:p-8">
        <CoursesPageClient
          courses={coursesSerialized}
          categories={categories}
          instructors={instructors}
        />
      </div>
    </div>
  );
}
