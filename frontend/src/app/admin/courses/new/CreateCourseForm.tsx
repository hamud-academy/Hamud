"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Category = { id: string; name: string; slug: string };
type Instructor = { id: string; name: string | null; email: string };

const LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
] as const;

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function CreateCourseForm({
  categories,
  instructors,
  onSuccess,
  onClose,
  asTeacher = false,
}: {
  categories: Category[];
  instructors: Instructor[];
  onSuccess?: (id: string) => void;
  onClose?: () => void;
  asTeacher?: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [level, setLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("BEGINNER");
  const [language, setLanguage] = useState("so");
  const [durationHours, setDurationHours] = useState("");
  const [published, setPublished] = useState(false);
  const [instructorId, setInstructorId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const updateSlugFromTitle = useCallback((newTitle: string) => {
    if (!slugManual) setSlug(slugFromTitle(newTitle));
  }, [slugManual]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setTitle(v);
    updateSlugFromTitle(v);
  };

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
        if (!asTeacher && !instructorId) {
          setMessage({ type: "err", text: "Please select instructor" });
          return;
        }
        if (!slug.trim()) {
          setMessage({ type: "err", text: "Please enter a slug for the course" });
          return;
        }
        setLoading(true);
        try {
          const res = await fetch("/api/admin/courses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: title.trim(),
              slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
              description: description.trim() || undefined,
              thumbnail: thumbnail.trim() || undefined,
              price: priceNum,
              originalPrice: originalPriceNum,
              level,
              language: language.trim() || "so",
              durationHours: durationNum,
              published,
              ...(asTeacher ? {} : { instructorId }),
              categoryId,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setMessage({ type: "err", text: data.error ?? "Something went wrong" });
            return;
          }
          if (onSuccess) {
            onSuccess(data.id);
          } else if (asTeacher) {
            router.push(`/teacher/courses/${data.id}/curriculum`);
            router.refresh();
          } else {
            router.push(`/admin/courses/${data.id}/curriculum`);
            router.refresh();
          }
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
          className={`p-3 rounded-xl text-sm ${
            message.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Course title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={handleTitleChange}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="e.g. Web Development: From Zero to Pro"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Slug *</label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManual(true);
              }}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
              placeholder="web-development-from-zero-to-pro"
            />
            <button
              type="button"
              onClick={() => {
                setSlugManual(false);
                setSlug(slugFromTitle(title));
              }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm whitespace-nowrap"
            >
              Reset
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">Only lowercase letters, numbers, and hyphens</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="Describe the course..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Course image (optional)</label>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium cursor-pointer hover:bg-slate-50 transition">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {uploadingImage ? "Uploading..." : "Upload image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                className="sr-only"
                disabled={uploadingImage}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setMessage(null);
                  setUploadingImage(true);
                  try {
                    const form = new FormData();
                    form.append("file", f);
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
              <button
                type="button"
                onClick={() => setThumbnail("")}
                className="text-sm text-slate-500 hover:text-red-600"
              >
                Remove image
              </button>
            ) : null}
          </div>
          {thumbnail ? (
            <div className="flex items-start gap-3">
              <img
                src={thumbnail}
                alt="Preview"
                className="h-24 w-40 rounded-xl object-cover border border-slate-200"
              />
              <p className="text-xs text-slate-500 break-all">{thumbnail}</p>
            </div>
          ) : null}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Or enter image URL</label>
            <input
              type="url"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {!asTeacher && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Instructor *</label>
          <select
            required
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
          >
            <option value="">Select instructor</option>
            {instructors.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name || i.email}
              </option>
            ))}
          </select>
        </div>
      )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Price ($) *</label>
          <input
            type="number"
            required
            min={0}
            step={0.01}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="49.99"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Original price (optional)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="120"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Level</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as "BEGINNER" | "INTERMEDIATE" | "ADVANCED")}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration (hours) (optional)</label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={durationHours}
            onChange={(e) => setDurationHours(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="84"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="published"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        <label htmlFor="published" className="text-sm font-medium text-slate-700">
          Published — when checked, the course is visible to students
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-60 transition"
        >
          {loading ? "Creating..." : "Create course"}
        </button>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        ) : (
          <Link
            href="/admin/courses"
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
