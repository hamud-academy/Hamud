"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type QuizOptionDraft = { text: string; isCorrect: boolean };
type QuizQuestionDraft = { prompt: string; options: QuizOptionDraft[] };

function defaultQuizOptions(): QuizOptionDraft[] {
  return [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ];
}

interface Lesson {
  id: string;
  title: string;
  videoUrl: string | null;
  documentUrl: string | null;
  hasQuiz?: boolean;
  duration: number | null;
  order: number;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Props {
  courseId: string;
  initialModules: Module[];
}

export default function CurriculumManager({ courseId, initialModules }: Props) {
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [expandedModule, setExpandedModule] = useState<string | null>(
    initialModules[0]?.id ?? null
  );
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [newLesson, setNewLesson] = useState<{
    moduleId: string;
    title: string;
    videoUrl: string;
    documentUrl: string;
    quiz: { questions: QuizQuestionDraft[] };
  } | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [error, setError] = useState("");
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  async function handleAddModule() {
    if (!newModuleTitle.trim()) return;
    setError("");
    setAddingModule(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newModuleTitle.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setModules((prev) => [...prev, { ...data.module, lessons: [] }]);
      setNewModuleTitle("");
      setExpandedModule(data.module.id);
      router.refresh();
    } catch {
      setError("Connection error");
    } finally {
      setAddingModule(false);
    }
  }

  async function handleDeleteModule(moduleId: string) {
    if (!confirm("Are you sure you want to delete this module?")) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/modules/${moduleId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Error");
        return;
      }
      setModules((prev) => prev.filter((m) => m.id !== moduleId));
      router.refresh();
    } catch {
      setError("Error");
    }
  }

  function startAddLesson(moduleId: string) {
    setNewLesson({
      moduleId,
      title: "",
      videoUrl: "",
      documentUrl: "",
      quiz: { questions: [] },
    });
  }

