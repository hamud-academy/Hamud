import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

async function getCourses() {
  return prisma.course.findMany({
    where: { published: true },
    include: {
      instructor: { select: { name: true } },
      category: { select: { name: true, slug: true } },
      _count: { select: { enrollments: true } },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });
}

function formatDuration(hours: number | null) {
  if (!hours) return "—";
  if (hours >= 24) return `${Math.round(hours / 24)} Weeks`;
  return `${hours}h`;
}

function formatStudents(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k Students`;
  return `${count} Students`;
}

export default async function PopularCourses() {
  const courses = await getCourses();

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
              Most Popular Courses
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm sm:text-base">
              Choose from the best courses welcomed by students.
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition text-sm sm:text-base shrink-0"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {courses.map((course) => {
            const thumb = course.thumbnail
              ? (resolveMediaUrl(course.thumbnail) ?? course.thumbnail)
              : null;
            return (
            <article
              key={course.id}
              className="group bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-lg hover:border-blue-100 dark:hover:border-blue-800 hover:shadow-md transition duration-200"
            >
              <Link href={`/courses/${course.slug}`} className="block">
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center overflow-hidden relative">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl text-blue-400 dark:text-blue-500 font-mono font-bold uppercase">
                      {course.category.slug.slice(0, 2)}
                    </span>
                  )}
                </div>
              </Link>
              <div className="p-4 sm:p-5">
                <span className="inline-block text-xs font-semibold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg">
                  {course.category.name.toUpperCase()}
                </span>
                <div className="flex gap-2 mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  <span>{formatDuration(Number(course.durationHours))}</span>
                  <span>•</span>
                  <span>{formatStudents(course._count.enrollments)}</span>
                </div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mt-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  <Link href={`/courses/${course.slug}`}>{course.title}</Link>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex-shrink-0" />
                  <span className="truncate">{course.instructor.name ?? "Unknown"}</span>
                </p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      ${Number(course.price).toFixed(2)}
                    </span>
                    {course.originalPrice && (
                      <span className="text-sm text-slate-400 dark:text-slate-500 line-through">
                        ${Number(course.originalPrice).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/40 transition flex-shrink-0"
                    aria-label="View course"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
            );
          })}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-16 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-300">Koorsooyin wali ma jiraan. Dhowr maalmood ka dib soo noqo.</p>
            <Link href="/courses" className="inline-block mt-4 text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Browse courses
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
