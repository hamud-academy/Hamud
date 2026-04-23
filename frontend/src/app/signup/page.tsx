import Link from "next/link";
import Header from "@/components/Header";

export const metadata = {
  title: "Sign up - BaroSmart",
  description: "Your account is created by admin after payment",
};

export default function SignUpPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-14 sm:pt-16 flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">Sign up</h1>
            <p className="text-gray-600 dark:text-slate-300 text-center text-sm mb-6">
              We don&apos;t create new accounts here. Choose a course, complete payment, then an admin will create your account and grant access.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/courses"
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 text-center text-sm"
              >
                View courses →
              </Link>
              <Link
                href="/login"
                className="w-full py-3 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 text-center text-sm"
              >
                Already have an account? Login
              </Link>
            </div>
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
