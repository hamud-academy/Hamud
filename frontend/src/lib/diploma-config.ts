import { getAppConfig, saveAppConfig } from "@/lib/app-config-store";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import {
  defaultDiplomaConfig,
  DIPLOMA_PLAN_LABELS,
  DIPLOMA_PLAN_THEMES,
  DIPLOMA_PLAN_TYPES,
  buildDefaultPaymentPlans,
  type DiplomaConfig,
  type DiplomaPaymentPlanConfig,
  type DiplomaPlanType,
  type DiplomaProgramConfig,
  type DiplomaSubjectConfig,
  type DiplomaSubjectLessonConfig,
  type DiplomaSubjectModuleConfig,
} from "@/lib/diploma-config-defaults";

const CONFIG_KEY = "diploma-config";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeList(values: unknown, fallback: string[]) {
  if (!Array.isArray(values)) return fallback;
  const list = values.map((item) => String(item).trim()).filter(Boolean).slice(0, 12);
  return list.length > 0 ? list : fallback;
}

function normalizeLesson(item: Partial<DiplomaSubjectLessonConfig> | null | undefined, index: number): DiplomaSubjectLessonConfig {
  const title = item?.title?.trim() || `Lesson ${index + 1}`;

  return {
    id: item?.id?.trim() || slugify(title) || `lesson-${index + 1}`,
    title,
    description: item?.description?.trim().slice(0, 800) || "",
    videoUrl: item?.videoUrl?.trim().slice(0, 1000) || "",
    documentUrl: item?.documentUrl?.trim().slice(0, 1000) || "",
    duration: item?.duration?.trim().slice(0, 80) || "",
    quiz: {
      questions: Array.isArray(item?.quiz?.questions)
        ? item.quiz.questions.slice(0, 40).map((question) => ({
            prompt: String(question.prompt ?? "").trim().slice(0, 500),
            options: Array.isArray(question.options)
              ? question.options.slice(0, 8).map((option) => ({
                  text: String(option.text ?? "").trim().slice(0, 300),
                  isCorrect: Boolean(option.isCorrect),
                }))
              : [],
          }))
        : [],
    },
  };
}

function normalizeModule(item: Partial<DiplomaSubjectModuleConfig> | null | undefined, index: number): DiplomaSubjectModuleConfig {
  const title = item?.title?.trim() || `Module ${index + 1}`;

  return {
    id: item?.id?.trim() || slugify(title) || `module-${index + 1}`,
    title,
    order: Number.isFinite(item?.order) ? Number(item?.order) : index,
    lessons: Array.isArray(item?.lessons)
      ? item.lessons.slice(0, 80).map((lesson, lessonIndex) => normalizeLesson(lesson, lessonIndex))
      : [],
  };
}

function normalizeExam(item: Partial<DiplomaSubjectConfig["exam"]> | null | undefined, title: string) {
  const questions = Array.isArray(item?.questions)
    ? item.questions.slice(0, 80).map((question) => ({
        prompt: String(question.prompt ?? "").trim().slice(0, 500),
        options: Array.isArray(question.options)
          ? question.options.slice(0, 8).map((option) => ({
              text: String(option.text ?? "").trim().slice(0, 300),
              isCorrect: Boolean(option.isCorrect),
            }))
          : [],
      }))
    : [];
  const passingScore = Number(item?.passingScore);

  return {
    title: item?.title?.trim().slice(0, 180) || `${title} Final Exam`,
    passingScore: Number.isFinite(passingScore) ? Math.min(100, Math.max(0, Math.round(passingScore))) : 50,
    questions,
  };
}

function normalizeSubject(item: Partial<DiplomaSubjectConfig> | null | undefined, index: number): DiplomaSubjectConfig {
  const title = item?.title?.trim() || `Subject ${index + 1}`;
  const legacyLessons = Array.isArray(item?.lessons)
    ? item.lessons.slice(0, 60).map((lesson, lessonIndex) => normalizeLesson(lesson, lessonIndex))
    : [];
  const modules =
    Array.isArray(item?.modules) && item.modules.length > 0
      ? item.modules.slice(0, 40).map((module, moduleIndex) => normalizeModule(module, moduleIndex))
      : legacyLessons.length > 0
        ? [{ id: "module-1", title: "Module 1", order: 0, lessons: legacyLessons }]
        : [];

  return {
    id: item?.id?.trim() || slugify(title) || `subject-${index + 1}`,
    title,
    code: item?.code?.trim().slice(0, 32) || `SUB-${index + 1}`,
    description: item?.description?.trim().slice(0, 500) || "Subject description coming soon.",
    duration: item?.duration?.trim().slice(0, 80) || "Schedule TBA",
    teacherId: item?.teacherId?.trim() || "",
    courseId: item?.courseId?.trim() || "",
    lessons: legacyLessons,
    modules,
    exam: normalizeExam(item?.exam, title),
  };
}

