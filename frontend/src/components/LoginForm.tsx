"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      setError(data.error ?? "Invalid email or password");
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
        setError("Sign in failed");
        return false;
      }
      await redirectAfterLogin();
      return true;
    }
    setMfaRequired(true);
    setMessage(data.message ?? "A 6-digit security code has been sent to your email.");
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

      const res = await signIn("credentials", { email: email.trim().toLowerCase(), password, mfaCode, redirect: false });
      if (res?.error) {
        setError("Invalid or expired security code");
        return;
      }
      await redirectAfterLogin();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {justRegistered && (
        <div className="px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-sm border border-emerald-100 dark:border-emerald-900/40">
          Akoonkaaga ayaa la abuuray. Ku riix Continue, geli ereyga sirta ah, oo diiwan geli koodhka 6-da lambar ee email-ka. Haddii aysan imaanin waxaad hubsataa Spam/Promotions ama dib u diraysaa kodka.
        </div>
      )}
      {error && <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/50">{error}</div>}
      {message && <div className="px-4 py-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-sm border border-blue-100 dark:border-blue-900/50">{message}</div>}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          disabled={mfaRequired}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="email@example.com" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Password</label>
        <div className="relative">
          <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
            disabled={mfaRequired}
            className="w-full px-4 py-2.5 pr-11 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="••••••••" />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            )}
          </button>
        </div>
      </div>
      {mfaRequired && (
        <div>
          <label htmlFor="mfa-code" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Security code</label>
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
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 text-sm tracking-[0.35em]"
            placeholder="123456"
          />
          <div className="flex items-center justify-between gap-3 mt-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setMfaRequired(false);
                setMfaCode("");
                setMessage("");
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Change email or password
            </button>
            <button
              type="button"
              onClick={async () => {
                setError("");
                setMessage("");
                setLoading(true);
                try {
                  await requestSecurityCode();
                } catch {
                  setError("Something went wrong");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 dark:text-blue-400"
            >
              Resend code
            </button>
          </div>
        </div>
      )}
      <button type="submit" disabled={loading}
        className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition text-sm">
        {loading ? "Loading..." : mfaRequired ? "Verify and sign in" : "Continue"}
      </button>
    </form>
  );
}
