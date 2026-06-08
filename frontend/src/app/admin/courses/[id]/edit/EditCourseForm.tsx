"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Category = { id: string; name: string; slug: string };
type Instructor = { id: string; name: string | null; email: string };

const LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
] as const;

type CourseData = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  price: number;
  originalPrice: number | null;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  language: string;
  durationHours: number | null;
  published: boolean;
  categoryId: string;
  instructorId: string;
};

export default function EditCourseForm({
  course,
  categories,
  instructors,
}: {
  course: CourseData;
  categories: Category[];
  instructors: Instructor[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(course.title);
  const [slug, setSlug] = useState(course.slug);
  const [description, setDescription] = useState(course.description ?? "");
  const [thumbnail, setThumbnail] = useState(course.thumbnail ?? "");
  const [price, setPrice] = useState(String(course.price));
  const [originalPrice, setOriginalPrice] = useState(
    course.originalPrice != null ? String(course.originalPrice) : ""
  );
  const [level, setLevel] = useState(course.level);
  const [language, setLanguage] = useState(course.language || "so");
  const [durationHours, setDurationHours] = useState(
    course.durationHours != null ? String(course.durationHours) : ""
  );
  const [published, setPublished] = useState(course.published);
  const [instructorId, setInstructorId] = useState(course.instructorId);
  const [categoryId, setCategoryId] = useState(course.categoryId);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setMessage(null);
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum < 0) {
          setMessage({ type: "err", text: "Price must be a valid number greater than or equal to 0" });
          return;
        }
        let originalPriceNum: number | null = null;
        if (originalPrice.trim()) {
          originalPriceNum = parseFloat(originalPrice);
          if (isNaN(originalPriceNum) || originalPriceNum < 0) originalPriceNum = null;
        }
        let durationNum: number | null = null;
        if (durationHours.trim()) {
          durationNum = parseFloat(durationHours);
          if (isNaN(durationNum) || durationNum < 0) durationNum = null;
        }
        if (!categoryId) {
          setMessage({ type: "err", text: "Please select category" });
          return;
        }
        if (!instructorId) {
          setMessage({ type: "err", text: "Please assign a teacher" });
          return;
        }
        if (!slug.trim()) {
          setMessage({ type: "err", text: "Please enter a slug for the course" });
          return;
        }

        setLoading(true);
        try {
          const res = await fetch(`/api/admin/courses/${course.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: title.trim(),
              slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
              description: description.trim() || null,
              thumbnail: thumbnail.trim() || null,
              price: priceNum,
              originalPrice: originalPriceNum,
              level,
              language: language.trim() || "so",
              durationHours: durationNum,
              published,
              instructorId,
              categoryId,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setMessage({ type: "err", text: data.error ?? "Something went wrong" });
            return;
          }
          setMessage({ type: "ok", text: "Course saved. Assigned teacher can now manage it from their dashboard." });
          router.refresh();
        } catch {
          setMessage({ type: "err", text: "Connection error" });
        } finally {
          setLoading(false);
        }
      }}
      className="space-y-6"
    >
      {message && (
        <div
          className={`rounded-xl p-3 text-sm ${
            message.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Course title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Slug *</label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 font-mono text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Course image</label>
        <div className="space-y-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50">
            {uploadingImage ? "Uploading..." : "Upload image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
              className="sr-only"
              disabled={uploadingImage}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadingImage(true);
                try {
                  const form = new FormData();
                  form.append("file", file);
                  const res = await fetch("/api/upload/image", { method: "POST", body: form });
                  const data = await res.json();
                  if (!res.ok) {
                    setMessage({ type: "err", text: data.error ?? "Upload failed" });
                    return;
                  }
                  setThumbnail(data.url);
                } catch {
                  setMessage({ type: "err", text: "Upload failed" });
                } finally {
                  setUploadingImage(false);
                  e.target.value = "";
                }
              }}
            />
          </label>
          {thumbnail ? (
            <img src={thumbnail} alt="Preview" className="h-24 w-40 rounded-xl border border-slate-200 object-cover" />
          ) : null}
          <input
            type="url"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Category *</label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Assigned teacher *</label>
          <select
            required
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select teacher</option>
            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.name || instructor.email}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            The selected teacher will see this course under My Courses and can edit the curriculum.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Price ($) *</label>
          <input
            type="number"
            required
            min={0}
            step={0.01}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Original price</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Level</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as CourseData["level"])}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
          >
            {LEVELS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Duration (hours)</label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={durationHours}
            onChange={(e) => setDurationHours(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="published"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        <label htmlFor="published" className="text-sm font-medium text-slate-700">
          Published — visible to students on the public site
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-emerald-500 px-6 py-2.5 font-medium text-white transition hover:bg-emerald-600 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save course"}
        </button>
        <Link
          href={`/admin/courses/${course.id}/curriculum`}
          className="rounded-xl border border-slate-200 px-6 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Curriculum
        </Link>
        <Link
          href="/admin/courses"
          className="rounded-xl border border-slate-200 px-6 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to courses
        </Link>
      </div>
    </form>
  );
}
