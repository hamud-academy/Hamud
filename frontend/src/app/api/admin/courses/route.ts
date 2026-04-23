import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeCourseThumbnail } from "@/lib/course-thumbnail";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug: only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  thumbnail: z.string().max(4000).optional().nullable(),
  price: z.number().min(0),
  originalPrice: z.number().min(0).optional().nullable(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  language: z.string().optional(),
  durationHours: z.number().min(0).optional().nullable(),
  published: z.boolean().optional(),
  instructorId: z.string().min(1).optional(),
  categoryId: z.string().min(1, "Category is required"),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (user?.role !== "ADMIN" && user?.role !== "INSTRUCTOR") {
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

  const data = parsed.data;

  const thumb = normalizeCourseThumbnail(data.thumbnail);
  if (!thumb.ok) {
    return NextResponse.json({ error: thumb.message }, { status: 400 });
  }

  const existing = await prisma.course.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return NextResponse.json({ error: "This slug is already in use" }, { status: 400 });
  }

  let instructorId: string;
  if (user?.role === "INSTRUCTOR") {
    instructorId = user.id!;
  } else {
    if (!data.instructorId) {
      return NextResponse.json({ error: "Instructor is required" }, { status: 400 });
    }
    const instructor = await prisma.user.findUnique({
      where: { id: data.instructorId, role: "INSTRUCTOR" },
    });
    if (!instructor) {
      return NextResponse.json({ error: "Instructor not found or not an INSTRUCTOR" }, { status: 400 });
    }
    instructorId = data.instructorId;
  }

  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 400 });
  }

  const course = await prisma.course.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      thumbnail: thumb.value,
      price: data.price,
      originalPrice: data.originalPrice ?? null,
      level: data.level ?? "BEGINNER",
      language: data.language ?? "so",
      durationHours: data.durationHours ?? null,
      published: data.published ?? false,
      instructorId,
      categoryId: data.categoryId,
    },
  });

  return NextResponse.json({ success: true, id: course.id, slug: course.slug });
}
