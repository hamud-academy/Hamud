"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Category = { id: string; name: string; slug: string };
type Instructor = { id: string; name: string | null; email: string };
type CourseRow = {
  id: string;
  title: string;
  slug: string;
  price: number;
  published: boolean;
  category: { name: string; slug: string };
  instructorId: string;
  instructor: { name: string | null; email: string };
  _count: { modules: number; enrollments: number };
};

export default function CoursesPageClient({
  courses: initialCourses,
  instructors,
}: {
  courses: CourseRow[];
  categories: Category[];
  instructors: Instructor[];
}) {
  const router = useRouter();
  const [courses, setCourses] = useState(initialCourses);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function assignInstructor(courseId: string, instructorId: string) {
    if (!instructorId) return;
    setAssigningId(courseId);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructorId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Failed to assign teacher." });
        return;
      }

      const instructor = instructors.find((item) => item.id === instructorId);
      setCourses((current) =>
        current.map((course) =>
          course.id === courseId
            ? {
                ...course,
                instructorId,
                instructor: {
                  name: instructor?.name ?? data.course?.instructor?.name ?? null,
                  email: instructor?.email ?? data.course?.instructor?.email ?? "",
                },
              }
            : course
        )
      );
      setMessage({ type: "ok", text: "Teacher assigned. They can now see this course in their dashboard." });
      router.refresh();
    } catch {
      setMessage({ type: "err", text: "Connection error while assigning teacher." });
    } finally {
      setAssigningId(null);
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Courses</h1>
          <p className="mt-1 text-slate-500">
            Manage courses, assign teachers, and open curriculum editors.
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          + New course
        </Link>
      </div>

      {message ? (
        <div
          className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${
            message.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-12 text-center shadow-sm backdrop-blur">
          <p className="font-medium text-slate-600">No courses yet</p>
          <p className="mt-1 text-sm text-slate-500">Create a course and assign a teacher to get started.</p>
          <Link
            href="/admin/courses/new"
            className="mt-4 inline-flex rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Create first course
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur">
          <div className="responsive-data-table">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Course</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned teacher</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Price</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Modules / Students</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((course) => (
                  <tr key={course.id} className="transition hover:bg-slate-50/50">
                    <td data-label="Course" className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{course.title}</p>
                      <p className="text-xs text-slate-500">{course.slug}</p>
                    </td>
                    <td data-label="Category" className="px-6 py-4 text-slate-700">{course.category.name}</td>
                    <td data-label="Assigned teacher" className="px-6 py-4">
                      <select
                        value={course.instructorId}
                        disabled={assigningId === course.id}
                        onChange={(e) => assignInstructor(course.id, e.target.value)}
                        className="min-w-[180px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
                      >
                        <option value="">Select teacher</option>
                        {instructors.map((instructor) => (
                          <option key={instructor.id} value={instructor.id}>
                            {instructor.name || instructor.email}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td data-label="Price" className="px-6 py-4">
                      <span className="font-semibold text-slate-900">${course.price.toFixed(2)}</span>
                    </td>
                    <td data-label="Status" className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${
                          course.published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {course.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td data-label="Modules / Students" className="px-6 py-4 text-slate-600">
                      {course._count.modules} modules · {course._count.enrollments} students
                    </td>
                    <td data-label="Actions" className="responsive-data-table__actions px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/courses/${course.id}/edit`}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/admin/courses/${course.id}/curriculum`}
                          className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                        >
                          Curriculum
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
