import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return null;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    select: { courseId: true },
  });
  const enrolledCourseIds = enrollments.map((e) => e.courseId);

  const recommended = await prisma.course.findMany({
    where: {
      published: true,
      id: enrolledCourseIds.length ? { notIn: enrolledCourseIds } : undefined,
    },
    take: 8,
    include: {
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const firstName = session?.user?.name?.split(/\s+/)[0] ?? "Student";
  const hoursStudied = 42;
  const completedCount = 12;
  const certificatesCount = 3;

  const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const activityData = [12, 18, 22, 48, 20, 15, 10];

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">
      {/* Welcome */}
      <div className="mb-2 sm:mb-0">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Ku soo dhawoow, {firstName}
        </h1>
        <p className="text-slate-600 text-sm mt-0.5">
          Maanta wax cusub baro oo horumari aqoontaada.
        </p>
      </div>

      {/* Stats: studied hours, completed courses, certificates */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white rounded-lg sm:rounded-xl border border-violet-200 p-3 sm:p-4 text-center">
          <p className="text-lg sm:text-2xl font-bold text-violet-600">{hoursStudied}h</p>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500 mt-0.5 sm:mt-1">Hours Studied</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl border border-emerald-200 p-3 sm:p-4 text-center">
          <p className="text-lg sm:text-2xl font-bold text-emerald-600">{completedCount}</p>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500 mt-0.5 sm:mt-1">Completed</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl border border-amber-200 p-3 sm:p-4 text-center">
          <p className="text-lg sm:text-2xl font-bold text-amber-600">{certificatesCount}</p>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500 mt-0.5 sm:mt-1">Certificates</p>
        </div>
      </div>

      {/* Activity Progress */}
      <section className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Activity Progress</h2>
          <div className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-600">
            This Week
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="flex items-end justify-between gap-1 sm:gap-2 h-20 sm:h-24">
          {weekDays.map((day, i) => {
            const max = Math.max(...activityData);
            const pct = max ? (activityData[i]! / max) * 100 : 0;
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-0.5 sm:gap-1">
                <div
                  className="w-full rounded-t transition-colors min-h-[4px]"
                  style={{
                    height: `${Math.max(pct, 6)}%`,
                    backgroundColor: day === "THU" ? "rgb(124 58 237)" : "rgb(196 181 253)",
                  }}
                />
                <span className="text-[10px] sm:text-xs font-medium text-slate-500">{day}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Other courses (website courses for student) */}
      <section>
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h2 className="flex items-center gap-1.5 text-base sm:text-lg font-bold text-slate-900">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Courses
          </h2>
          <Link href="/courses" className="text-xs sm:text-sm font-semibold text-violet-600 hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
          {recommended.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="bg-white rounded-lg sm:rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition group"
            >
              <div className="aspect-video relative bg-gradient-to-br from-slate-200 to-slate-300">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs sm:text-sm uppercase">
                    {course.category.name.slice(0, 2)}
                  </span>
                )}
              </div>
              <div className="p-2 sm:p-3">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase">{course.category.name}</p>
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base line-clamp-2 mt-0.5 group-hover:text-violet-600">{course.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">${Number(course.price).toFixed(2)}</p>
                {course.durationHours != null && (
                  <p className="text-[10px] sm:text-xs text-slate-400">{Number(course.durationHours)} Hours</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
