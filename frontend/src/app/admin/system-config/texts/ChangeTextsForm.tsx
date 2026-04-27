"use client";

import { useState, useEffect } from "react";

export default function ChangeTextsForm() {
  const [heroTagline, setHeroTagline] = useState("");
  const [heroHeading, setHeroHeading] = useState("");
  const [heroHeadingHighlight, setHeroHeadingHighlight] = useState("");
  const [heroDescription, setHeroDescription] = useState("");
  const [heroStudentCountText, setHeroStudentCountText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/landing-config")
      .then((r) => r.json())
      .then((data) => {
        setHeroTagline(data.heroTagline ?? "");
        setHeroHeading(data.heroHeading ?? "");
        setHeroHeadingHighlight(data.heroHeadingHighlight ?? "");
        setHeroDescription(data.heroDescription ?? "");
        setHeroStudentCountText(data.heroStudentCountText ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/landing-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroTagline: heroTagline.trim(),
          heroHeading: heroHeading.trim(),
          heroHeadingHighlight: heroHeadingHighlight.trim(),
          heroDescription: heroDescription.trim(),
          heroStudentCountText: heroStudentCountText.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Failed to save" });
        return;
      }
      setMessage({ type: "ok", text: "Texts updated." });
    } catch {
      setMessage({ type: "err", text: "Connection error" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            message.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}
      <div>
        <label htmlFor="heroTagline" className="block text-sm font-medium text-slate-700 mb-1">Tagline (pill)</label>
        <input
          id="heroTagline"
          type="text"
          value={heroTagline}
          onChange={(e) => setHeroTagline(e.target.value)}
          placeholder="THE FUTURE OF SOMALI E-LEARNING"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
        />
      </div>
      <div>
        <label htmlFor="heroHeading" className="block text-sm font-medium text-slate-700 mb-1">Main heading</label>
        <input
          id="heroHeading"
          type="text"
          value={heroHeading}
          onChange={(e) => setHeroHeading(e.target.value)}
          placeholder="Learn quality knowledge, wherever you are"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
        />
      </div>
      <div>
        <label htmlFor="heroHeadingHighlight" className="block text-sm font-medium text-slate-700 mb-1">Heading part in blue (highlight)</label>
        <input
          id="heroHeadingHighlight"
          type="text"
          value={heroHeadingHighlight}
          onChange={(e) => setHeroHeadingHighlight(e.target.value)}
          placeholder="wherever"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
        />
      </div>
      <div>
        <label htmlFor="heroDescription" className="block text-sm font-medium text-slate-700 mb-1">Description paragraph</label>
        <textarea
          id="heroDescription"
          rows={3}
          value={heroDescription}
          onChange={(e) => setHeroDescription(e.target.value)}
          placeholder="Join thousands of students..."
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
        />
      </div>
      <div>
        <label htmlFor="heroStudentCountText" className="block text-sm font-medium text-slate-700 mb-1">Student count text</label>
        <input
          id="heroStudentCountText"
          type="text"
          value={heroStudentCountText}
          onChange={(e) => setHeroStudentCountText(e.target.value)}
          placeholder="Join 10,000+ active students"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition"
      >
        {saving ? "Saving…" : "Save Texts"}
      </button>
    </form>
  );
}
