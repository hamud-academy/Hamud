import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import EnrollButton from "@/components/EnrollButton";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const course = await prisma.course.findUnique({
    where: { slug, published: true },
    include: {
      instructor: { select: { id: true, name: true, image: true } },
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

  const userId = (session?.user as { id?: string })?.id;
  let isEnrolled = false;
  if (userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId: course.id },
      },
    });
    isEnrolled = !!enrollment;
  }

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const price = Number(course.price);
  const originalPrice = course.originalPrice ? Number(course.originalPrice) : null;

  return (
    <>
      <Header />
      <main className="min-h-screen pt-14 sm:pt-16 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 transition"
            >
              ← Back to courses
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-900 mb-6">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-4xl font-bold">
                    {course.category.slug.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-1 rounded">
                {course.category.name.toUpperCase()}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 mt-2">{course.title}</h1>
              <p className="text-gray-600 dark:text-slate-400 mt-2 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-slate-300">
                  {course.instructor.name?.[0] ?? "?"}
                </span>
                {course.instructor.name ?? "Instructor"}
              </p>
              {course.description && (
                <div className="mt-6 prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-slate-400 whitespace-pre-wrap">{course.description}</p>
                </div>
              )}

              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Course curriculum</h2>
                {course.modules.length === 0 ? (
                  <p className="text-gray-500 dark:text-slate-400">Lessons not added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {course.modules.map((mod, i) => (
                      <div key={mod.id} className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                        <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800 font-medium text-gray-900 dark:text-slate-100">
                          Module {i + 1}: {mod.title}
                        </div>
                        <ul className="divide-y divide-gray-100 dark:divide-slate-800">
                          {mod.lessons.map((lesson, j) => (
                            <li key={lesson.id}>
                              {isEnrolled ? (
                                <Link
                                  href={`/courses/${slug}/lessons/${lesson.id}`}
                                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/60"
                                >
                                  <span className="text-gray-400 dark:text-slate-500 text-sm">{j + 1}</span>
                                  <span className="text-gray-700 dark:text-slate-300">{lesson.title}</span>
                                  {lesson.duration && (
                                    <span className="text-gray-400 dark:text-slate-500 text-sm ml-auto">
                                      {lesson.duration} min
                                    </span>
                                  )}
                                </Link>
                              ) : (
                                <div className="flex items-center gap-3 px-4 py-3 text-gray-400 dark:text-slate-500">
                                  <span className="text-sm">{j + 1}</span>
                                  <span>{lesson.title}</span>
                                  {lesson.duration && (
                                    <span className="text-sm ml-auto">{lesson.duration} min</span>
                                  )}
                                </div>
                              )}
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
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6 sticky top-24 shadow-sm dark:shadow-slate-950/50">
                <h3 className="font-bold text-gray-900 dark:text-slate-100 text-lg">{course.title}</h3>
                <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">{course.instructor.name ?? "Instructor"}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                  {isEnrolled ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">You are enrolled</span>
                  ) : (
                    "Not Enrolled"
                  )}
                </p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-900 dark:text-slate-100">${price.toFixed(2)}</span>
                  {originalPrice && originalPrice > price && (
                    <span className="text-sm text-gray-400 dark:text-slate-500 line-through">
                      ${originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-slate-400">
                  <p>{course.modules.length} Modules</p>
                  <p>{totalLessons} Lessons</p>
                  <p>Course Certificate</p>
                </div>
                <div className="mt-6">
                  <EnrollButton
                    courseId={course.id}
                    slug={slug}
                    isLoggedIn={!!session?.user}
                    isEnrolled={isEnrolled}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
