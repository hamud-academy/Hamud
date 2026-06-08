import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getStudentCompletedDiplomaPrograms } from "@/lib/diploma-completion";
import { getStudentDiplomaExamResults } from "@/lib/diploma-exam-results";
import { prisma } from "@/lib/prisma";
import DashboardAchievementsClient from "./DashboardAchievementsClient";

export default async function AchievementsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/achievements");
  }

  const user = session.user as { id?: string; role?: string };
  if (user.role === "ADMIN" || user.role === "INSTRUCTOR") {
    redirect("/admin");
  }

  const [completedEnrollments, diplomaExamResults, diplomaCertificates] = await Promise.all([
    prisma.enrollment.findMany({
    where: { userId: user.id, completed: true },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
          category: { select: { name: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  }),
    user.id ? getStudentDiplomaExamResults(user.id) : Promise.resolve([]),
    user.id ? getStudentCompletedDiplomaPrograms(user.id) : Promise.resolve([]),
  ]);

  return (
    <DashboardAchievementsClient
      transcript={diplomaExamResults
        .slice()
        .sort(
          (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        )
        .map((r) => ({
          programId: r.programId,
          programTitle: r.programTitle,
          subjectId: r.subjectId,
          subjectTitle: r.subjectTitle,
          score: r.score,
          correctCount: r.correctCount,
          totalQuestions: r.totalQuestions,
          passed: r.passed,
          submittedAtIso: r.submittedAt,
        }))}
      diplomaCertificates={diplomaCertificates.map((d) => ({
        programId: d.programId,
        programTitle: d.programTitle,
        completedAtIso: d.completedAtIso,
        certificateUrl: d.certificateUrl,
      }))}
      completedEnrollments={completedEnrollments.map((e) => ({
        id: e.id,
        updatedAtIso: e.updatedAt.toISOString(),
        course: {
          title: e.course.title,
          slug: e.course.slug,
          thumbnail: e.course.thumbnail,
          categoryName: e.course.category.name,
        },
      }))}
    />
  );
}
