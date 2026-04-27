import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/site-config";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatCertificateDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function wrapText(value: string, maxLength: number) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

function certificateSvg({
  studentName,
  courseTitle,
  completedAt,
  siteName,
  logoUrl,
  certificateId,
}: {
  studentName: string;
  courseTitle: string;
  completedAt: string;
  siteName: string;
  logoUrl: string;
  certificateId: string;
}) {
  const safeStudent = escapeXml(studentName);
  const courseLines = wrapText(courseTitle, 42);
  const safeDate = escapeXml(completedAt);
  const safeSite = escapeXml(siteName);
  const safeLogo = escapeXml(logoUrl);
  const safeCertificateId = escapeXml(certificateId);
  const initials = escapeXml(
    siteName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "EL"
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1120" viewBox="0 0 1600 1120">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="48%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#ecfdf5"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#facc15"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#0f172a" flood-opacity="0.14"/>
    </filter>
  </defs>
  <rect width="1600" height="1120" fill="#e2e8f0"/>
  <rect x="80" y="80" width="1440" height="960" rx="36" fill="url(#bg)" filter="url(#shadow)"/>
  <rect x="128" y="128" width="1344" height="864" rx="26" fill="none" stroke="#0f766e" stroke-width="5"/>
  <rect x="155" y="155" width="1290" height="810" rx="18" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="10 12"/>

  <circle cx="800" cy="216" r="56" fill="#0f766e"/>
  ${
    safeLogo
      ? `<clipPath id="logoClip"><circle cx="800" cy="216" r="48"/></clipPath><image href="${safeLogo}" x="752" y="168" width="96" height="96" preserveAspectRatio="xMidYMid slice" clip-path="url(#logoClip)"/>`
      : `<text x="800" y="232" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" fill="#ffffff">${initials}</text>`
  }

  <text x="800" y="325" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="74" font-weight="700" fill="#0f172a" letter-spacing="2">Certificate of Completion</text>
  <text x="800" y="386" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#64748b" letter-spacing="4">THIS CERTIFICATE IS PROUDLY PRESENTED TO</text>

  <text x="800" y="520" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="72" font-weight="700" fill="#0f766e">${safeStudent}</text>
  <line x1="430" y1="548" x2="1170" y2="548" stroke="#cbd5e1" stroke-width="3"/>

  <text x="800" y="622" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="27" fill="#334155">has successfully completed the course</text>
  ${courseLines
    .map(
      (line, index) =>
        `<text x="800" y="${courseLines.length > 1 ? 682 + index * 58 : 704}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="48" font-weight="700" fill="#111827">${escapeXml(line)}</text>`
    )
    .join("")}

  <g transform="translate(665 760)">
    <circle cx="135" cy="85" r="72" fill="url(#gold)"/>
    <circle cx="135" cy="85" r="55" fill="none" stroke="#ffffff" stroke-width="5"/>
    <path d="M108 84l18 19 39-45" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M88 143l-24 76 70-34 72 34-24-76" fill="#f59e0b" opacity="0.85"/>
  </g>

  <g font-family="Arial, Helvetica, sans-serif" fill="#334155">
    <text x="310" y="900" text-anchor="middle" font-size="22" font-weight="700">${safeDate}</text>
    <line x1="205" y1="872" x2="415" y2="872" stroke="#94a3b8" stroke-width="2"/>
    <text x="310" y="932" text-anchor="middle" font-size="18" fill="#64748b">Completion Date</text>

    <text x="1290" y="872" text-anchor="middle" font-size="42" font-family="Brush Script MT, Segoe Script, cursive" fill="#0f766e">${safeSite}</text>
    <line x1="1165" y1="892" x2="1415" y2="892" stroke="#94a3b8" stroke-width="2"/>
    <text x="1290" y="932" text-anchor="middle" font-size="18" fill="#64748b">Authorized Signature</text>
  </g>

  <text x="800" y="952" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#94a3b8">Certificate ID: ${safeCertificateId}</text>
</svg>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { enrollmentId } = await params;
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { title: true, slug: true } },
    },
  });

  if (!enrollment || enrollment.userId !== userId || !enrollment.completed) {
    return new Response("Certificate not found", { status: 404 });
  }

  const siteConfig = await getSiteConfig();
  const completedAt = formatCertificateDate(enrollment.updatedAt);
  const certificateId = `CERT-${enrollment.id.slice(0, 8).toUpperCase()}`;
  const svg = certificateSvg({
    studentName: enrollment.user.name || enrollment.user.email,
    courseTitle: enrollment.course.title,
    completedAt,
    siteName: siteConfig.siteName,
    logoUrl: siteConfig.logoUrl,
    certificateId,
  });
  const filename = `${enrollment.course.slug}-certificate.svg`;
  const disposition = request.nextUrl.searchParams.get("preview") === "1" ? "inline" : "attachment";

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `${disposition}; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
