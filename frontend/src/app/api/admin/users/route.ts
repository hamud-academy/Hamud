import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { isStrongPassword, strongPasswordMessage } from "@/lib/password-strength";

const schema = z.object({
  email: z.string().email(),
  password: z.string().refine(isStrongPassword, strongPasswordMessage()),
  name: z.string().min(1).optional(),
  role: z.enum(["ADMIN", "INSTRUCTOR", "STUDENT"]),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() || undefined;
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) {
      const d = new Date(dateTo);
      d.setHours(23, 59, 59, 999);
      where.createdAt.lte = d;
    }
  }

  const users = await prisma.user.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const list = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  }));

  return NextResponse.json({ users: list });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data. Email, strong password, and role are required." },
      { status: 400 }
    );
  }

  const { password, name, role } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "This email is already in use" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      name: name ?? email.split("@")[0],
      passwordHash,
      role,
    },
  });

  return NextResponse.json({ success: true });
}
