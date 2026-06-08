import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { getDiplomaConfig, saveDiplomaConfig } from "@/lib/diploma-config";
import { teacherCanAccessDiplomaSubject } from "@/lib/diploma-teacher-access";

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
  order: z.number().int().min(0).max(1000),
  lessons: z.array(lessonSchema).max(80),
});

const examSchema = z.object({
  title: z.string().trim().min(2).max(180),
  passingScore: z.number().int().min(0).max(100),
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

const bodySchema = z.object({
  programId: z.string().trim().min(1).max(100),
  modules: z.array(moduleSchema).max(40),
  exam: examSchema,
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid module data" },
      { status: 400 }
    );
  }

  const { subjectId } = await params;
  const programId = parsed.data.programId;
  const canAccess = await teacherCanAccessDiplomaSubject(user.id, programId, subjectId);
  if (!canAccess) {
    return NextResponse.json(
      { error: "Subject not found or not assigned to you." },
      { status: 404 }
    );
  }

  const config = await getDiplomaConfig();
  let foundAssignedSubject = false;

  const modules = parsed.data.modules.map((curriculumModule, index) => ({
    ...curriculumModule,
    order: index,
  }));

  const programs = config.programs.map((program) => {
    if (program.id !== programId) return program;

    return {
      ...program,
      subjects: program.subjects.map((subject) => {
        if (subject.id !== subjectId) return subject;

        foundAssignedSubject = true;
        return {
          ...subject,
          modules,
          lessons: modules.flatMap((curriculumModule) => curriculumModule.lessons),
          exam: parsed.data.exam,
        };
      }),
    };
  });

  if (!foundAssignedSubject) {
    return NextResponse.json(
      { error: "Subject not found or not assigned to you." },
      { status: 404 }
    );
  }

  const saved = await saveDiplomaConfig({ ...config, programs });
  const updatedSubject = saved.programs
    .find((program) => program.id === programId)
    ?.subjects.find((subject) => subject.id === subjectId);

  revalidatePath("/teacher/diploma");
  revalidatePath("/dashboard/diploma");

  return NextResponse.json(
    { modules: updatedSubject?.modules ?? [], exam: updatedSubject?.exam ?? parsed.data.exam },
    { headers: { "Cache-Control": "no-store" } }
  );
}
