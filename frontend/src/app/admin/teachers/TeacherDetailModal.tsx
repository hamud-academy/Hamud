"use client";

export type TeacherDetail = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  courses: {
    id: string;
    title: string;
    slug: string;
    published: boolean;
    createdAt: string;
    moduleCount: number;
    studentCount: number;
  }[];
  diplomaSubjects: {
    id: string;
    programId: string;
    programTitle: string;
    subjectTitle: string;
    subjectCode: string;
  }[];
  summary: {
    courseCount: number;
    diplomaSubjectCount: number;
    totalStudents: number;
  };
};

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function TeacherDetailModal({
  detail,
  loading,
  error,
  onClose,
  onResetPassword,
}: {
  detail: TeacherDetail | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onResetPassword?: () => void;
}) {
  if (!detail && !loading) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 sm:px-8">
          <h2 className="text-xl font-bold text-slate-900 min-w-0 truncate">
            {loading ? "Loading…" : detail?.name?.trim() || "Teacher details"}
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            {detail && onResetPassword ? (
              <button
                type="button"
                onClick={onResetPassword}
                className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
              >
                Reset password
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-slate-500">Loading teacher details…</div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : detail ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                  <p className="mt-1 font-medium text-slate-900 break-all">{detail.email}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Courses</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{detail.summary.courseCount}</p>
                </div>
                <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">Diploma subjects</p>
                  <p className="mt-1 text-2xl font-bold text-teal-900">{detail.summary.diplomaSubjectCount}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total students</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{detail.summary.totalStudents}</p>
                </div>
              </div>

              <p className="text-sm text-slate-500">
                Joined {formatShortDate(detail.createdAt)}
              </p>

              <section>
                <h3 className="text-lg font-bold text-slate-900">Assigned courses</h3>
                {detail.courses.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">No courses assigned yet.</p>
                ) : (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80">
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Course</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Students</th>
                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Modules</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {detail.courses.map((course) => (
                          <tr key={course.id}>
                            <td className="px-4 py-3 font-medium text-slate-900">{course.title}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  course.published
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {course.published ? "Published" : "Draft"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{course.studentCount}</td>
                            <td className="px-4 py-3 text-slate-600">{course.moduleCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-900">Diploma subjects</h3>
                {detail.diplomaSubjects.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">No diploma subjects assigned yet.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {detail.diplomaSubjects.map((subject) => (
                      <li
                        key={subject.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-teal-100 bg-teal-50/40 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-teal-900">{subject.subjectTitle}</p>
                          <p className="text-xs text-slate-500">
                            {subject.programTitle}
                            {subject.subjectCode ? ` · ${subject.subjectCode}` : ""}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
