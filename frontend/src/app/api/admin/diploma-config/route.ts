import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDiplomaConfig, mergeAdminDiplomaConfig, saveDiplomaConfig } from "@/lib/diploma-config";

export const dynamic = "force-dynamic";

const lessonSchema = z.object({
  id: z.string().trim().min(1).max(100),
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(800).optional().default(""),
  videoUrl: z.string().trim().max(1000).optional().default(""),
  documentUrl: z.string().trim().max(1000).optional().default(""),
  duration: z.string().trim().max(80).optional().default(""),
  quiz: z
    .object({
      questions: z
        .array(
          z.object({
            prompt: z.string().trim().max(500),
            options: z
              .array(
                z.object({
                  text: z.string().trim().max(300),
                  isCorrect: z.boolean(),
                })
              )
              .max(8),
          })
        )
        .max(40),
    })
    .optional()
    .default({ questions: [] }),
});

const moduleSchema = z.object({
  id: z.string().trim().min(1).max(100),
  title: z.string().trim().min(2).max(180),
  order: z.number().int().min(0).max(1000).optional().default(0),
  lessons: z.array(lessonSchema).max(80).optional().default([]),
});

const examSchema = z.object({
  title: z.string().trim().min(2).max(180),
  passingScore: z.number().int().min(0).max(100).optional().default(50),
  questions: z
    .array(
      z.object({
        prompt: z.string().trim().max(500),
        options: z
          .array(
            z.object({
              text: z.string().trim().max(300),
              isCorrect: z.boolean(),
            })
          )
          .max(8),
      })
    )
    .max(80),
});

const subjectSchema = z.object({
  id: z.string().trim().min(1).max(100),
  title: z.string().trim().min(2).max(160),
  code: z.string().trim().max(32).optional().default(""),
  description: z.string().trim().max(500).optional().default(""),
  duration: z.string().trim().max(80).optional().default(""),
  teacherId: z.string().trim().max(100).optional().default(""),
  courseId: z.string().trim().max(100).optional().default(""),
  lessons: z.array(lessonSchema).max(60).optional().default([]),
  modules: z.array(moduleSchema).max(40).optional().default([]),
  exam: examSchema.optional().default({ title: "Final Exam", passingScore: 50, questions: [] }),
});

const paymentPlanSchema = z.object({
  type: z.enum(["SLOW", "SPEEDY", "EXPRESS", "ONE_TIME"]),
  title: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().min(1).max(180),
  originalPrice: z.string().trim().min(1).max(40),
  price: z.string().trim().min(1).max(40),
  priceSuffix: z.string().trim().min(1).max(40),
  theme: z.enum(["orange", "blue", "green", "red"]),
  courses: z.string().trim().min(1).max(80),
  details: z.array(z.string().trim().min(1).max(180)).min(1).max(12),
  ctaLabel: z.string().trim().min(1).max(80),
  ctaHref: z.string().trim().min(1).max(300),
});

const programSchema = z.object({
  id: z.string().trim().min(1).max(100),
  title: z.string().trim().min(2).max(180),
  slug: z.string().trim().min(2).max(180),
  summary: z.string().trim().min(10).max(600),
  duration: z.string().trim().min(1).max(80),
  courses: z.string().trim().min(1).max(80),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  details: z.array(z.string().trim().min(1).max(180)).min(1).max(12),
  paymentPlans: z.array(paymentPlanSchema).max(4).optional().default([]),
  subjects: z.array(subjectSchema).max(20),
});

const configSchema = z.object({
  spotlightEyebrow: z.string().trim().min(1).max(80),
  spotlightTitle: z.string().trim().min(2).max(180),
  spotlightDescription: z.string().trim().min(10).max(700),
  spotlightFeatures: z.array(z.string().trim().min(1).max(180)).min(1).max(12),
  heroEyebrow: z.string().trim().min(1).max(80),
  heroTitle: z.string().trim().min(2).max(180),
  heroDescription: z.string().trim().min(10).max(700),
  heroImageUrl: z.string().trim().max(1000).optional().default(""),
  ctaLabel: z.string().trim().min(1).max(80),
  ctaHref: z.string().trim().min(1).max(300),
  secondaryCtaLabel: z.string().trim().min(1).max(80),
  secondaryCtaHref: z.string().trim().min(1).max(300),
  programsEyebrow: z.string().trim().min(1).max(80),
  programsTitle: z.string().trim().min(2).max(180),
  programs: z.array(programSchema).min(1).max(24),
});

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "ADMIN";
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [config, instructors] = await Promise.all([
    getDiplomaConfig(),
    prisma.user.findMany({
      where: { role: "INSTRUCTOR" },
      orderBy: [{ name: "asc" }, { email: "asc" }],
      select: { id: true, name: true, email: true },
    }),
  ]);

  return NextResponse.json(
    { config, instructors },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = configSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid diploma data" },
      { status: 400 }
    );
  }

  const teacherIds = Array.from(
    new Set(parsed.data.programs.flatMap((program) => program.subjects.map((subject) => subject.teacherId).filter(Boolean)))
  );

  if (teacherIds.length > 0) {
    const teachers = await prisma.user.findMany({
      where: { id: { in: teacherIds }, role: "INSTRUCTOR" },
      select: { id: true },
    });
    const validTeacherIds = new Set(teachers.map((teacher) => teacher.id));
    const invalidTeacher = teacherIds.find((id) => !validTeacherIds.has(id));
    if (invalidTeacher) {
      return NextResponse.json({ error: "One selected teacher is not valid." }, { status: 400 });
    }
  }

  const courseIds = Array.from(
    new Set(parsed.data.programs.flatMap((program) => program.subjects.map((subject) => subject.courseId).filter(Boolean)))
  );

  if (courseIds.length > 0) {
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true },
    });
    const validCourseIds = new Set(courses.map((course) => course.id));
    const invalidCourse = courseIds.find((id) => !validCourseIds.has(id));
    if (invalidCourse) {
      return NextResponse.json({ error: "One linked course is not valid." }, { status: 400 });
    }
  }

  try {
    const current = await getDiplomaConfig();
    const merged = mergeAdminDiplomaConfig(current, parsed.data);
    const saved = await saveDiplomaConfig(merged);
    revalidatePath("/diploma");
    revalidatePath("/admin/diplomas");
    revalidatePath("/teacher/diploma");
    revalidatePath("/dashboard/diploma");
    return NextResponse.json(saved, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("diploma-config save error:", error);
    return NextResponse.json({ error: "Failed to save diploma configuration." }, { status: 500 });
  }
}
