import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import { getDiplomaCheckoutContext } from "@/lib/diploma-checkout";
import { getLoggedInCheckoutCustomer } from "@/lib/checkout-customer";
import { getPaymentNumbers } from "@/lib/payment-numbers";
import { getPaymentGatewayPublicConfig } from "@/lib/payment-gateway-config";
import { getSiteConfig } from "@/lib/site-config";

interface Props {
  params: Promise<{ programSlug: string }>;
  searchParams: Promise<{ plan?: string }>;
}

export const dynamic = "force-dynamic";

export default async function DashboardDiplomaCheckoutPage({ params, searchParams }: Props) {
  const { programSlug } = await params;
  const { plan = "SLOW" } = await searchParams;
  const loggedInCustomer = await getLoggedInCheckoutCustomer();
  if (!loggedInCustomer) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(`/dashboard/checkout/diploma/${programSlug}?plan=${plan}`)}`
    );
  }

  const [checkout, paymentNumbers, siteConfig, paymentGateway] = await Promise.all([
    getDiplomaCheckoutContext(programSlug, plan),
    getPaymentNumbers(),
    getSiteConfig(),
    Promise.resolve(getPaymentGatewayPublicConfig()),
  ]);
  if (!checkout) notFound();

  const productTitle = `${checkout.program.title} - ${checkout.plan.title}`;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-800">
        &quot;{productTitle}&quot; has been added to your order.
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">Checkout</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ordering as {loggedInCustomer.fullName} ({loggedInCustomer.email})
        </p>
      </div>

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
        loggedInCustomer={loggedInCustomer}
        studentSectionCheckout
      />

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        ← Back to dashboard
      </Link>
    </div>
  );
}
