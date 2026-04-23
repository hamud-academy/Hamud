"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type TeacherStudentRow = {
  enrollmentId: string;
  enrolledAt: string;
  progress: number;
  completed: boolean;
  student: { id: string; name: string | null; email: string; image: string | null };
  course: { id: string; title: string; slug: string };
};

type CourseOption = { id: string; title: string };

export default function TeacherStudentsClient({
  rows,
  courses,
}: {
  rows: TeacherStudentRow[];
  courses: CourseOption[];
}) {
  const router = useRouter();
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (courseFilter && r.course.id !== courseFilter) return false;
      if (!q) return true;
      const name = (r.student.name ?? "").toLowerCase();
      const email = r.student.email.toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [rows, courseFilter, search]);

  const uniqueStudentIds = useMemo(() => new Set(rows.map((r) => r.student.id)).size, [rows]);

  async function removeEnrollment(row: TeacherStudentRow) {
    const ok = window.confirm(
      `Remove ${row.student.name ?? row.student.email} from “${row.course.title}”? They will lose access to this course.`
    );
    if (!ok) return;
    setRemovingId(row.enrollmentId);
    try {
      const res = await fetch(`/api/teacher/enrollments/${row.enrollmentId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Could not remove enrollment");
        return;
      }
      router.refresh();
    } catch {
      alert("Connection error");
    } finally {
      setRemovingId(null);
    }
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Students</h1>
          <p className="text-slate-500 mt-1">
            Everyone enrolled in your courses. Filter by course, search by name or email, or remove an enrollment.
          </p>
        </div>
        <Link
          href="/teacher/courses"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 transition shadow-sm"
        >
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          My courses
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrollments</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{rows.length}</p>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unique students</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{uniqueStudentIds}</p>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your courses</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{courses.length}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <label htmlFor="student-search" className="sr-only">
            Search students
          </label>
          <input
            id="student-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          />
        </div>
        <div className="sm:w-64 shrink-0">
          <label htmlFor="course-filter" className="sr-only">
            Filter by course
          </label>
          <select
            id="course-filter"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          >
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">No students yet</p>
          <p className="text-slate-500 text-sm mt-1">When learners enroll in your courses, they will appear here.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm p-10 text-center text-slate-600">
          No rows match your filters. Try clearing search or choosing “All courses”.
        </div>
      ) : (
        <>
          <div className="hidden lg:block bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrolled</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((row) => (
                    <tr key={row.enrollmentId} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="relative w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm overflow-hidden flex-shrink-0">
                            {row.student.image ? (
                              <Image
                                src={row.student.image}
                                alt=""
                                fill
                                className="object-cover"
                                unoptimized={
                                  row.student.image.startsWith("http") && row.student.image.includes("localhost")
                                }
                              />
                            ) : (
                              (row.student.name ?? row.student.email)[0]?.toUpperCase() ?? "?"
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {row.student.name ?? "—"}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{row.student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">{row.course.title}</p>
                        <p className="text-xs text-slate-500">{row.course.slug}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{formatDate(row.enrolledAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-teal-500 transition-all"
                              style={{ width: `${Math.min(100, Math.max(0, row.progress))}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-700 w-9 text-right">{row.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            row.completed ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {row.completed ? "Completed" : "In progress"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => removeEnrollment(row)}
                          disabled={removingId === row.enrollmentId}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition disabled:opacity-50"
                        >
                          {removingId === row.enrollmentId ? "Removing…" : "Remove"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ul className="lg:hidden space-y-3">
            {filtered.map((row) => (
              <li
                key={row.enrollmentId}
                className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="relative w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold overflow-hidden flex-shrink-0">
                    {row.student.image ? (
                      <Image
                        src={row.student.image}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized={row.student.image.startsWith("http") && row.student.image.includes("localhost")}
                      />
                    ) : (
                      (row.student.name ?? row.student.email)[0]?.toUpperCase() ?? "?"
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{row.student.name ?? "—"}</p>
                    <p className="text-sm text-slate-500 break-all">{row.student.email}</p>
                    <p className="text-sm font-medium text-slate-800 mt-2">{row.course.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Enrolled {formatDate(row.enrolledAt)}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-teal-500"
                          style={{ width: `${Math.min(100, Math.max(0, row.progress))}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{row.progress}%</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 gap-2">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          row.completed ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {row.completed ? "Completed" : "In progress"}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeEnrollment(row)}
                        disabled={removingId === row.enrollmentId}
                        className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
