"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/components/LanguageProvider";
import { saveSessionLoginPassword } from "@/lib/session-login-password";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20";

function maskEmail(email: string) {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.indexOf("@");
  if (at <= 0) return trimmed;
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${local.length > 2 ? "***" : ""}@${domain}`;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const justRegistered = searchParams.get("registered") === "1";

  async function redirectAfterLogin() {
    const session = await getSession();
    const role = (session?.user as { role?: string })?.role;
    if (role === "ADMIN") {
      router.push("/admin");
    } else if (role === "INSTRUCTOR") {
      router.push("/teacher");
    } else {
      router.push(callbackUrl);
    }
    router.refresh();
  }

  async function requestSecurityCode() {
    const normalizedEmail = email.trim().toLowerCase();
    const res = await fetch("/api/auth/mfa/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? t("auth.invalidCredentials"));
      return false;
    }
    setEmail(normalizedEmail);
    if (data.mfaRequired === false) {
      const signRes = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });
      if (signRes?.error) {
        setError(t("auth.signInFailed"));
        return false;
      }
      saveSessionLoginPassword(normalizedEmail, password);
      await redirectAfterLogin();
      return true;
    }
    setMfaRequired(true);
    setMessage(data.message ?? t("auth.mfaCodeSent"));
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      if (!mfaRequired) {
        await requestSecurityCode();
        return;
      }

      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        mfaCode,
        redirect: false,
      });
      if (res?.error) {
        setError(t("auth.invalidMfaCode"));
        return;
      }
      saveSessionLoginPassword(email.trim().toLowerCase(), password);
      await redirectAfterLogin();
    } catch {
      setError(t("auth.somethingWrong"));
    } finally {
      setLoading(false);
    }
  }

  function resetToCredentials() {
    setMfaRequired(false);
    setMfaCode("");
    setMessage("");
    setError("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-1 dark:bg-slate-800/80">
        <div
          className={`flex-1 rounded-xl px-3 py-2 text-center text-xs font-semibold transition ${
            !mfaRequired
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {t("auth.stepAccount")}
        </div>
        <div
          className={`flex-1 rounded-xl px-3 py-2 text-center text-xs font-semibold transition ${
            mfaRequired
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {t("auth.stepVerify")}
        </div>
      </div>

      {justRegistered && !mfaRequired && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          {t("auth.registeredBanner")}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {!mfaRequired ? (
        <>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("auth.email")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={inputClass}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("auth.password")}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={`${inputClass} pe-11`}
                placeholder={t("auth.passwordPlaceholder")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute end-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/80 p-5 dark:border-blue-900/40 dark:from-blue-950/40 dark:to-indigo-950/30">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{t("auth.checkEmail")}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {message || t("auth.mfaSentTo", { email: maskEmail(email) })}
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {t("auth.signingInAs", { email: maskEmail(email) })}
            </p>
          </div>

          <div>
            <label htmlFor="mfa-code" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("auth.securityCode")}
            </label>
            <input
              id="mfa-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              autoFocus
              className={`${inputClass} text-center text-lg font-semibold tracking-[0.45em]`}
              placeholder="••••••"
            />
            <div className="mt-3 flex items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={resetToCredentials}
                className="font-medium text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <span className="inline-flex items-center gap-1">
                  <span className="rtl:rotate-180" aria-hidden>
                    ←
                  </span>
                  {t("auth.useDifferentAccount")}
                </span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  setError("");
                  setLoading(true);
                  try {
                    await requestSecurityCode();
                  } catch {
                    setError(t("auth.somethingWrong"));
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="font-semibold text-blue-600 transition hover:text-blue-700 disabled:opacity-50 dark:text-blue-400"
              >
                {t("auth.resendCode")}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || (mfaRequired && mfaCode.length !== 6)}
        className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? t("auth.pleaseWait") : mfaRequired ? t("auth.verifyAndSignIn") : t("auth.continueBtn")}
      </button>
    </form>
  );
}
