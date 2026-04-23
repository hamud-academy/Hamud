import Link from "next/link";
import Header from "@/components/Header";

interface Props {
  searchParams: Promise<{ slug?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { slug } = await searchParams;

  return (
    <>
      <Header />
      <main className="min-h-screen pt-14 sm:pt-16 bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Your order is pending</h1>
            <p className="text-gray-600 text-sm mb-6">
              Your order has been submitted. An admin will verify payment (via email or dashboard). Once approved, you will receive account access and course enrollment.
            </p>
            <p className="text-xs text-gray-500 mb-6">
              If you have paid, please wait for verification. You will receive an email when your order is approved.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {slug ? (
                <Link
                  href={`/courses/${slug}`}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 shadow-sm transition"
                >
                  Back to course
                </Link>
              ) : null}
              <Link
                href="/courses"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition"
              >
                All courses
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
