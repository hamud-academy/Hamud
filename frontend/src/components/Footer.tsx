"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import SocialIcon from "@/components/SocialIcon";
import type { FooterConfig } from "@/lib/footer-config";

const defaultSiteName = "BaroSmart";
const defaultFooterConfig: FooterConfig = {
  description: "Learn quality knowledge, anywhere. Join thousands of active students.",
  studentCountDescription: "Learn quality knowledge, anywhere. Join {studentCount}+ active students.",
  showStudentCount: true,
  socialLinks: [
    { id: "facebook", platform: "facebook", url: "#" },
    { id: "youtube", platform: "youtube", url: "#" },
    { id: "x", platform: "x", url: "#" },
    { id: "linkedin", platform: "linkedin", url: "#" },
  ],
  quickLinksTitle: "Quick Links",
  quickLinks: [
    { id: "courses", label: "Courses", href: "/courses" },
    { id: "about", label: "About", href: "/about" },
    { id: "contact", label: "Contact", href: "/contact" },
    { id: "login", label: "Log in", href: "/login" },
  ],
  copyrightText: "{siteName} E-Learning. All Rights Reserved.",
};

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

function formatFooterDescription(config: FooterConfig, studentCount: number | null) {
  if (config.showStudentCount && studentCount !== null) {
    return config.studentCountDescription.replace("{studentCount}", studentCount.toLocaleString());
  }
  return config.description;
}

function formatCopyright(text: string, siteName: string) {
  return text.replace("{siteName}", siteName);
}

function FooterQuickLink({ href, label }: { href: string; label: string }) {
  const className = "hover:text-white transition";
  if (/^https?:\/\//i.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export default function Footer() {
  const [siteName, setSiteName] = useState(defaultSiteName);
  const [logoUrl, setLogoUrl] = useState("");
  const [accentSuffix, setAccentSuffix] = useState("");
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(defaultFooterConfig);

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
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.studentCount === "number") setStudentCount(data.studentCount);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/footer-config")
      .then((r) => r.json())
      .then((data) => setFooterConfig(data))
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
            <p className="text-slate-400 text-sm leading-relaxed">{formatFooterDescription(footerConfig, studentCount)}</p>
            <div className="flex gap-3 mt-5">
              {footerConfig.socialLinks.filter((s) => s.url.trim()).length > 0 ? (
                footerConfig.socialLinks.filter((s) => s.url.trim()).map((s) => (
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
            <h4 className="font-semibold text-white mb-4">{footerConfig.quickLinksTitle}</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              {footerConfig.quickLinks.map((link) => (
                <li key={link.id}>
                  <FooterQuickLink href={link.href} label={link.label} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 sm:mt-14 pt-8 text-center text-slate-500 text-xs sm:text-sm">
          © {new Date().getFullYear()} {formatCopyright(footerConfig.copyrightText, siteName)}
        </div>
      </div>
    </footer>
  );
}
