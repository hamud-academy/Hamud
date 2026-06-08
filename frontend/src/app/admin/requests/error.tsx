"use client";

import Link from "next/link";

export default function AdminRequestsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="text-xl font-bold text-red-800">Could not load requests</h2>
        <p className="mt-2 text-sm text-red-700">
          The admin requests page failed to load. This usually means the site needs a fresh deploy
          with the latest database migrations.
        </p>
        <p className="mt-3 text-xs text-red-600/80 break-all">{error.message}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700"
          >
            Try again
          </button>
          <Link
            href="/admin"
            className="px-4 py-2 rounded-xl bg-white border border-red-200 text-red-700 text-sm font-medium hover:bg-red-100"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
