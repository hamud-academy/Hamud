"use client";

import { useState, useEffect, useRef } from "react";
import type { AboutConfig } from "@/lib/about-config";

export default function AboutConfigClient() {
  const [config, setConfig] = useState<AboutConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/about-config")
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(() => setConfig(null));
  }, []);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/about-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok) {
        setConfig(data);
        setMessage({ type: "ok", text: "Saved." });
      } else {
        setMessage({ type: "err", text: data.error || "Failed to save" });
      }
    } catch {
      setMessage({ type: "err", text: "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const uploadHero = async () => {
    const file = heroFileRef.current?.files?.[0];
    if (!file) {
      setMessage({ type: "err", text: "Please select an image." });
      return;
    }
    setMessage(null);
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/admin/about-config/hero/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setMessage({ type: "err", text: uploadData.error ?? "Upload failed" });
        return;
      }
      setConfig((c) => (c ? { ...c, heroBackgroundImageUrl: uploadData.url } : c));
      setMessage({ type: "ok", text: "Hero image uploaded. Click Save to apply." });
      if (heroFileRef.current) heroFileRef.current.value = "";
    } catch {
      setMessage({ type: "err", text: "Upload failed" });
    } finally {
      setSaving(false);
    }
  };

  const updateFeature = (index: number, field: "title" | "description", value: string) => {
    setConfig((c) => {
      if (!c) return c;
      const next = [...c.features];
      if (!next[index]) return c;
      next[index] = { ...next[index], [field]: value };
      return { ...c, features: next };
    });
  };

  if (!config) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">About Config</h1>
        <p className="text-slate-600 mb-4">
          Edit About page content and hero background image. Changes appear on the public About page.
        </p>
        {message && (
          <p className={`mb-4 text-sm ${message.type === "ok" ? "text-emerald-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      {/* Hero section */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Hero section</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tagline (e.g. Transforming Education)</label>
            <input
              type="text"
              value={config.heroTagline}
              onChange={(e) => setConfig((c) => (c ? { ...c, heroTagline: e.target.value } : c))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Heading</label>
            <input
              type="text"
              value={config.heroHeading}
              onChange={(e) => setConfig((c) => (c ? { ...c, heroHeading: e.target.value } : c))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={config.heroDescription}
              onChange={(e) => setConfig((c) => (c ? { ...c, heroDescription: e.target.value } : c))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hero background image</label>
            {config.heroBackgroundImageUrl && (
              <div className="mb-2">
                <img
                  src={config.heroBackgroundImageUrl}
                  alt="Hero background"
                  className="max-h-32 w-full object-cover rounded-lg border border-slate-200"
                />
                <p className="text-xs text-slate-500 mt-1">Current image. Upload a new one to replace.</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2 items-end">
              <input
                ref={heroFileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
                className="block text-sm text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:font-medium file:text-emerald-700"
              />
              <button
                type="button"
                onClick={uploadHero}
                disabled={saving}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 disabled:opacity-50 text-sm"
              >
                Upload image
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">JPEG, PNG, WebP or GIF. Max 10MB. Leave empty to use default teal background.</p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Our Mission</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={config.missionTitle}
              onChange={(e) => setConfig((c) => (c ? { ...c, missionTitle: e.target.value } : c))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Text</label>
            <textarea
              rows={3}
              value={config.missionText}
              onChange={(e) => setConfig((c) => (c ? { ...c, missionText: e.target.value } : c))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Our Vision</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={config.visionTitle}
              onChange={(e) => setConfig((c) => (c ? { ...c, visionTitle: e.target.value } : c))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Text</label>
            <textarea
              rows={3}
              value={config.visionText}
              onChange={(e) => setConfig((c) => (c ? { ...c, visionText: e.target.value } : c))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Why Choose Us</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Section title</label>
            <input
              type="text"
              value={config.whyChooseUsTitle}
              onChange={(e) => setConfig((c) => (c ? { ...c, whyChooseUsTitle: e.target.value } : c))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Intro paragraph</label>
            <textarea
              rows={2}
              value={config.whyChooseUsIntro}
              onChange={(e) => setConfig((c) => (c ? { ...c, whyChooseUsIntro: e.target.value } : c))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Features (3 cards) */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Feature cards (3)</h2>
        <div className="space-y-4">
          {config.features.map((f, i) => (
            <div key={i} className="border border-slate-100 rounded-lg p-3 space-y-2">
              <span className="text-sm font-medium text-slate-500">Card {i + 1}</span>
              <input
                type="text"
                placeholder="Title"
                value={f.title}
                onChange={(e) => updateFeature(i, "title", e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
              <textarea
                rows={2}
                placeholder="Description"
                value={f.description}
                onChange={(e) => updateFeature(i, "description", e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Bottom button</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Button label</label>
            <input
              type="text"
              value={config.ctaLabel}
              onChange={(e) => setConfig((c) => (c ? { ...c, ctaLabel: e.target.value } : c))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Button link (e.g. /courses)</label>
            <input
              type="text"
              value={config.ctaHref}
              onChange={(e) => setConfig((c) => (c ? { ...c, ctaHref: e.target.value } : c))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
        </div>
      </section>

      <div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
