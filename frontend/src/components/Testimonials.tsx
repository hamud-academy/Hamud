"use client";

import { useState, useEffect } from "react";

type TestimonyItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  userName: string;
  userImage: string | null;
};

function StarRating() {
  return (
    <div className="flex justify-center gap-0.5 mb-4" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [items, setItems] = useState<TestimonyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/testimonies")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (items.length === 0) return null;

  const displayItems = items.slice(0, 3);

  return (
    <section className="py-14 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-900/40">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center mb-3">
          Testimonials from our Students
        </h2>
        <p className="text-slate-600 text-center text-sm sm:text-base max-w-xl mx-auto mb-10 sm:mb-12">
          Waxa ardaydeena naga sheegay faa&apos;iideyska ay ka helaan platform-ka.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {displayItems.map((t) => (
            <article
              key={t.id}
              className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-700 flex flex-col items-center text-center hover:shadow-md transition duration-200"
            >
              <div className="-mt-14 mb-3 flex justify-center">
                <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                  {t.userImage ? (
                    <img src={t.userImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl sm:text-3xl font-bold text-violet-600">
                      {t.userName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-0.5">
                {t.userName}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{t.title}</p>
              <StarRating />
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed text-left">
                &ldquo;{t.body}&rdquo;
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
