import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import CheckoutForm from "@/components/CheckoutForm";
import { getDiplomaCheckoutContext } from "@/lib/diploma-checkout";
import { getPaymentNumbers } from "@/lib/payment-numbers";
import { getPaymentGatewayPublicConfig } from "@/lib/payment-gateway-config";
import { getSiteConfig } from "@/lib/site-config";

interface Props {
  params: Promise<{ programSlug: string }>;
  searchParams: Promise<{ plan?: string }>;
}

export const dynamic = "force-dynamic";

export default async function DiplomaCheckoutPage({ params, searchParams }: Props) {
  const { programSlug } = await params;
  const { plan = "SLOW" } = await searchParams;

  const [checkout, paymentNumbers, siteConfig, paymentGateway] = await Promise.all([
    getDiplomaCheckoutContext(programSlug, plan),
    getPaymentNumbers(),
    getSiteConfig(),
    Promise.resolve(getPaymentGatewayPublicConfig()),
  ]);

  if (!checkout) notFound();

  const productTitle = `${checkout.program.title} - ${checkout.plan.title}`;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-14 sm:pt-16">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              &quot;{productTitle}&quot; has been added to your order.
            </p>
            <Link
              href="/diploma"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Back to diplomas
            </Link>
          </div>

          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-slate-100 sm:text-3xl">Checkout</h1>

          <CheckoutForm
            courseTitle={productTitle}
            amount={checkout.amount}
            courseCategory="Diploma Program"
            courseThumbnail={siteConfig.logoUrl || undefined}
            productImageFit="contain"
            paymentNumbers={paymentNumbers}
            paymentGateway={paymentGateway}
            diplomaProgramId={checkout.program.id}
            diplomaProgramSlug={checkout.program.slug}
            diplomaPlanType={checkout.plan.type}
            productHighlights={[checkout.plan.subtitle, ...checkout.plan.details.slice(0, 3)]}
          />

          <Link
            href="/diploma"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 transition hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800"
          >
            ← Back to diploma page
          </Link>
        </div>
      </main>
    </>
  );
}
