import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { migrateLegacyDiplomaOrdersOnLoad } from "@/lib/diploma-checkout";
import AdminOrdersTable, { type AdminOrderRow } from "./AdminOrdersTable";

export const dynamic = "force-dynamic";

function isDiplomaOrder(order: {
  kind: string;
  programId: string | null;
  courseId: string | null;
}): boolean {
  return order.kind === "DIPLOMA" || Boolean(order.programId && !order.courseId);
}

export default async function AdminRequestsPage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    redirect("/admin");
  }

  try {
    await migrateLegacyDiplomaOrdersOnLoad();
  } catch (error) {
    console.error("[Admin requests] Legacy diploma import failed:", error);
  }

  const pendingOrders = await prisma.order.findMany({
    where: { status: "PENDING" },
    include: {
      course: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const orders: AdminOrderRow[] = pendingOrders.map((order) => {
    const diploma = isDiplomaOrder(order);
    return {
      id: order.id,
      kind: diploma ? "diploma" : "course",
      fullName: order.fullName || "Unknown",
      email: order.email || "",
      paymentMethod: order.paymentMethod || "Manual",
      paymentRef: order.paymentRef ?? null,
      amount: Number(order.amount) || 0,
      createdAt: order.createdAt?.toISOString?.() ?? new Date().toISOString(),
      itemTitle: diploma
        ? order.programTitle || "Diploma program"
        : order.course?.title || "Course",
      itemSubtitle: diploma ? order.planTitle ?? null : null,
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Requests</h1>
          <p className="text-slate-500 mt-1">
            List of student requests. Approve or deny orders.
          </p>
        </div>
        <AdminOrdersTable orders={orders} />
      </div>
    </div>
  );
}
