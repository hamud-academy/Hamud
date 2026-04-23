"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LogoutConfirm() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/csrf");
        if (!res.ok) throw new Error("csrf");
        const data = (await res.json()) as { csrfToken?: string };
        if (!data.csrfToken) throw new Error("csrf");
        if (!cancelled) setCsrfToken(data.csrfToken);
      } catch {
        if (!cancelled) setError("Could not load sign-out form. Refresh the page and try again.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700 p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <span className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-600/20">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center tracking-tight">Sign out</h1>
        <p className="text-slate-600 dark:text-slate-300 text-center text-sm mt-2 leading-relaxed">
          Are you sure you want to sign out? You will need to sign in again to access your account.
        </p>

        {error && (
          <p className="mt-4 text-sm text-red-600 text-center" role="alert">
            {error}
          </p>
        )}

        {csrfToken ? (
          <form action="/api/auth/signout" method="POST" className="mt-8 space-y-3">
            <input type="hidden" name="csrfToken" value={csrfToken} />
            <input type="hidden" name="callbackUrl" value="/" />
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 active:bg-blue-800 transition shadow-sm"
            >
              Sign out
            </button>
            <Link
              href="/"
              className="flex w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </Link>
          </form>
        ) : !error ? (
          <div className="mt-8 space-y-3" aria-busy="true">
            <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>
        ) : null}
      </div>
      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
