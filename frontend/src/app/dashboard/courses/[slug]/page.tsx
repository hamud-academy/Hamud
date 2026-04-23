import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function DashboardCoursePage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return null;

  const course = await prisma.course.findUnique({
    where: { slug, published: true },
    include: {
      instructor: { select: { name: true, image: true } },
      category: { select: { name: true, slug: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!course) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId: course.id },
    },
  });
  if (!enrollment) {
    notFound();
  }

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const price = Number(course.price);
  const originalPrice = course.originalPrice ? Number(course.originalPrice) : null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4">
        <Link
          href="/dashboard/courses"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-violet-600 transition"
        >
          ← Back to My Courses
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          <div className="aspect-video rounded-xl overflow-hidden bg-slate-800 mb-4">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-3xl font-bold">
                {course.category.slug.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-1 rounded">
            {course.category.name.toUpperCase()}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">{course.title}</h1>
          <p className="text-slate-600 mt-2 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
              {course.instructor.name?.[0] ?? "?"}
            </span>
            {course.instructor.name ?? "Instructor"}
          </p>
          {course.description && (
            <p className="mt-4 text-slate-600 text-sm whitespace-pre-wrap">{course.description}</p>
          )}

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Course curriculum</h2>
            {course.modules.length === 0 ? (
              <p className="text-slate-500 text-sm">Lessons not added yet.</p>
            ) : (
              <div className="space-y-3">
                {course.modules.map((mod, i) => (
                  <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="px-4 py-3 bg-slate-50 font-medium text-slate-900 text-sm">
                      Module {i + 1}: {mod.title}
                    </div>
                    <ul className="divide-y divide-slate-100">
                      {mod.lessons.map((lesson, j) => (
                        <li key={lesson.id}>
                          <Link
                            href={`/dashboard/courses/${slug}/lessons/${lesson.id}`}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-700 text-sm transition"
                          >
                            <span className="text-slate-400">{j + 1}</span>
                            <span>{lesson.title}</span>
                            {lesson.duration != null && (
                              <span className="text-slate-400 ml-auto">{lesson.duration} min</span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-24">
            <h3 className="font-bold text-slate-900">{course.title}</h3>
            <p className="text-slate-600 text-sm mt-1">{course.instructor.name ?? "Instructor"}</p>
            <p className="text-sm text-emerald-600 font-medium mt-2">You are enrolled</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900">${price.toFixed(2)}</span>
              {originalPrice != null && originalPrice > price && (
                <span className="text-sm text-slate-400 line-through">${originalPrice.toFixed(2)}</span>
              )}
            </div>
            <div className="mt-4 space-y-1.5 text-sm text-slate-600">
              <p>{course.modules.length} Modules</p>
              <p>{totalLessons} Lessons</p>
              <p>Course Certificate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
