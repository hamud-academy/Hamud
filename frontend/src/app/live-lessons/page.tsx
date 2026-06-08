import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getLiveLessonsConfig } from "@/lib/live-lessons-config";

export const metadata = {
  title: "Live lessons - Hamud-Academy",
  description: "Join interactive live lessons with instructors.",
};

export const revalidate = 60;

export default async function LiveLessonsPage() {
  const liveLessonsConfig = await getLiveLessonsConfig();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/40 pt-20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
              <div className="rounded-3xl bg-blue-600 p-6 text-white">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
                  {liveLessonsConfig.classroomEyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-extrabold">{liveLessonsConfig.classroomTitle}</h2>
                <p className="mt-4 text-blue-50">
                  {liveLessonsConfig.classroomDescription}
                </p>
              </div>
              <div className="mt-5 grid gap-3">
                {liveLessonsConfig.classroomFeatures.map((item) => (
                  <div key={item} className="rounded-2xl bg-slate-50 p-4 font-semibold text-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
              {liveLessonsConfig.heroImageUrl ? (
                <>
                  <img
                    src={liveLessonsConfig.heroImageUrl}
                    alt="Live lessons"
                    className="h-72 w-full rounded-3xl object-cover sm:h-80"
                  />
                  <div className="mt-6">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                      {liveLessonsConfig.introEyebrow}
                    </p>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                      {liveLessonsConfig.introTitle}
                    </h1>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                    {liveLessonsConfig.introEyebrow}
                  </p>
                  <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                    {liveLessonsConfig.introTitle}
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                    {liveLessonsConfig.introDescription}
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={liveLessonsConfig.primaryButtonHref}
                      className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700"
                    >
                      {liveLessonsConfig.primaryButtonLabel}
                    </Link>
                    <Link
                      href={liveLessonsConfig.secondaryButtonHref}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      {liveLessonsConfig.secondaryButtonLabel}
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              {liveLessonsConfig.classesEyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              {liveLessonsConfig.classesTitle}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {liveLessonsConfig.classes.map((item) => (
              <article
                key={item.title}
                className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 transition hover:-translate-y-1 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20"
              >
                <div className="relative flex h-28 items-center justify-center bg-gradient-to-r from-blue-300 to-blue-500">
                  <div className="absolute inset-x-6 top-1/2 h-px bg-white/25" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white text-center shadow-xl">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-20 w-20 rounded-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-2xl font-black tracking-tight text-slate-900">{item.badge}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-5 p-6">
                  <h3 className="text-xl font-extrabold leading-tight text-slate-900 dark:text-white">
                    {item.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <span>{item.duration}</span>
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path d="M15 8.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 3 15.5v-7A2.5 2.5 0 0 1 5.5 6h7A2.5 2.5 0 0 1 15 8.5Zm1 2.25 4.2-2.8a.5.5 0 0 1 .8.42v7.26a.5.5 0 0 1-.8.42L16 13.25v-2.5Z" />
                      </svg>
                      {item.delivery}
                    </span>
                  </div>

                  <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    {item.features.map((feature) => (
                      <li key={feature} className="flex gap-3">
                        <span className="mt-0.5 text-red-600">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                    <li className="flex gap-3">
                      <span className="mt-0.5 text-slate-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </span>
                      <span>Limited spaces available</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-0.5 text-red-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 11h14M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
                        </svg>
                      </span>
                      <span>{item.date}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-0.5 text-red-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m6-2A10 10 0 1 1 2 12a10 10 0 0 1 20 0Z" />
                        </svg>
                      </span>
                      <span>{item.time}</span>
                    </li>
                  </ul>

                  <div className="flex items-end gap-3 pt-3">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{item.price}</span>
                    <span className="pb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{item.paymentText}</span>
                  </div>

                  <Link
                    href={item.buttonHref}
                    className="inline-flex rounded-xl bg-blue-600 px-7 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg transition hover:bg-blue-700"
                  >
                    {item.buttonLabel}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
