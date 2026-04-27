import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default async function AchievementsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/achievements");
  }

  const user = session.user as { id?: string; role?: string };
  if (user.role === "ADMIN" || user.role === "INSTRUCTOR") {
    redirect("/admin");
  }

  const completedEnrollments = await prisma.enrollment.findMany({
    where: { userId: user.id, completed: true },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
          category: { select: { name: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-slate-600 hover:text-violet-600 transition"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">Achievements</h1>
      <p className="text-slate-600 text-sm mb-8">Koorsoyinka aad dhameysatay iyo shahaadoyinka aad heshay.</p>

      {/* Completed courses */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          Completed courses
        </h2>
        {completedEnrollments.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <p className="text-slate-500 text-sm">No completed courses yet. Finish a course to see it here.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {completedEnrollments.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/dashboard/courses/${e.course.slug}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-violet-200 hover:shadow-sm transition"
                >
                  <div className="w-14 h-14 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {e.course.thumbnail ? (
                      <img src={e.course.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-400 font-bold text-sm">
                        {e.course.category.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">{e.course.title}</p>
                    <p className="text-xs text-slate-500">{e.course.category.name}</p>
                  </div>
                  <span className="flex-shrink-0 text-emerald-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Certificates (one per completed course) */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </span>
          Certificates
        </h2>
        {completedEnrollments.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <p className="text-slate-500 text-sm">Complete courses to earn certificates.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {completedEnrollments.map((e) => (
              <div
                key={e.id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Course certificate</p>
                  <p className="font-semibold text-slate-900 mt-0.5 line-clamp-2">{e.course.title}</p>
                  <p className="text-xs text-slate-500 mt-1">Issued {formatDate(e.updatedAt)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/api/certificates/${e.id}`}
                      className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-600"
                    >
                      Download certificate
                    </Link>
                    <Link
                      href={`/api/certificates/${e.id}?preview=1`}
                      target="_blank"
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Preview
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
