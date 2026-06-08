import { getDiplomaConfig } from "@/lib/diploma-config";
import type {
  DiplomaConfig,
  DiplomaProgramConfig,
  DiplomaSubjectConfig,
  DiplomaSubjectLessonConfig,
  DiplomaSubjectModuleConfig,
} from "@/lib/diploma-config-defaults";
import { OrderKind, OrderStatus } from "@prisma/client";
import { getPaidDiplomaProgramIdsForEmail } from "@/lib/diploma-checkout";
import { getDiplomaEnrollments } from "@/lib/diploma-enrollments";
import { prisma } from "@/lib/prisma";

function addProgramKeys(keys: Set<string>, programId?: string | null, programSlug?: string | null) {
  if (programId?.trim()) keys.add(programId.trim());
  if (programSlug?.trim()) keys.add(programSlug.trim());
}

export async function getStudentEnrollmentKeys(userId: string): Promise<Set<string>> {
  const keys = new Set<string>();
  const enrollments = await getDiplomaEnrollments();
  for (const enrollment of enrollments) {
    if (enrollment.userId !== userId) continue;
    addProgramKeys(keys, enrollment.programId, enrollment.programSlug);
  }
  return keys;
}

export function isDiplomaProgramEnrolled(
  program: DiplomaProgramConfig,
  enrolledKeys: Set<string>
): boolean {
  return enrolledKeys.has(program.id) || enrolledKeys.has(program.slug);
}

export async function getAvailableDiplomaProgramsForStudent(
  userId: string
): Promise<DiplomaProgramConfig[]> {
  const [config, enrolledKeys] = await Promise.all([
    getDiplomaConfig(),
    getStudentEnrollmentKeys(userId),
  ]);

  return config.programs.filter(
    (program) => program.status === "PUBLISHED" && !isDiplomaProgramEnrolled(program, enrolledKeys)
  );
}

export async function getStudentEnrolledProgramIds(
  userId: string,
  email?: string | null
): Promise<Set<string>> {
  const keys = await getStudentEnrollmentKeys(userId);

  const [paidProgramIds, paidOrders] = await Promise.all([
    email ? getPaidDiplomaProgramIdsForEmail(email) : Promise.resolve([]),
    prisma.order.findMany({
      where: {
        kind: OrderKind.DIPLOMA,
        status: OrderStatus.PAID,
        OR: [
          { userId },
          ...(email ? [{ email: email.trim().toLowerCase() }] : []),
        ],
      },
      select: { programId: true, programSlug: true },
    }),
  ]);

  paidProgramIds.forEach((id) => keys.add(id));
  for (const order of paidOrders) {
    addProgramKeys(keys, order.programId, order.programSlug);
  }

  return keys;
}

export async function isStudentEnrolledInProgram(
  userId: string,
  email: string | null | undefined,
  programId: string
): Promise<boolean> {
  const ids = await getStudentEnrolledProgramIds(userId, email);
  if (ids.has(programId)) return true;

  const config = await getDiplomaConfig();
  const program = config.programs.find((item) => item.id === programId || item.slug === programId);
  return program ? isDiplomaProgramEnrolled(program, ids) : false;
}

export function getPublishedProgram(
  config: DiplomaConfig,
  programId: string
): DiplomaProgramConfig | null {
  const program = config.programs.find((item) => item.id === programId || item.slug === programId);
  if (!program || program.status !== "PUBLISHED") return null;
  return program;
}

export function getSubjectFromProgram(
  program: DiplomaProgramConfig,
  subjectId: string
): DiplomaSubjectConfig | null {
  return program.subjects.find((item) => item.id === subjectId) ?? null;
}

export function getSortedModules(subject: DiplomaSubjectConfig): DiplomaSubjectModuleConfig[] {
  return [...(subject.modules ?? [])].sort((a, b) => a.order - b.order);
}

export function getAllLessonsFromSubject(subject: DiplomaSubjectConfig): DiplomaSubjectLessonConfig[] {
  return getSortedModules(subject).flatMap((module) => module.lessons);
}

export function findLessonInSubject(
  subject: DiplomaSubjectConfig,
  lessonId: string
): { lesson: DiplomaSubjectLessonConfig; module: DiplomaSubjectModuleConfig } | null {
  for (const module of getSortedModules(subject)) {
    const lesson = module.lessons.find((item) => item.id === lessonId);
    if (lesson) return { lesson, module };
  }
  return null;
}

export async function loadStudentDiplomaProgram(programId: string) {
  const config = await getDiplomaConfig();
  const program = getPublishedProgram(config, programId);
  return { config, program };
}

export type StudentLessonQuizQuestion = {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
};

export function stripLessonQuizForStudent(
  questions: DiplomaSubjectLessonConfig["quiz"]["questions"]
): StudentLessonQuizQuestion[] {
  return questions.map((question, questionIndex) => ({
    id: String(questionIndex),
    prompt: question.prompt,
    options: question.options.map((option, optionIndex) => ({
      id: String(optionIndex),
      text: option.text,
    })),
  }));
}

export type StudentModulePayload = {
  id: string;
  title: string;
  order: number;
  lessons: {
    id: string;
    title: string;
    duration: string;
    completed: boolean;
    released: boolean;
  }[];
};

export function mapSubjectModulesForStudent(
  subject: DiplomaSubjectConfig,
  completedLessonIds?: Set<string>,
  releaseContext?: { guidedMode: boolean; releasedLessonIds: Set<string> }
): StudentModulePayload[] {
  return getSortedModules(subject).map((module) => ({
    id: module.id,
    title: module.title,
    order: module.order,
    lessons: module.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      duration: lesson.duration,
      completed: completedLessonIds?.has(lesson.id) ?? false,
      released:
        !releaseContext?.guidedMode || (releaseContext.releasedLessonIds.has(lesson.id) ?? false),
    })),
  }));
}
