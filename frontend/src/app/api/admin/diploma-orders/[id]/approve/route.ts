import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { approveOrderById } from "@/lib/admin-order-actions";

/** @deprecated Use PATCH /api/admin/orders/[id]/approve */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id: orderId } = await params;
  const result = await approveOrderById(orderId);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  revalidatePath("/admin/requests");
  return NextResponse.json({ success: true, userId: result.userId });
}
