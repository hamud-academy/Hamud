"use client";

import { useState, useEffect } from "react";

export default function ChangeNameForm() {
  const [siteName, setSiteName] = useState("");
  const [accentSuffix, setAccentSuffix] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/site-config")
      .then((r) => r.json())
      .then((data) => {
        setSiteName(data.siteName ?? "BaroSmart");
        setAccentSuffix(data.accentSuffix ?? "");
      })
      .catch(() => {
        setSiteName("BaroSmart");
        setAccentSuffix("");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName: siteName.trim() || "BaroSmart",
          accentSuffix: accentSuffix.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Failed to save" });
        return;
      }
      setMessage({ type: "ok", text: "Site name updated." });
    } catch {
      setMessage({ type: "err", text: "Connection error" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading...</p>;
  }

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
        <label htmlFor="siteName" className="block text-sm font-medium text-slate-700 mb-1">
          Site Name
        </label>
        <input
          id="siteName"
          type="text"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          placeholder="BaroSmart"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
        />
      </div>
      <div>
        <label htmlFor="accentSuffix" className="block text-sm font-medium text-slate-700 mb-1">
          Accent part (optional)
        </label>
        <input
          id="accentSuffix"
          type="text"
          value={accentSuffix}
          onChange={(e) => setAccentSuffix(e.target.value)}
          placeholder="e.g. Smart (shown in green)"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
        />
        <p className="text-xs text-slate-500 mt-1">Part of the name to show in accent color (e.g. Baro<strong>Smart</strong>).</p>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition"
      >
        {saving ? "Saving…" : "Save Name"}
      </button>
    </form>
  );
}
