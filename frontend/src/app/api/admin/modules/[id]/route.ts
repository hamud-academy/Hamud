import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  order: z.number().int().min(0).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  const existing = await prisma.module.findUnique({
    where: { id },
    include: { course: { select: { instructorId: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }
  if (role === "INSTRUCTOR" && existing.course.instructorId !== (session?.user as { id?: string }).id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const mod = await prisma.module.update({
    where: { id },
    data: {
      ...(parsed.data.title && { title: parsed.data.title }),
      ...(parsed.data.order !== undefined && { order: parsed.data.order }),
    },
  });

  return NextResponse.json({ success: true, module: mod });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  const role = user?.role;
  if (role !== "ADMIN" && role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  const existing = await prisma.module.findUnique({
    where: { id },
    include: { course: { select: { instructorId: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }
  if (role === "INSTRUCTOR" && existing.course.instructorId !== user?.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.module.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
