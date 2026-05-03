import Link from "next/link";
import { Suspense } from "react";
import Header from "@/components/Header";
import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Login - BaroSmart",
  description: "Login to your BaroSmart account",
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-14 sm:pt-16 flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">Login</h1>
            <p className="text-gray-600 dark:text-slate-300 text-center text-sm mb-6">Sign in with your password and email security code</p>
            <Suspense fallback={<div className="animate-pulse h-48 bg-gray-100 dark:bg-slate-800 rounded-lg" />}>
              <LoginForm />
            </Suspense>
            <p className="text-center text-sm text-gray-600 dark:text-slate-400 mt-6">
              Ma haysato akoon?{" "}
              <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Is diiwaangeli
              </Link>
              .
            </p>
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-slate-500 mt-4">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              ← Back to home
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
