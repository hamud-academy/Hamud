"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CreateCourseForm from "@/app/admin/courses/new/CreateCourseForm";

type Category = { id: string; name: string; slug: string };

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  price: number;
  originalPrice: number | null;
  level: string;
  language: string;
  durationHours: number | null;
  published: boolean;
  category: { id: string; name: string; slug: string };
  _count: { modules: number; enrollments: number };
};

export default function TeacherCoursesClient({
  courses,
  categories,
}: {
  courses: CourseRow[];
  categories: Category[];
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<CourseRow | null>(null);
  const [editMessage, setEditMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editThumbnail, setEditThumbnail] = useState("");
  const [editUploadingImage, setEditUploadingImage] = useState(false);

  const handleCreateSuccess = (id: string) => {
    setCreateOpen(false);
    router.refresh();
    router.push(`/teacher/courses/${id}/curriculum`);
  };

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>, courseId: string) {
    e.preventDefault();
    if (!editCourse) return;
    setEditMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = (formData.get("title") as string)?.trim();
    const slug = (formData.get("slug") as string)?.trim().toLowerCase().replace(/\s+/g, "-");
    const description = (formData.get("description") as string)?.trim() || null;
    const priceNum = parseFloat((formData.get("price") as string) ?? "0");
    const categoryId = (formData.get("categoryId") as string)?.trim();
    const published = (formData.get("published") as string) === "on";

    if (!title || !slug || !categoryId || isNaN(priceNum) || priceNum < 0) {
      setEditMessage({ type: "err", text: "Please fill required fields and a valid price" });
      return;
    }
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          thumbnail: editThumbnail.trim() ? editThumbnail.trim() : null,
          price: priceNum,
          categoryId,
          published,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditMessage({ type: "err", text: data.error ?? "Update failed" });
        return;
      }
      setEditCourse(null);
      router.refresh();
    } catch {
      setEditMessage({ type: "err", text: "Connection error" });
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(course: CourseRow) {
    if (!confirm(`Delete course "${course.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Delete failed");
        return;
      }
      router.refresh();
    } catch {
      alert("Connection error");
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Courses</h1>
          <p className="text-slate-500 mt-1">
            Create and manage your courses. Add curriculum (modules & lessons) and view enrolled students.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 transition shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">No courses yet</p>
          <p className="text-slate-500 text-sm mt-1">Create your first course to get started.</p>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add course
          </button>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Published</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Modules / Students</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt=""
                            width={64}
                            height={48}
                            className="h-12 w-16 shrink-0 rounded-lg object-cover border border-slate-200 bg-slate-100"
                          />
                        ) : (
                          <div className="h-12 w-16 shrink-0 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
                            <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">{course.title}</p>
                          <p className="text-xs text-slate-500 truncate">{course.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{course.category.name}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">${course.price.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          course.published ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {course.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {course._count.modules} modules · {course._count.enrollments} students
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditCourse(course);
                            setEditThumbnail(course.thumbnail ?? "");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
                        >
                          Edit
                        </button>
                        <Link
                          href={`/teacher/courses/${course.id}/curriculum`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 transition shadow-sm"
                        >
                          Curriculum
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(course)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition"
                        >
                          Delete
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

      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setCreateOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Create course</h2>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {categories.length === 0 ? (
                <p className="text-amber-600 text-sm">No categories available. Ask an admin to add categories.</p>
              ) : (
                <CreateCourseForm
                  categories={categories}
                  instructors={[]}
                  asTeacher
                  onSuccess={handleCreateSuccess}
                  onClose={() => setCreateOpen(false)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {editCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setEditCourse(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Edit course</h2>
              <button
                type="button"
                onClick={() => setEditCourse(null)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <form onSubmit={(e) => handleEditSubmit(e, editCourse.id)} className="space-y-4">
                {editMessage && (
                  <div
                    className={`p-3 rounded-xl text-sm ${
                      editMessage.type === "ok" ? "bg-teal-50 text-teal-800" : "bg-red-50 text-red-600"
                    }`}
                  >
                    {editMessage.text}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editCourse.title}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    name="slug"
                    required
                    defaultValue={editCourse.slug}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editCourse.description}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Course profile image (optional)
                  </label>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium cursor-pointer hover:bg-slate-50 transition">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {editUploadingImage ? "Uploading..." : "Upload image"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                          className="sr-only"
                          disabled={editUploadingImage}
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setEditMessage(null);
                            setEditUploadingImage(true);
                            try {
                              const form = new FormData();
                              form.append("file", f);
                              const res = await fetch("/api/upload/image", { method: "POST", body: form });
                              const data = await res.json();
                              if (!res.ok) {
                                setEditMessage({ type: "err", text: data.error ?? "Upload failed" });
                                return;
                              }
                              setEditThumbnail(data.url);
                            } catch {
                              setEditMessage({ type: "err", text: "Upload failed" });
                            } finally {
                              setEditUploadingImage(false);
                              e.target.value = "";
                            }
                          }}
                        />
                      </label>
                      {editThumbnail ? (
                        <button
                          type="button"
                          onClick={() => setEditThumbnail("")}
                          className="text-sm text-slate-500 hover:text-red-600"
                        >
                          Remove image
                        </button>
                      ) : null}
                    </div>
                    {editThumbnail ? (
                      <div className="flex items-start gap-3">
                        <img
                          src={editThumbnail}
                          alt=""
                          className="h-24 w-40 rounded-xl object-cover border border-slate-200"
                        />
                        <p className="text-xs text-slate-500 break-all flex-1">{editThumbnail}</p>
                      </div>
                    ) : null}
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Or enter image URL</label>
                      <input
                        type="url"
                        value={editThumbnail}
                        onChange={(e) => setEditThumbnail(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price ($) *</label>
                    <input
                      type="number"
                      name="price"
                      required
                      min={0}
                      step={0.01}
                      defaultValue={editCourse.price}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                    <select
                      name="categoryId"
                      required
                      defaultValue={editCourse.category.id}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="published"
                    id="edit-published"
                    defaultChecked={editCourse.published}
                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="edit-published" className="text-sm font-medium text-slate-700">
                    Published
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-6 py-2.5 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 disabled:opacity-60 transition"
                  >
                    {editLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditCourse(null)}
                    className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
