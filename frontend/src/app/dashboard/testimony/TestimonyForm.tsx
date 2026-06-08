"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/components/LanguageProvider";
import { localeToBcp47 } from "@/lib/i18n/format";

type TestimonyItem = { id: string; title: string; body: string; createdAt: string };

export default function TestimonyForm() {
  const { t, locale } = useTranslation();
  const [list, setList] = useState<TestimonyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const fetchList = () => {
    fetch("/api/dashboard/testimonies")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setList(data);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const titleTrim = title.trim();
    const bodyTrim = body.trim();
    if (!titleTrim) {
      setMessage({ type: "err", text: t("student.titleRequired") });
      return;
    }
    if (!bodyTrim) {
      setMessage({ type: "err", text: t("student.writeTestimony") });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    fetch("/api/dashboard/testimonies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: titleTrim, body: bodyTrim }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          setMessage({
            type: "err",
            text: (data && data.error) || t("student.requestFailed", { status: r.status }),
          });
          return;
        }
        if (data && data.error) {
          setMessage({ type: "err", text: data.error });
          return;
        }
        setMessage({ type: "ok", text: t("student.testimonySaved") });
        setTitle("");
        setBody("");
        fetchList();
      })
      .catch(() => setMessage({ type: "err", text: t("student.networkError") }))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link href="/dashboard" className="text-sm text-slate-600 hover:text-violet-600">
          {t("student.backToDashboard")}
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{t("student.testimonyTitle")}</h1>
        <p className="text-slate-600 mb-6">{t("student.testimonySubtitle")}</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          {message && (
            <p
              className={`text-sm px-4 py-2 rounded-xl ${
                message.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </p>
          )}
          <div>
            <label htmlFor="testimony-title" className="block text-sm font-medium text-slate-700 mb-1">
              {t("student.titleLabel")}
            </label>
            <input
              id="testimony-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("student.titlePlaceholder")}
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
            />
            <p className="text-xs text-slate-500 mt-1">{title.length}/200</p>
          </div>
          <div>
            <label htmlFor="testimony-body" className="block text-sm font-medium text-slate-700 mb-1">
              {t("student.yourTestimony")}
            </label>
            <textarea
              id="testimony-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("student.testimonyPlaceholder")}
              rows={5}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-y min-h-[120px]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 disabled:opacity-50 transition"
          >
            {submitting ? t("student.saving") : t("student.saveTestimony")}
          </button>
        </form>
      </div>

      {list.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">{t("student.yourTestimonies")}</h2>
          <ul className="space-y-4">
            {list.map((item) => (
              <li key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-slate-600 text-sm whitespace-pre-wrap">{item.body}</p>
                <p className="text-xs text-slate-400 mt-2">
                  {new Date(item.createdAt).toLocaleDateString(localeToBcp47(locale))}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && list.length === 0 && (
        <p className="text-slate-500 text-sm">{t("student.noTestimonyYet")}</p>
      )}
    </div>
  );
}
