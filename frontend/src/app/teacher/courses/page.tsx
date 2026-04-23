import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import TeacherCoursesClient from "./TeacherCoursesClient";

export default async function TeacherCoursesPage() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || user?.role !== "INSTRUCTOR") redirect("/login");

  const [courses, categories] = await Promise.all([
    prisma.course.findMany({
      where: { instructorId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true, slug: true, id: true } },
        _count: { select: { modules: true, enrollments: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } }),
  ]);

  const list = courses.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    description: c.description ?? "",
    thumbnail: c.thumbnail ?? "",
    price: Number(c.price),
    originalPrice: c.originalPrice != null ? Number(c.originalPrice) : null,
    level: c.level,
    language: c.language ?? "so",
    durationHours: c.durationHours != null ? Number(c.durationHours) : null,
    published: c.published,
    category: { id: c.category.id, name: c.category.name, slug: c.category.slug },
    _count: c._count,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <div className="p-4 sm:p-6 md:p-8">
        <TeacherCoursesClient courses={list} categories={categories} />
      </div>
    </div>
  );
}
