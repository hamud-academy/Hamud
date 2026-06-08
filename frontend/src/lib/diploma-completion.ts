import { getDiplomaConfig } from "@/lib/diploma-config";
import type { DiplomaProgramConfig, DiplomaSubjectConfig } from "@/lib/diploma-config-defaults";
import type { DiplomaExamResult } from "@/lib/diploma-exam-results";
import { getStudentDiplomaExamResults } from "@/lib/diploma-exam-results";
import {
  getStudentDiplomaLessonCompletions,
  getSubjectProgress,
} from "@/lib/diploma-lesson-completions";
import {
  getAllLessonsFromSubject,
  getStudentEnrolledProgramIds,
} from "@/lib/diploma-student-access";

export type DiplomaProgramCompletion = {
  programId: string;
  programTitle: string;
  programSlug: string;
  completedAtIso: string;
  certificateUrl: string;
};

function subjectHasRequirements(subject: DiplomaSubjectConfig): boolean {
  const lessonCount = getAllLessonsFromSubject(subject).length;
  const examCount = subject.exam?.questions?.length ?? 0;
  return lessonCount > 0 || examCount > 0;
}

export function isDiplomaSubjectComplete(
  subject: DiplomaSubjectConfig,
  completedLessonIds: Set<string>,
  examResult: DiplomaExamResult | undefined
): boolean {
  const lessonIds = getAllLessonsFromSubject(subject).map((lesson) => lesson.id);
  const hasExam = (subject.exam?.questions?.length ?? 0) > 0;
  const { curriculumComplete } = getSubjectProgress(lessonIds, completedLessonIds);

  if (lessonIds.length > 0 && !curriculumComplete) return false;
  if (hasExam) return examResult?.passed === true;
  return lessonIds.length > 0 && curriculumComplete;
}

export function isDiplomaProgramComplete(
  program: DiplomaProgramConfig,
  completedLessonIdsBySubject: Map<string, Set<string>>,
  examResultsBySubject: Map<string, DiplomaExamResult>
): boolean {
  const requiredSubjects = program.subjects.filter(subjectHasRequirements);
  if (requiredSubjects.length === 0) return false;

  return requiredSubjects.every((subject) =>
    isDiplomaSubjectComplete(
      subject,
      completedLessonIdsBySubject.get(subject.id) ?? new Set(),
      examResultsBySubject.get(subject.id)
    )
  );
}

function getProgramCompletedAt(
  program: DiplomaProgramConfig,
  lessonCompletions: { subjectId: string; lessonId: string; completedAt: string }[],
  examResults: DiplomaExamResult[]
): Date {
  let maxMs = 0;
  const subjectIds = new Set(program.subjects.map((s) => s.id));

  for (const result of examResults) {
    if (result.programId !== program.id || !subjectIds.has(result.subjectId)) continue;
    maxMs = Math.max(maxMs, new Date(result.submittedAt).getTime());
  }

  for (const completion of lessonCompletions) {
    if (!subjectIds.has(completion.subjectId)) continue;
    maxMs = Math.max(maxMs, new Date(completion.completedAt).getTime());
  }

  return new Date(maxMs || Date.now());
}

export async function getStudentCompletedDiplomaPrograms(
  userId: string,
  email?: string | null
): Promise<DiplomaProgramCompletion[]> {
  const [config, enrolledSet, examResults, lessonCompletions] = await Promise.all([
    getDiplomaConfig(),
    getStudentEnrolledProgramIds(userId, email),
    getStudentDiplomaExamResults(userId),
    getStudentDiplomaLessonCompletions(userId),
  ]);

  const programs = config.programs.filter(
    (p) => p.status === "PUBLISHED" && enrolledSet.has(p.id)
  );

  const completed: DiplomaProgramCompletion[] = [];

  for (const program of programs) {
    const examBySubject = new Map<string, DiplomaExamResult>();
    for (const result of examResults) {
      if (result.programId === program.id) {
        examBySubject.set(result.subjectId, result);
      }
    }

    const lessonsBySubject = new Map<string, Set<string>>();
    for (const item of lessonCompletions) {
      if (item.programId !== program.id) continue;
      const set = lessonsBySubject.get(item.subjectId) ?? new Set<string>();
      set.add(item.lessonId);
      lessonsBySubject.set(item.subjectId, set);
    }

    if (!isDiplomaProgramComplete(program, lessonsBySubject, examBySubject)) continue;

    const programLessons = lessonCompletions
      .filter((c) => c.programId === program.id)
      .map((c) => ({
        subjectId: c.subjectId,
        lessonId: c.lessonId,
        completedAt: c.completedAt,
      }));
    const programExams = examResults.filter((r) => r.programId === program.id);
    const completedAt = getProgramCompletedAt(program, programLessons, programExams);

    completed.push({
      programId: program.id,
      programTitle: program.title,
      programSlug: program.slug,
      completedAtIso: completedAt.toISOString(),
      certificateUrl: `/api/certificates/diploma/${program.id}`,
    });
  }

  return completed.sort(
    (a, b) => new Date(b.completedAtIso).getTime() - new Date(a.completedAtIso).getTime()
  );
}

export function buildProgramCompletionMap(
  programs: DiplomaProgramConfig[],
  examResults: DiplomaExamResult[],
  lessonCompletions: { programId: string; subjectId: string; lessonId: string; completedAt: string }[]
): Map<string, { completed: boolean; completedAtIso: string | null; certificateUrl: string | null }> {
  const map = new Map<
    string,
    { completed: boolean; completedAtIso: string | null; certificateUrl: string | null }
  >();

  for (const program of programs) {
    const examBySubject = new Map<string, DiplomaExamResult>();
    for (const result of examResults) {
      if (result.programId === program.id) examBySubject.set(result.subjectId, result);
    }

    const lessonsBySubject = new Map<string, Set<string>>();
    for (const item of lessonCompletions) {
      if (item.programId !== program.id) continue;
      const set = lessonsBySubject.get(item.subjectId) ?? new Set<string>();
      set.add(item.lessonId);
      lessonsBySubject.set(item.subjectId, set);
    }

    const completed = isDiplomaProgramComplete(program, lessonsBySubject, examBySubject);
    if (!completed) {
      map.set(program.id, { completed: false, completedAtIso: null, certificateUrl: null });
      continue;
    }

    const programLessons = lessonCompletions
      .filter((c) => c.programId === program.id)
      .map((c) => ({
        subjectId: c.subjectId,
        lessonId: c.lessonId,
        completedAt: c.completedAt,
      }));
    const programExams = examResults.filter((r) => r.programId === program.id);
    const completedAt = getProgramCompletedAt(program, programLessons, programExams);

    map.set(program.id, {
      completed: true,
      completedAtIso: completedAt.toISOString(),
      certificateUrl: `/api/certificates/diploma/${program.id}`,
    });
  }

  return map;
}
