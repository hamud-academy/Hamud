"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  DiplomaQuizQuestionConfig,
  DiplomaSubjectConfig,
  DiplomaSubjectLessonConfig,
  DiplomaSubjectModuleConfig,
} from "@/lib/diploma-config-defaults";
import DiplomaLessonReleasePanel from "@/components/DiplomaLessonReleasePanel";

type AssignedSubject = {
  programId: string;
  programTitle: string;
  programStatus: "DRAFT" | "PUBLISHED";
  subject: DiplomaSubjectConfig;
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100";
const textareaClass = `${inputClass} min-h-24 resize-y`;

function defaultQuizOptions() {
  return [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ];
}

function makeId(prefix: string) {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${suffix}`;
}

function assignmentKey(programId: string, subjectId: string) {
  return `${programId}:${subjectId}`;
}

function countLessons(modules: DiplomaSubjectModuleConfig[]) {
  return modules.reduce((total, curriculumModule) => total + curriculumModule.lessons.length, 0);
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

export default function TeacherDiplomaClient({
  assignedSubjects,
}: {
  assignedSubjects: AssignedSubject[];
}) {
  const router = useRouter();
  const [subjects, setSubjects] = useState(assignedSubjects);
  const [activeAssignmentKey, setActiveAssignmentKey] = useState(
    assignedSubjects[0] ? assignmentKey(assignedSubjects[0].programId, assignedSubjects[0].subject.id) : ""
  );
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(
    assignedSubjects[0]?.subject.modules?.[0]?.id ?? null
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<{ lessonId: string; type: "video" | "document" } | null>(null);
  const [examExpanded, setExamExpanded] = useState(true);
  const [rightPanel, setRightPanel] = useState<"curriculum" | "release">("curriculum");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const activeSubject = useMemo(
    () =>
      subjects.find(
        (item) => assignmentKey(item.programId, item.subject.id) === activeAssignmentKey
      ) ?? subjects[0],
    [activeAssignmentKey, subjects]
  );

  const activeModules = activeSubject?.subject.modules ?? [];

  function setSubjectModules(
    programId: string,
    subjectId: string,
    updater: (modules: DiplomaSubjectModuleConfig[]) => DiplomaSubjectModuleConfig[]
  ) {
    setSubjects((current) =>
      current.map((item) => {
        if (item.programId !== programId || item.subject.id !== subjectId) return item;
        const modules = updater(item.subject.modules ?? []).map((curriculumModule, index) => ({
          ...curriculumModule,
          order: index,
        }));

        return {
          ...item,
          subject: {
            ...item.subject,
            modules,
            lessons: modules.flatMap((curriculumModule) => curriculumModule.lessons),
          },
        };
      })
    );
  }

  function addModule() {
    if (!activeSubject) return;
    const title = newModuleTitle.trim();
    if (!title) {
      setMessage({ type: "err", text: "Module title is required." });
      return;
    }

    const nextModule: DiplomaSubjectModuleConfig = {
      id: makeId("module"),
      title,
      order: activeModules.length,
      lessons: [],
    };
    setSubjectModules(activeSubject.programId, activeSubject.subject.id, (modules) => [...modules, nextModule]);
    setExpandedModuleId(nextModule.id);
    setNewModuleTitle("");
    setMessage(null);
  }

  function updateModule(moduleId: string, updater: (curriculumModule: DiplomaSubjectModuleConfig) => DiplomaSubjectModuleConfig) {
    if (!activeSubject) return;
    setSubjectModules(activeSubject.programId, activeSubject.subject.id, (modules) =>
      modules.map((curriculumModule) => (curriculumModule.id === moduleId ? updater(curriculumModule) : curriculumModule))
    );
  }

  function removeModule(moduleId: string) {
    if (!activeSubject || !confirm("Delete this module and its lessons?")) return;
    setSubjectModules(activeSubject.programId, activeSubject.subject.id, (modules) =>
      modules.filter((curriculumModule) => curriculumModule.id !== moduleId)
    );
    if (expandedModuleId === moduleId) setExpandedModuleId(null);
  }

  function addLesson(moduleId: string) {
    const lesson: DiplomaSubjectLessonConfig = {
      id: makeId("lesson"),
      title: "New lesson",
      description: "",
      videoUrl: "",
      documentUrl: "",
      duration: "",
      quiz: { questions: [] },
    };
    updateModule(moduleId, (curriculumModule) => ({ ...curriculumModule, lessons: [...curriculumModule.lessons, lesson] }));
    setExpandedModuleId(moduleId);
  }

  function updateLesson(
    moduleId: string,
    lessonId: string,
    updater: (lesson: DiplomaSubjectLessonConfig) => DiplomaSubjectLessonConfig
  ) {
    updateModule(moduleId, (curriculumModule) => ({
      ...curriculumModule,
      lessons: curriculumModule.lessons.map((lesson) => (lesson.id === lessonId ? updater(lesson) : lesson)),
    }));
  }

  function removeLesson(moduleId: string, lessonId: string) {
    if (!confirm("Delete this lesson?")) return;
    updateModule(moduleId, (curriculumModule) => ({
      ...curriculumModule,
      lessons: curriculumModule.lessons.filter((lesson) => lesson.id !== lessonId),
    }));
  }

  function setQuizCorrectOption(moduleId: string, lessonId: string, questionIndex: number, optionIndex: number) {
    updateLesson(moduleId, lessonId, (lesson) => ({
      ...lesson,
      quiz: {
        questions: (lesson.quiz?.questions ?? []).map((question, qIndex) =>
          qIndex === questionIndex
            ? {
                ...question,
                options: question.options.map((option, oIndex) => ({
                  ...option,
                  isCorrect: oIndex === optionIndex,
                })),
              }
            : question
        ),
      },
    }));
  }

  function updateQuizQuestions(
    moduleId: string,
    lessonId: string,
    updater: (questions: DiplomaQuizQuestionConfig[]) => DiplomaQuizQuestionConfig[]
  ) {
    updateLesson(moduleId, lessonId, (lesson) => ({
      ...lesson,
      quiz: { questions: updater(lesson.quiz?.questions ?? []) },
    }));
  }

  function updateExam(updater: (exam: DiplomaSubjectConfig["exam"]) => DiplomaSubjectConfig["exam"]) {
    if (!activeSubject) return;
    setSubjects((current) =>
      current.map((item) =>
        item.programId === activeSubject.programId && item.subject.id === activeSubject.subject.id
          ? { ...item, subject: { ...item.subject, exam: updater(item.subject.exam) } }
          : item
      )
    );
  }

  function setExamCorrectOption(questionIndex: number, optionIndex: number) {
    updateExam((exam) => ({
      ...exam,
      questions: exam.questions.map((question, qIndex) =>
        qIndex === questionIndex
          ? {
              ...question,
              options: question.options.map((option, oIndex) => ({
                ...option,
                isCorrect: oIndex === optionIndex,
              })),
            }
          : question
      ),
    }));
  }

  async function uploadLessonFile(
    moduleId: string,
    lessonId: string,
    file: File | undefined,
    type: "video" | "document"
  ) {
    if (!file) return;
    setMessage(null);
    setUploading({ lessonId, type });
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(type === "video" ? "/api/upload/lesson-video" : "/api/upload/lesson-document", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Upload failed." });
        return;
      }
      updateLesson(moduleId, lessonId, (lesson) => ({
        ...lesson,
        [type === "video" ? "videoUrl" : "documentUrl"]: data.url,
      }));
      setMessage({ type: "ok", text: `${type === "video" ? "Video" : "Document"} uploaded. Click Save Curriculum.` });
    } catch {
      setMessage({ type: "err", text: "Upload failed." });
    } finally {
      setUploading(null);
    }
  }

  function validateQuizQuestions() {
    for (const curriculumModule of activeModules) {
      for (const lesson of curriculumModule.lessons) {
        const questions = lesson.quiz?.questions ?? [];
        for (let index = 0; index < questions.length; index++) {
          const question = questions[index];
          const options = question.options.filter((option) => option.text.trim());
          if (!question.prompt.trim()) {
            setMessage({ type: "err", text: `${lesson.title}: quiz question ${index + 1} needs question text.` });
            return false;
          }
          if (options.length < 2) {
            setMessage({ type: "err", text: `${lesson.title}: quiz question ${index + 1} needs at least two answers.` });
            return false;
          }
          if (options.filter((option) => option.isCorrect).length !== 1) {
            setMessage({ type: "err", text: `${lesson.title}: quiz question ${index + 1} needs exactly one correct answer.` });
            return false;
          }
        }
      }
    }
    return true;
  }

  function validateExamQuestions() {
    const exam = activeSubject?.subject.exam;
    if (!exam || exam.questions.length === 0) return true;
    for (let index = 0; index < exam.questions.length; index++) {
      const question = exam.questions[index];
      const options = question.options.filter((option) => option.text.trim());
      if (!question.prompt.trim()) {
        setMessage({ type: "err", text: `Final exam question ${index + 1} needs question text.` });
        return false;
      }
      if (options.length < 2) {
        setMessage({ type: "err", text: `Final exam question ${index + 1} needs at least two answers.` });
        return false;
      }
      if (options.filter((option) => option.isCorrect).length !== 1) {
        setMessage({ type: "err", text: `Final exam question ${index + 1} needs exactly one correct answer.` });
        return false;
      }
    }
    return true;
  }

  async function persistSubjectConfig(successMessage: string, collapseExam: boolean) {
    if (!activeSubject) return;
    if (!validateExamQuestions()) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/teacher/diploma/subjects/${encodeURIComponent(activeSubject.subject.id)}/modules`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId: activeSubject.programId,
          modules: activeModules,
          exam: activeSubject.subject.exam,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Failed to save diploma curriculum." });
        return;
      }

      setSubjectModules(activeSubject.programId, activeSubject.subject.id, () => data.modules ?? []);
      setMessage({ type: "ok", text: successMessage });
      if (collapseExam) setExamExpanded(false);
      router.refresh();
    } catch {
      setMessage({ type: "err", text: "Connection error while saving diploma curriculum." });
    } finally {
      setSaving(false);
    }
  }

  async function saveModules() {
    if (!validateQuizQuestions()) return;
    await persistSubjectConfig("Diploma curriculum saved successfully.", true);
  }

  async function saveExam() {
    await persistSubjectConfig("Exam saved successfully.", true);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Diploma Teaching</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Diploma Curriculum</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Build modules and lessons for the diploma subjects assigned to you by the admin.
          </p>
        </div>
        <button
          type="button"
          onClick={saveModules}
          disabled={saving || !activeSubject}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Curriculum"}
        </button>
      </div>

      {message && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            message.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/80 p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
          <p className="font-bold text-slate-800 dark:text-slate-100">No diploma subjects assigned yet</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Ask an admin to assign you under Admin → Diploma → Subjects &amp; Teachers, or link a platform course
            you already teach.
          </p>
        </div>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-4 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-extrabold text-slate-900">Assigned Subjects</h2>
              <p className="text-xs text-slate-500">{subjects.length} subjects assigned to you</p>
            </div>
            <div className="space-y-2">
              {subjects.map((item) => {
                const modules = item.subject.modules ?? [];
                const key = assignmentKey(item.programId, item.subject.id);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setActiveAssignmentKey(key);
                      setExpandedModuleId(modules[0]?.id ?? null);
                      setExamExpanded(true);
                      setRightPanel("curriculum");
                    }}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      activeAssignmentKey === key
                        ? "border-blue-300 bg-blue-50 text-blue-900"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block text-sm font-bold">{item.subject.title}</span>
                    <span className="mt-1 block text-xs text-slate-500">{item.programTitle}</span>
                    {item.programStatus === "DRAFT" ? (
                      <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                        Draft program
                      </span>
                    ) : null}
                    <span className="mt-1 block text-xs text-slate-500">
                      {modules.length} modules · {countLessons(modules)} lessons
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {activeSubject && (
            <div className="space-y-6">
              <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">{activeSubject.programTitle}</p>
                  {activeSubject.programStatus === "DRAFT" ? (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                      Draft
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">{activeSubject.subject.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{activeSubject.subject.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                  <span className="rounded-full bg-slate-100 px-3 py-1">{activeSubject.subject.code}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">{activeSubject.subject.duration}</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setRightPanel("curriculum")}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                      rightPanel === "curriculum"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Curriculum
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightPanel("release")}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                      rightPanel === "release"
                        ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Student Access
                  </button>
                </div>
              </div>

              {rightPanel === "release" ? (
                <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
                  <DiplomaLessonReleasePanel
                    mode="teacher"
                    programId={activeSubject.programId}
                    programTitle={activeSubject.programTitle}
                    fixedSubjectId={activeSubject.subject.id}
                    subjects={[
                      {
                        id: activeSubject.subject.id,
                        title: activeSubject.subject.title,
                        code: activeSubject.subject.code,
                      },
                    ]}
                  />
                </div>
              ) : (
              <>
              <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Course Final Exam</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      This exam is shown to students after they finish this diploma course/subject.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExamExpanded((open) => !open)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    {examExpanded ? "Hide Exam" : "Edit Exam"}
                  </button>
                </div>
                {!examExpanded ? (
                  <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Saved exam</p>
                    <h4 className="mt-1 text-lg font-extrabold text-slate-950">{activeSubject.subject.exam.title}</h4>
                    <p className="mt-1 text-sm text-slate-500">
                      {activeSubject.subject.exam.questions.length} questions · Pass mark{" "}
                      {activeSubject.subject.exam.passingScore}%
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_180px]">
                      <Field
                        label="Exam title"
                        value={activeSubject.subject.exam.title}
                        onChange={(value) => updateExam((exam) => ({ ...exam, title: value }))}
                      />
                      <Field
                        label="Passing score"
                        value={String(activeSubject.subject.exam.passingScore)}
                        onChange={(value) =>
                          updateExam((exam) => ({
                            ...exam,
                            passingScore: Number.isFinite(Number(value)) ? Number(value) : exam.passingScore,
                          }))
                        }
                        placeholder="50"
                      />
                    </div>
                    <div className="mt-5 space-y-3">
                      {activeSubject.subject.exam.questions.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                          No final exam questions yet.
                        </div>
                      ) : (
                        activeSubject.subject.exam.questions.map((question, questionIndex) => (
                          <div key={questionIndex} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                                Exam question {questionIndex + 1}
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  updateExam((exam) => ({
                                    ...exam,
                                    questions: exam.questions.filter((_, index) => index !== questionIndex),
                                  }))
                                }
                                className="text-xs font-bold text-red-600 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                            <input
                              className={inputClass}
                              value={question.prompt}
                              onChange={(e) =>
                                updateExam((exam) => {
                                  const questions = [...exam.questions];
                                  questions[questionIndex] = { ...questions[questionIndex], prompt: e.target.value };
                                  return { ...exam, questions };
                                })
                              }
                              placeholder="Question text"
                            />
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex flex-wrap items-center gap-2">
                                <input
                                  type="radio"
                                  name={`exam-correct-${activeSubject.subject.id}-${questionIndex}`}
                                  checked={option.isCorrect}
                                  onChange={() => setExamCorrectOption(questionIndex, optionIndex)}
                                />
                                <input
                                  className="min-w-[160px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                  value={option.text}
                                  onChange={(e) =>
                                    updateExam((exam) => {
                                      const questions = [...exam.questions];
                                      const options = [...questions[questionIndex].options];
                                      options[optionIndex] = { ...options[optionIndex], text: e.target.value };
                                      questions[questionIndex] = { ...questions[questionIndex], options };
                                      return { ...exam, questions };
                                    })
                                  }
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                                {question.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateExam((exam) => {
                                        const questions = [...exam.questions];
                                        let options = questions[questionIndex].options.filter((_, index) => index !== optionIndex);
                                        if (options.length > 0 && !options.some((item) => item.isCorrect)) {
                                          options = options.map((item, index) => ({
                                            ...item,
                                            isCorrect: index === 0,
                                          }));
                                        }
                                        questions[questionIndex] = { ...questions[questionIndex], options };
                                        return { ...exam, questions };
                                      })
                                    }
                                    className="text-xs font-bold text-slate-500 hover:text-red-600"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                updateExam((exam) => {
                                  const questions = [...exam.questions];
                                  questions[questionIndex] = {
                                    ...questions[questionIndex],
                                    options: [...questions[questionIndex].options, { text: "", isCorrect: false }],
                                  };
                                  return { ...exam, questions };
                                })
                              }
                              className="text-xs font-bold text-blue-600 hover:underline"
                            >
                              + Add answer option
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        onClick={saveExam}
                        disabled={saving || !activeSubject}
                        className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                      >
                        {saving ? "Saving..." : "Save Exam"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateExam((exam) => ({
                            ...exam,
                            questions: [...exam.questions, { prompt: "", options: defaultQuizOptions() }],
                          }))
                        }
                        className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                      >
                        Add Exam Question
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
                <h3 className="text-lg font-extrabold text-slate-900">Add module</h3>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    className={inputClass}
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                    placeholder="Module title (e.g. Introduction)"
                  />
                  <button
                    type="button"
                    onClick={addModule}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {activeModules.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
                  <p className="font-bold text-slate-800">No modules yet</p>
                  <p className="mt-1 text-sm text-slate-500">Create a module first, then add lessons inside it.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {activeModules.map((curriculumModule, moduleIndex) => {
                    const isOpen = expandedModuleId === curriculumModule.id;
                    return (
                      <div key={curriculumModule.id} className="rounded-[1.75rem] border border-slate-200 bg-white/90 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                          <button
                            type="button"
                            onClick={() => setExpandedModuleId(isOpen ? null : curriculumModule.id)}
                            className="flex min-w-0 items-center gap-3 text-left"
                          >
                            <span className={`transition ${isOpen ? "rotate-90" : ""}`}>›</span>
                            <span>
                              <span className="block font-extrabold text-slate-900">Module {moduleIndex + 1}</span>
                              <span className="block text-xs text-slate-500">{curriculumModule.lessons.length} lessons</span>
                            </span>
                          </button>
                          <div className="flex items-center gap-2">
                            <input
                              className="w-64 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                              value={curriculumModule.title}
                              onChange={(e) => updateModule(curriculumModule.id, (item) => ({ ...item, title: e.target.value }))}
                            />
                            <button
                              type="button"
                              onClick={() => removeModule(curriculumModule.id)}
                              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="space-y-4 p-5">
                            {curriculumModule.lessons.length === 0 ? (
                              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                                No lessons yet.
                              </div>
                            ) : (
                              curriculumModule.lessons.map((lesson, index) => (
                                <div key={lesson.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                  <div className="mb-4 flex items-center justify-between gap-3">
                                    <div>
                                      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                                        Lesson {index + 1}
                                      </p>
                                      <p className="mt-1 font-bold text-slate-900">{lesson.title}</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeLesson(curriculumModule.id, lesson.id)}
                                      className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                  <div className="grid gap-4 lg:grid-cols-2">
                                    <Field
                                      label="Lesson title"
                                      value={lesson.title}
                                      onChange={(value) =>
                                        updateLesson(curriculumModule.id, lesson.id, (item) => ({ ...item, title: value }))
                                      }
                                    />
                                    <Field
                                      label="Duration"
                                      value={lesson.duration}
                                      onChange={(value) =>
                                        updateLesson(curriculumModule.id, lesson.id, (item) => ({ ...item, duration: value }))
                                      }
                                      placeholder="20 minutes"
                                    />
                                    <div>
                                      <Field
                                        label="Video URL"
                                        value={lesson.videoUrl}
                                        onChange={(value) =>
                                          updateLesson(curriculumModule.id, lesson.id, (item) => ({ ...item, videoUrl: value }))
                                        }
                                        placeholder="YouTube, Vimeo, or direct link"
                                      />
                                      <input
                                        id={`video-${lesson.id}`}
                                        type="file"
                                        accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogg,.mov"
                                        className="hidden"
                                        onChange={(e) => {
                                          uploadLessonFile(curriculumModule.id, lesson.id, e.target.files?.[0], "video");
                                          e.target.value = "";
                                        }}
                                      />
                                      <label
                                        htmlFor={`video-${lesson.id}`}
                                        className="mt-2 inline-flex cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                                      >
                                        {uploading?.lessonId === lesson.id && uploading.type === "video"
                                          ? "Uploading..."
                                          : "Or upload video (MP4, WebM, OGG, MOV - max 5GB)"}
                                      </label>
                                    </div>
                                    <div>
                                      <Field
                                        label="Document URL"
                                        value={lesson.documentUrl}
                                        onChange={(value) =>
                                          updateLesson(curriculumModule.id, lesson.id, (item) => ({ ...item, documentUrl: value }))
                                        }
                                        placeholder="PDF, Word, Excel link"
                                      />
                                      <input
                                        id={`document-${lesson.id}`}
                                        type="file"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                        className="hidden"
                                        onChange={(e) => {
                                          uploadLessonFile(curriculumModule.id, lesson.id, e.target.files?.[0], "document");
                                          e.target.value = "";
                                        }}
                                      />
                                      <label
                                        htmlFor={`document-${lesson.id}`}
                                        className="mt-2 inline-flex cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                                      >
                                        {uploading?.lessonId === lesson.id && uploading.type === "document"
                                          ? "Uploading..."
                                          : "Or upload document (PDF, DOC, DOCX, XLS, XLSX - max 50MB)"}
                                      </label>
                                    </div>
                                    <label className="block lg:col-span-2">
                                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Lesson description
                                      </span>
                                      <textarea
                                        className={textareaClass}
                                        value={lesson.description}
                                        onChange={(e) =>
                                          updateLesson(curriculumModule.id, lesson.id, (item) => ({
                                            ...item,
                                            description: e.target.value,
                                          }))
                                        }
                                      />
                                    </label>
                                    <div className="space-y-3 border-t border-slate-200 pt-4 lg:col-span-2">
                                      <div className="flex flex-wrap items-center justify-between gap-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                          Quiz (optional - multiple choice)
                                        </p>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateQuizQuestions(curriculumModule.id, lesson.id, (questions) => [
                                              ...questions,
                                              { prompt: "", options: defaultQuizOptions() },
                                            ])
                                          }
                                          className="text-sm font-bold text-blue-600 hover:underline"
                                        >
                                          + Add quiz question
                                        </button>
                                      </div>

                                      {(lesson.quiz?.questions ?? []).map((question, questionIndex) => (
                                        <div
                                          key={questionIndex}
                                          className="space-y-3 rounded-xl border border-slate-200 bg-white p-3"
                                        >
                                          <div className="flex items-center justify-between gap-3">
                                            <span className="text-xs font-bold text-slate-500">
                                              Question {questionIndex + 1}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                updateQuizQuestions(curriculumModule.id, lesson.id, (questions) =>
                                                  questions.filter((_, index) => index !== questionIndex)
                                                )
                                              }
                                              className="text-xs font-bold text-red-600 hover:underline"
                                            >
                                              Remove
                                            </button>
                                          </div>
                                          <input
                                            className={inputClass}
                                            value={question.prompt}
                                            onChange={(e) =>
                                              updateQuizQuestions(curriculumModule.id, lesson.id, (questions) => {
                                                const next = [...questions];
                                                next[questionIndex] = { ...next[questionIndex], prompt: e.target.value };
                                                return next;
                                              })
                                            }
                                            placeholder="Question text"
                                          />
                                          <p className="text-xs text-slate-500">Answers - select the correct one:</p>
                                          {question.options.map((option, optionIndex) => (
                                            <div key={optionIndex} className="flex flex-wrap items-center gap-2">
                                              <input
                                                type="radio"
                                                name={`correct-${lesson.id}-${questionIndex}`}
                                                checked={option.isCorrect}
                                                onChange={() =>
                                                  setQuizCorrectOption(
                                                    curriculumModule.id,
                                                    lesson.id,
                                                    questionIndex,
                                                    optionIndex
                                                  )
                                                }
                                              />
                                              <input
                                                className="min-w-[160px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                                value={option.text}
                                                onChange={(e) =>
                                                  updateQuizQuestions(curriculumModule.id, lesson.id, (questions) => {
                                                    const next = [...questions];
                                                    const options = [...next[questionIndex].options];
                                                    options[optionIndex] = { ...options[optionIndex], text: e.target.value };
                                                    next[questionIndex] = { ...next[questionIndex], options };
                                                    return next;
                                                  })
                                                }
                                                placeholder={`Option ${optionIndex + 1}`}
                                              />
                                              {question.options.length > 2 && (
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    updateQuizQuestions(curriculumModule.id, lesson.id, (questions) => {
                                                      const next = [...questions];
                                                      let options = next[questionIndex].options.filter(
                                                        (_, index) => index !== optionIndex
                                                      );
                                                      if (options.length > 0 && !options.some((item) => item.isCorrect)) {
                                                        options = options.map((item, index) => ({
                                                          ...item,
                                                          isCorrect: index === 0,
                                                        }));
                                                      }
                                                      next[questionIndex] = { ...next[questionIndex], options };
                                                      return next;
                                                    })
                                                  }
                                                  className="text-xs font-bold text-slate-500 hover:text-red-600"
                                                >
                                                  Remove
                                                </button>
                                              )}
                                            </div>
                                          ))}
                                          <button
                                            type="button"
                                            onClick={() =>
                                              updateQuizQuestions(curriculumModule.id, lesson.id, (questions) => {
                                                const next = [...questions];
                                                next[questionIndex] = {
                                                  ...next[questionIndex],
                                                  options: [
                                                    ...next[questionIndex].options,
                                                    { text: "", isCorrect: false },
                                                  ],
                                                };
                                                return next;
                                              })
                                            }
                                            className="text-xs font-bold text-blue-600 hover:underline"
                                          >
                                            + Add answer option
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}

                            <button
                              type="button"
                              onClick={() => addLesson(curriculumModule.id)}
                              className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-bold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                            >
                              + Add lesson
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              </>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
