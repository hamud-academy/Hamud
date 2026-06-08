"use client";

import { useEffect, useRef, useState } from "react";
import {
  defaultPartnersConfig,
  type PartnerLogoConfig,
  type PartnersConfig,
} from "@/lib/partners-config-defaults";

function newPartner(): PartnerLogoConfig {
  return {
    id: `partner-${Date.now()}`,
    name: "",
    logoUrl: "",
  };
}

export default function PartnerLogosForm() {
  const [config, setConfig] = useState<PartnersConfig>(defaultPartnersConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch("/api/admin/partners-config")
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(() => setConfig(defaultPartnersConfig))
      .finally(() => setLoading(false));
  }, []);

  function updatePartner(id: string, update: Partial<PartnerLogoConfig>) {
    setConfig((current) => ({
      ...current,
      partners: current.partners.map((partner) =>
        partner.id === id ? { ...partner, ...update } : partner
      ),
    }));
  }

  async function uploadPartnerLogo(id: string, file: File | undefined) {
    if (!file) return;
    setMessage(null);
    setUploadingId(id);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/partners-config/logo/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Upload failed" });
        return;
      }
      updatePartner(id, { logoUrl: data.url });
      setMessage({ type: "ok", text: "Logo uploaded. Click Save Changes to publish." });
    } catch {
      setMessage({ type: "err", text: "Upload connection error" });
    } finally {
      setUploadingId(null);
      const input = fileInputs.current[id];
      if (input) input.value = "";
    }
  }

  async function saveConfig(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const partners = config.partners
      .map((partner) => ({
        ...partner,
        name: partner.name.trim(),
        logoUrl: partner.logoUrl.trim(),
      }))
      .filter((partner) => partner.name || partner.logoUrl);

    if (partners.length === 0) {
      setMessage({ type: "err", text: "Add at least one partner." });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/partners-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eyebrow: config.eyebrow,
          title: config.title,
          partners,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Failed to save" });
        return;
      }
      setConfig(data);
      setMessage({ type: "ok", text: "Partner logos saved." });
    } catch {
      setMessage({ type: "err", text: "Connection error" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <form onSubmit={saveConfig} className="space-y-6">
      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            message.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Section Text</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="partnersEyebrow" className="block text-sm font-medium text-slate-700 mb-1">
              Small heading
            </label>
            <input
              id="partnersEyebrow"
              type="text"
              value={config.eyebrow}
              onChange={(e) => setConfig((current) => ({ ...current, eyebrow: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
            />
          </div>
          <div>
            <label htmlFor="partnersTitle" className="block text-sm font-medium text-slate-700 mb-1">
              Main title
            </label>
            <input
              id="partnersTitle"
              type="text"
              value={config.title}
              onChange={(e) => setConfig((current) => ({ ...current, title: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Partner Logos</h2>
          <button
            type="button"
            onClick={() =>
              setConfig((current) => ({
                ...current,
                partners: [...current.partners, newPartner()],
              }))
            }
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition"
          >
            Add Partner
          </button>
        </div>

        <div className="space-y-4">
          {config.partners.map((partner, index) => (
            <div key={partner.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                  {partner.logoUrl ? (
                    <img
                      src={partner.logoUrl}
                      alt={partner.name || `Partner ${index + 1}`}
                      className="h-20 w-20 rounded-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-xs font-bold uppercase text-slate-400">No logo</span>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Partner name
                    </label>
                    <input
                      type="text"
                      value={partner.name}
                      onChange={(e) => updatePartner(partner.id, { name: e.target.value })}
                      placeholder="e.g. IFRC"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={partner.logoUrl}
                      onChange={(e) => updatePartner(partner.id, { logoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      ref={(node) => {
                        fileInputs.current[partner.id] = node;
                      }}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.gif,.svg,image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                      onChange={(e) => uploadPartnerLogo(partner.id, e.target.files?.[0])}
                      className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Upload square or transparent logos for best circle display.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setConfig((current) => ({
                      ...current,
                      partners: current.partners.filter((item) => item.id !== partner.id),
                    }))
                  }
                  className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  {uploadingId === partner.id ? "Uploading..." : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || !!uploadingId}
        className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
