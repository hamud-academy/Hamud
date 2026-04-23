"use client";

import { useState, useEffect } from "react";
import type { ContactConfig } from "@/lib/contact-config";

const defaultConfig: ContactConfig = {
  getInTouchTitle: "Get in Touch",
  getInTouchDescription: "Have a question or looking to start a project? Our team is ready to help you navigate your digital transformation.",
  phones: [{ id: "1", number: "+252 61 507 9785", callbackLabel: "Request a callback" }],
  emails: [{ id: "2", address: "support@goltech.so", messageLabel: "Send us a message" }],
  headOffices: [{ id: "3", text: "Hargeisa, Somaliland" }],
  socialLinks: [
    { id: "4", platform: "facebook", url: "#" },
    { id: "5", platform: "youtube", url: "#" },
    { id: "6", platform: "x", url: "#" },
    { id: "7", platform: "linkedin", url: "#" },
  ],
  ourLocation: { title: "Our Location", description: "Located in the heart of Hargeisa, Somaliland.", mapUrl: "https://www.google.com/maps", mapEmbedCode: "" },
};

function getEmbedMapSrc(embedCode: string): string | null {
  if (!embedCode || !embedCode.trim()) return null;
  const raw = embedCode.trim();
  // Prefer: iframe ... src="url" (handles newlines and any attribute order)
  let m = raw.match(/<iframe[\s\S]*?src\s*=\s*["']([^"']+)["']/i);
  if (!m) m = raw.match(/src\s*=\s*["']([^"']+)["']/i);
  const url = m ? m[1].trim() : null;
  if (!url) return null;
  const decoded = url.replace(/&amp;/g, "&");
  return (decoded.includes("maps") || decoded.startsWith("https://") || decoded.startsWith("http://")) ? decoded : null;
}

function SocialIcon({ platform, className }: { platform: string; className?: string }) {
  const c = className || "w-5 h-5";
  const key = platform.toLowerCase().trim();
  if (key === "facebook")
    return <svg className={c} fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
  if (key === "youtube")
    return <svg className={c} fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
  if (key === "x" || key === "twitter")
    return <svg className={c} fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
  if (key === "linkedin")
    return <svg className={c} fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
  return (
    <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

type Props = { initialConfig?: ContactConfig };

export default function ContactSection({ initialConfig }: Props) {
  const [config, setConfig] = useState<ContactConfig>(initialConfig ?? defaultConfig);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", subject: "", message: "" });

  useEffect(() => {
    if (initialConfig) return;
    fetch("/api/contact-config")
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(() => {});
  }, [initialConfig]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setSent(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
        setForm({ fullName: "", email: "", subject: "", message: "" });
      }
    } catch {
      // show error if needed
    } finally {
      setSending(false);
    }
  }

  const embedMapSrc = getEmbedMapSrc(config.ourLocation.mapEmbedCode);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10 items-start">
        {/* Left: Get in Touch */}
        <div className="sm:col-start-1 sm:row-start-1">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            {config.getInTouchTitle}
          </h1>
          <p className="text-slate-600 text-base sm:text-lg mb-10 max-w-lg">
            {config.getInTouchDescription}
          </p>

          <div className="space-y-8">
            {config.phones.filter((p) => p.number.trim()).map((p) => (
              <div key={p.id} className="flex gap-4">
                <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Phone</p>
                  <p className="text-slate-600 mt-0.5">{p.number}</p>
                  {p.callbackLabel && (
                    <a href={`tel:${p.number.replace(/\s/g, "")}`} className="text-blue-600 hover:underline font-medium text-sm mt-1 inline-block">
                      {p.callbackLabel}
                    </a>
                  )}
                </div>
              </div>
            ))}

            {config.emails.filter((e) => e.address.trim()).map((e) => (
              <div key={e.id} className="flex gap-4">
                <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Email</p>
                  <p className="text-slate-600 mt-0.5">{e.address}</p>
                  {e.messageLabel && (
                    <a href={`mailto:${e.address}`} className="text-blue-600 hover:underline font-medium text-sm mt-1 inline-block">
                      {e.messageLabel}
                    </a>
                  )}
                </div>
              </div>
            ))}

            {config.headOffices.filter((h) => h.text.trim()).map((h) => (
              <div key={h.id} className="flex gap-4">
                <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Head Office</p>
                  <p className="text-slate-600 mt-0.5">{h.text}</p>
                </div>
              </div>
            ))}

            {config.socialLinks.filter((s) => s.url.trim()).length > 0 && (
              <div>
                <p className="font-bold text-slate-900 uppercase tracking-wide text-sm mb-4">Follow us</p>
                <div className="flex gap-3">
                  {config.socialLinks.filter((s) => s.url.trim()).map((s) => (
                    <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition" aria-label={s.platform}>
                      <SocialIcon platform={s.platform} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Send Message form + Our Location */}
        <div className="sm:col-start-2 sm:row-start-1 space-y-6 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Send Message</h2>
            {sent && (
              <div className="mb-4 p-4 rounded-lg bg-emerald-50 text-emerald-800 text-sm border border-emerald-100">
                Thank you. We&apos;ll get back to you soon.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contact-subject" className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                <input
                  id="contact-subject"
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="How can we help you?"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Your message here..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
              >
                Send Message
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9 2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-md shadow-slate-200/50 p-6 overflow-hidden">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-bold text-slate-900 mb-1">{config.ourLocation.title}</h3>
                <p className="text-slate-600 text-sm mb-3">
                  {config.ourLocation.description}
                </p>
              </div>
              {embedMapSrc ? (
                  <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100" style={{ minHeight: "280px", aspectRatio: "600/400" }}>
                    <iframe
                      src={embedMapSrc}
                      title="Our location map"
                      className="absolute inset-0 w-full h-full min-h-[280px]"
                      frameBorder={0}
                      scrolling="no"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
              ) : (
                  <div className="w-full h-32 sm:h-40 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
