import type { DiplomaConfig } from "@/lib/diploma-config-defaults";

export type TeacherCourseAssignment = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  studentCount: number;
};

export type TeacherDiplomaSubjectAssignment = {
  id: string;
  programId: string;
  programTitle: string;
  subjectTitle: string;
  subjectCode: string;
};

export function getTeacherDiplomaSubjects(
  diplomaConfig: DiplomaConfig,
  teacherId: string
): TeacherDiplomaSubjectAssignment[] {
  const assignments: TeacherDiplomaSubjectAssignment[] = [];

  for (const program of diplomaConfig.programs) {
    for (const subject of program.subjects) {
      if (subject.teacherId !== teacherId) continue;
      assignments.push({
        id: `${program.id}:${subject.id}`,
        programId: program.id,
        programTitle: program.title,
        subjectTitle: subject.title,
        subjectCode: subject.code,
      });
    }
  }

  return assignments.sort((a, b) => a.programTitle.localeCompare(b.programTitle));
}
