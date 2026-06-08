import { auth } from "@/auth";
import { getDiplomaConfig } from "@/lib/diploma-config";
import { buildProgramCompletionMap } from "@/lib/diploma-completion";
import { getStudentDiplomaExamResults } from "@/lib/diploma-exam-results";
import {
  getCompletedLessonIdsForSubject,
  getStudentDiplomaLessonCompletions,
  getSubjectProgress,
} from "@/lib/diploma-lesson-completions";
import { batchGetStudentReleaseContexts } from "@/lib/diploma-lesson-releases";
import {
  getAllLessonsFromSubject,
  getStudentEnrolledProgramIds,
  isDiplomaProgramEnrolled,
  mapSubjectModulesForStudent,
} from "@/lib/diploma-student-access";
import DashboardDiplomaClient from "./DashboardDiplomaClient";

export const dynamic = "force-dynamic";

export default async function DashboardDiplomaPage() {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string } | undefined;
  if (!user?.id) return null;
  const userId = user.id;

  const [config, results, enrolledSet, lessonCompletions] = await Promise.all([
    getDiplomaConfig(),
    getStudentDiplomaExamResults(userId),
    getStudentEnrolledProgramIds(userId, user.email),
    getStudentDiplomaLessonCompletions(userId),
  ]);

  const enrolledPrograms = config.programs.filter(
    (program) => program.status === "PUBLISHED" && isDiplomaProgramEnrolled(program, enrolledSet)
  );
  const completionMap = buildProgramCompletionMap(enrolledPrograms, results, lessonCompletions);

  const programs = await Promise.all(
    enrolledPrograms.map(async (program) => {
      const completion = completionMap.get(program.id);
      const releaseContexts = await batchGetStudentReleaseContexts(
        userId,
        program.subjects.map((subject) => ({ programId: program.id, subjectId: subject.id }))
      );

      return {
        id: program.id,
        title: program.title,
        summary: program.summary,
        completion: {
          completed: completion?.completed ?? false,
          completedAtIso: completion?.completedAtIso ?? null,
          certificateUrl: completion?.certificateUrl ?? null,
        },
        subjects: await Promise.all(
          program.subjects.map(async (subject) => {
            const completedLessonIds = await getCompletedLessonIdsForSubject(
              userId,
              program.id,
              subject.id
            );
            const lessonIds = getAllLessonsFromSubject(subject).map((lesson) => lesson.id);
            const progress = getSubjectProgress(lessonIds, completedLessonIds);
            const releaseContext = releaseContexts.get(`${program.id}:${subject.id}`) ?? {
              guidedMode: false,
              releasedLessonIds: new Set<string>(),
            };

            return {
              id: subject.id,
              title: subject.title,
              code: subject.code,
              description: subject.description,
              guidedMode: releaseContext.guidedMode,
              modules: mapSubjectModulesForStudent(subject, completedLessonIds, releaseContext),
              progress,
              exam: {
                title: subject.exam.title,
                passingScore: subject.exam.passingScore,
                questions: subject.exam.questions.map((question, questionIndex) => ({
                  id: String(questionIndex),
                  prompt: question.prompt,
                  options: question.options.map((option, optionIndex) => ({
                    id: String(optionIndex),
                    text: option.text,
                  })),
                })),
              },
            };
          })
        ),
      };
    })
  );

  return (
    <div className="max-w-6xl mx-auto">
      <DashboardDiplomaClient programs={programs} initialResults={results} />
    </div>
  );
}
