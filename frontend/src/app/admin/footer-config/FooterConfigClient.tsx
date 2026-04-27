"use client";

import { useEffect, useState } from "react";
import type { FooterConfig, FooterQuickLink, FooterSocialLink } from "@/lib/footer-config";
import SocialIcon, { SOCIAL_PLATFORM_OPTIONS, getSocialPlatformLabel } from "@/components/SocialIcon";

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function FooterConfigClient() {
  const [config, setConfig] = useState<FooterConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/footer-config")
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(() => setConfig(null));
  }, []);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/footer-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok) {
        setConfig(data);
        setMessage({ type: "ok", text: "Footer saved." });
      } else {
        setMessage({ type: "err", text: data.error || "Failed to save footer" });
      }
    } catch {
      setMessage({ type: "err", text: "Failed to save footer" });
    } finally {
      setSaving(false);
    }
  };

  const addQuickLink = () =>
    setConfig((c) => (c ? { ...c, quickLinks: [...c.quickLinks, { id: genId(), label: "", href: "" }] } : c));

  const removeQuickLink = (id: string) =>
    setConfig((c) => (c ? { ...c, quickLinks: c.quickLinks.filter((link) => link.id !== id) } : c));

  const updateQuickLink = (id: string, update: Partial<FooterQuickLink>) =>
    setConfig((c) =>
      c ? { ...c, quickLinks: c.quickLinks.map((link) => (link.id === id ? { ...link, ...update } : link)) } : c
    );

  const addSocialLink = () =>
    setConfig((c) => (c ? { ...c, socialLinks: [...c.socialLinks, { id: genId(), platform: "facebook", url: "" }] } : c));

  const removeSocialLink = (id: string) =>
    setConfig((c) => (c ? { ...c, socialLinks: c.socialLinks.filter((link) => link.id !== id) } : c));

  const updateSocialLink = (id: string, update: Partial<FooterSocialLink>) =>
    setConfig((c) =>
      c ? { ...c, socialLinks: c.socialLinks.map((link) => (link.id === id ? { ...link, ...update } : link)) } : c
    );

  if (!config) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Footer Config</h1>
        <p className="text-slate-600 mb-4">Manage the footer description, quick links, and copyright text.</p>
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
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Footer Description</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={config.showStudentCount}
              onChange={(e) => setConfig((c) => ({ ...c!, showStudentCount: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300"
            />
            Show active student count in footer
          </label>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Text when student count is hidden/unavailable</label>
            <textarea
              rows={3}
              value={config.description}
              onChange={(e) => setConfig((c) => ({ ...c!, description: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Text with student count</label>
            <textarea
              rows={3}
              value={config.studentCountDescription}
              onChange={(e) => setConfig((c) => ({ ...c!, studentCountDescription: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <p className="text-xs text-slate-500 mt-1">Use {"{studentCount}"} where the number should appear.</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Social media links</h2>
          <button
            type="button"
            onClick={addSocialLink}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg"
          >
            + Add
          </button>
        </div>
        <div className="space-y-3">
          {config.socialLinks.map((link) => (
            <div key={link.id} className="flex gap-2 items-center flex-wrap">
              <span className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <SocialIcon platform={link.platform} />
              </span>
              <select
                value={link.platform}
                onChange={(e) => updateSocialLink(link.id, { platform: e.target.value })}
                className="w-52 px-3 py-2 border border-slate-200 rounded-lg bg-white"
                aria-label="Choose footer social media icon"
              >
                {!SOCIAL_PLATFORM_OPTIONS.some((option) => option.value === link.platform) && (
                  <option value={link.platform}>{getSocialPlatformLabel(link.platform)}</option>
                )}
                {SOCIAL_PLATFORM_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                type="url"
                placeholder="URL"
                value={link.url}
                onChange={(e) => updateSocialLink(link.id, { url: e.target.value })}
                className="flex-1 min-w-[200px] px-3 py-2 border border-slate-200 rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeSocialLink(link.id)}
                className="text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                aria-label="Remove"
              >
                x
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Quick Links</h2>
          <button
            type="button"
            onClick={addQuickLink}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg"
          >
            + Add
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Section title</label>
            <input
              type="text"
              value={config.quickLinksTitle}
              onChange={(e) => setConfig((c) => ({ ...c!, quickLinksTitle: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="space-y-3">
            {config.quickLinks.map((link) => (
              <div key={link.id} className="flex gap-2 items-center flex-wrap">
                <input
                  type="text"
                  placeholder="Label (e.g. Courses)"
                  value={link.label}
                  onChange={(e) => updateQuickLink(link.id, { label: e.target.value })}
                  className="w-44 px-3 py-2 border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="URL (e.g. /courses)"
                  value={link.href}
                  onChange={(e) => updateQuickLink(link.id, { href: e.target.value })}
                  className="flex-1 min-w-[200px] px-3 py-2 border border-slate-200 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeQuickLink(link.id)}
                  className="text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                  aria-label="Remove"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Copyright</h2>
        <input
          type="text"
          value={config.copyrightText}
          onChange={(e) => setConfig((c) => ({ ...c!, copyrightText: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
        />
        <p className="text-xs text-slate-500 mt-1">Use {"{siteName}"} where the website name should appear.</p>
      </section>
    </div>
  );
}
