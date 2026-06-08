import "server-only";

import { prisma } from "@/lib/prisma";
import { getDiplomaConfig, saveDiplomaConfig } from "@/lib/diploma-config";
import {
  isTeacherAssignedToDiplomaSubject,
  normalizeSubjectId,
  type TeacherAssignedDiplomaSubject,
} from "@/lib/diploma-teacher-utils";

export type { TeacherAssignedDiplomaSubject, LinkedCourseOption } from "@/lib/diploma-teacher-utils";
export { applyCourseLinkToSubject } from "@/lib/diploma-teacher-utils";

export async function getTeacherAssignedDiplomaSubjects(
  instructorId: string
): Promise<TeacherAssignedDiplomaSubject[]> {
  const config = await getDiplomaConfig();
  const linkedCourseIds = Array.from(
    new Set(
      config.programs.flatMap((program) =>
        program.subjects.map((subject) => normalizeSubjectId(subject.courseId)).filter(Boolean)
      )
    )
  );

  const courses =
    linkedCourseIds.length > 0
      ? await prisma.course.findMany({
          where: { id: { in: linkedCourseIds } },
          select: { id: true, instructorId: true },
        })
      : [];

  const courseInstructorById = new Map(courses.map((course) => [course.id, course.instructorId]));

  return config.programs.flatMap((program) =>
    program.subjects
      .filter((subject) => isTeacherAssignedToDiplomaSubject(subject, instructorId, courseInstructorById))
      .map((subject) => {
        const viaTeacherId = normalizeSubjectId(subject.teacherId) === instructorId;
        return {
          programId: program.id,
          programTitle: program.title,
          programStatus: program.status,
          subject,
          accessVia: viaTeacherId ? ("teacherId" as const) : ("linkedCourse" as const),
        };
      })
  );
}

export async function teacherCanAccessDiplomaSubject(
  instructorId: string,
  programId: string,
  subjectId: string
): Promise<boolean> {
  const assigned = await getTeacherAssignedDiplomaSubjects(instructorId);
  return assigned.some((item) => item.programId === programId && item.subject.id === subjectId);
}

/** When admin assigns a course instructor, keep linked diploma subjects in sync. */
export async function syncDiplomaTeacherForCourse(courseId: string, instructorId: string) {
  const config = await getDiplomaConfig();
  let changed = false;

  const programs = config.programs.map((program) => ({
    ...program,
    subjects: program.subjects.map((subject) => {
      if (normalizeSubjectId(subject.courseId) !== courseId) return subject;
      if (normalizeSubjectId(subject.teacherId) === instructorId) return subject;
      changed = true;
      return { ...subject, teacherId: instructorId };
    }),
  }));

  if (!changed) return;

  await saveDiplomaConfig({ ...config, programs });
}
