"use client";

import { useEffect, useRef, useState } from "react";
import {
  defaultLiveLessonsConfig,
  type LiveClassConfig,
  type LiveLessonsConfig,
} from "@/lib/live-lessons-config-defaults";

export default function LiveLessonsImageForm() {
  const [config, setConfig] = useState<LiveLessonsConfig>(defaultLiveLessonsConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingClassId, setUploadingClassId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const classFileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch("/api/admin/live-lessons-config")
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(() => setConfig(defaultLiveLessonsConfig))
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof LiveLessonsConfig>(key: K, value: LiveLessonsConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  function updateClass(id: string, update: Partial<LiveClassConfig>) {
    setConfig((current) => ({
      ...current,
      classes: current.classes.map((item) => (item.id === id ? { ...item, ...update } : item)),
    }));
  }

  function updateClassFeature(classId: string, index: number, value: string) {
    setConfig((current) => ({
      ...current,
      classes: current.classes.map((item) =>
        item.id === classId
          ? {
              ...item,
              features: item.features.map((feature, featureIndex) =>
                featureIndex === index ? value : feature
              ),
            }
          : item
      ),
    }));
  }

  function addClass() {
    setConfig((current) => ({
      ...current,
      classes: [
        ...current.classes,
        {
          id: `live-class-${Date.now()}`,
          title: "New Live Class",
          badge: "LC",
          imageUrl: "",
          duration: "3 Months",
          delivery: "Zoom",
          date: "Coming soon",
          time: "Schedule TBA",
          price: "$0",
          paymentText: "One Time Payment",
          buttonLabel: "Hada Dalbo",
          buttonHref: "/contact",
          features: ["Live teacher session"],
        },
      ],
    }));
  }

  async function saveConfig(nextConfig: LiveLessonsConfig) {
    const res = await fetch("/api/admin/live-lessons-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextConfig),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "Failed to save");
    }
    setConfig(data);
  }

  async function handleUploadImage() {
    setMessage(null);
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setMessage({ type: "err", text: "Please select an image to upload." });
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/admin/live-lessons-config/image/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setMessage({ type: "err", text: uploadData.error ?? "Upload failed" });
        return;
      }

      await saveConfig({ ...config, heroImageUrl: uploadData.url });
      setMessage({ type: "ok", text: "Hero image uploaded and saved." });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setMessage({
        type: "err",
        text: error instanceof Error ? error.message : "Connection error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadClassImage(classId: string, file: File | undefined) {
    if (!file) return;
    setMessage(null);
    setUploadingClassId(classId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/admin/live-lessons-config/image/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setMessage({ type: "err", text: uploadData.error ?? "Upload failed" });
        return;
      }

      updateClass(classId, { imageUrl: uploadData.url });
      setMessage({ type: "ok", text: "Class image uploaded. Click Save Changes to publish." });
    } catch (error) {
      setMessage({
        type: "err",
        text: error instanceof Error ? error.message : "Connection error",
      });
    } finally {
      setUploadingClassId(null);
      const input = classFileInputs.current[classId];
      if (input) input.value = "";
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      await saveConfig(config);
      setMessage({ type: "ok", text: "Live lessons page saved." });
    } catch (error) {
      setMessage({
        type: "err",
        text: error instanceof Error ? error.message : "Connection error",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            message.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Left Classroom Card</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Small heading" value={config.classroomEyebrow} onChange={(value) => update("classroomEyebrow", value)} />
          <TextField label="Title" value={config.classroomTitle} onChange={(value) => update("classroomTitle", value)} />
          <TextareaField label="Description" value={config.classroomDescription} onChange={(value) => update("classroomDescription", value)} />
        </div>
        <EditableList
          title="Feature rows"
          items={config.classroomFeatures}
          onChange={(items) => update("classroomFeatures", items)}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Right Intro / Image Card</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Small heading" value={config.introEyebrow} onChange={(value) => update("introEyebrow", value)} />
          <TextField label="Title" value={config.introTitle} onChange={(value) => update("introTitle", value)} />
          <TextareaField label="Description" value={config.introDescription} onChange={(value) => update("introDescription", value)} />
          <TextField label="Primary button label" value={config.primaryButtonLabel} onChange={(value) => update("primaryButtonLabel", value)} />
          <TextField label="Primary button link" value={config.primaryButtonHref} onChange={(value) => update("primaryButtonHref", value)} />
          <TextField label="Secondary button label" value={config.secondaryButtonLabel} onChange={(value) => update("secondaryButtonLabel", value)} />
          <TextField label="Secondary button link" value={config.secondaryButtonHref} onChange={(value) => update("secondaryButtonHref", value)} />
        </div>

        {config.heroImageUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700 mb-2">Current image</p>
            <img
              src={config.heroImageUrl}
              alt="Live lessons"
              className="max-h-72 w-full rounded-2xl border border-slate-200 object-cover"
            />
          </div>
        )}

        <div className="mt-4">
          <label htmlFor="liveLessonsImage" className="block text-sm font-medium text-slate-700 mb-1">
            Upload image
          </label>
          <input
            ref={fileInputRef}
            id="liveLessonsImage"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
          />
          <p className="text-xs text-slate-500 mt-1">JPEG, PNG, WebP or GIF. Max 10MB.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleUploadImage}
              disabled={saving}
              className="rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 transition"
            >
              Upload Image
            </button>
            {config.heroImageUrl && (
              <button
                type="button"
                onClick={() => update("heroImageUrl", "")}
                disabled={saving}
                className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
              >
                Remove Image
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Live Class Cards</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Section small heading" value={config.classesEyebrow} onChange={(value) => update("classesEyebrow", value)} />
          <TextField label="Section title" value={config.classesTitle} onChange={(value) => update("classesTitle", value)} />
        </div>

        <div className="mt-5 space-y-5">
          {config.classes.map((item, index) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900">Class {index + 1}</h3>
                <button
                  type="button"
                  onClick={() =>
                    update("classes", config.classes.filter((row) => row.id !== item.id))
                  }
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
              <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
                <p className="mb-2 text-sm font-medium text-slate-700">Class image</p>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-20 w-20 rounded-full object-contain"
                      />
                    ) : (
                      <span className="text-sm font-bold text-slate-400">{item.badge}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={(node) => {
                        classFileInputs.current[item.id] = node;
                      }}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => handleUploadClassImage(item.id, e.target.files?.[0])}
                      className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Upload a course image/logo for the circle badge. Click Save Changes after upload.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.imageUrl && (
                        <button
                          type="button"
                          onClick={() => updateClass(item.id, { imageUrl: "" })}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Remove image
                        </button>
                      )}
                      {uploadingClassId === item.id && (
                        <span className="text-xs font-medium text-slate-500">Uploading...</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <TextField label="Title" value={item.title} onChange={(value) => updateClass(item.id, { title: value })} />
                <TextField label="Badge" value={item.badge} onChange={(value) => updateClass(item.id, { badge: value })} />
                <TextField label="Duration" value={item.duration} onChange={(value) => updateClass(item.id, { duration: value })} />
                <TextField label="Delivery" value={item.delivery} onChange={(value) => updateClass(item.id, { delivery: value })} />
                <TextField label="Date" value={item.date} onChange={(value) => updateClass(item.id, { date: value })} />
                <TextField label="Time" value={item.time} onChange={(value) => updateClass(item.id, { time: value })} />
                <TextField label="Price" value={item.price} onChange={(value) => updateClass(item.id, { price: value })} />
                <TextField label="Payment text" value={item.paymentText} onChange={(value) => updateClass(item.id, { paymentText: value })} />
                <TextField label="Button label" value={item.buttonLabel} onChange={(value) => updateClass(item.id, { buttonLabel: value })} />
                <TextField label="Button link" value={item.buttonHref} onChange={(value) => updateClass(item.id, { buttonHref: value })} />
              </div>
              <EditableList
                title="Class features"
                items={item.features}
                onChange={(items) => updateClass(item.id, { features: items })}
                onItemChange={(featureIndex, value) => updateClassFeature(item.id, featureIndex, value)}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addClass}
          className="mt-5 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 transition"
        >
          Add Live Class
        </button>
      </section>

      <div className="flex flex-wrap gap-3 sticky bottom-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
      />
    </div>
  );
}

function TextareaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
      />
    </div>
  );
}

function EditableList({
  title,
  items,
  onChange,
  onItemChange,
}: {
  title: string;
  items: string[];
  onChange: (items: string[]) => void;
  onItemChange?: (index: number, value: string) => void;
}) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          Add item
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => {
                if (onItemChange) {
                  onItemChange(index, e.target.value);
                  return;
                }
                onChange(items.map((value, itemIndex) => (itemIndex === index ? e.target.value : value)));
              }}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
              className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
