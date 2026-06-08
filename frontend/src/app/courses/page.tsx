import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import CoursesFilters from "@/components/CoursesFilters";
import CoursesGrid from "@/components/CoursesGrid";
import CoursesPageIntro from "@/components/CoursesPageIntro";
import CoursesPagination from "@/components/CoursesPagination";
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

  const [rawCourses, total, categories] = await Promise.all([
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

  const courses = rawCourses.map((course) => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    thumbnail: course.thumbnail,
    price: Number(course.price),
    originalPrice: course.originalPrice != null ? Number(course.originalPrice) : null,
    durationHours: course.durationHours != null ? Number(course.durationHours) : null,
    category: course.category,
    instructor: course.instructor,
    _count: course._count,
  }));

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <CoursesPageIntro total={pagination.total} />

          <Suspense fallback={<div className="mb-8 h-28 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />}>
            <CoursesFilters
              categories={categories}
              currentCategory={params.category}
              currentLevel={params.level}
              currentSearch={params.search}
            />
          </Suspense>

          <div className="mt-5 sm:mt-6">
            <CoursesGrid courses={courses} />

            <CoursesPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              prevHref={
                pagination.page > 1 ? buildUrl(params, { page: String(pagination.page - 1) }) : null
              }
              nextHref={
                pagination.page < pagination.totalPages
                  ? buildUrl(params, { page: String(pagination.page + 1) })
                  : null
              }
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
