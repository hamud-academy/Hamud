"use client";

import { useState, useEffect, useRef } from "react";

export default function ChangeLogoForm() {
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/site-config")
      .then((r) => r.json())
      .then((data) => {
        setLogoUrl(data.logoUrl ?? "");
      })
      .catch(() => setLogoUrl(""))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setMessage({ type: "err", text: "Please select an image to upload." });
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/admin/site-config/logo/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setMessage({ type: "err", text: uploadData.error ?? "Upload failed" });
        return;
      }
      const res = await fetch("/api/admin/site-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: uploadData.url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Failed to save" });
        return;
      }
      setLogoUrl(data.logoUrl ?? uploadData.url);
      setMessage({ type: "ok", text: "Logo updated." });
      fileInputRef.current!.value = "";
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
      {logoUrl && (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Current logo</p>
          <img
            src={logoUrl}
            alt="Site logo"
            className="h-16 object-contain object-left"
          />
        </div>
      )}
      <div>
        <label htmlFor="logoFile" className="block text-sm font-medium text-slate-700 mb-1">
          Upload logo
        </label>
        <input
          ref={fileInputRef}
          id="logoFile"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.gif,.svg,image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
        />
        <p className="text-xs text-slate-500 mt-1">JPEG, PNG, WebP, GIF or SVG. Max 200MB.</p>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition"
      >
        {saving ? "Uploading…" : "Save Logo"}
      </button>
    </form>
  );
}
