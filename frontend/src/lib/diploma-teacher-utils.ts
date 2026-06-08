import type { DiplomaSubjectConfig } from "@/lib/diploma-config-defaults";

export type TeacherAssignedDiplomaSubject = {
  programId: string;
  programTitle: string;
  programStatus: "DRAFT" | "PUBLISHED";
  subject: DiplomaSubjectConfig;
  accessVia: "teacherId" | "linkedCourse";
};

export type LinkedCourseOption = {
  id: string;
  title: string;
  instructorId: string;
};

export function normalizeSubjectId(value: string | null | undefined) {
  return value?.trim() ?? "";
}

export function isTeacherAssignedToDiplomaSubject(
  subject: DiplomaSubjectConfig,
  instructorId: string,
  courseInstructorById: Map<string, string>
) {
  const teacherId = normalizeSubjectId(subject.teacherId);
  if (teacherId && teacherId === instructorId) return true;

  const courseId = normalizeSubjectId(subject.courseId);
  if (courseId && courseInstructorById.get(courseId) === instructorId) return true;

  return false;
}

export function applyCourseLinkToSubject(
  subject: DiplomaSubjectConfig,
  courseId: string,
  instructorId: string | null | undefined
): DiplomaSubjectConfig {
  const nextCourseId = courseId.trim();
  if (!nextCourseId) {
    return { ...subject, courseId: "" };
  }

  return {
    ...subject,
    courseId: nextCourseId,
    teacherId: instructorId?.trim() || subject.teacherId,
  };
}
