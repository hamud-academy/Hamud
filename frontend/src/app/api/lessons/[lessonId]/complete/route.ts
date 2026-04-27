import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            include: {
              modules: {
                select: {
                  lessons: { select: { id: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!lesson || !lesson.module.course.published) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const course = lesson.module.course;
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
  });
  if (!enrollment) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.lessonCompletion.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {},
    create: { userId, lessonId },
  });

  const courseLessonIds = course.modules.flatMap((module) => module.lessons.map((courseLesson) => courseLesson.id));
  const totalLessons = courseLessonIds.length;
  const completedLessons = totalLessons
    ? await prisma.lessonCompletion.count({
        where: {
          userId,
          lessonId: { in: courseLessonIds },
        },
      })
    : 0;
  const progress = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const completed = totalLessons > 0 && completedLessons >= totalLessons;

  const updatedEnrollment = await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      progress,
      completed,
    },
  });

  return NextResponse.json({
    completed,
    completedLessons,
    totalLessons,
    progress: updatedEnrollment.progress,
    certificateUrl: completed ? `/api/certificates/${updatedEnrollment.id}` : null,
  });
}
