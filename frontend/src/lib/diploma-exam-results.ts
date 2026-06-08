import { getAppConfig, saveAppConfig } from "@/lib/app-config-store";

export type DiplomaExamResult = {
  userId: string;
  programId: string;
  programTitle: string;
  subjectId: string;
  subjectTitle: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  submittedAt: string;
};

const CONFIG_KEY = "diploma-exam-results";

function resultKey(userId: string, programId: string, subjectId: string) {
  return `${userId}:${programId}:${subjectId}`;
}

export async function getDiplomaExamResults() {
  return (await getAppConfig<Record<string, DiplomaExamResult>>(CONFIG_KEY)) ?? {};
}

export async function getStudentDiplomaExamResults(userId: string) {
  const results = await getDiplomaExamResults();
  return Object.values(results).filter((result) => result.userId === userId);
}

export async function saveDiplomaExamResult(result: DiplomaExamResult) {
  const results = await getDiplomaExamResults();
  results[resultKey(result.userId, result.programId, result.subjectId)] = result;
  await saveAppConfig(CONFIG_KEY, results);
  return result;
}
