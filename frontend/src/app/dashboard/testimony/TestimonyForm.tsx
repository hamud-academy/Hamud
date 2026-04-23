"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type TestimonyItem = { id: string; title: string; body: string; createdAt: string };

export default function TestimonyForm() {
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
    const t = title.trim();
    const b = body.trim();
    if (!t) {
      setMessage({ type: "err", text: "Title is required." });
      return;
    }
    if (!b) {
      setMessage({ type: "err", text: "Please write your testimony." });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    fetch("/api/dashboard/testimonies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t, body: b }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          setMessage({ type: "err", text: (data && data.error) || `Request failed (${r.status}). Try again.` });
          return;
        }
        if (data && data.error) {
          setMessage({ type: "err", text: data.error });
          return;
        }
        setMessage({ type: "ok", text: "Testimony saved." });
        setTitle("");
        setBody("");
        fetchList();
      })
      .catch(() => setMessage({ type: "err", text: "Network error. Check your connection and try again." }))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link href="/dashboard" className="text-sm text-slate-600 hover:text-violet-600">
          ← Back to Dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Testimony</h1>
        <p className="text-slate-600 mb-6">
          Share what you have benefited from this website. Your title and testimony will be saved.
        </p>

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
              Title
            </label>
            <input
              id="testimony-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Full Stack Developer, IT specialist, Student ..."
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
            />
            <p className="text-xs text-slate-500 mt-1">{title.length}/200</p>
          </div>
          <div>
            <label htmlFor="testimony-body" className="block text-sm font-medium text-slate-700 mb-1">
              Your testimony
            </label>
            <textarea
              id="testimony-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write what you have benefited from the website..."
              rows={5}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-y min-h-[120px]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 disabled:opacity-50 transition"
          >
            {submitting ? "Saving…" : "Save testimony"}
          </button>
        </form>
      </div>

      {list.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Your testimonies</h2>
          <ul className="space-y-4">
            {list.map((item) => (
              <li
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm"
              >
                <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-slate-600 text-sm whitespace-pre-wrap">{item.body}</p>
                <p className="text-xs text-slate-400 mt-2">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && list.length === 0 && (
        <p className="text-slate-500 text-sm">You haven’t submitted any testimony yet. Use the form above to add one.</p>
      )}
    </div>
  );
}
