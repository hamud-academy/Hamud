import { getAppConfig, saveAppConfig } from "@/lib/app-config-store";

const ENROLLMENTS_KEY = "diploma-enrollments";

export type DiplomaEnrollment = {
  id: string;
  userId: string;
  programId: string;
  programSlug: string;
  planType: string;
  orderId: string;
  enrolledAt: string;
};

function normalizeEnrollment(value: unknown, index: number): DiplomaEnrollment | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<DiplomaEnrollment>;
  const userId = item.userId?.trim();
  const programId = item.programId?.trim();
  if (!userId || !programId) return null;

  return {
    id: item.id?.trim() || `enrollment-${index + 1}`,
    userId,
    programId,
    programSlug: item.programSlug?.trim() || "",
    planType: item.planType?.trim() || "",
    orderId: item.orderId?.trim() || "",
    enrolledAt: item.enrolledAt?.trim() || new Date().toISOString(),
  };
}

export async function getDiplomaEnrollments(): Promise<DiplomaEnrollment[]> {
  const raw = await getAppConfig<unknown>(ENROLLMENTS_KEY);
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => normalizeEnrollment(item, index))
    .filter((item): item is DiplomaEnrollment => item !== null);
}

export async function getUserEnrolledProgramIds(userId: string): Promise<string[]> {
  const enrollments = await getDiplomaEnrollments();
  return Array.from(
    new Set(enrollments.filter((item) => item.userId === userId).map((item) => item.programId))
  );
}

export async function isUserEnrolledInProgram(userId: string, programId: string): Promise<boolean> {
  const enrollments = await getDiplomaEnrollments();
  return enrollments.some((item) => item.userId === userId && item.programId === programId);
}

export async function enrollUserInDiplomaProgram(input: {
  userId: string;
  programId: string;
  programSlug: string;
  planType: string;
  orderId: string;
}): Promise<DiplomaEnrollment> {
  const enrollments = await getDiplomaEnrollments();

  const enrollment: DiplomaEnrollment = {
    id: `enrollment-${Date.now()}`,
    userId: input.userId,
    programId: input.programId,
    programSlug: input.programSlug,
    planType: input.planType,
    orderId: input.orderId,
    enrolledAt: new Date().toISOString(),
  };

  enrollments.unshift(enrollment);
  await saveAppConfig(ENROLLMENTS_KEY, enrollments.slice(0, 2000));
  return enrollment;
}
