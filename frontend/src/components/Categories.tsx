import Link from "next/link";
import { prisma } from "@/lib/prisma";

const slugToIcon: Record<string, { icon: React.ReactNode; color: string }> = {
  coding: {
    color: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  design: {
    color: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  business: {
    color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  languages: {
    color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
  },
  photography: {
    color: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4" />
      </svg>
    ),
  },
};

const defaultIcon = {
  color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
};

function getIcon(slug: string) {
  const key = slug.toLowerCase();
  return slugToIcon[key] ?? defaultIcon;
}

export default async function Categories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { courses: true } } },
  });

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-900/40">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
              Most Popular Categories
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm sm:text-base max-w-xl">
              Explore the categories we offer to start learning the skills suitable for your future.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const { icon, color } = getIcon(cat.slug);
            const count = cat._count.courses;
            return (
              <Link
                key={cat.id}
                href={`/courses?category=${encodeURIComponent(cat.slug)}`}
                className="group flex flex-col p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition duration-200"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  {icon}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {cat.name}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  {count}+ Koorso
                </p>
              </Link>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { name: "Coding", slug: "coding" },
              { name: "Design", slug: "design" },
              { name: "Business", slug: "business" },
              { name: "Languages", slug: "languages" },
              { name: "Photography", slug: "photography" },
            ].map((cat) => {
              const { icon, color } = getIcon(cat.slug);
              return (
                <Link
                  key={cat.slug}
                  href="/courses"
                  className="flex flex-col p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition duration-200"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                    {icon}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">{cat.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">0+ Koorso</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
