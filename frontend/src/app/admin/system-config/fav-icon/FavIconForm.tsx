"use client";

import { useState, useEffect, useRef } from "react";

export default function FavIconForm() {
  const [faviconUrl, setFaviconUrl] = useState("");
  const [tabTitle, setTabTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/site-config")
      .then((r) => r.json())
      .then((data) => {
        setFaviconUrl(data.faviconUrl ?? "");
        setTabTitle(data.tabTitle ?? "");
      })
      .catch(() => {
        setFaviconUrl("");
        setTabTitle("");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const file = fileInputRef.current?.files?.[0];
    setSaving(true);
    try {
      let nextFaviconUrl = faviconUrl;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/admin/site-config/favicon/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          setMessage({ type: "err", text: uploadData.error ?? "Upload failed" });
          return;
        }
        nextFaviconUrl = uploadData.url;
      }

      const res = await fetch("/api/admin/site-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          faviconUrl: nextFaviconUrl,
          tabTitle: tabTitle.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Failed to save" });
        return;
      }
      setFaviconUrl(data.faviconUrl ?? nextFaviconUrl);
      setTabTitle(data.tabTitle ?? tabTitle.trim());
      setMessage({ type: "ok", text: "Favicon and tab title saved." });
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        <label htmlFor="tabTitle" className="block text-sm font-medium text-slate-700 mb-1">
          Browser tab title
        </label>
        <input
          id="tabTitle"
          type="text"
          value={tabTitle}
          onChange={(e) => setTabTitle(e.target.value)}
          placeholder="e.g. BaroSmart"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        <p className="text-xs text-slate-500 mt-1">Shown in the browser tab next to the favicon.</p>
      </div>
      {faviconUrl && (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Current favicon</p>
          <div className="flex items-center gap-3">
            <img src={faviconUrl} alt="" className="h-10 w-10 object-contain" />
            <span className="text-xs text-slate-500 break-all">{faviconUrl}</span>
          </div>
        </div>
      )}
      <div>
        <label htmlFor="faviconFile" className="block text-sm font-medium text-slate-700 mb-1">
          Upload favicon
        </label>
        <input
          ref={fileInputRef}
          id="faviconFile"
          type="file"
          accept=".ico,.jpg,.JPG,.jpeg,.JPEG,.png,.webp,.gif,.svg,image/x-icon,image/vnd.microsoft.icon,image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
        />
        <p className="text-xs text-slate-500 mt-1">
          ICO, PNG, SVG, JPEG, jpg, JPG, WebP, GIF. Max 200MB.
        </p>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
