import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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

const createSchema = z.object({
  title: z.string().min(1),
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string };
  const role = user?.role;
  if (role !== "ADMIN" && role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id: moduleId } = await params;

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: { select: { instructorId: true } } },
  });
  if (!mod) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }
  if (role === "INSTRUCTOR" && mod.course.instructorId !== user?.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Lesson title is required" },
      { status: 400 }
    );
  }

  const maxOrder = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = parsed.data.order ?? (maxOrder?.order ?? -1) + 1;

  const quizQuestions = parsed.data.quiz?.questions;
  if (quizQuestions?.length) {
    const err = validateQuizQuestions(quizQuestions);
    if (err) {
      return NextResponse.json({ error: err }, { status: 400 });
    }
  }

  const lesson = await prisma.$transaction(async (tx) => {
    const l = await tx.lesson.create({
      data: {
        moduleId,
        title: parsed.data.title,
        videoUrl: parsed.data.videoUrl || null,
        documentUrl: parsed.data.documentUrl || null,
        duration: parsed.data.duration ?? null,
        order,
      },
    });

    if (quizQuestions?.length) {
      await tx.lessonQuiz.create({
        data: {
          lessonId: l.id,
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

    return l;
  });

  const serialized = {
    id: lesson.id,
    title: lesson.title,
    videoUrl: lesson.videoUrl,
    documentUrl: lesson.documentUrl,
    duration: lesson.duration != null ? Number(lesson.duration) : null,
    order: lesson.order,
    hasQuiz: !!quizQuestions?.length,
  };
  return NextResponse.json({ success: true, lesson: serialized });
}
