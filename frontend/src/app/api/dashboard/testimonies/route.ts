import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Testimony is required"),
});

async function getStudentId(): Promise<string | null> {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return null;
  let role = (session?.user as { role?: string })?.role;
  if (role !== "STUDENT") {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    role = user?.role ?? undefined;
  }
  return role === "STUDENT" ? userId : null;
}

export async function GET() {
  const userId = await getStudentId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const list = await prisma.testimony.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, body: true, createdAt: true },
  });
  return NextResponse.json(list);
}

export async function POST(request: NextRequest) {
  const userId = await getStudentId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid data";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  if (typeof (prisma as { testimony?: { create: unknown } }).testimony?.create !== "function") {
    console.error("Prisma client missing testimony model. Run: npx prisma generate");
    return NextResponse.json(
      { error: "Service is updating. Please try again in a moment." },
      { status: 503 }
    );
  }
  try {
    const testimony = await prisma.testimony.create({
      data: {
        userId,
        title: parsed.data.title.trim(),
        body: parsed.data.body.trim(),
      },
      select: { id: true, title: true, body: true, createdAt: true },
    });
    return NextResponse.json(testimony);
  } catch (err) {
    console.error("Testimony create error:", err);
    const message = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
