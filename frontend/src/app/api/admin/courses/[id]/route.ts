import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeCourseThumbnail } from "@/lib/course-thumbnail";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional().nullable(),
  thumbnail: z.string().max(4000).optional().nullable(),
  price: z.number().min(0).optional(),
  originalPrice: z.number().min(0).optional().nullable(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  language: z.string().optional(),
  durationHours: z.number().min(0).optional().nullable(),
  published: z.boolean().optional(),
  categoryId: z.string().min(1).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (user?.role !== "ADMIN" && user?.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }
  if (user?.role === "INSTRUCTOR" && course.instructorId !== user.id) {
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
    const msg = parsed.error.issues[0]?.message ?? "Invalid data";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const data = parsed.data;

  let nextThumbnail: string | null | undefined = undefined;
  if (data.thumbnail !== undefined) {
    const thumb = normalizeCourseThumbnail(data.thumbnail);
    if (!thumb.ok) {
      return NextResponse.json({ error: thumb.message }, { status: 400 });
    }
    nextThumbnail = thumb.value;
  }

  if (data.slug && data.slug !== course.slug) {
    const existing = await prisma.course.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ error: "This slug is already in use" }, { status: 400 });
    }
  }
  if (data.categoryId) {
    const cat = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!cat) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }
  }

  const updated = await prisma.course.update({
    where: { id },
    data: {
      ...(data.title != null && { title: data.title }),
      ...(data.slug != null && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(nextThumbnail !== undefined && { thumbnail: nextThumbnail }),
      ...(data.price != null && { price: data.price }),
      ...(data.originalPrice !== undefined && { originalPrice: data.originalPrice }),
      ...(data.level != null && { level: data.level }),
      ...(data.language != null && { language: data.language }),
      ...(data.durationHours !== undefined && { durationHours: data.durationHours }),
      ...(data.published !== undefined && { published: data.published }),
      ...(data.categoryId != null && { categoryId: data.categoryId }),
    },
  });

  return NextResponse.json({
    success: true,
    course: {
      id: updated.id,
      title: updated.title,
      slug: updated.slug,
      price: Number(updated.price),
      published: updated.published,
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  if (user?.role !== "ADMIN" && user?.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }
  if (user?.role === "INSTRUCTOR" && course.instructorId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.course.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
