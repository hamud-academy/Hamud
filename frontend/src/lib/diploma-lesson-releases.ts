import { OrderKind, OrderStatus } from "@prisma/client";
import { getAppConfig, saveAppConfig } from "@/lib/app-config-store";
import { getDiplomaEnrollments } from "@/lib/diploma-enrollments";
import {
  getAllLessonsFromSubject,
  getSortedModules,
} from "@/lib/diploma-student-access";
import type { DiplomaSubjectConfig } from "@/lib/diploma-config-defaults";
import { prisma } from "@/lib/prisma";

const RELEASES_KEY = "diploma-lesson-releases";
const GUIDED_KEY = "diploma-lesson-guided";

export type DiplomaLessonRelease = {
  userId: string;
  programId: string;
  subjectId: string;
  lessonId: string;
  releasedAt: string;
  releasedBy: string;
  releasedByRole: "ADMIN" | "TEACHER";
};

export type DiplomaGuidedReleaseMode = {
  userId: string;
  programId: string;
  subjectId: string;
  enabled: boolean;
  enabledAt: string;
  enabledBy: string;
  enabledByRole: "ADMIN" | "TEACHER";
};

export type EnrolledDiplomaStudent = {
  userId: string;
  name: string | null;
  email: string;
  enrolledAt: string;
  planType: string;
};

export type SubjectReleaseContext = {
  guidedMode: boolean;
  releasedLessonIds: Set<string>;
};

export type LessonReleaseRow = {
  lessonId: string;
  title: string;
  moduleId: string;
  moduleTitle: string;
  order: number;
  released: boolean;
  releasedAt: string | null;
};

function releaseRecordKey(
  userId: string,
  programId: string,
  subjectId: string,
  lessonId: string
) {
  return `${userId}:${programId}:${subjectId}:${lessonId}`;
}

function guidedModeKey(userId: string, programId: string, subjectId: string) {
  return `${userId}:${programId}:${subjectId}`;
}

async function getAllReleases(): Promise<Record<string, DiplomaLessonRelease>> {
  return (await getAppConfig<Record<string, DiplomaLessonRelease>>(RELEASES_KEY)) ?? {};
}

async function getAllGuidedModes(): Promise<Record<string, DiplomaGuidedReleaseMode>> {
  return (await getAppConfig<Record<string, DiplomaGuidedReleaseMode>>(GUIDED_KEY)) ?? {};
}

