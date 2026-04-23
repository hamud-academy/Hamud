import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import CoursesFilters from "@/components/CoursesFilters";
import CoursesGrid from "@/components/CoursesGrid";
import Footer from "@/components/Footer";

interface Props {
  searchParams: Promise<{ category?: string; level?: string; search?: string; page?: string }>;
}

function buildUrl(params: Record<string, string | undefined>, updates: Partial<Record<string, string>>) {
  const merged = { ...params, ...updates };
  const search = new URLSearchParams();
  Object.entries(merged).forEach(([k, v]) => {
    if (v) search.set(k, v);
  });
  const q = search.toString();
  return q ? `/courses?${q}` : "/courses";
}

async function getCourses(params: { category?: string; level?: string; search?: string; page?: string }) {
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const limit = 12;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { published: true };

  if (params.category) {
    where.category = { slug: params.category };
  }

  if (params.level && ["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(params.level)) {
    where.level = params.level;
  }

  if (params.search?.trim()) {
    where.OR = [
      { title: { contains: params.search.trim(), mode: "insensitive" } },
      { description: { contains: params.search.trim(), mode: "insensitive" } },
    ];
  }

  const [courses, total, categories] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        instructor: { select: { name: true } },
        category: { select: { name: true, slug: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.course.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { courses: true } } } }),
  ]);

  return {
    courses,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, coursesCount: c._count.courses })),
  };
}

export default async function CoursesPage({ searchParams }: Props) {
  const params = await searchParams;
  const { courses, pagination, categories } = await getCourses(params);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-14 sm:pt-16 bg-gradient-to-b from-slate-50 via-white to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600/90 dark:text-blue-400 mb-2">Catalog</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Available courses</h1>
              <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm sm:text-base max-w-xl leading-relaxed">
                Sharpen your skills with courses from expert instructors. Use the filters to narrow what you need.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center rounded-full bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" aria-hidden />
                {pagination.total} {pagination.total === 1 ? "result" : "results"}
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
            <aside className="lg:w-80 xl:w-72 flex-shrink-0">
              <Suspense fallback={<div className="animate-pulse h-64 bg-gray-100 rounded-lg" />}>
                <CoursesFilters
                  categories={categories}
                  currentCategory={params.category}
                  currentLevel={params.level}
                  currentSearch={params.search}
                />
              </Suspense>
            </aside>

            <div className="flex-1 min-w-0">
              <CoursesGrid courses={courses} />

              {pagination.totalPages > 1 && (
                <nav className="flex flex-wrap justify-center items-center gap-3 mt-10 sm:mt-12">
                  {pagination.page > 1 && (
                    <Link
                      href={buildUrl(params, { page: String(pagination.page - 1) })}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700 text-sm font-semibold shadow-sm transition"
                    >
                      ← Previous
                    </Link>
                  )}
                  <span className="px-4 py-2 text-slate-600 text-sm font-medium tabular-nums">
                    Page {pagination.page} / {pagination.totalPages}
                  </span>
                  {pagination.page < pagination.totalPages && (
                    <Link
                      href={buildUrl(params, { page: String(pagination.page + 1) })}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700 text-sm font-semibold shadow-sm transition"
                    >
                      Next →
                    </Link>
                  )}
                </nav>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
