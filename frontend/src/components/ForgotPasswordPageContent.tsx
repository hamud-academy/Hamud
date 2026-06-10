"use client";

import Link from "next/link";
import { Suspense } from "react";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import { useTranslation } from "@/components/LanguageProvider";

export default function ForgotPasswordPageContent() {
  const { t } = useTranslation();

  return (
    <main className="relative min-h-screen overflow-hidden pt-14 sm:pt-16">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900" />
      <div className="pointer-events-none absolute -top-24 end-0 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-500/10" />
      <div className="pointer-events-none absolute bottom-0 start-0 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/10" />

      <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/90 dark:shadow-black/30">
            <div className="border-b border-slate-100 px-6 py-6 text-center dark:border-slate-800 sm:px-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                {t("auth.forgotPassword")}
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                {t("auth.forgotPasswordTitle")}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {t("auth.forgotPasswordSubtitle")}
              </p>
            </div>

            <div className="px-6 py-6 sm:px-8 sm:py-7">
              <Suspense
                fallback={<div className="h-56 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />}
              >
                <ForgotPasswordForm />
              </Suspense>

              <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                <Link
                  href="/login"
                  className="font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {t("auth.forgotBackToSignIn")}
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-500">
            <Link href="/" className="inline-flex items-center gap-1 transition hover:text-blue-600 dark:hover:text-blue-400">
              <span className="rtl:rotate-180" aria-hidden>
                ←
              </span>
              {t("auth.backToHome")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