function normalizePaymentPlan(
  item: Partial<DiplomaPaymentPlanConfig> | null | undefined,
  type: DiplomaPlanType,
  fallbackPlans: DiplomaPaymentPlanConfig[]
): DiplomaPaymentPlanConfig {
  const fallback = fallbackPlans.find((plan) => plan.type === type) ?? fallbackPlans[0];
  const theme = item?.theme === "orange" || item?.theme === "blue" || item?.theme === "green" || item?.theme === "red"
    ? item.theme
    : DIPLOMA_PLAN_THEMES[type];

  return {
    type,
    title: item?.title?.trim().slice(0, 120) || fallback.title || DIPLOMA_PLAN_LABELS[type],
    subtitle: item?.subtitle?.trim().slice(0, 180) || fallback.subtitle,
    originalPrice: item?.originalPrice?.trim().slice(0, 40) || fallback.originalPrice,
    price: item?.price?.trim().slice(0, 40) || fallback.price,
    priceSuffix: item?.priceSuffix?.trim().slice(0, 40) || fallback.priceSuffix,
    theme,
    courses: item?.courses?.trim().slice(0, 80) || fallback.courses,
    details: normalizeList(item?.details, fallback.details),
    ctaLabel: item?.ctaLabel?.trim().slice(0, 80) || fallback.ctaLabel,
    ctaHref: item?.ctaHref?.trim().slice(0, 300) || fallback.ctaHref,
  };
}

function normalizePaymentPlans(
  values: unknown,
  coursesLabel: string,
  fallbackPlans: DiplomaPaymentPlanConfig[]
): DiplomaPaymentPlanConfig[] {
  const defaults = fallbackPlans.length > 0 ? fallbackPlans : buildDefaultPaymentPlans(coursesLabel);
  const source = Array.isArray(values) ? values : [];

  return DIPLOMA_PLAN_TYPES.map((type) => {
    const match = source.find((item) => item?.type === type);
    return normalizePaymentPlan(match, type, defaults);
  });
}

function programsMatch(
  a: { id?: string; slug?: string },
  b: { id: string; slug: string }
): boolean {
  return (
    (Boolean(a.id) && (a.id === b.id || a.id === b.slug)) ||
    (Boolean(a.slug) && (a.slug === b.id || a.slug === b.slug))
  );
}

function findDefaultProgramFallback(
  item: Partial<DiplomaProgramConfig> | null | undefined,
  index: number
): DiplomaProgramConfig {
  if (item?.id) {
    const byId = defaultDiplomaConfig.programs.find((program) => program.id === item.id);
    if (byId) return byId;
  }
  if (item?.slug) {
    const bySlug = defaultDiplomaConfig.programs.find(
      (program) => program.slug === item.slug || program.id === item.slug
    );
    if (bySlug) return bySlug;
  }
  if (item?.title) {
    const slug = slugify(item.title);
    const byTitle = defaultDiplomaConfig.programs.find((program) => program.slug === slug);
    if (byTitle) return byTitle;
  }
  return defaultDiplomaConfig.programs[index] ?? defaultDiplomaConfig.programs[0];
}

function mergeProgramsWithDefaults(
  storedRaw: Partial<DiplomaProgramConfig>[] | undefined
): DiplomaProgramConfig[] {
  if (!Array.isArray(storedRaw) || storedRaw.length === 0) {
    return defaultDiplomaConfig.programs.map((program, index) => normalizeProgram(program, index));
  }

  const merged = storedRaw.slice(0, 24).map((program, index) => normalizeProgram(program, index));

  defaultDiplomaConfig.programs.forEach((defaultProgram, index) => {
    const alreadyPresent = merged.some((program) => programsMatch(program, defaultProgram));
    if (!alreadyPresent) {
      merged.push(normalizeProgram(defaultProgram, index));
    }
  });

  return merged.slice(0, 24);
}

