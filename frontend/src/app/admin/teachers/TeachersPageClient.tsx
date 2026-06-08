"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import TeacherDetailModal, { type TeacherDetail } from "./TeacherDetailModal";
import TeacherResetPasswordModal from "./TeacherResetPasswordModal";

type Course = { id: string; title: string; slug: string };
type DiplomaProgram = { id: string; title: string; slug: string };

type TeacherCourse = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  studentCount: number;
};

type TeacherDiplomaSubject = {
  id: string;
  programId: string;
  programTitle: string;
  subjectTitle: string;
  subjectCode: string;
};

type Teacher = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  courses: TeacherCourse[];
  diplomaSubjects: TeacherDiplomaSubject[];
};

function hasAssignments(teacher: Teacher) {
  return teacher.courses.length > 0 || teacher.diplomaSubjects.length > 0;
}

export default function TeachersPageClient({
  courses,
  diplomaPrograms,
}: {
  courses: Course[];
  diplomaPrograms: DiplomaProgram[];
}) {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState("");
  const [programId, setProgramId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [viewTeacherId, setViewTeacherId] = useState<string | null>(null);
  const [teacherDetail, setTeacherDetail] = useState<TeacherDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resetTeacher, setResetTeacher] = useState<Teacher | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (courseId) params.set("courseId", courseId);
      if (programId) params.set("programId", programId);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/teachers?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load teachers");
        setTeachers([]);
        return;
      }
      setTeachers(data.teachers ?? []);
    } catch {
      setError("Connection error");
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, [courseId, programId, dateFrom, dateTo, search]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  async function handleDelete(id: string, courseCount: number) {
    const warning =
      courseCount > 0
        ? "This teacher has assigned courses. Deleting will remove the teacher and their linked courses. Continue?"
        : "Are you sure you want to delete this teacher?";
    if (!confirm(warning)) return;

    setDeleteId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/teachers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Delete failed");
        return;
      }
      setViewTeacherId((current) => (current === id ? null : current));
      setTeacherDetail((current) => (current?.id === id ? null : current));
      fetchTeachers();
      router.refresh();
    } catch {
      setError("Connection error");
    } finally {
      setDeleteId(null);
    }
  }

  async function openView(teacherId: string) {
    setViewTeacherId(teacherId);
    setTeacherDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/teachers/${teacherId}`);
      const data = await res.json();
      if (!res.ok) {
        setDetailError(data.error ?? "Failed to load teacher details");
        return;
      }
      setTeacherDetail(data as TeacherDetail);
    } catch {
      setDetailError("Connection error");
    } finally {
      setDetailLoading(false);
    }
  }

  function closeView() {
    setViewTeacherId(null);
    setTeacherDetail(null);
    setDetailError(null);
    setDetailLoading(false);
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Teachers</h1>
        <p className="text-slate-500 mt-1">
          Manage instructors. View assigned courses and diploma subjects. Filter by course, diploma, or date.
        </p>
      </div>

      <div className="mb-6 p-4 rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Course</label>
            <select
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                if (e.target.value) setProgramId("");
              }}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm min-w-[180px]"
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
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date from</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date to</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
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
        <div className="py-12 text-center text-slate-500">Loading teachers...</div>
      ) : teachers.length === 0 ? (
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
          <p className="text-slate-600 font-medium">No teachers found</p>
          <p className="text-slate-500 text-sm mt-1">
            Try changing filters or create a teacher account from Configuration → Create Accounts.
          </p>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Courses / Subjects</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">{teacher.name || "—"}</td>
                    <td className="px-6 py-4 text-slate-700">{teacher.email}</td>
                    <td className="px-6 py-4 text-slate-700">
                      {!hasAssignments(teacher) ? (
                        "—"
                      ) : (
                        <div className="flex flex-col gap-1">
                          {teacher.courses.map((course) => (
                            <span key={course.id}>
                              {course.title}
                              <span className="text-slate-400 text-xs"> · {course.studentCount} students</span>
                            </span>
                          ))}
                          {teacher.diplomaSubjects.map((subject) => (
                            <span key={subject.id} className="text-teal-800">
                              <span className="mr-1 text-[10px] font-bold uppercase tracking-wide text-teal-600">
                                Diploma
                              </span>
                              {subject.subjectTitle}
                              <span className="text-slate-500"> · {subject.programTitle}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(teacher.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openView(teacher.id)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => setResetTeacher(teacher)}
                          className="px-3 py-1.5 rounded-lg border border-amber-200 text-amber-800 text-xs font-medium hover:bg-amber-50"
                        >
                          Password
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(teacher.id, teacher.courses.length)}
                          disabled={!!deleteId}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 disabled:opacity-50"
                        >
                          {deleteId === teacher.id ? "..." : "Delete"}
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

      {viewTeacherId ? (
        <TeacherDetailModal
          detail={teacherDetail}
          loading={detailLoading}
          error={detailError}
          onClose={closeView}
          onResetPassword={
            teacherDetail
              ? () =>
                  setResetTeacher({
                    id: teacherDetail.id,
                    name: teacherDetail.name,
                    email: teacherDetail.email,
                    createdAt: teacherDetail.createdAt,
                    courses: teacherDetail.courses.map((c) => ({
                      id: c.id,
                      title: c.title,
                      slug: c.slug,
                      published: c.published,
                      studentCount: c.studentCount,
                    })),
                    diplomaSubjects: teacherDetail.diplomaSubjects,
                  })
              : undefined
          }
        />
      ) : null}

      {resetTeacher ? (
        <TeacherResetPasswordModal
          teacher={resetTeacher}
          onClose={() => setResetTeacher(null)}
          onSuccess={() => {
            setResetSuccess(`New password saved for ${resetTeacher.name?.trim() || resetTeacher.email}.`);
            setTimeout(() => setResetSuccess(null), 5000);
          }}
        />
      ) : null}
    </>
  );
}
