"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/components/LanguageProvider";

interface Props {
  userId: string;
  currentName: string;
  currentEmail: string;
  currentImage: string | null;
}

export default function ProfileForm({
  userId: _userId,
  currentName,
  currentEmail,
  currentImage,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(currentName);
  const [email, setEmail] = useState(currentEmail);
  const [image, setImage] = useState<string | null>(currentImage);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    setImage(currentImage);
  }, [currentImage]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError("");
    setAvatarSuccess("");
    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/user/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setAvatarError(data.error ?? t("student.uploadFailed"));
        return;
      }
      setImage(data.url ?? image);
      setAvatarSuccess(t("student.photoUpdated"));
      router.refresh();
    } catch {
      setAvatarError(t("student.connectionError"));
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error");
        return;
      }
      setSuccess(t("student.profileSaved"));
      router.refresh();
    } catch {
      setError(t("student.connectionError"));
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (newPassword !== confirmPassword) {
      setPasswordError(t("student.passwordsNoMatch"));
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(t("student.passwordMinLength"));
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error ?? "Error");
        return;
      }
      setPasswordSuccess(t("student.passwordUpdated"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.refresh();
    } catch {
      setPasswordError(t("student.connectionError"));
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile photo */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">{t("student.profilePhoto")}</h2>
        {avatarError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{avatarError}</div>
        )}
        {avatarSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">{avatarSuccess}</div>
        )}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-slate-200">
            {image ? (
              <img src={image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarLoading}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 disabled:opacity-50 transition"
            >
              {avatarLoading ? t("student.uploading") : t("student.changePhoto")}
            </button>
            <p className="text-xs text-slate-500 mt-2">{t("student.photoFormats")}</p>
          </div>
        </div>
      </section>

      {/* Username & Email */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">{t("student.accountDetails")}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">{success}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("student.username")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition"
              placeholder={t("student.yourName")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("student.email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 disabled:opacity-50 transition"
          >
            {loading ? t("student.saving") : t("student.saveChanges")}
          </button>
        </form>
      </section>

      {/* Password */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">{t("student.changePassword")}</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {passwordError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{passwordError}</div>
          )}
          {passwordSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">{passwordSuccess}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("student.currentPassword")}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("student.newPassword")}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition"
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={6}
            />
            <p className="text-xs text-slate-500 mt-1">{t("student.passwordHint")}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("student.confirmNewPassword")}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
            className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 disabled:opacity-50 transition"
          >
            {passwordLoading ? t("student.updating") : t("student.updatePassword")}
          </button>
        </form>
      </section>
    </div>
  );
}
