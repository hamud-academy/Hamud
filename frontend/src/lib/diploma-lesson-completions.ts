import { getAppConfig, saveAppConfig } from "@/lib/app-config-store";

const CONFIG_KEY = "diploma-lesson-completions";

export type DiplomaLessonCompletion = {
  userId: string;
  programId: string;
  subjectId: string;
  lessonId: string;
  completedAt: string;
};

function completionKey(
  userId: string,
  programId: string,
  subjectId: string,
  lessonId: string
) {
  return `${userId}:${programId}:${subjectId}:${lessonId}`;
}

async function getAllCompletions(): Promise<Record<string, DiplomaLessonCompletion>> {
  return (await getAppConfig<Record<string, DiplomaLessonCompletion>>(CONFIG_KEY)) ?? {};
}

export async function getStudentDiplomaLessonCompletions(userId: string) {
  const all = await getAllCompletions();
  return Object.values(all).filter((item) => item.userId === userId);
}

export async function getCompletedLessonIdsForSubject(
  userId: string,
  programId: string,
  subjectId: string
): Promise<Set<string>> {
  const all = await getAllCompletions();
  const ids = new Set<string>();
  for (const item of Object.values(all)) {
    if (item.userId === userId && item.programId === programId && item.subjectId === subjectId) {
      ids.add(item.lessonId);
    }
  }
  return ids;
}

export async function isDiplomaLessonCompleted(
  userId: string,
  programId: string,
  subjectId: string,
  lessonId: string
): Promise<boolean> {
  const all = await getAllCompletions();
  return Boolean(all[completionKey(userId, programId, subjectId, lessonId)]);
}

export function isSubjectCurriculumComplete(
  lessonIds: string[],
  completedLessonIds: Set<string>
): boolean {
  if (lessonIds.length === 0) return false;
  return lessonIds.every((lessonId) => completedLessonIds.has(lessonId));
}

export async function markDiplomaLessonComplete(input: {
  userId: string;
  programId: string;
  subjectId: string;
  lessonId: string;
}): Promise<DiplomaLessonCompletion> {
  const all = await getAllCompletions();
  const key = completionKey(input.userId, input.programId, input.subjectId, input.lessonId);
  const record: DiplomaLessonCompletion = {
    userId: input.userId,
    programId: input.programId,
    subjectId: input.subjectId,
    lessonId: input.lessonId,
    completedAt: new Date().toISOString(),
  };
  all[key] = record;
  await saveAppConfig(CONFIG_KEY, all);
  return record;
}

export function getSubjectProgress(
  lessonIds: string[],
  completedLessonIds: Set<string>
): { completedCount: number; totalLessons: number; progress: number; curriculumComplete: boolean } {
  const totalLessons = lessonIds.length;
  const completedCount = lessonIds.filter((id) => completedLessonIds.has(id)).length;
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  return {
    completedCount,
    totalLessons,
    progress,
    curriculumComplete: isSubjectCurriculumComplete(lessonIds, completedLessonIds),
  };
}
