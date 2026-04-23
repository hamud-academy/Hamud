import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AdminOrdersList from "./AdminOrdersList";

export default async function AdminRequestsPage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    redirect("/admin");
  }

  const pendingOrders = await prisma.order.findMany({
    where: { status: "PENDING" },
    include: {
      course: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const orders = pendingOrders.map((o) => ({
    id: o.id,
    fullName: o.fullName,
    email: o.email,
    phone: o.phone,
    paymentMethod: o.paymentMethod,
    paymentRef: o.paymentRef,
    amount: Number(o.amount),
    createdAt: o.createdAt.toISOString(),
    course: o.course,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Requests</h1>
          <p className="text-slate-500 mt-1">
            List of student requests. Approve or deny orders.
          </p>
        </div>
        <AdminOrdersList orders={orders} />
      </div>
    </div>
  );
}
