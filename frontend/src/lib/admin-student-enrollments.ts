import type { DiplomaConfig } from "@/lib/diploma-config-defaults";
import type { getDiplomaEnrollments } from "@/lib/diploma-enrollments";

export type StudentDiplomaEnrollment = {
  id: string;
  programId: string;
  programTitle: string;
  programSlug: string;
  planType: string;
  planTitle: string | null;
  enrolledAt: string;
};

export function buildStudentDiplomaEnrollments(
  student: { id: string; email: string },
  diplomaEnrollments: Awaited<ReturnType<typeof getDiplomaEnrollments>>,
  paidDiplomaOrders: {
    id: string;
    userId: string | null;
    email: string;
    programId: string | null;
    programTitle: string | null;
    programSlug: string | null;
    planType: string | null;
    planTitle: string | null;
    paidAt: Date | null;
    createdAt: Date;
  }[],
  programTitleById: Map<string, string>,
  diplomaConfig: DiplomaConfig
): StudentDiplomaEnrollment[] {
  function resolvePlanTitle(programId: string, planType: string): string | null {
    if (!planType) return null;
    const program = diplomaConfig.programs.find((item) => item.id === programId);
    return program?.paymentPlans.find((item) => item.type === planType)?.title ?? null;
  }

  const byProgram = new Map<string, StudentDiplomaEnrollment>();
  const normalizedEmail = student.email.trim().toLowerCase();

  for (const enrollment of diplomaEnrollments) {
    if (enrollment.userId !== student.id) continue;
    byProgram.set(enrollment.programId, {
      id: enrollment.id,
      programId: enrollment.programId,
      programTitle: programTitleById.get(enrollment.programId) ?? enrollment.programSlug ?? "Diploma",
      programSlug: enrollment.programSlug,
      planType: enrollment.planType,
      planTitle: resolvePlanTitle(enrollment.programId, enrollment.planType),
      enrolledAt: enrollment.enrolledAt,
    });
  }

  for (const order of paidDiplomaOrders) {
    if (!order.programId) continue;
    const orderEmail = order.email.trim().toLowerCase();
    if (order.userId !== student.id && orderEmail !== normalizedEmail) continue;
    if (byProgram.has(order.programId)) continue;

    byProgram.set(order.programId, {
      id: order.id,
      programId: order.programId,
      programTitle:
        order.programTitle ??
        programTitleById.get(order.programId) ??
        order.programSlug ??
        "Diploma",
      programSlug: order.programSlug ?? "",
      planType: order.planType ?? "",
      planTitle: order.planTitle,
      enrolledAt: (order.paidAt ?? order.createdAt).toISOString(),
    });
  }

  return Array.from(byProgram.values()).sort(
    (a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime()
  );
}
