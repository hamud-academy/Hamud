"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import StudentDetailModal, { type StudentDetail } from "./StudentDetailModal";
import StudentResetPasswordModal from "./StudentResetPasswordModal";

type Course = { id: string; title: string; slug: string };
type DiplomaProgram = { id: string; title: string; slug: string };
type Enrollment = {
  id: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  enrolledAt: string;
  progress: number;
};
type DiplomaEnrollment = {
  id: string;
  programId: string;
  programTitle: string;
  programSlug: string;
  planType: string;
  planTitle: string | null;
  enrolledAt: string;
};
type Student = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  enrollments: Enrollment[];
  diplomaEnrollments: DiplomaEnrollment[];
};

function latestEnrollmentDate(student: Student): string | null {
  const dates = [
    ...student.enrollments.map((e) => e.enrolledAt),
    ...student.diplomaEnrollments.map((d) => d.enrolledAt),
  ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  return dates[0] ?? null;
}

function hasAnyEnrollment(student: Student) {
  return student.enrollments.length > 0 || student.diplomaEnrollments.length > 0;
}

export default function StudentsPageClient({
  courses,
  diplomaPrograms,
}: {
  courses: Course[];
  diplomaPrograms: DiplomaProgram[];
}) {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState("");
  const [programId, setProgramId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [viewStudentId, setViewStudentId] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resetStudent, setResetStudent] = useState<Student | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (courseId) params.set("courseId", courseId);
      if (programId) params.set("programId", programId);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/students?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load students");
        setStudents([]);
        return;
      }
      setStudents(data.students ?? []);
    } catch {
      setError("Connection error");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [courseId, programId, dateFrom, dateTo, search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this student? This will remove all their enrollments.")) return;
    setDeleteId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Delete failed");
        return;
      }
      setViewStudentId((current) => (current === id ? null : current));
      setStudentDetail((current) => (current?.id === id ? null : current));
      fetchStudents();
      router.refresh();
    } catch {
      setError("Connection error");
    } finally {
      setDeleteId(null);
    }
  }

  async function openView(studentId: string) {
    setViewStudentId(studentId);
    setStudentDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${studentId}`);
      const data = await res.json();
      if (!res.ok) {
        setDetailError(data.error ?? "Failed to load student details");
        return;
      }
      setStudentDetail(data as StudentDetail);
    } catch {
      setDetailError("Connection error");
    } finally {
      setDetailLoading(false);
    }
  }

  function closeView() {
    setViewStudentId(null);
    setStudentDetail(null);
    setDetailError(null);
    setDetailLoading(false);
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Students</h1>
        <p className="text-slate-500 mt-1">
          Approved students. View course and diploma enrollments. Filter by course, diploma, or date.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
          <div className="w-full">
            <label className="block text-xs font-medium text-slate-500 mb-1">Course</label>
            <select
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                if (e.target.value) setProgramId("");
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm sm:min-w-[180px]"
            >
              <option value="">All courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Diploma</label>
            <select
              value={programId}
              onChange={(e) => {
                setProgramId(e.target.value);
                if (e.target.value) setCourseId("");
              }}
              className="px-3 py-2 border border-teal-200 rounded-xl text-sm min-w-[200px] bg-white"
            >
              <option value="">All diplomas</option>
              {diplomaPrograms.map((program) => (
                <option key={program.id} value={program.id}>{program.title}</option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <label className="block text-xs font-medium text-slate-500 mb-1">Date from</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div className="w-full">
            <label className="block text-xs font-medium text-slate-500 mb-1">Date to</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div className="w-full sm:col-span-2 lg:col-span-3 xl:col-span-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Search (name or email)</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>
      )}

      {resetSuccess && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm border border-emerald-100">
          {resetSuccess}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
          <p className="text-slate-600 font-medium">No students found</p>
          <p className="text-slate-500 text-sm mt-1">Try changing filters or approve orders to add students.</p>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="responsive-data-table">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Courses / Diplomas</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrolled</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition">
                    <td data-label="Name" className="px-6 py-4 font-medium text-slate-900">{s.name || "—"}</td>
                    <td data-label="Email" className="px-6 py-4 text-slate-700 break-all">{s.email}</td>
                    <td data-label="Courses / Diplomas" className="px-6 py-4 text-slate-700">
                      {!hasAnyEnrollment(s) ? (
                        "—"
                      ) : (
                        <div className="flex flex-col gap-1">
                          {s.enrollments.map((e) => (
                            <span key={e.id}>{e.courseTitle}</span>
                          ))}
                          {s.diplomaEnrollments.map((d) => (
                            <span key={d.id} className="text-teal-800">
                              <span className="mr-1 text-[10px] font-bold uppercase tracking-wide text-teal-600">
                                Diploma
                              </span>
                              {d.programTitle}
                              {d.planTitle ? (
                                <span className="text-slate-500"> · {d.planTitle}</span>
                              ) : null}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td data-label="Enrolled" className="px-6 py-4 text-slate-600">
                      {latestEnrollmentDate(s)
                        ? new Date(latestEnrollmentDate(s)!).toLocaleDateString()
                        : "—"}
                    </td>
                    <td data-label="Actions" className="responsive-data-table__actions px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openView(s.id)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => setResetStudent(s)}
                          className="px-3 py-1.5 rounded-lg border border-amber-200 text-amber-800 text-xs font-medium hover:bg-amber-50"
                        >
                          Password
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(s.id)}
                          disabled={!!deleteId}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 disabled:opacity-50"
                        >
                          {deleteId === s.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewStudentId ? (
        <StudentDetailModal
          detail={studentDetail}
          loading={detailLoading}
          error={detailError}
          onClose={closeView}
          onResetPassword={
            studentDetail
              ? () =>
                  setResetStudent({
                    id: studentDetail.id,
                    name: studentDetail.name,
                    email: studentDetail.email,
                    createdAt: studentDetail.createdAt,
                    enrollments: studentDetail.enrollments,
                    diplomaEnrollments: studentDetail.diplomaEnrollments,
                  })
              : undefined
          }
        />
      ) : null}

      {resetStudent ? (
        <StudentResetPasswordModal
          student={resetStudent}
          onClose={() => setResetStudent(null)}
          onSuccess={() => {
            setResetSuccess(`New password saved for ${resetStudent.name?.trim() || resetStudent.email}.`);
            setTimeout(() => setResetSuccess(null), 5000);
          }}
        />
      ) : null}
    </>
  );
}