export async function getEnrolledStudentsForProgram(
  programId: string,
  programSlug?: string
): Promise<EnrolledDiplomaStudent[]> {
  const enrollments = await getDiplomaEnrollments();
  const relevant = enrollments.filter(
    (item) => item.programId === programId || (programSlug && item.programSlug === programSlug)
  );

  const byUserId = new Map<string, { enrolledAt: string; planType: string }>();
  for (const enrollment of relevant) {
    const existing = byUserId.get(enrollment.userId);
    if (!existing || enrollment.enrolledAt > existing.enrolledAt) {
      byUserId.set(enrollment.userId, {
        enrolledAt: enrollment.enrolledAt,
        planType: enrollment.planType,
      });
    }
  }

  const orders = await prisma.order.findMany({
    where: {
      kind: OrderKind.DIPLOMA,
      status: OrderStatus.PAID,
      OR: [{ programId }, ...(programSlug ? [{ programSlug }] : [])],
    },
    select: {
      userId: true,
      planType: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  for (const order of orders) {
    if (!order.userId) continue;
    const enrolledAt = (order.updatedAt ?? order.createdAt).toISOString();
    if (!byUserId.has(order.userId)) {
      byUserId.set(order.userId, {
        enrolledAt,
        planType: order.planType ?? "",
      });
    }
  }

  const userIds = Array.from(byUserId.keys());
  if (userIds.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });

  return users
    .map((user) => ({
      userId: user.id,
      name: user.name,
      email: user.email,
      enrolledAt: byUserId.get(user.id)!.enrolledAt,
      planType: byUserId.get(user.id)!.planType,
    }))
    .sort((a, b) => b.enrolledAt.localeCompare(a.enrolledAt));
}

export async function isGuidedReleaseEnabled(
  userId: string,
  programId: string,
  subjectId: string
): Promise<boolean> {
  const all = await getAllGuidedModes();
  const record = all[guidedModeKey(userId, programId, subjectId)];
  return record?.enabled === true;
}

export async function getReleasedLessonIdsForSubject(
  userId: string,
  programId: string,
  subjectId: string
): Promise<Set<string>> {
  const all = await getAllReleases();
  const ids = new Set<string>();
  for (const item of Object.values(all)) {
    if (item.userId === userId && item.programId === programId && item.subjectId === subjectId) {
      ids.add(item.lessonId);
    }
  }
  return ids;
}

export async function getStudentSubjectReleaseContext(
  userId: string,
  programId: string,
  subjectId: string
): Promise<SubjectReleaseContext> {
  const [guidedMode, releasedLessonIds] = await Promise.all([
    isGuidedReleaseEnabled(userId, programId, subjectId),
    getReleasedLessonIdsForSubject(userId, programId, subjectId),
  ]);
  return { guidedMode, releasedLessonIds };
}

export async function batchGetStudentReleaseContexts(
  userId: string,
  items: { programId: string; subjectId: string }[]
): Promise<Map<string, SubjectReleaseContext>> {
  const [guidedModes, releases] = await Promise.all([getAllGuidedModes(), getAllReleases()]);
  const map = new Map<string, SubjectReleaseContext>();

  for (const item of items) {
    const key = `${item.programId}:${item.subjectId}`;
    const guidedMode = guidedModes[guidedModeKey(userId, item.programId, item.subjectId)]?.enabled === true;
    const releasedLessonIds = new Set<string>();
    for (const release of Object.values(releases)) {
      if (
        release.userId === userId &&
        release.programId === item.programId &&
        release.subjectId === item.subjectId
      ) {
        releasedLessonIds.add(release.lessonId);
      }
    }
    map.set(key, { guidedMode, releasedLessonIds });
  }

  return map;
}

export function isLessonReleasedInContext(
  lessonId: string,
  context: SubjectReleaseContext
): boolean {
  if (!context.guidedMode) return true;
  return context.releasedLessonIds.has(lessonId);
}

export async function isLessonReleasedForStudent(
  userId: string,
  programId: string,
  subjectId: string,
  lessonId: string
): Promise<boolean> {
  const context = await getStudentSubjectReleaseContext(userId, programId, subjectId);
  return isLessonReleasedInContext(lessonId, context);
}

function buildLessonRows(
  subject: DiplomaSubjectConfig,
  releasedLessonIds: Set<string>,
  allReleases: Record<string, DiplomaLessonRelease>,
  userId: string,
  programId: string,
  subjectId: string
): LessonReleaseRow[] {
  const rows: LessonReleaseRow[] = [];
  let order = 0;

  for (const module of getSortedModules(subject)) {
    for (const lesson of module.lessons) {
      const key = releaseRecordKey(userId, programId, subjectId, lesson.id);
      const record = allReleases[key];
      rows.push({
        lessonId: lesson.id,
        title: lesson.title,
        moduleId: module.id,
        moduleTitle: module.title,
        order,
        released: releasedLessonIds.has(lesson.id),
        releasedAt: record?.releasedAt ?? null,
      });
      order += 1;
    }
  }

  return rows;
}

export async function getSubjectReleaseOverview(input: {
  userId: string;
  programId: string;
  subject: DiplomaSubjectConfig;
}) {
  const subjectId = input.subject.id;
  const [guidedMode, releasedLessonIds, allReleases] = await Promise.all([
    isGuidedReleaseEnabled(input.userId, input.programId, subjectId),
    getReleasedLessonIdsForSubject(input.userId, input.programId, subjectId),
    getAllReleases(),
  ]);

  const lessons = buildLessonRows(
    input.subject,
    releasedLessonIds,
    allReleases,
    input.userId,
    input.programId,
    subjectId
  );

  return {
    guidedMode,
    releasedCount: releasedLessonIds.size,
    totalLessons: lessons.length,
    lessons,
  };
}

async function saveReleaseRecord(
  record: DiplomaLessonRelease,
  allReleases: Record<string, DiplomaLessonRelease>
) {
  allReleases[releaseRecordKey(record.userId, record.programId, record.subjectId, record.lessonId)] =
    record;
  await saveAppConfig(RELEASES_KEY, allReleases);
}

async function removeReleaseRecord(
  userId: string,
  programId: string,
  subjectId: string,
  lessonId: string,
  allReleases: Record<string, DiplomaLessonRelease>
) {
  delete allReleases[releaseRecordKey(userId, programId, subjectId, lessonId)];
  await saveAppConfig(RELEASES_KEY, allReleases);
}

async function setGuidedMode(input: {
  userId: string;
  programId: string;
  subjectId: string;
  enabled: boolean;
  actorId: string;
  actorRole: "ADMIN" | "TEACHER";
}) {
  const all = await getAllGuidedModes();
  const key = guidedModeKey(input.userId, input.programId, input.subjectId);

  if (input.enabled) {
    all[key] = {
      userId: input.userId,
      programId: input.programId,
      subjectId: input.subjectId,
      enabled: true,
      enabledAt: new Date().toISOString(),
      enabledBy: input.actorId,
      enabledByRole: input.actorRole,
    };
  } else {
    delete all[key];
  }

  await saveAppConfig(GUIDED_KEY, all);
}

export async function releaseLessonForStudent(input: {
  userId: string;
  programId: string;
  subjectId: string;
  lessonId: string;
  actorId: string;
  actorRole: "ADMIN" | "TEACHER";
}) {
  const allReleases = await getAllReleases();
  const record: DiplomaLessonRelease = {
    userId: input.userId,
    programId: input.programId,
    subjectId: input.subjectId,
    lessonId: input.lessonId,
    releasedAt: new Date().toISOString(),
    releasedBy: input.actorId,
    releasedByRole: input.actorRole,
  };
  await saveReleaseRecord(record, allReleases);
  return record;
}

export async function revokeLessonRelease(input: {
  userId: string;
  programId: string;
  subjectId: string;
  lessonId: string;
}) {
  const allReleases = await getAllReleases();
  await removeReleaseRecord(input.userId, input.programId, input.subjectId, input.lessonId, allReleases);
}

export async function enableGuidedReleaseForStudent(input: {
  userId: string;
  programId: string;
  subject: DiplomaSubjectConfig;
  actorId: string;
  actorRole: "ADMIN" | "TEACHER";
  releaseFirstLesson?: boolean;
}) {
  await setGuidedMode({
    userId: input.userId,
    programId: input.programId,
    subjectId: input.subject.id,
    enabled: true,
    actorId: input.actorId,
    actorRole: input.actorRole,
  });

  if (input.releaseFirstLesson !== false) {
    const firstLesson = getAllLessonsFromSubject(input.subject)[0];
    if (firstLesson) {
      await releaseLessonForStudent({
        userId: input.userId,
        programId: input.programId,
        subjectId: input.subject.id,
        lessonId: firstLesson.id,
        actorId: input.actorId,
        actorRole: input.actorRole,
      });
    }
  }

  return getSubjectReleaseOverview({
    userId: input.userId,
    programId: input.programId,
    subject: input.subject,
  });
}

export async function disableGuidedReleaseForStudent(input: {
  userId: string;
  programId: string;
  subjectId: string;
  actorId: string;
  actorRole: "ADMIN" | "TEACHER";
}) {
  await setGuidedMode({
    userId: input.userId,
    programId: input.programId,
    subjectId: input.subjectId,
    enabled: false,
    actorId: input.actorId,
    actorRole: input.actorRole,
  });

  return { guidedMode: false };
}

export async function releaseNextLessonForStudent(input: {
  userId: string;
  programId: string;
  subject: DiplomaSubjectConfig;
  actorId: string;
  actorRole: "ADMIN" | "TEACHER";
}) {
  const releasedIds = await getReleasedLessonIdsForSubject(
    input.userId,
    input.programId,
    input.subject.id
  );
  const nextLesson = getAllLessonsFromSubject(input.subject).find((lesson) => !releasedIds.has(lesson.id));
  if (!nextLesson) {
    return getSubjectReleaseOverview({
      userId: input.userId,
      programId: input.programId,
      subject: input.subject,
    });
  }

  await releaseLessonForStudent({
    userId: input.userId,
    programId: input.programId,
    subjectId: input.subject.id,
    lessonId: nextLesson.id,
    actorId: input.actorId,
    actorRole: input.actorRole,
  });

  return getSubjectReleaseOverview({
    userId: input.userId,
    programId: input.programId,
    subject: input.subject,
  });
}

export async function releaseModuleLessonsForStudent(input: {
  userId: string;
  programId: string;
  subject: DiplomaSubjectConfig;
  moduleId: string;
  actorId: string;
  actorRole: "ADMIN" | "TEACHER";
}) {
  const module = getSortedModules(input.subject).find((item) => item.id === input.moduleId);
  if (!module) throw new Error("Module not found");

  for (const lesson of module.lessons) {
    await releaseLessonForStudent({
      userId: input.userId,
      programId: input.programId,
      subjectId: input.subject.id,
      lessonId: lesson.id,
      actorId: input.actorId,
      actorRole: input.actorRole,
    });
  }

  return getSubjectReleaseOverview({
    userId: input.userId,
    programId: input.programId,
    subject: input.subject,
  });
}

export async function releaseAllLessonsForStudent(input: {
  userId: string;
  programId: string;
  subject: DiplomaSubjectConfig;
  actorId: string;
  actorRole: "ADMIN" | "TEACHER";
}) {
  for (const lesson of getAllLessonsFromSubject(input.subject)) {
    await releaseLessonForStudent({
      userId: input.userId,
      programId: input.programId,
      subjectId: input.subject.id,
      lessonId: lesson.id,
      actorId: input.actorId,
      actorRole: input.actorRole,
    });
  }

  return getSubjectReleaseOverview({
    userId: input.userId,
    programId: input.programId,
    subject: input.subject,
  });
}

export type ReleaseAction =
  | "enable_guided"
  | "disable_guided"
  | "release_lesson"
  | "revoke_lesson"
  | "release_next"
  | "release_module"
  | "release_all";

export async function applyLessonReleaseAction(input: {
  action: ReleaseAction;
  userId: string;
  programId: string;
  subject: DiplomaSubjectConfig;
  lessonId?: string;
  moduleId?: string;
  actorId: string;
  actorRole: "ADMIN" | "TEACHER";
}) {
  switch (input.action) {
    case "enable_guided":
      return enableGuidedReleaseForStudent({
        userId: input.userId,
        programId: input.programId,
        subject: input.subject,
        actorId: input.actorId,
        actorRole: input.actorRole,
      });
    case "disable_guided":
      await disableGuidedReleaseForStudent({
        userId: input.userId,
        programId: input.programId,
        subjectId: input.subject.id,
        actorId: input.actorId,
        actorRole: input.actorRole,
      });
      return getSubjectReleaseOverview({
        userId: input.userId,
        programId: input.programId,
        subject: input.subject,
      });
    case "release_lesson":
      if (!input.lessonId) throw new Error("lessonId required");
      await releaseLessonForStudent({
        userId: input.userId,
        programId: input.programId,
        subjectId: input.subject.id,
        lessonId: input.lessonId,
        actorId: input.actorId,
        actorRole: input.actorRole,
      });
      return getSubjectReleaseOverview({
        userId: input.userId,
        programId: input.programId,
        subject: input.subject,
      });
    case "revoke_lesson":
      if (!input.lessonId) throw new Error("lessonId required");
      await revokeLessonRelease({
        userId: input.userId,
        programId: input.programId,
        subjectId: input.subject.id,
        lessonId: input.lessonId,
      });
      return getSubjectReleaseOverview({
        userId: input.userId,
        programId: input.programId,
        subject: input.subject,
      });
    case "release_next":
      return releaseNextLessonForStudent({
        userId: input.userId,
        programId: input.programId,
        subject: input.subject,
        actorId: input.actorId,
        actorRole: input.actorRole,
      });
    case "release_module":
      if (!input.moduleId) throw new Error("moduleId required");
      return releaseModuleLessonsForStudent({
        userId: input.userId,
        programId: input.programId,
        subject: input.subject,
        moduleId: input.moduleId,
        actorId: input.actorId,
        actorRole: input.actorRole,
      });
    case "release_all":
      return releaseAllLessonsForStudent({
        userId: input.userId,
        programId: input.programId,
        subject: input.subject,
        actorId: input.actorId,
        actorRole: input.actorRole,
      });
    default:
      throw new Error("Unknown action");
  }
}
