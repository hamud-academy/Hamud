"use client";

import { useState, useEffect } from "react";
import type { ContactConfig, ContactPhone, ContactEmail, ContactHeadOffice, ContactSocialLink } from "@/lib/contact-config";
import SocialIcon, { SOCIAL_PLATFORM_OPTIONS, getSocialPlatformLabel } from "@/components/SocialIcon";

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function ContactConfigClient() {
  const [config, setConfig] = useState<ContactConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/contact-config")
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(() => setConfig(null));
  }, []);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/contact-config", {
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

  if (!config) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  const addPhone = () =>
    setConfig((c) => ({ ...c!, phones: [...c!.phones, { id: genId(), number: "", callbackLabel: "Request a callback" }] }));
  const removePhone = (id: string) => setConfig((c) => ({ ...c!, phones: c!.phones.filter((p) => p.id !== id) }));
  const updatePhone = (id: string, upd: Partial<ContactPhone>) =>
    setConfig((c) => ({ ...c!, phones: c!.phones.map((p) => (p.id === id ? { ...p, ...upd } : p)) }));

  const addEmail = () =>
    setConfig((c) => ({ ...c!, emails: [...c!.emails, { id: genId(), address: "", messageLabel: "Send us a message" }] }));
  const removeEmail = (id: string) => setConfig((c) => ({ ...c!, emails: c!.emails.filter((e) => e.id !== id) }));
  const updateEmail = (id: string, upd: Partial<ContactEmail>) =>
    setConfig((c) => ({ ...c!, emails: c!.emails.map((e) => (e.id === id ? { ...e, ...upd } : e)) }));

  const addHeadOffice = () =>
    setConfig((c) => ({ ...c!, headOffices: [...c!.headOffices, { id: genId(), text: "" }] }));
  const removeHeadOffice = (id: string) => setConfig((c) => ({ ...c!, headOffices: c!.headOffices.filter((h) => h.id !== id) }));
  const updateHeadOffice = (id: string, text: string) =>
    setConfig((c) => ({ ...c!, headOffices: c!.headOffices.map((h) => (h.id === id ? { ...h, text } : h)) }));

  const addSocial = () =>
    setConfig((c) => ({ ...c!, socialLinks: [...c!.socialLinks, { id: genId(), platform: "facebook", url: "" }] }));
  const removeSocial = (id: string) => setConfig((c) => ({ ...c!, socialLinks: c!.socialLinks.filter((s) => s.id !== id) }));
  const updateSocial = (id: string, upd: Partial<ContactSocialLink>) =>
    setConfig((c) => ({ ...c!, socialLinks: c!.socialLinks.map((s) => (s.id === id ? { ...s, ...upd } : s)) }));

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Contact Config</h1>
        <p className="text-slate-600 mb-4">Edit contact page: phone, email, head office, social links, and our location.</p>
        {message && (
          <p className={`mb-4 text-sm ${message.type === "ok" ? "text-emerald-600" : "text-red-600"}`}>{message.text}</p>
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

      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Get in Touch (title & description)</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={config.getInTouchTitle}
              onChange={(e) => setConfig((c) => ({ ...c!, getInTouchTitle: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={config.getInTouchDescription}
              onChange={(e) => setConfig((c) => ({ ...c!, getInTouchDescription: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Phone</h2>
          <button
            type="button"
            onClick={addPhone}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg"
          >
            + Add
          </button>
        </div>
        <div className="space-y-3">
          {config.phones.map((p) => (
            <div key={p.id} className="flex gap-2 items-start flex-wrap">
              <input
                type="text"
                placeholder="Number (e.g. +252 61 507 9785)"
                value={p.number}
                onChange={(e) => updatePhone(p.id, { number: e.target.value })}
                className="flex-1 min-w-[180px] px-3 py-2 border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="Link label (e.g. Request a callback)"
                value={p.callbackLabel}
                onChange={(e) => updatePhone(p.id, { callbackLabel: e.target.value })}
                className="flex-1 min-w-[160px] px-3 py-2 border border-slate-200 rounded-lg"
              />
              <button type="button" onClick={() => removePhone(p.id)} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded" aria-label="Remove">×</button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Email</h2>
          <button
            type="button"
            onClick={addEmail}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg"
          >
            + Add
          </button>
        </div>
        <div className="space-y-3">
          {config.emails.map((e) => (
            <div key={e.id} className="flex gap-2 items-start flex-wrap">
              <input
                type="text"
                placeholder="Email address"
                value={e.address}
                onChange={(ev) => updateEmail(e.id, { address: ev.target.value })}
                className="flex-1 min-w-[180px] px-3 py-2 border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="Link label (e.g. Send us a message)"
                value={e.messageLabel}
                onChange={(ev) => updateEmail(e.id, { messageLabel: ev.target.value })}
                className="flex-1 min-w-[160px] px-3 py-2 border border-slate-200 rounded-lg"
              />
              <button type="button" onClick={() => removeEmail(e.id)} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded" aria-label="Remove">×</button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Head Office</h2>
          <button
            type="button"
            onClick={addHeadOffice}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg"
          >
            + Add
          </button>
        </div>
        <div className="space-y-3">
          {config.headOffices.map((h) => (
            <div key={h.id} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Address (e.g. Hargeisa, Somaliland)"
                value={h.text}
                onChange={(e) => updateHeadOffice(h.id, e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
              />
              <button type="button" onClick={() => removeHeadOffice(h.id)} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded" aria-label="Remove">×</button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Social media links</h2>
          <button
            type="button"
            onClick={addSocial}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg"
          >
            + Add
          </button>
        </div>
        <div className="space-y-3">
          {config.socialLinks.map((s) => (
            <div key={s.id} className="flex gap-2 items-center flex-wrap">
              <span className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <SocialIcon platform={s.platform} />
              </span>
              <select
                value={s.platform}
                onChange={(e) => updateSocial(s.id, { platform: e.target.value })}
                className="w-52 px-3 py-2 border border-slate-200 rounded-lg bg-white"
                aria-label="Choose social media icon"
              >
                {!SOCIAL_PLATFORM_OPTIONS.some((option) => option.value === s.platform) && (
                  <option value={s.platform}>{getSocialPlatformLabel(s.platform)}</option>
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
                value={s.url}
                onChange={(e) => updateSocial(s.id, { url: e.target.value })}
                className="flex-1 min-w-[200px] px-3 py-2 border border-slate-200 rounded-lg"
              />
              <button type="button" onClick={() => removeSocial(s.id)} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded" aria-label="Remove">×</button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Our Location</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={config.ourLocation.title}
              onChange={(e) => setConfig((c) => ({ ...c!, ourLocation: { ...c!.ourLocation, title: e.target.value } }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={config.ourLocation.description}
              onChange={(e) => setConfig((c) => ({ ...c!, ourLocation: { ...c!.ourLocation, description: e.target.value } }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Map embed code</label>
            <textarea
              rows={4}
              value={config.ourLocation.mapEmbedCode}
              onChange={(e) => setConfig((c) => ({ ...c!, ourLocation: { ...c!.ourLocation, mapEmbedCode: e.target.value } }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-sm"
              placeholder="Paste Google Maps embed HTML (iframe code) here..."
            />
            <p className="text-xs text-slate-500 mt-1">Paste the full embed code from Google Maps (Share → Embed a map).</p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
