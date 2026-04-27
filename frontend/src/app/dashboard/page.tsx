import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function startOfWeek(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatHours(minutes: number) {
  const hours = minutes / 60;
  if (hours >= 10) return `${Math.round(hours)}h`;
  if (hours >= 1) return `${Number(hours.toFixed(1))}h`;
  return `${minutes}m`;
}

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return null;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    select: { courseId: true, completed: true },
  });
  const enrolledCourseIds = enrollments.map((e) => e.courseId);
  const completedCount = enrollments.filter((enrollment) => enrollment.completed).length;

  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = addDays(weekStart, 7);
  const lessonCompletions = await prisma.lessonCompletion.findMany({
    where: { userId: user.id },
    select: {
      completedAt: true,
      lesson: { select: { duration: true } },
    },
  });

  const completedLessonCount = lessonCompletions.length;
  const totalStudyMinutes = lessonCompletions.reduce((sum, completion) => sum + (completion.lesson.duration ?? 0), 0);
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    return {
      label: date.toLocaleDateString("en", { weekday: "short" }).toUpperCase(),
      date,
      minutes: 0,
      lessons: 0,
    };
  });

  lessonCompletions.forEach((completion) => {
    if (completion.completedAt < weekStart || completion.completedAt >= weekEnd) return;
    const index = Math.floor((completion.completedAt.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000));
    const day = weekDays[index];
    if (!day) return;
    day.minutes += completion.lesson.duration ?? 0;
    day.lessons += 1;
  });

  const weeklyTotalLessons = weekDays.reduce((sum, day) => sum + day.lessons, 0);
  const weeklyTotalMinutes = weekDays.reduce((sum, day) => sum + day.minutes, 0);
  const maxActivity = Math.max(...weekDays.map((day) => day.minutes || day.lessons), 0);

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
  const certificatesCount = completedCount;

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-white via-violet-50/70 to-white p-5 sm:p-6 shadow-sm">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Student dashboard</p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              Welcome back, {firstName}
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Track your real learning progress and weekly study activity in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Stats: studied hours, completed courses, certificates */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white rounded-xl border border-violet-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
              </svg>
            </span>
            <p className="text-right text-xl sm:text-3xl font-bold text-slate-950">{formatHours(totalStudyMinutes)}</p>
          </div>
          <p className="mt-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">Time studied</p>
          <p className="mt-1 text-[11px] sm:text-xs text-slate-400">{completedLessonCount} lessons completed</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <p className="text-right text-xl sm:text-3xl font-bold text-slate-950">{completedCount}</p>
          </div>
          <p className="mt-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">Completed</p>
          <p className="mt-1 text-[11px] sm:text-xs text-slate-400">of {enrollments.length} enrolled courses</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </span>
            <p className="text-right text-xl sm:text-3xl font-bold text-slate-950">{certificatesCount}</p>
          </div>
          <p className="mt-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">Certificates</p>
          <p className="mt-1 text-[11px] sm:text-xs text-slate-400">earned from finished courses</p>
        </div>
      </div>

      {/* Activity Progress */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-950">Weekly learning activity</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {weeklyTotalLessons} lessons completed this week
              {weeklyTotalMinutes > 0 ? `, ${formatHours(weeklyTotalMinutes)} studied` : ""}
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-600">
            This week
            <span className="h-2 w-2 rounded-full bg-violet-500" />
          </div>
        </div>
        <div className="flex items-end justify-between gap-2 sm:gap-3 h-28 sm:h-32">
          {weekDays.map((day) => {
            const value = day.minutes || day.lessons;
            const pct = maxActivity ? (value / maxActivity) * 100 : 0;
            const isToday = day.date.toDateString() === now.toDateString();
            return (
              <div key={day.label} className="flex-1 flex h-full flex-col items-center justify-end gap-2">
                <div className="flex h-full w-full items-end rounded-full bg-slate-100 p-1">
                  <div
                    className={`w-full rounded-full transition-all ${isToday ? "bg-violet-600" : "bg-violet-300"}`}
                    title={`${day.lessons} lessons${day.minutes ? `, ${formatHours(day.minutes)}` : ""}`}
                    style={{ height: `${value ? Math.max(pct, 12) : 0}%` }}
                  />
                </div>
                <div className="text-center">
                  <span className={`block text-[10px] sm:text-xs font-semibold ${isToday ? "text-violet-600" : "text-slate-500"}`}>
                    {day.label}
                  </span>
                  <span className="block text-[10px] text-slate-400">{day.lessons}</span>
                </div>
              </div>
            );
          })}
        </div>
        {weeklyTotalLessons === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            No lessons completed this week yet. Continue a course to start building your activity graph.
          </div>
        )}
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
