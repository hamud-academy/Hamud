import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function slugify(name: string): string {
  const s = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "category";
}

async function uniqueSlug(base: string): Promise<string> {
  let n = 0;
  for (;;) {
    const candidate = n === 0 ? base : `${base}-${n}`;
    const exists = await prisma.category.findUnique({ where: { slug: candidate } });
    if (!exists) return candidate;
    n += 1;
  }
}

const createSchema = z.object({
  name: z.string().min(1, "Name is required").max(120, "Name is too long"),
});

export async function GET() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { courses: true } } },
  });

  return NextResponse.json({
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      courseCount: c._count.courses,
      createdAt: c.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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

  const baseSlug = slugify(parsed.data.name);
  const slug = await uniqueSlug(baseSlug);

  const category = await prisma.category.create({
    data: {
      name: parsed.data.name.trim(),
      slug,
    },
  });

  return NextResponse.json({
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      courseCount: 0,
      createdAt: category.createdAt.toISOString(),
    },
  });
}
