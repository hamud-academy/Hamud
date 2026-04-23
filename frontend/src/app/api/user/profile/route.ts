import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const schema = z.object({
  name: z.string().min(1).optional(),
  image: z.string().url().optional().nullable(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  password: z.string().min(6).optional(),
});

export async function PATCH(request: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const data: { name?: string; image?: string | null; email?: string; passwordHash?: string } = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.image !== undefined) data.image = parsed.data.image;

  if (parsed.data.email !== undefined) {
    if (parsed.data.email !== existing.email) {
      const taken = await prisma.user.findUnique({ where: { email: parsed.data.email } });
      if (taken) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
    }
    data.email = parsed.data.email;
  }

  if (parsed.data.password !== undefined) {
    if (!parsed.data.currentPassword || !existing.passwordHash) {
      return NextResponse.json({ error: "Current password required" }, { status: 400 });
    }
    const valid = await bcrypt.compare(parsed.data.currentPassword, existing.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is wrong" }, { status: 400 });
    }
    data.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data,
  });

  return NextResponse.json({ success: true });
}