  function cancelAddLesson() {
    setNewLesson(null);
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !newLesson) return;
    setError("");
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/lesson-video", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      setNewLesson((n) => n && { ...n, videoUrl: data.url });
    } catch {
      setError("Upload failed");
    } finally {
      setUploadingVideo(false);
      e.target.value = "";
    }
  }

  async function handleDocumentUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !newLesson) return;
    setError("");
    setUploadingDocument(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/lesson-document", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      setNewLesson((n) => n && { ...n, documentUrl: data.url });
    } catch {
      setError("Upload failed");
    } finally {
      setUploadingDocument(false);
      e.target.value = "";
    }
  }

  function setQuizCorrectOption(qIdx: number, optIdx: number) {
    setNewLesson((n) => {
      if (!n) return n;
      const questions = n.quiz.questions.map((q, i) => {
        if (i !== qIdx) return q;
        return {
          ...q,
          options: q.options.map((o, j) => ({
            ...o,
            isCorrect: j === optIdx,
          })),
        };
      });
      return { ...n, quiz: { questions } };
    });
  }

  async function handleAddLesson() {
    if (!newLesson || !newLesson.title.trim()) return;
    setError("");

    let quizPayload: { questions: { prompt: string; options: { text: string; isCorrect: boolean }[] }[] } | undefined;
    if (newLesson.quiz.questions.length > 0) {
      const cleaned = newLesson.quiz.questions.map((q) => {
        const prompt = q.prompt.trim();
        const options = q.options
          .map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect }))
          .filter((o) => o.text.length > 0);
        return { prompt, options };
      });
      for (let i = 0; i < cleaned.length; i++) {
        if (!cleaned[i].prompt) {
          setError(`Quiz question ${i + 1}: enter the question text.`);
          return;
        }
        if (cleaned[i].options.length < 2) {
          setError(`Quiz question ${i + 1}: add at least two answer options with text.`);
          return;
        }
        const correct = cleaned[i].options.filter((o) => o.isCorrect);
        if (correct.length !== 1) {
          setError(`Quiz question ${i + 1}: select exactly one correct answer.`);
          return;
        }
      }
      quizPayload = { questions: cleaned };
    }

    try {
      const res = await fetch(`/api/admin/modules/${newLesson.moduleId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newLesson.title.trim(),
          videoUrl: newLesson.videoUrl.trim() || null,
          documentUrl: newLesson.documentUrl.trim() || null,
          ...(quizPayload ? { quiz: quizPayload } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error");
        return;
      }
      setModules((prev) =>
        prev.map((m) =>
          m.id === newLesson.moduleId
            ? { ...m, lessons: [...m.lessons, { ...data.lesson }] }
            : m
        )
      );
      setNewLesson(null);
      router.refresh();
    } catch {
      setError("Error");
    }
  }

  async function handleDeleteLesson(moduleId: string, lessonId: string) {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Error");
        return;
      }
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
            : m
        )
      );
      router.refresh();
    } catch {
      setError("Error");
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {/* Add module */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add module</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            placeholder="Module title (e.g. Introduction to AI)"
            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg"
            onKeyDown={(e) => e.key === "Enter" && handleAddModule()}
          />
          <button
            onClick={handleAddModule}
            disabled={addingModule || !newModuleTitle.trim()}
            className="px-4 py-2 rounded-lg border-2 border-blue-500 bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50"
          >
            {addingModule ? "Adding..." : "Add"}
          </button>
        </div>
      </div>

      {/* Modules list */}
      <div className="space-y-4">
        {modules.length === 0 && (
          <p className="text-gray-500 py-8 text-center">
            No modules yet. Add one above.
          </p>
        )}
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden"
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() =>
                setExpandedModule((x) => (x === mod.id ? null : mod.id))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setExpandedModule((x) => (x === mod.id ? null : mod.id));
                }
              }}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <svg
                  className={`w-5 h-5 text-gray-400 transition ${expandedModule === mod.id ? "rotate-90" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="font-semibold text-gray-900">{mod.title}</span>
                <span className="text-sm text-gray-500">({mod.lessons.length} lessons)</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteModule(mod.id);
                }}
                className="text-red-600 text-sm hover:underline"
              >
                Delete
              </button>
            </div>

            {expandedModule === mod.id && (
              <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Lessons</h3>
                <div className="space-y-2">
                  {mod.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between gap-4 p-3 bg-white rounded-lg border border-gray-100"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{lesson.title}</p>
                        {lesson.videoUrl && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">{lesson.videoUrl}</p>
                        )}
                        {lesson.documentUrl && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">{lesson.documentUrl}</p>
                        )}
                        {lesson.hasQuiz && (
                          <p className="text-xs text-blue-600 mt-0.5">Quiz attached</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteLesson(mod.id, lesson.id)}
                        className="text-red-600 text-sm hover:underline flex-shrink-0"
                      >
                        Delete
                      </button>
                    </div>
                  ))}

                  {newLesson?.moduleId === mod.id ? (
                    <div className="p-4 bg-white rounded-lg border-2 border-blue-200 space-y-3">
                      <input
                        type="text"
                        value={newLesson.title}
                        onChange={(e) =>
                          setNewLesson((n) => n && { ...n, title: e.target.value })
                        }
                        placeholder="Lesson title"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg"
                      />
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Video (URL or upload)</label>
                        <input
                          type="url"
                          value={newLesson.videoUrl}
                          onChange={(e) =>
                            setNewLesson((n) => n && { ...n, videoUrl: e.target.value })
                          }
                          placeholder="YouTube, Vimeo, ama direct link (http://...)"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg mb-2"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            ref={videoInputRef}
                            type="file"
                            accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogg,.mov"
                            onChange={handleVideoUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => videoInputRef.current?.click()}
                            disabled={uploadingVideo}
                            className="px-3 py-2 rounded-lg border-2 border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                          >
                            {uploadingVideo ? "Uploading..." : "Or upload video (MP4, WebM, OGG, MOV - max 5GB)"}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Document (URL or upload — PDF, Word, Excel)
                        </label>
                        <input
                          type="url"
                          value={newLesson.documentUrl}
                          onChange={(e) =>
                            setNewLesson((n) => n && { ...n, documentUrl: e.target.value })
                          }
                          placeholder="Direct link to PDF, Word, or Excel (http://...)"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg mb-2"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            ref={documentInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            onChange={handleDocumentUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => documentInputRef.current?.click()}
                            disabled={uploadingDocument}
                            className="px-3 py-2 rounded-lg border-2 border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                          >
                            {uploadingDocument
                              ? "Uploading..."
                              : "Or upload document (PDF, DOC, DOCX, XLS, XLSX — max 50MB)"}
                          </button>
                        </div>
                      </div>
                      <div className="border-t border-gray-100 pt-3 space-y-3">
                        <label className="block text-xs font-medium text-gray-600">
                          Quiz (optional — multiple choice, one correct answer per question)
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setNewLesson((n) =>
                              n
                                ? {
                                    ...n,
                                    quiz: {
                                      questions: [
                                        ...n.quiz.questions,
                                        { prompt: "", options: defaultQuizOptions() },
                                      ],
                                    },
                                  }
                                : n
                            )
                          }
                          className="text-sm text-blue-600 font-medium hover:underline"
                        >
                          + Add quiz question
                        </button>
                        {newLesson.quiz.questions.map((q, qIdx) => (
                          <div
                            key={qIdx}
                            className="p-3 rounded-lg border border-gray-200 bg-gray-50/80 space-y-2"
                          >
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-xs font-medium text-gray-600">
                                Question {qIdx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setNewLesson((n) =>
                                    n
                                      ? {
                                          ...n,
                                          quiz: {
                                            questions: n.quiz.questions.filter(
                                              (_, i) => i !== qIdx
                                            ),
                                          },
                                        }
                                      : n
                                  )
                                }
                                className="text-xs text-red-600 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                            <input
                              type="text"
                              value={q.prompt}
                              onChange={(e) =>
                                setNewLesson((n) => {
                                  if (!n) return n;
                                  const questions = [...n.quiz.questions];
                                  questions[qIdx] = {
                                    ...questions[qIdx],
                                    prompt: e.target.value,
                                  };
                                  return { ...n, quiz: { questions } };
                                })
                              }
                              placeholder="Question text"
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                            />
                            <p className="text-xs text-gray-500">Answers — select the correct one:</p>
                            {q.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className="flex items-center gap-2 flex-wrap"
                              >
                                <input
                                  type="radio"
                                  name={`correct-${qIdx}`}
                                  checked={opt.isCorrect}
                                  onChange={() => setQuizCorrectOption(qIdx, oIdx)}
                                  className="shrink-0"
                                />
                                <input
                                  type="text"
                                  value={opt.text}
                                  onChange={(e) =>
                                    setNewLesson((n) => {
                                      if (!n) return n;
                                      const questions = [...n.quiz.questions];
                                      const opts = [...questions[qIdx].options];
                                      opts[oIdx] = {
                                        ...opts[oIdx],
                                        text: e.target.value,
                                      };
                                      questions[qIdx] = {
                                        ...questions[qIdx],
                                        options: opts,
                                      };
                                      return { ...n, quiz: { questions } };
                                    })
                                  }
                                  placeholder={`Option ${oIdx + 1}`}
                                  className="flex-1 min-w-[120px] px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
                                />
                                {q.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setNewLesson((n) => {
                                        if (!n) return n;
                                        const questions = [...n.quiz.questions];
                                        let opts = questions[qIdx].options.filter(
                                          (_, i) => i !== oIdx
                                        );
                                        if (opts.length && !opts.some((o) => o.isCorrect)) {
                                          opts = opts.map((o, i) => ({
                                            ...o,
                                            isCorrect: i === 0,
                                          }));
                                        }
                                        questions[qIdx] = {
                                          ...questions[qIdx],
                                          options: opts,
                                        };
                                        return { ...n, quiz: { questions } };
                                      })
                                    }
                                    className="text-xs text-gray-500 hover:text-red-600"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                setNewLesson((n) => {
                                  if (!n) return n;
                                  const questions = [...n.quiz.questions];
                                  questions[qIdx] = {
                                    ...questions[qIdx],
                                    options: [
                                      ...questions[qIdx].options,
                                      { text: "", isCorrect: false },
                                    ],
                                  };
                                  return { ...n, quiz: { questions } };
                                })
                              }
                              className="text-xs text-blue-600 hover:underline"
                            >
                              + Add option
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddLesson();
                          }}
                          disabled={!newLesson.title.trim()}
                          className="px-3 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
                        >
                          Add
                        </button>
                        <button
                          onClick={cancelAddLesson}
                          className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => startAddLesson(mod.id)}
                      className="w-full p-3 rounded-lg border-2 border-dashed border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 text-sm font-medium"
                    >
                      + Add lesson (video)
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
