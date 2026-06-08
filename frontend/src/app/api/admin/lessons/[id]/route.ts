import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizePublicMediaUrl } from "@/lib/resolve-media-url";
import { z } from "zod";

const quizQuestionSchema = z.object({
  prompt: z.string().min(1),
  options: z
    .array(
      z.object({
        text: z.string().min(1),
        isCorrect: z.boolean(),
      })
    )
    .min(2),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  videoUrl: z.string().optional().nullable(),
  documentUrl: z.string().optional().nullable(),
  duration: z.number().int().min(0).optional().nullable(),
  order: z.number().int().min(0).optional(),
  quiz: z
    .object({
      questions: z.array(quizQuestionSchema),
    })
    .optional(),
});

function validateQuizQuestions(
  questions: { options: { isCorrect: boolean }[] }[]
): string | null {
  for (let i = 0; i < questions.length; i++) {
    const correct = questions[i].options.filter((o) => o.isCorrect);
    if (correct.length !== 1) {
      return `Question ${i + 1}: select exactly one correct answer.`;
    }
  }
  return null;
}

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

  const existing = await prisma.lesson.findUnique({
    where: { id },
    include: {
      lessonQuiz: { select: { id: true } },
      module: { include: { course: { select: { instructorId: true } } } },
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }
  if (role === "INSTRUCTOR" && existing.module.course.instructorId !== (session?.user as { id?: string }).id) {
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

  const quizQuestions = parsed.data.quiz?.questions;
  if (quizQuestions?.length) {
    const err = validateQuizQuestions(quizQuestions);
    if (err) {
      return NextResponse.json({ error: err }, { status: 400 });
    }
  }

  const videoUrl = normalizePublicMediaUrl(parsed.data.videoUrl, "Lesson video URL");
  if (!videoUrl.ok) {
    return NextResponse.json({ error: videoUrl.message }, { status: 400 });
  }
  const documentUrl = normalizePublicMediaUrl(parsed.data.documentUrl, "Lesson document URL");
  if (!documentUrl.ok) {
    return NextResponse.json({ error: documentUrl.message }, { status: 400 });
  }

  const lesson = await prisma.$transaction(async (tx) => {
    const updated = await tx.lesson.update({
      where: { id },
      data: {
        ...(parsed.data.title && { title: parsed.data.title }),
        ...(parsed.data.videoUrl !== undefined && { videoUrl: videoUrl.value }),
        ...(parsed.data.documentUrl !== undefined && { documentUrl: documentUrl.value }),
        ...(parsed.data.duration !== undefined && { duration: parsed.data.duration }),
        ...(parsed.data.order !== undefined && { order: parsed.data.order }),
      },
    });

    if (parsed.data.quiz !== undefined) {
      await tx.lessonQuiz.deleteMany({ where: { lessonId: id } });
      if (quizQuestions?.length) {
        await tx.lessonQuiz.create({
          data: {
            lessonId: id,
            questions: {
              create: quizQuestions.map((q, qi) => ({
                order: qi,
                prompt: q.prompt.trim(),
                options: {
                  create: q.options.map((o, oi) => ({
                    order: oi,
                    text: o.text.trim(),
                    isCorrect: o.isCorrect,
                  })),
                },
              })),
            },
          },
        });
      }
    }

    return updated;
  });

  return NextResponse.json({
    success: true,
    lesson: {
      ...lesson,
      duration: lesson.duration != null ? Number(lesson.duration) : null,
      hasQuiz:
        parsed.data.quiz !== undefined
          ? !!quizQuestions?.length
          : !!existing.lessonQuiz,
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  const existing = await prisma.lesson.findUnique({
    where: { id },
    include: { module: { include: { course: { select: { instructorId: true } } } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }
  if (role === "INSTRUCTOR" && existing.module.course.instructorId !== (session?.user as { id?: string }).id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.lesson.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
