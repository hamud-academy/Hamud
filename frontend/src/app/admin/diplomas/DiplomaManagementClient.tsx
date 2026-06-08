"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  DiplomaConfig,
  DiplomaPaymentPlanConfig,
  DiplomaPlanType,
  DiplomaProgramConfig,
  DiplomaSubjectConfig,
} from "@/lib/diploma-config-defaults";
import { buildDefaultPaymentPlans, DIPLOMA_PLAN_LABELS, DIPLOMA_PLAN_THEMES, DIPLOMA_PLAN_TYPES } from "@/lib/diploma-config-defaults";
import { buildDiplomaCheckoutHref } from "@/lib/diploma-checkout-utils";
import { applyCourseLinkToSubject, type LinkedCourseOption } from "@/lib/diploma-teacher-utils";
import DiplomaLessonReleasePanel from "@/components/DiplomaLessonReleasePanel";

type Instructor = { id: string; name: string | null; email: string };

type AdminTab = "hero" | "programs" | "payment-plans" | "subjects" | "lesson-release";

function countSubjectCurriculum(subject: DiplomaSubjectConfig) {
  const modules = subject.modules ?? [];
  const lessons = modules.reduce((total, curriculumModule) => total + (curriculumModule.lessons?.length ?? 0), 0);
  return {
    modules: modules.length,
    lessons,
    examQuestions: subject.exam?.questions?.length ?? 0,
  };
}

