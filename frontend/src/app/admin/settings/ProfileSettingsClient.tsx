"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const MAX_AVATAR_MB = 50;

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

type ProfileSettingsClientProps = {
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
};

export default function ProfileSettingsClient({ user }: ProfileSettingsClientProps) {
  const router = useRouter();
  const [photoOpen, setPhotoOpen] = useState(false);
  const [usernameOpen, setUsernameOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState(user.name ?? "");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [email, setEmail] = useState(user.email);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const displayName = user.name || user.email || "Admin";
  const avatarUrl = user.image || null;

  async function handlePhotoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!photoFile) {
      setPhotoError("Please select an image.");
      return;
    }
    if (photoFile.size > MAX_AVATAR_MB * 1024 * 1024) {
      setPhotoError(`Max size is ${MAX_AVATAR_MB}MB.`);
      return;
    }
    setPhotoError("");
    setPhotoLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", photoFile);
      const res = await fetch("/api/user/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setPhotoError(data.error ?? "Upload failed");
        return;
      }
      setPhotoOpen(false);
      setPhotoFile(null);
      router.refresh();
    } catch {
      setPhotoError("Connection error");
    } finally {
      setPhotoLoading(false);
    }
  }

  async function handleUsernameSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameMessage({ type: "err", text: "Username is required." });
      return;
    }
    setUsernameMessage(null);
    setUsernameLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUsernameMessage({ type: "err", text: data.error ?? "Update failed" });
        return;
      }
      setUsernameMessage({ type: "ok", text: "Username updated." });
      setUsernameOpen(false);
      router.refresh();
    } catch {
      setUsernameMessage({ type: "err", text: "Connection error" });
    } finally {
      setUsernameLoading(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailMessage({ type: "err", text: "Email is required." });
      return;
    }
    setEmailMessage(null);
    setEmailLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailMessage({ type: "err", text: data.error ?? "Update failed" });
        return;
      }
      setEmailMessage({ type: "ok", text: "Email updated." });
      setEmailOpen(false);
      router.refresh();
    } catch {
      setEmailMessage({ type: "err", text: "Connection error" });
    } finally {
      setEmailLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "err", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "err", text: "Passwords do not match." });
      return;
    }
    setPasswordMessage(null);
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
        setPasswordMessage({ type: "err", text: data.error ?? "Update failed" });
        return;
      }
      setPasswordMessage({ type: "ok", text: "Password updated." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordOpen(false);
    } catch {
      setPasswordMessage({ type: "err", text: "Connection error" });
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Profile Settings</h1>
      <p className="text-slate-600 mb-8">Manage your admin account details.</p>

      <div className="space-y-4">
        {/* Photo */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-6">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-100 ring-2 ring-slate-200">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Profile"
                  fill
                  className="object-cover"
                  unoptimized={avatarUrl.startsWith("http") && avatarUrl.includes("localhost")}
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-emerald-600">
                  {displayName[0]?.toUpperCase() ?? "A"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900">Profile photo</h3>
              <p className="text-sm text-slate-500">JPEG, PNG, WebP or GIF. Max {MAX_AVATAR_MB}MB.</p>
              <button
                type="button"
                onClick={() => setPhotoOpen(true)}
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
              >
                Change photo
              </button>
            </div>
          </div>
        </div>

        {/* Username */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900">Username</h3>
              <p className="text-slate-600 mt-0.5">{displayName}</p>
            </div>
            <button
              type="button"
              onClick={() => setUsernameOpen(true)}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
            >
              Change username
            </button>
          </div>
        </div>

        {/* Email */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900">Email</h3>
              <p className="text-slate-600 mt-0.5">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => setEmailOpen(true)}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
            >
              Change email
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900">Password</h3>
              <p className="text-slate-600 mt-0.5">••••••••</p>
            </div>
            <button
              type="button"
              onClick={() => setPasswordOpen(true)}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
            >
              Change password
            </button>
          </div>
        </div>
      </div>

      {/* Photo modal */}
      <Modal open={photoOpen} onClose={() => { setPhotoOpen(false); setPhotoError(""); setPhotoFile(null); }} title="Change profile photo">
        <form onSubmit={handlePhotoSubmit} className="space-y-4">
          {photoError && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{photoError}</div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setPhotoFile(f ?? null);
              setPhotoError("");
            }}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
          />
          <p className="text-xs text-slate-500">Max size: {MAX_AVATAR_MB}MB. Allowed: JPEG, PNG, WebP, GIF.</p>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPhotoOpen(false)}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={photoLoading || !photoFile}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {photoLoading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Username modal */}
      <Modal open={usernameOpen} onClose={() => setUsernameOpen(false)} title="Change username">
        <form onSubmit={handleUsernameSubmit} className="space-y-4">
          {usernameMessage && (
            <div
              className={`rounded-xl px-4 py-3 text-sm ${
                usernameMessage.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
              }`}
            >
              {usernameMessage.text}
            </div>
          )}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
              placeholder="Your name"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setUsernameOpen(false)}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={usernameLoading}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {usernameLoading ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Email modal */}
      <Modal open={emailOpen} onClose={() => setEmailOpen(false)} title="Change email">
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {emailMessage && (
            <div
              className={`rounded-xl px-4 py-3 text-sm ${
                emailMessage.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
              }`}
            >
              {emailMessage.text}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
              placeholder="admin@example.com"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEmailOpen(false)}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={emailLoading}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {emailLoading ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Password modal */}
      <Modal open={passwordOpen} onClose={() => { setPasswordOpen(false); setPasswordMessage(null); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }} title="Change password">
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {passwordMessage && (
            <div
              className={`rounded-xl px-4 py-3 text-sm ${
                passwordMessage.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
              }`}
            >
              {passwordMessage.text}
            </div>
          )}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-1">Current password</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1">New password (min 6)</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">Confirm new password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
              placeholder="••••••••"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPasswordOpen(false)}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={passwordLoading}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {passwordLoading ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