function normalizeProgram(item: Partial<DiplomaProgramConfig> | null | undefined, index: number): DiplomaProgramConfig {
  const fallback = findDefaultProgramFallback(item, index);
  const title = item?.title?.trim() || fallback.title || `Diploma Program ${index + 1}`;
  const subjects =
    Array.isArray(item?.subjects) && item.subjects.length > 0
      ? item.subjects.slice(0, 20).map((subject, subjectIndex) => normalizeSubject(subject, subjectIndex))
      : fallback.subjects;

  const courses = item?.courses?.trim().slice(0, 80) || fallback.courses;
  const fallbackPlans =
    Array.isArray(fallback.paymentPlans) && fallback.paymentPlans.length > 0
      ? fallback.paymentPlans
      : buildDefaultPaymentPlans(courses);

  return {
    id: item?.id?.trim() || fallback.id || slugify(title) || `diploma-${index + 1}`,
    title,
    slug: item?.slug?.trim() || fallback.slug || slugify(title) || `diploma-${index + 1}`,
    summary: item?.summary?.trim().slice(0, 600) || fallback.summary,
    duration: item?.duration?.trim().slice(0, 80) || fallback.duration,
    courses,
    status: item?.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
    details: normalizeList(item?.details, fallback.details),
    paymentPlans: normalizePaymentPlans(item?.paymentPlans, courses, fallbackPlans),
    subjects,
  };
}

export function normalizeDiplomaConfig(data: Partial<DiplomaConfig> | null | undefined): DiplomaConfig {
  const programs = mergeProgramsWithDefaults(data?.programs);

  return {
    spotlightEyebrow: data?.spotlightEyebrow?.trim() || defaultDiplomaConfig.spotlightEyebrow,
    spotlightTitle: data?.spotlightTitle?.trim() || defaultDiplomaConfig.spotlightTitle,
    spotlightDescription: data?.spotlightDescription?.trim() || defaultDiplomaConfig.spotlightDescription,
    spotlightFeatures: normalizeList(data?.spotlightFeatures, defaultDiplomaConfig.spotlightFeatures),
    heroEyebrow: data?.heroEyebrow?.trim() || defaultDiplomaConfig.heroEyebrow,
    heroTitle: data?.heroTitle?.trim() || defaultDiplomaConfig.heroTitle,
    heroDescription: data?.heroDescription?.trim() || defaultDiplomaConfig.heroDescription,
    heroImageUrl:
      resolveMediaUrl(data?.heroImageUrl ?? defaultDiplomaConfig.heroImageUrl) ??
      defaultDiplomaConfig.heroImageUrl,
    ctaLabel: data?.ctaLabel?.trim() || defaultDiplomaConfig.ctaLabel,
    ctaHref: data?.ctaHref?.trim() || defaultDiplomaConfig.ctaHref,
    secondaryCtaLabel: data?.secondaryCtaLabel?.trim() || defaultDiplomaConfig.secondaryCtaLabel,
    secondaryCtaHref: data?.secondaryCtaHref?.trim() || defaultDiplomaConfig.secondaryCtaHref,
    programsEyebrow: data?.programsEyebrow?.trim() || defaultDiplomaConfig.programsEyebrow,
    programsTitle: data?.programsTitle?.trim() || defaultDiplomaConfig.programsTitle,
    programs,
  };
}

export async function getDiplomaConfig(): Promise<DiplomaConfig> {
  const config = await getAppConfig<Partial<DiplomaConfig>>(CONFIG_KEY);
  return normalizeDiplomaConfig(config);
}

export async function saveDiplomaConfig(config: DiplomaConfig): Promise<DiplomaConfig> {
  const normalized = normalizeDiplomaConfig(config);
  await saveAppConfig(CONFIG_KEY, normalized);
  return normalized;
}

/** Preserve teacher-built modules/exams when admin saves metadata from stale client state. */
export function mergeAdminDiplomaConfig(current: DiplomaConfig, incoming: DiplomaConfig): DiplomaConfig {
  const currentProgramsById = new Map(current.programs.map((program) => [program.id, program]));

  const programs = incoming.programs.map((incomingProgram) => {
    const existingProgram = currentProgramsById.get(incomingProgram.id);
    if (!existingProgram) return incomingProgram;

    const existingSubjectsById = new Map(existingProgram.subjects.map((subject) => [subject.id, subject]));

    const subjects = incomingProgram.subjects.map((incomingSubject) => {
      const existingSubject = existingSubjectsById.get(incomingSubject.id);
      if (!existingSubject) return incomingSubject;

      return {
        ...incomingSubject,
        teacherId: incomingSubject.teacherId?.trim() || existingSubject.teacherId,
        courseId: incomingSubject.courseId?.trim() || existingSubject.courseId || "",
        modules: existingSubject.modules,
        lessons: existingSubject.lessons,
        exam: existingSubject.exam,
      };
    });

    return {
      ...incomingProgram,
      subjects,
    };
  });

  return normalizeDiplomaConfig({
    ...incoming,
    programs,
  });
}

export function countSubjectCurriculum(subject: DiplomaSubjectConfig) {
  const modules = subject.modules ?? [];
  const lessons = modules.reduce((total, curriculumModule) => total + curriculumModule.lessons.length, 0);
  const examQuestions = subject.exam?.questions?.length ?? 0;
  return { modules: modules.length, lessons, examQuestions };
}
