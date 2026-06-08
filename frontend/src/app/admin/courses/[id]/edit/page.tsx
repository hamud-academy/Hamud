import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditCourseForm from "./EditCourseForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEditCoursePage({ params }: Props) {
  const { id } = await params;

  const [course, categories, instructors] = await Promise.all([
    prisma.course.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } }),
    prisma.user.findMany({
      where: { role: "INSTRUCTOR" },
      orderBy: [{ name: "asc" }, { email: "asc" }],
      select: { id: true, name: true, email: true },
    }),
  ]);

  if (!course) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
        <div className="mb-6">
          <Link href="/admin/courses" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
            ← Back to courses
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Edit course</h1>
          <p className="mt-1 text-slate-500">Update course details and assign a teacher. Changes are saved in the database.</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur">
          <EditCourseForm
            course={{
              id: course.id,
              title: course.title,
              slug: course.slug,
              description: course.description,
              thumbnail: course.thumbnail,
              price: Number(course.price),
              originalPrice: course.originalPrice != null ? Number(course.originalPrice) : null,
              level: course.level,
              language: course.language ?? "so",
              durationHours: course.durationHours != null ? Number(course.durationHours) : null,
              published: course.published,
              categoryId: course.categoryId,
              instructorId: course.instructorId,
            }}
            categories={categories}
            instructors={instructors}
          />
        </div>
      </div>
    </div>
  );
}
