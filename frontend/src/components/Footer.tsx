"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const defaultSiteName = "BaroSmart";

type SocialLink = { id: string; platform: string; url: string };

function SocialIcon({ platform, className }: { platform: string; className?: string }) {
  const c = className ?? "w-5 h-5";
  switch (platform.toLowerCase()) {
    case "facebook":
      return (
        <svg className={c} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "x":
    case "twitter":
      return (
        <svg className={c} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "youtube":
      return (
        <svg className={c} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className={c} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
        </svg>
      );
    case "instagram":
      return (
        <svg className={c} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.919-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.919.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    default:
      return (
        <svg className={c} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm3.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      );
  }
}

function FooterBrandName({
  siteName,
  accentSuffix,
}: {
  siteName: string;
  accentSuffix: string;
}) {
  if (accentSuffix && siteName.endsWith(accentSuffix)) {
    const main = siteName.slice(0, -accentSuffix.length);
    return (
      <span className="text-xl font-bold tracking-tight text-white">
        {main}
        <span className="text-emerald-400">{accentSuffix}</span>
      </span>
    );
  }
  return <span className="text-xl font-bold tracking-tight text-white">{siteName}</span>;
}

export default function Footer() {
  const [siteName, setSiteName] = useState(defaultSiteName);
  const [logoUrl, setLogoUrl] = useState("");
  const [accentSuffix, setAccentSuffix] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [studentCount, setStudentCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data) => {
        if (data.siteName) setSiteName(data.siteName);
        if (data.logoUrl) setLogoUrl(data.logoUrl);
        if (data.accentSuffix) setAccentSuffix(data.accentSuffix);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/contact-config")
      .then((r) => r.json())
      .then((data) => {
        if (data.socialLinks && Array.isArray(data.socialLinks)) {
          setSocialLinks(data.socialLinks.filter((s: SocialLink) => s.url && s.url.trim() !== ""));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.studentCount === "number") setStudentCount(data.studentCount);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-slate-900 dark:bg-black text-white border-t border-slate-800 dark:border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-12">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              {logoUrl ? (
                <>
                  <span className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-slate-800">
                    <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                  </span>
                  <FooterBrandName siteName={siteName} accentSuffix={accentSuffix} />
                </>
              ) : (
                <FooterBrandName siteName={siteName} accentSuffix={accentSuffix} />
              )}
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              {studentCount !== null
                ? `Learn quality knowledge, anywhere. Join ${studentCount.toLocaleString()}+ active students.`
                : "Learn quality knowledge, anywhere. Join thousands of active students."}
            </p>
            <div className="flex gap-3 mt-5">
              {socialLinks.length > 0 ? (
                socialLinks.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                    className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition"
                  >
                    <SocialIcon platform={s.platform} />
                  </a>
                ))
              ) : (
                ["facebook", "x", "youtube"].map((platform) => (
                  <span
                    key={platform}
                    className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400"
                    aria-hidden
                  >
                    <SocialIcon platform={platform} />
                  </span>
                ))
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li>
                <Link href="/courses" className="hover:text-white transition">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Log in
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 sm:mt-14 pt-8 text-center text-slate-500 text-xs sm:text-sm">
          © {new Date().getFullYear()} {siteName} E-Learning. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
