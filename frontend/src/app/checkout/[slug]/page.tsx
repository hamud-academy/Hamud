import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import CheckoutForm from "@/components/CheckoutForm";
import { getPaymentNumbers } from "@/lib/payment-numbers";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CheckoutPage({ params }: Props) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug, published: true },
    include: { category: { select: { name: true } }, instructor: { select: { name: true } } },
  });

  if (!course) notFound();

  const price = Number(course.price);
  const [totalLessons, moduleCount, paymentNumbers] = await Promise.all([
    prisma.lesson.count({ where: { module: { courseId: course.id } } }),
    prisma.module.count({ where: { courseId: course.id } }),
    getPaymentNumbers(),
  ]);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-14 sm:pt-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Green success banner - Hurbad style */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-100 mb-6">
            <p className="text-sm text-emerald-800 font-medium">
              &quot;{course.title}&quot; has been added to your order.
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
            >
              Continue to checkout
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Checkout</h1>

          {/* Parallel layout: BILLING DETAILS (left) | YOUR ORDER + PAYMENT (right) */}
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
          />

          <Link
            href={`/courses/${slug}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition mt-6"
          >
            ← Back to course
          </Link>
        </div>
      </main>
    </>
  );
}
