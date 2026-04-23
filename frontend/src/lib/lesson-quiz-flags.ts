import { prisma } from "@/lib/prisma";

/** Batch lookup: which lesson IDs have a quiz (avoids nested `Lesson` include). */
export async function getLessonIdsWithQuiz(
  lessonIds: string[]
): Promise<Set<string>> {
  if (lessonIds.length === 0) return new Set();
  const rows = await prisma.lessonQuiz.findMany({
    where: { lessonId: { in: lessonIds } },
    select: { lessonId: true },
  });
  return new Set(rows.map((r) => r.lessonId));
}
