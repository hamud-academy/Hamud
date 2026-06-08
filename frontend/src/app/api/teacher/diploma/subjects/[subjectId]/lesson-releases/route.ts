import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { getDiplomaConfig } from "@/lib/diploma-config";
import {
  applyLessonReleaseAction,
  getEnrolledStudentsForProgram,
  getSubjectReleaseOverview,
  type ReleaseAction,
} from "@/lib/diploma-lesson-releases";
import { teacherCanAccessDiplomaSubject } from "@/lib/diploma-teacher-access";
import { getSubjectFromProgram } from "@/lib/diploma-student-access";

export const dynamic = "force-dynamic";

async function requireTeacher() {
  const session = await auth();
  const user = session?.user as { role?: string; id?: string } | undefined;
  if (user?.role !== "INSTRUCTOR" || !user.id) return null;
  return user;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const teacher = await requireTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { subjectId } = await params;
  const programId = request.nextUrl.searchParams.get("programId")?.trim() ?? "";
  const userId = request.nextUrl.searchParams.get("userId")?.trim() ?? "";

  if (!programId) {
    return NextResponse.json({ error: "programId is required" }, { status: 400 });
  }

  const canAccess = await teacherCanAccessDiplomaSubject(teacher.id!, programId, subjectId);
  if (!canAccess) {
    return NextResponse.json({ error: "Subject not found or not assigned to you." }, { status: 404 });
  }

  const config = await getDiplomaConfig();
  const program = config.programs.find((item) => item.id === programId);
  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  const subject = getSubjectFromProgram(program, subjectId);
  if (!subject) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }

  const students = await getEnrolledStudentsForProgram(program.id, program.slug);

  if (!userId) {
    return NextResponse.json({
      students,
      subject: {
        id: subject.id,
        title: subject.title,
        code: subject.code,
        modules: subject.modules ?? [],
      },
    });
  }

  const state = await getSubjectReleaseOverview({
    userId,
    programId: program.id,
    subject,
  });

  return NextResponse.json({
    students,
    subject: {
      id: subject.id,
      title: subject.title,
      code: subject.code,
      modules: subject.modules ?? [],
    },
    state,
  });
}

const actionSchema = z.object({
  action: z.enum([
    "enable_guided",
    "disable_guided",
    "release_lesson",
    "revoke_lesson",
    "release_next",
    "release_module",
    "release_all",
  ]),
  programId: z.string().trim().min(1).max(100),
  userId: z.string().trim().min(1).max(100),
  lessonId: z.string().trim().max(100).optional(),
  moduleId: z.string().trim().max(100).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const teacher = await requireTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { subjectId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const canAccess = await teacherCanAccessDiplomaSubject(
    teacher.id!,
    parsed.data.programId,
    subjectId
  );
  if (!canAccess) {
    return NextResponse.json({ error: "Subject not found or not assigned to you." }, { status: 404 });
  }

  const config = await getDiplomaConfig();
  const program = config.programs.find((item) => item.id === parsed.data.programId);
  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  const subject = getSubjectFromProgram(program, subjectId);
  if (!subject) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }

  try {
    const state = await applyLessonReleaseAction({
      action: parsed.data.action as ReleaseAction,
      userId: parsed.data.userId,
      programId: program.id,
      subject,
      lessonId: parsed.data.lessonId,
      moduleId: parsed.data.moduleId,
      actorId: teacher.id!,
      actorRole: "TEACHER",
    });

    revalidatePath("/dashboard/diploma");
    revalidatePath("/teacher/diploma");

    return NextResponse.json({ state });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Action failed" },
      { status: 400 }
    );
  }
}