const ADMIN_TABS: { id: AdminTab; label: string; hint: string }[] = [
  { id: "hero", label: "Hero & Page", hint: "Hero cards, image, section headings" },
  { id: "programs", label: "Programs", hint: "Default diploma card content" },
  { id: "payment-plans", label: "Payment Plans", hint: "Slow, Speedy, Express, One Time" },
  { id: "subjects", label: "Subjects & Teachers", hint: "Teacher assignments" },
  { id: "lesson-release", label: "Lesson Release", hint: "Unlock lessons for students" },
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100";
const textareaClass = `${inputClass} min-h-24 resize-y`;

function makeId(prefix: string) {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${suffix}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function TextField({
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

function TextareaField({
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
      <textarea className={textareaClass} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function ProgramSidebar({
  programs,
  activeProgramId,
  onSelect,
  onAdd,
}: {
  programs: DiplomaProgramConfig[];
  activeProgramId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Programs</h2>
          <p className="text-xs text-slate-500">{programs.length} diploma programs</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
        >
          Add
        </button>
      </div>
      <div className="space-y-2">
        {programs.map((program) => (
          <button
            key={program.id}
            type="button"
            onClick={() => onSelect(program.id)}
            className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
              activeProgramId === program.id
                ? "border-blue-300 bg-blue-50 text-blue-900"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span className="block text-sm font-bold">{program.title}</span>
            <span className="mt-1 block text-xs text-slate-500">
              {program.subjects.length} subjects · {program.status === "PUBLISHED" ? "Published" : "Draft"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function prepareConfigForSave(config: DiplomaConfig): DiplomaConfig {
  return {
    ...config,
    programs: config.programs.map((program) => {
      const defaults = buildDefaultPaymentPlans(program.courses);
      const paymentPlans = DIPLOMA_PLAN_TYPES.map((type) => {
        const fallback = defaults.find((plan) => plan.type === type) ?? defaults[0];
        const existing = program.paymentPlans.find((plan) => plan.type === type);
        return existing
          ? {
              ...fallback,
              ...existing,
              type,
              theme: DIPLOMA_PLAN_THEMES[type],
              ctaHref: buildDiplomaCheckoutHref(program.slug, type),
            }
          : { ...fallback, ctaHref: buildDiplomaCheckoutHref(program.slug, type) };
      });

      return { ...program, paymentPlans };
    }),
  };
}

export default function DiplomaManagementClient({
  initialConfig,
  instructors,
  courses,
}: {
  initialConfig: DiplomaConfig;
  instructors: Instructor[];
  courses: LinkedCourseOption[];
}) {
  const router = useRouter();
  const [config, setConfig] = useState<DiplomaConfig>(initialConfig);
  const [activeProgramId, setActiveProgramId] = useState(initialConfig.programs[0]?.id ?? "");
  const [activePlanType, setActivePlanType] = useState<DiplomaPlanType>("SLOW");
  const [activeTab, setActiveTab] = useState<AdminTab>("hero");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [collapsedSubjects, setCollapsedSubjects] = useState<Record<string, boolean>>({});
  const heroImageInputRef = useRef<HTMLInputElement>(null);

  const activeProgram = useMemo(
    () => config.programs.find((program) => program.id === activeProgramId) ?? config.programs[0],
    [activeProgramId, config.programs]
  );

  const activePlan = useMemo(
    () => activeProgram?.paymentPlans.find((plan) => plan.type === activePlanType) ?? activeProgram?.paymentPlans[0],
    [activePlanType, activeProgram?.paymentPlans]
  );

  function updateProgram(programId: string, updater: (program: DiplomaProgramConfig) => DiplomaProgramConfig) {
    setConfig((current) => ({
      ...current,
      programs: current.programs.map((program) => (program.id === programId ? updater(program) : program)),
    }));
  }

  function addProgram() {
    const id = makeId("diploma");
    const next: DiplomaProgramConfig = {
      id,
      title: "New Diploma Program",
      slug: `new-diploma-${id.slice(-4)}`,
      summary: "Describe what students will learn and the outcome of this diploma.",
      duration: "3 Months",
      courses: "6 Courses",
      status: "DRAFT",
      details: ["Structured learning path", "Teacher-assigned subjects", "Practical assignments"],
      paymentPlans: buildDefaultPaymentPlans("6 eLearning Courses"),
      subjects: [],
    };

    setConfig((current) => ({ ...current, programs: [...current.programs, next] }));
    setActiveProgramId(id);
  }

  function removeProgram(programId: string) {
    if (config.programs.length <= 1) {
      setMessage({ type: "err", text: "At least one diploma program is required." });
      return;
    }
    if (!confirm("Remove this diploma program?")) return;

    setConfig((current) => {
      const programs = current.programs.filter((program) => program.id !== programId);
      setActiveProgramId(programs[0]?.id ?? "");
      return { ...current, programs };
    });
  }

  function addSubject(programId: string) {
    const id = makeId("subject");
    const next: DiplomaSubjectConfig = {
      id,
      title: "New Subject",
      code: "SUB-101",
      description: "Describe what this subject covers.",
      duration: "4 weeks",
      teacherId: "",
      courseId: "",
      lessons: [],
      modules: [],
      exam: { title: "Final Exam", passingScore: 50, questions: [] },
    };
    updateProgram(programId, (program) => ({ ...program, subjects: [...program.subjects, next] }));
  }

  function updateSubject(
    programId: string,
    subjectId: string,
    updater: (subject: DiplomaSubjectConfig) => DiplomaSubjectConfig
  ) {
    updateProgram(programId, (program) => ({
      ...program,
      subjects: program.subjects.map((subject) => (subject.id === subjectId ? updater(subject) : subject)),
    }));
  }

  function removeSubject(programId: string, subjectId: string) {
    setCollapsedSubjects((current) => {
      if (!current[subjectId]) return current;
      const next = { ...current };
      delete next[subjectId];
      return next;
    });
    updateProgram(programId, (program) => ({
      ...program,
      subjects: program.subjects.filter((subject) => subject.id !== subjectId),
    }));
  }

  function toggleSubjectCollapse(subjectId: string) {
    setCollapsedSubjects((current) => ({
      ...current,
      [subjectId]: !current[subjectId],
    }));
  }

  function updateDetail(programId: string, index: number, value: string) {
    updateProgram(programId, (program) => ({
      ...program,
      details: program.details.map((detail, detailIndex) => (detailIndex === index ? value : detail)),
    }));
  }

  function addDetail(programId: string) {
    updateProgram(programId, (program) => ({ ...program, details: [...program.details, "New diploma benefit"] }));
  }

  function removeDetail(programId: string, index: number) {
    updateProgram(programId, (program) => {
      if (program.details.length <= 1) return program;
      return { ...program, details: program.details.filter((_, detailIndex) => detailIndex !== index) };
    });
  }

  function updatePaymentPlan(
    programId: string,
    planType: DiplomaPlanType,
    updater: (plan: DiplomaPaymentPlanConfig) => DiplomaPaymentPlanConfig
  ) {
    updateProgram(programId, (program) => ({
      ...program,
      paymentPlans: program.paymentPlans.map((plan) => (plan.type === planType ? updater(plan) : plan)),
    }));
  }

  function updatePaymentPlanDetail(programId: string, planType: DiplomaPlanType, index: number, value: string) {
    updatePaymentPlan(programId, planType, (plan) => ({
      ...plan,
      details: plan.details.map((detail, detailIndex) => (detailIndex === index ? value : detail)),
    }));
  }

  function addPaymentPlanDetail(programId: string, planType: DiplomaPlanType) {
    updatePaymentPlan(programId, planType, (plan) => ({
      ...plan,
      details: [...plan.details, "New plan benefit"],
    }));
  }

  function removePaymentPlanDetail(programId: string, planType: DiplomaPlanType, index: number) {
    updatePaymentPlan(programId, planType, (plan) => {
      if (plan.details.length <= 1) return plan;
      return { ...plan, details: plan.details.filter((_, detailIndex) => detailIndex !== index) };
    });
  }

  function updateSpotlightFeature(index: number, value: string) {
    setConfig((current) => ({
      ...current,
      spotlightFeatures: current.spotlightFeatures.map((feature, featureIndex) =>
        featureIndex === index ? value : feature
      ),
    }));
  }

  function addSpotlightFeature() {
    setConfig((current) => ({
      ...current,
      spotlightFeatures: [...current.spotlightFeatures, "New diploma highlight"],
    }));
  }

  function removeSpotlightFeature(index: number) {
    setConfig((current) => {
      if (current.spotlightFeatures.length <= 1) return current;
      return {
        ...current,
        spotlightFeatures: current.spotlightFeatures.filter((_, featureIndex) => featureIndex !== index),
      };
    });
  }

  async function saveConfig() {
    setSaving(true);
    setMessage(null);
    try {
      const payload = prepareConfigForSave(config);
      const res = await fetch("/api/admin/diploma-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Failed to save diploma configuration." });
        return;
      }

      setConfig(data);
      setMessage({
        type: "ok",
        text: "Diploma saved to database. Open /diploma to see the updated public page.",
      });
      router.refresh();
    } catch {
      setMessage({ type: "err", text: "Connection error while saving." });
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadHeroImage() {
    setMessage(null);
    const file = heroImageInputRef.current?.files?.[0];
    if (!file) {
      setMessage({ type: "err", text: "Please select a hero image to upload." });
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/admin/diploma-config/image/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setMessage({ type: "err", text: uploadData.error ?? "Upload failed" });
        return;
      }

      const nextConfig = prepareConfigForSave({ ...config, heroImageUrl: uploadData.url });
      const saveRes = await fetch("/api/admin/diploma-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextConfig),
      });
      const saved = await saveRes.json();
      if (!saveRes.ok) {
        setMessage({ type: "err", text: saved.error ?? "Image uploaded but saving failed." });
        return;
      }

      setConfig(saved);
      setMessage({ type: "ok", text: "Diploma hero image uploaded and saved." });
      if (heroImageInputRef.current) heroImageInputRef.current.value = "";
      router.refresh();
    } catch (error) {
      setMessage({
        type: "err",
        text: error instanceof Error ? error.message : "Connection error while uploading.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Academic Management</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Diploma</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage all public diploma content, programs, payment plans, subjects, and teacher assignments from one place.
          </p>
        </div>
        <button
          type="button"
          onClick={saveConfig}
          disabled={saving}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
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

      <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-2 shadow-sm">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {ADMIN_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`min-w-[140px] flex-1 rounded-2xl px-4 py-3 text-left transition sm:min-w-[180px] ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-transparent text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="block text-sm font-extrabold">{tab.label}</span>
              <span
                className={`mt-0.5 block text-[11px] leading-4 ${
                  activeTab === tab.id ? "text-blue-100" : "text-slate-400"
                }`}
              >
                {tab.hint}
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === "hero" && (
      <section className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-extrabold text-slate-900">Diploma Hero Layout</h2>
          <p className="mt-1 text-sm text-slate-500">These fields control the two-card hero section on the public Diploma page.</p>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-blue-700">Left hero card</h3>
            <div className="grid gap-4">
              <TextField
                label="Small heading"
                value={config.spotlightEyebrow}
                onChange={(value) => setConfig((current) => ({ ...current, spotlightEyebrow: value }))}
              />
              <TextField
                label="Title"
                value={config.spotlightTitle}
                onChange={(value) => setConfig((current) => ({ ...current, spotlightTitle: value }))}
              />
              <TextareaField
                label="Description"
                value={config.spotlightDescription}
                onChange={(value) => setConfig((current) => ({ ...current, spotlightDescription: value }))}
              />
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Feature rows</span>
                  <button
                    type="button"
                    onClick={addSpotlightFeature}
                    className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50"
                  >
                    Add Feature
                  </button>
                </div>
                <div className="space-y-2">
                  {config.spotlightFeatures.map((feature, index) => (
                    <div key={`spotlight-feature-${index}`} className="flex gap-2">
                      <input
                        className={inputClass}
                        value={feature}
                        onChange={(e) => updateSpotlightFeature(index, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeSpotlightFeature(index)}
                        className="rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-500 hover:bg-slate-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-slate-700">Right hero card</h3>
            <div className="grid gap-4">
          <TextField
            label="Small heading"
            value={config.heroEyebrow}
            onChange={(value) => setConfig((current) => ({ ...current, heroEyebrow: value }))}
          />
          <TextField
            label="Main title"
            value={config.heroTitle}
            onChange={(value) => setConfig((current) => ({ ...current, heroTitle: value }))}
          />
            <TextareaField
              label="Description"
              value={config.heroDescription}
              onChange={(value) => setConfig((current) => ({ ...current, heroDescription: value }))}
            />
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Hero image
                </span>
                {config.heroImageUrl && (
                  <img
                    src={config.heroImageUrl}
                    alt="Diploma hero preview"
                    className="mb-3 h-32 w-full rounded-xl object-cover"
                  />
                )}
                <input ref={heroImageInputRef} type="file" accept="image/*" className="block w-full text-sm text-slate-600" />
                <p className="mt-2 text-xs text-slate-500">JPEG, PNG, WebP or GIF. Max 10MB.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleUploadHeroImage}
                    disabled={saving}
                    className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-50 disabled:opacity-60"
                  >
                    Upload Image
                  </button>
                  {config.heroImageUrl && (
                    <button
                      type="button"
                      onClick={() => setConfig((current) => ({ ...current, heroImageUrl: "" }))}
                      className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <TextField
            label="Programs section small heading"
            value={config.programsEyebrow}
            onChange={(value) => setConfig((current) => ({ ...current, programsEyebrow: value }))}
          />
          <TextField
            label="Programs section title"
            value={config.programsTitle}
            onChange={(value) => setConfig((current) => ({ ...current, programsTitle: value }))}
          />
        </div>
      </section>
      )}

      {activeTab === "programs" && (
      <section className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <ProgramSidebar
          programs={config.programs}
          activeProgramId={activeProgram?.id ?? ""}
          onSelect={setActiveProgramId}
          onAdd={addProgram}
        />

        {activeProgram ? (
          <div className="space-y-6 rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">{activeProgram.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Edit the default diploma card shown before a payment plan is selected.
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeProgram(activeProgram.id)}
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
              >
                Remove Program
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <TextField
                label="Program title"
                value={activeProgram.title}
                onChange={(value) =>
                  updateProgram(activeProgram.id, (program) => ({
                    ...program,
                    title: value,
                    slug: program.slug || slugify(value),
                  }))
                }
              />
              <TextField
                label="Slug"
                value={activeProgram.slug}
                onChange={(value) => updateProgram(activeProgram.id, (program) => ({ ...program, slug: slugify(value) }))}
              />
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</span>
                <select
                  className={inputClass}
                  value={activeProgram.status}
                  onChange={(e) =>
                    updateProgram(activeProgram.id, (program) => ({
                      ...program,
                      status: e.target.value as "DRAFT" | "PUBLISHED",
                    }))
                  }
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </label>
              <TextField
                label="Duration"
                value={activeProgram.duration}
                onChange={(value) => updateProgram(activeProgram.id, (program) => ({ ...program, duration: value }))}
              />
              <TextField
                label="Courses label"
                value={activeProgram.courses}
                onChange={(value) => updateProgram(activeProgram.id, (program) => ({ ...program, courses: value }))}
              />
              <div className="lg:col-span-2">
                <TextareaField
                  label="Summary"
                  value={activeProgram.summary}
                  onChange={(value) => updateProgram(activeProgram.id, (program) => ({ ...program, summary: value }))}
                />
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-700">Diploma Benefits</h3>
                  <p className="mt-1 text-xs text-slate-500">Bullet points on the default public card.</p>
                </div>
                <button
                  type="button"
                  onClick={() => addDetail(activeProgram.id)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Add Benefit
                </button>
              </div>
              <div className="space-y-2">
                {activeProgram.details.map((detail, index) => (
                  <div key={`${activeProgram.id}-detail-${index}`} className="flex gap-2">
                    <input
                      className={inputClass}
                      value={detail}
                      onChange={(e) => updateDetail(activeProgram.id, index, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeDetail(activeProgram.id, index)}
                      className="rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-500 hover:bg-slate-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState text="No active diploma program selected." />
        )}
      </section>
      )}

      {activeTab === "payment-plans" && (
      <section className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <ProgramSidebar
          programs={config.programs}
          activeProgramId={activeProgram?.id ?? ""}
          onSelect={setActiveProgramId}
          onAdd={addProgram}
        />

        {activeProgram ? (
          <div className="space-y-6 rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">{activeProgram.title}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Configure Slow, Speedy, Express, and One Time payment cards for this program.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {DIPLOMA_PLAN_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActivePlanType(type)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    activePlanType === type
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {DIPLOMA_PLAN_LABELS[type]}
                </button>
              ))}
            </div>

            {activePlan && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <TextField
                    label="Plan title"
                    value={activePlan.title}
                    onChange={(value) =>
                      updatePaymentPlan(activeProgram.id, activePlan.type, (plan) => ({ ...plan, title: value }))
                    }
                  />
                  <TextField
                    label="Subtitle"
                    value={activePlan.subtitle}
                    onChange={(value) =>
                      updatePaymentPlan(activeProgram.id, activePlan.type, (plan) => ({ ...plan, subtitle: value }))
                    }
                  />
                  <TextField
                    label="Original price"
                    value={activePlan.originalPrice}
                    onChange={(value) =>
                      updatePaymentPlan(activeProgram.id, activePlan.type, (plan) => ({ ...plan, originalPrice: value }))
                    }
                  />
                  <TextField
                    label="Current price"
                    value={activePlan.price}
                    onChange={(value) =>
                      updatePaymentPlan(activeProgram.id, activePlan.type, (plan) => ({ ...plan, price: value }))
                    }
                  />
                  <TextField
                    label="Price suffix"
                    value={activePlan.priceSuffix}
                    onChange={(value) =>
                      updatePaymentPlan(activeProgram.id, activePlan.type, (plan) => ({ ...plan, priceSuffix: value }))
                    }
                  />
                  <TextField
                    label="Courses label"
                    value={activePlan.courses}
                    onChange={(value) =>
                      updatePaymentPlan(activeProgram.id, activePlan.type, (plan) => ({ ...plan, courses: value }))
                    }
                  />
                  <TextField
                    label="CTA label"
                    value={activePlan.ctaLabel}
                    onChange={(value) =>
                      updatePaymentPlan(activeProgram.id, activePlan.type, (plan) => ({ ...plan, ctaLabel: value }))
                    }
                  />
                  <div className="lg:col-span-2">
                    <TextField
                      label="CTA link"
                      value={activePlan.ctaHref}
                      onChange={(value) =>
                        updatePaymentPlan(activeProgram.id, activePlan.type, (plan) => ({ ...plan, ctaHref: value }))
                      }
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Plan features</span>
                    <button
                      type="button"
                      onClick={() => addPaymentPlanDetail(activeProgram.id, activePlan.type)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-white"
                    >
                      Add Feature
                    </button>
                  </div>
                  <div className="space-y-2">
                    {activePlan.details.map((detail, index) => (
                      <div key={`${activePlan.type}-detail-${index}`} className="flex gap-2">
                        <input
                          className={inputClass}
                          value={detail}
                          onChange={(e) =>
                            updatePaymentPlanDetail(activeProgram.id, activePlan.type, index, e.target.value)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removePaymentPlanDetail(activeProgram.id, activePlan.type, index)}
                          className="rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-500 hover:bg-slate-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState text="No active diploma program selected." />
        )}
      </section>
      )}

      {activeTab === "subjects" && (
      <section className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <ProgramSidebar
          programs={config.programs}
          activeProgramId={activeProgram?.id ?? ""}
          onSelect={setActiveProgramId}
          onAdd={addProgram}
        />

        {activeProgram ? (
          <div className="space-y-6 rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">{activeProgram.title}</h2>
              <p className="mt-1 text-sm text-slate-500">Assign each subject to an existing teacher account.</p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => addSubject(activeProgram.id)}
                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                Add Subject
              </button>
            </div>

            {activeProgram.subjects.length === 0 ? (
              <EmptyState text="No subjects yet. Add subjects and assign teachers to this diploma." />
            ) : (
              <div className="space-y-4">
                {activeProgram.subjects.map((subject) => {
                  const curriculum = countSubjectCurriculum(subject);
                  const isCollapsed = !!collapsedSubjects[subject.id];
                  const assignedTeacher = instructors.find((instructor) => instructor.id === subject.teacherId);
                  const linkedCourse = courses.find((course) => course.id === subject.courseId);
                  return (
                  <div key={subject.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className={`flex items-center justify-between gap-3 ${isCollapsed ? "" : "mb-4"}`}>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900">{subject.title}</p>
                        <p className="text-xs text-slate-500">{subject.code || "No code"}</p>
                        <p className="mt-1 text-xs font-medium text-slate-600">
                          Teacher content: {curriculum.modules} modules · {curriculum.lessons} lessons ·{" "}
                          {curriculum.examQuestions} exam questions
                        </p>
                        {isCollapsed ? (
                          <p className="mt-1 text-xs text-slate-500">
                            {assignedTeacher
                              ? `Teacher: ${assignedTeacher.name ?? assignedTeacher.email}`
                              : "Teacher: Unassigned"}
                            {linkedCourse ? ` · Course: ${linkedCourse.title}` : ""}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSubjectCollapse(subject.id)}
                          aria-expanded={!isCollapsed}
                          aria-label={isCollapsed ? "Expand subject" : "Collapse subject"}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center transition-transform duration-200 ${
                              isCollapsed ? "" : "rotate-180"
                            }`}
                            aria-hidden
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                          {isCollapsed ? "Expand" : "Collapse"}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSubject(activeProgram.id, subject.id)}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {!isCollapsed ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                      <TextField
                        label="Subject title"
                        value={subject.title}
                        onChange={(value) =>
                          updateSubject(activeProgram.id, subject.id, (item) => ({ ...item, title: value }))
                        }
                      />
                      <TextField
                        label="Subject code"
                        value={subject.code}
                        onChange={(value) =>
                          updateSubject(activeProgram.id, subject.id, (item) => ({ ...item, code: value }))
                        }
                      />
                      <TextField
                        label="Duration"
                        value={subject.duration}
                        onChange={(value) =>
                          updateSubject(activeProgram.id, subject.id, (item) => ({ ...item, duration: value }))
                        }
                      />
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Assigned teacher
                        </span>
                        <select
                          className={inputClass}
                          value={subject.teacherId}
                          onChange={(e) =>
                            updateSubject(activeProgram.id, subject.id, (item) => ({
                              ...item,
                              teacherId: e.target.value,
                            }))
                          }
                        >
                          <option value="">Unassigned</option>
                          {instructors.map((instructor) => (
                            <option key={instructor.id} value={instructor.id}>
                              {instructor.name ?? instructor.email}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block lg:col-span-2">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Linked platform course
                        </span>
                        <select
                          className={inputClass}
                          value={subject.courseId ?? ""}
                          onChange={(e) => {
                            const linkedCourse = courses.find((course) => course.id === e.target.value);
                            updateSubject(activeProgram.id, subject.id, (item) =>
                              applyCourseLinkToSubject(item, e.target.value, linkedCourse?.instructorId)
                            );
                          }}
                        >
                          <option value="">No linked course</option>
                          {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {course.title}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-slate-500">
                          Link a course so its assigned instructor can manage this diploma subject in Teacher → Diploma.
                        </p>
                      </label>
                      <div className="lg:col-span-2">
                        <TextareaField
                          label="Subject description"
                          value={subject.description}
                          onChange={(value) =>
                            updateSubject(activeProgram.id, subject.id, (item) => ({ ...item, description: value }))
                          }
                        />
                      </div>
                    </div>
                    ) : null}
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <EmptyState text="No active diploma program selected." />
        )}
      </section>
      )}

      {activeTab === "lesson-release" && (
      <section className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <ProgramSidebar
          programs={config.programs}
          activeProgramId={activeProgram?.id ?? ""}
          onSelect={setActiveProgramId}
          onAdd={addProgram}
        />

        {activeProgram ? (
          <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
            <DiplomaLessonReleasePanel
              mode="admin"
              programId={activeProgram.id}
              programTitle={activeProgram.title}
              subjects={activeProgram.subjects.map((subject) => ({
                id: subject.id,
                title: subject.title,
                code: subject.code,
              }))}
            />
          </div>
        ) : (
          <EmptyState text="No active diploma program selected." />
        )}
      </section>
      )}
    </div>
  );
}
