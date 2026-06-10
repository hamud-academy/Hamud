"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/components/LanguageProvider";
import { isStrongPassword, strongPasswordMessage } from "@/lib/password-strength";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20";

type Step = "email" | "reset" | "done";

function maskEmail(email: string) {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.indexOf("@");
  if (at <= 0) return trimmed;
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${local.length > 2 ? "***" : ""}@${domain}`;
}

function PasswordVisibilityIcon({ hidden }: { hidden: boolean }) {
  if (hidden) {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  );
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          autoComplete={autoComplete}
          className={`${inputClass} pe-11`}
          placeholder={t("auth.passwordPlaceholder")}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute end-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
          aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")}
        >
          <PasswordVisibilityIcon hidden={!visible} />
        </button>
      </div>
    </div>
  );
}

export default function ForgotPasswordForm() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendResetCode() {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("auth.somethingWrong"));
        return;
      }
      setMessage(data.message ?? t("auth.forgotCodeSent", { email: maskEmail(email) }));
      setStep("reset");
    } catch {
      setError(t("auth.somethingWrong"));
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    await sendResetCode();
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!isStrongPassword(newPassword)) {
      setError(strongPasswordMessage());
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("auth.forgotPasswordMismatch"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code,
          password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("auth.forgotInvalidCode"));
        return;
      }
      setStep("done");
    } catch {
      setError(t("auth.somethingWrong"));
    } finally {
      setLoading(false);
    }
  }

  function resetToEmailStep() {
    setStep("email");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("");
    setError("");
  }

  if (step === "done") {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{t("auth.forgotSuccess")}</p>
        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
        >
          {t("auth.forgotBackToSignIn")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={step === "email" ? handleEmailSubmit : handleResetSubmit} className="space-y-5">
      <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-1 dark:bg-slate-800/80">
        <div
          className={`flex-1 rounded-xl px-3 py-2 text-center text-xs font-semibold transition ${
            step === "email"
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {t("auth.forgotStepEmail")}
        </div>
        <div
          className={`flex-1 rounded-xl px-3 py-2 text-center text-xs font-semibold transition ${
            step === "reset"
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {t("auth.forgotStepReset")}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {step === "email" ? (
        <div>
          <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("auth.email")}
          </label>
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className={inputClass}
            placeholder="email@example.com"
          />
          <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{t("auth.forgotEmailHint")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/80 p-5 dark:border-blue-900/40 dark:from-blue-950/40 dark:to-indigo-950/30">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{t("auth.checkEmail")}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {message || t("auth.forgotCodeSent", { email: maskEmail(email) })}
            </p>
          </div>

          <div>
            <label htmlFor="reset-code" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("auth.securityCode")}
            </label>
            <input
              id="reset-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              className={`${inputClass} text-center text-lg font-semibold tracking-[0.45em]`}
              placeholder="••••••"
            />
          </div>

          <PasswordInput
            id="new-password"
            label={t("auth.forgotNewPassword")}
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
          />
          <p className="-mt-2 text-xs text-slate-500 dark:text-slate-400">{strongPasswordMessage()}</p>

          <PasswordInput
            id="confirm-password"
            label={t("auth.forgotConfirmPassword")}
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
          />

          <div className="flex items-center justify-between gap-3 text-xs">
            <button
              type="button"
              onClick={resetToEmailStep}
              className="font-medium text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {t("auth.forgotUseDifferentEmail")}
            </button>
            <button
              type="button"
              onClick={sendResetCode}
              disabled={loading}
              className="font-semibold text-blue-600 transition hover:text-blue-700 disabled:opacity-50 dark:text-blue-400"
            >
              {t("auth.resendCode")}
            </button>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || (step === "reset" && code.length !== 6)}
        className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? t("auth.pleaseWait")
          : step === "email"
            ? t("auth.forgotContinue")
            : t("auth.forgotResetBtn")}
      </button>
    </form>
  );
}
