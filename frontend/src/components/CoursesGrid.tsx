import Link from "next/link";

interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  price: unknown;
  originalPrice: unknown;
  durationHours: unknown;
  category: { name: string; slug: string };
  instructor: { name: string | null };
  _count: { enrollments: number };
}

interface Props {
  courses: Course[];
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

function num(val: unknown): number {
  if (typeof val === "number") return val;
  if (val && typeof val === "object" && "toNumber" in val)
    return (val as { toNumber: () => number }).toNumber();
  return Number(val) || 0;
}

export default function CoursesGrid({ courses }: Props) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-20 px-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/50">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">Koorsooyin ma helin.</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">Isku day filter kale ama raadinta.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 min-[420px]:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {courses.map((course) => (
        <Link
          key={course.id}
          href={`/courses/${course.slug}`}
          className="group bg-white dark:bg-slate-900/70 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-700 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)] dark:shadow-slate-950/50 hover:shadow-[0_20px_40px_-12px_rgba(37,99,235,0.15)] hover:border-blue-200/60 dark:hover:border-blue-700/60 transition-all duration-300 block hover:-translate-y-1"
        >
          <div className="aspect-video bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center overflow-hidden relative">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
              />
            ) : (
              <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-blue-500 to-indigo-600 bg-clip-text text-transparent font-mono tracking-tight">
                {course.category.slug.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
          <div className="p-4 sm:p-5">
            <span className="inline-flex text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full border border-blue-100/80 dark:border-blue-900/50">
              {course.category.name}
            </span>
            <div className="flex gap-2 mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>{formatDuration(num(course.durationHours) || null)}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>{formatStudents(course._count.enrollments)}</span>
            </div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mt-2 line-clamp-2 leading-snug group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
              {course.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-600 dark:to-slate-700 border border-slate-200/80 dark:border-slate-600 flex-shrink-0" />
              <span className="truncate font-medium">{course.instructor.name ?? "Unknown"}</span>
            </p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                  ${num(course.price).toFixed(2)}
                </span>
                {num(course.originalPrice) > 0 && (
                  <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 line-through tabular-nums">
                    ${num(course.originalPrice).toFixed(2)}
                  </span>
                )}
              </div>
              <span className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-md shadow-blue-500/25 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-shadow">
                Daawo
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
