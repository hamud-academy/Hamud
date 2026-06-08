import { NextRequest } from "next/server";
import { auth } from "@/auth";
import {
  buildCertificateSvg,
  formatCertificateDate,
  resolveOrganizationName,
} from "@/lib/certificate-svg";
import { getDiplomaConfig } from "@/lib/diploma-config";
import { getStudentDiplomaExamResults } from "@/lib/diploma-exam-results";
import { getStudentDiplomaLessonCompletions } from "@/lib/diploma-lesson-completions";
import {
  getPublishedProgram,
  getStudentEnrolledProgramIds,
} from "@/lib/diploma-student-access";
import { isDiplomaProgramComplete } from "@/lib/diploma-completion";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string; name?: string } | undefined;
  if (!user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { programId } = await params;
  const enrolled = await getStudentEnrolledProgramIds(user.id, user.email);
  if (!enrolled.has(programId)) {
    return new Response("Certificate not found", { status: 404 });
  }

  const config = await getDiplomaConfig();
  const program = getPublishedProgram(config, programId);
  if (!program) {
    return new Response("Certificate not found", { status: 404 });
  }

  const [examResults, lessonCompletions, dbUser] = await Promise.all([
    getStudentDiplomaExamResults(user.id),
    getStudentDiplomaLessonCompletions(user.id),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, email: true },
    }),
  ]);

  const examBySubject = new Map(
    examResults.filter((r) => r.programId === programId).map((r) => [r.subjectId, r])
  );
  const lessonsBySubject = new Map<string, Set<string>>();
  for (const item of lessonCompletions) {
    if (item.programId !== programId) continue;
    const set = lessonsBySubject.get(item.subjectId) ?? new Set<string>();
    set.add(item.lessonId);
    lessonsBySubject.set(item.subjectId, set);
  }

  if (!isDiplomaProgramComplete(program, lessonsBySubject, examBySubject)) {
    return new Response("Certificate not found", { status: 404 });
  }

  const programLessons = lessonCompletions
    .filter((c) => c.programId === programId)
    .map((c) => ({
      subjectId: c.subjectId,
      lessonId: c.lessonId,
      completedAt: c.completedAt,
    }));
  const programExams = examResults.filter((r) => r.programId === programId);

  let maxMs = 0;
  for (const result of programExams) {
    maxMs = Math.max(maxMs, new Date(result.submittedAt).getTime());
  }
  for (const completion of programLessons) {
    maxMs = Math.max(maxMs, new Date(completion.completedAt).getTime());
  }
  const completedAt = new Date(maxMs || Date.now());

  const siteConfig = await getSiteConfig();
  const studentName = dbUser?.name || dbUser?.email || user.email || "Student";
  const certificateId = `DIP-${user.id.slice(0, 6).toUpperCase()}-${programId.slice(0, 8).toUpperCase()}`;
  const svg = buildCertificateSvg({
    studentName,
    programTitle: program.title,
    completedAt: formatCertificateDate(completedAt),
    siteName: resolveOrganizationName(siteConfig.siteName),
    logoUrl: siteConfig.logoUrl,
    certificateId,
    completionPhrase: "has successfully completed the diploma program",
  });

  const filename = `${program.slug}-diploma-certificate.svg`;
  const disposition = request.nextUrl.searchParams.get("preview") === "1" ? "inline" : "attachment";

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `${disposition}; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
