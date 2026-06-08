"use client";

import Link from "next/link";
import { useTranslation } from "@/components/LanguageProvider";

export default function SignUpPageContent() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen pt-14 sm:pt-16 flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 sm:p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("auth.signupTitle")}</h1>
          <p className="text-gray-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
            {t("auth.signupDescription")}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/courses"
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 text-center text-sm inline-flex items-center justify-center gap-2"
            >
              <span>{t("auth.viewCourses")}</span>
              <span className="rtl:rotate-180" aria-hidden>
                →
              </span>
            </Link>
            <Link
              href="/login"
              className="w-full py-3 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 text-center text-sm"
            >
              {t("auth.alreadyHaveAccountLogin")}
            </Link>
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 dark:text-slate-500 mt-4">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition">
            <span className="rtl:rotate-180" aria-hidden>
              ←
            </span>
            {t("auth.backToHome")}
          </Link>
        </p>
      </div>
    </main>
  );
}
