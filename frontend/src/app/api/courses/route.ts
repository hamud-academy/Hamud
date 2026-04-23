import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const level = searchParams.get("level");
    const search = searchParams.get("search") ?? searchParams.get("q");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(24, Math.max(6, parseInt(searchParams.get("limit") ?? "12")));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { published: true };

    if (category) {
      where.category = { slug: category };
    }

    if (level && ["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(level)) {
      where.level = level;
    }

    if (search?.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: { select: { name: true } },
          category: { select: { name: true, slug: true } },
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.course.count({ where }),
    ]);

    const formatted = courses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      thumbnail: c.thumbnail,
      price: Number(c.price),
      originalPrice: c.originalPrice ? Number(c.originalPrice) : null,
      level: c.level,
      durationHours: c.durationHours ? Number(c.durationHours) : null,
      category: c.category.name,
      categorySlug: c.category.slug,
      instructor: c.instructor.name ?? "Unknown",
      students: c._count.enrollments,
    }));

    return NextResponse.json({
      courses: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Courses API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
