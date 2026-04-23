"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type AdminCategoryRow = {
  id: string;
  name: string;
  slug: string;
  courseCount: number;
  createdAt: string;
};

export default function CategoriesAdminClient({ initialCategories }: { initialCategories: AdminCategoryRow[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setMessage({ type: "err", text: "Enter a category name." });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "Could not add category." });
        return;
      }
      setName("");
      setMessage({ type: "ok", text: "Category added." });
      setCategories((prev) => [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name)));
      router.refresh();
    } catch {
      setMessage({ type: "err", text: "Could not add category." });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCategory = async (row: AdminCategoryRow) => {
    const ok = window.confirm(`Delete “${row.name}”? This cannot be undone.`);
    if (!ok) return;
    setDeletingId(row.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/categories/${row.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "Could not delete." });
        return;
      }
      setMessage({ type: "ok", text: "Category deleted." });
      setCategories((prev) => prev.filter((c) => c.id !== row.id));
      router.refresh();
    } catch {
      setMessage({ type: "err", text: "Could not delete." });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 sm:p-6 md:p-8 max-w-5xl">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Most Popular Categories</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Manage and organize your top-performing categories.
          </p>
        </header>

        {message && (
          <p
            className={`mb-6 text-sm font-medium ${message.type === "ok" ? "text-emerald-600" : "text-red-600"}`}
            role="status"
          >
            {message.text}
          </p>
        )}

        <section className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5 sm:p-6 mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Add category</h2>
          <form onSubmit={addCategory} className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1 min-w-0">
              <label htmlFor="category-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Category name
              </label>
              <input
                id="category-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Data Science"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                maxLength={120}
                disabled={submitting}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {submitting ? "Adding…" : "Add category"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-200/80">
            <h2 className="text-lg font-bold text-slate-900">All categories</h2>
            <p className="text-sm text-slate-500 mt-1">{categories.length} total</p>
          </div>

          {categories.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No categories yet. Add one above.</div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-white/80">
                      <th className="px-5 sm:px-6 py-3 font-semibold text-slate-700">Name</th>
                      <th className="px-5 sm:px-6 py-3 font-semibold text-slate-700">Slug</th>
                      <th className="px-5 sm:px-6 py-3 font-semibold text-slate-700">Courses</th>
                      <th className="px-5 sm:px-6 py-3 font-semibold text-slate-700 w-[100px] text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((row) => (
                      <tr key={row.id} className="border-b border-slate-200/60 last:border-0 bg-white/50 hover:bg-white/90">
                        <td className="px-5 sm:px-6 py-4 font-medium text-slate-900">{row.name}</td>
                        <td className="px-5 sm:px-6 py-4 text-slate-600 font-mono text-xs">{row.slug}</td>
                        <td className="px-5 sm:px-6 py-4 text-slate-600">{row.courseCount}</td>
                        <td className="px-5 sm:px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => deleteCategory(row)}
                            disabled={deletingId === row.id}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                            aria-label={`Delete ${row.name}`}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="md:hidden divide-y divide-slate-200/80">
                {categories.map((row) => (
                  <li key={row.id} className="p-4 bg-white/50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{row.name}</p>
                        <p className="text-xs font-mono text-slate-500 mt-1 truncate">{row.slug}</p>
                        <p className="text-sm text-slate-600 mt-2">{row.courseCount} course(s)</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteCategory(row)}
                        disabled={deletingId === row.id}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
