import { NextRequest } from "next/server";
import { auth } from "@/auth";
import {
  buildCertificateSvg,
  formatCertificateDate,
  resolveOrganizationName,
} from "@/lib/certificate-svg";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/site-config";

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
  const svg = buildCertificateSvg({
    studentName: enrollment.user.name || enrollment.user.email,
    programTitle: enrollment.course.title,
    completedAt,
    siteName: resolveOrganizationName(siteConfig.siteName),
    logoUrl: siteConfig.logoUrl,
    certificateId,
    completionPhrase: "has successfully completed the course",
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
