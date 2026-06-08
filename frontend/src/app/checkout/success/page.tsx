import Link from "next/link";

import Header from "@/components/Header";

import { confirmStripeCheckoutSession } from "@/lib/stripe-checkout";

interface Props {
  searchParams: Promise<{
    slug?: string;
    diploma?: string;
    plan?: string;
    paid?: string;
    session_id?: string;
  }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { slug, diploma, paid, session_id } = await searchParams;

  let paymentReceived = paid === "1";
  if (session_id) {
    try {
      const result = await confirmStripeCheckoutSession(session_id);
      paymentReceived = result.verified;
    } catch {
      paymentReceived = false;
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-14 sm:pt-16 bg-gray-50 dark:bg-slate-950">
        <div className="max-w-lg mx-auto px-4 py-12 text-center">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-8">
            <div
              className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4 ${
                paymentReceived
                  ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
              }`}
            >
              {paymentReceived ? (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">
              {paymentReceived ? "Payment received" : "Your order is pending"}
            </h1>
            <p className="text-gray-600 dark:text-slate-300 text-sm mb-6">
              {paymentReceived
                ? `Your payment was successful. An admin will verify and activate your account${diploma ? " for your diploma program" : " and course enrollment"}.`
                : `Your order has been submitted. An admin will verify payment (via email or dashboard). Once approved, you will receive account access${diploma ? " to your diploma program" : " and course enrollment"}.`}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-6">
              {paymentReceived
                ? "You will receive an email when your order is approved and your account is ready."
                : "If you have paid, please wait for verification. You will receive an email when your order is approved."}
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
              {diploma ? (
                <Link
                  href="/diploma"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 shadow-sm transition"
                >
                  Back to diploma page
                </Link>
              ) : null}
              <Link
                href={slug ? "/courses" : diploma ? "/diploma" : "/courses"}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 transition"
              >
                {diploma ? "All diplomas" : "All courses"}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
