import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { getStudentDiplomaExamResults } from "@/lib/diploma-exam-results";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/site-config";
import { buildTranscriptSvg, type TranscriptProgram } from "@/lib/transcript-svg";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string; name?: string; email?: string } | undefined;
  if (!user?.id || user.role !== "STUDENT") {
    return new Response("Unauthorized", { status: 401 });
  }

  const programIdFilter = request.nextUrl.searchParams.get("programId")?.trim() || null;

  const [results, siteConfig, dbUser] = await Promise.all([
    getStudentDiplomaExamResults(user.id),
    getSiteConfig(),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, email: true },
    }),
  ]);

  const filtered = programIdFilter
    ? results.filter((r) => r.programId === programIdFilter)
    : results;

  if (filtered.length === 0) {
    return new Response("Transcript not found", { status: 404 });
  }

  const programMap = new Map<string, { programTitle: string; entries: TranscriptProgram["entries"] }>();
  for (const result of filtered) {
    const group = programMap.get(result.programId);
    const entry = {
      subjectTitle: result.subjectTitle,
      score: result.score,
      correctCount: result.correctCount,
      totalQuestions: result.totalQuestions,
      passed: result.passed,
      submittedAt: new Date(result.submittedAt),
    };
    if (group) {
      group.entries.push(entry);
    } else {
      programMap.set(result.programId, {
        programTitle: result.programTitle,
        entries: [entry],
      });
    }
  }

  const programs = Array.from(programMap.values()).map((program) => ({
    programTitle: program.programTitle,
    entries: program.entries.sort(
      (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()
    ),
  }));

  const studentName = dbUser?.name || dbUser?.email || user.email || "Student";
  const transcriptId = `TR-${user.id.slice(0, 6).toUpperCase()}-${programIdFilter ? programIdFilter.slice(0, 8).toUpperCase() : "ALL"}`;

  const svg = buildTranscriptSvg({
    studentName,
    siteName: siteConfig.siteName,
    logoUrl: siteConfig.logoUrl,
    programs,
    transcriptId,
  });

  const slug = programIdFilter
    ? programs[0]?.programTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "program"
    : "diploma-transcript";
  const filename = `${slug}-transcript.svg`;
  const disposition = request.nextUrl.searchParams.get("preview") === "1" ? "inline" : "attachment";

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `${disposition}; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
