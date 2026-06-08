import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import { getLoggedInCheckoutCustomer } from "@/lib/checkout-customer";
import { getPaymentNumbers } from "@/lib/payment-numbers";
import { getPaymentGatewayPublicConfig } from "@/lib/payment-gateway-config";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function DashboardCourseCheckoutPage({ params }: Props) {
  const { slug } = await params;
  const loggedInCustomer = await getLoggedInCheckoutCustomer();
  if (!loggedInCustomer) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/dashboard/checkout/course/${slug}`)}`);
  }

  const course = await prisma.course.findUnique({
    where: { slug, published: true },
    include: { category: { select: { name: true } } },
  });
  if (!course) notFound();

  const price = Number(course.price);
  const [totalLessons, moduleCount, paymentNumbers, paymentGateway] = await Promise.all([
    prisma.lesson.count({ where: { module: { courseId: course.id } } }),
    prisma.module.count({ where: { courseId: course.id } }),
    getPaymentNumbers(),
    Promise.resolve(getPaymentGatewayPublicConfig()),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-800">
        &quot;{course.title}&quot; has been added to your order.
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">Checkout</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ordering as {loggedInCustomer.fullName} ({loggedInCustomer.email})
        </p>
      </div>

      <CheckoutForm
        courseId={course.id}
        courseSlug={slug}
        courseTitle={course.title}
        amount={price}
        courseThumbnail={course.thumbnail}
        courseCategory={course.category.name}
        moduleCount={moduleCount}
        totalLessons={totalLessons}
        paymentNumbers={paymentNumbers}
        paymentGateway={paymentGateway}
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
