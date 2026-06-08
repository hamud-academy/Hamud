import { auth } from "@/auth";
import { getDiplomaConfig } from "@/lib/diploma-config";
import { WEEKDAY_KEYS } from "@/lib/i18n/format";
import { prisma } from "@/lib/prisma";
import DashboardHomeClient from "./DashboardHomeClient";

function startOfWeek(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return null;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    select: { courseId: true, completed: true },
  });
  const enrolledCourseIds = enrollments.map((e) => e.courseId);
  const completedCount = enrollments.filter((enrollment) => enrollment.completed).length;

  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = addDays(weekStart, 7);
  const lessonCompletions = await prisma.lessonCompletion.findMany({
    where: { userId: user.id },
    select: {
      completedAt: true,
      lesson: { select: { duration: true } },
    },
  });

  const completedLessonCount = lessonCompletions.length;
  const totalStudyMinutes = lessonCompletions.reduce(
    (sum, completion) => sum + (completion.lesson.duration ?? 0),
    0
  );
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    return {
      dayKey: WEEKDAY_KEYS[index],
      dateIso: date.toISOString(),
      minutes: 0,
      lessons: 0,
    };
  });

  lessonCompletions.forEach((completion) => {
    if (completion.completedAt < weekStart || completion.completedAt >= weekEnd) return;
    const index = Math.floor(
      (completion.completedAt.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000)
    );
    const day = weekDays[index];
    if (!day) return;
    day.minutes += completion.lesson.duration ?? 0;
    day.lessons += 1;
  });

  const weeklyTotalLessons = weekDays.reduce((sum, day) => sum + day.lessons, 0);
  const weeklyTotalMinutes = weekDays.reduce((sum, day) => sum + day.minutes, 0);
  const maxActivity = Math.max(...weekDays.map((day) => day.minutes || day.lessons), 0);

  const [recommended, diplomaConfig] = await Promise.all([
    prisma.course.findMany({
      where: {
        published: true,
        id: enrolledCourseIds.length ? { notIn: enrolledCourseIds } : undefined,
      },
      take: 8,
      include: {
        category: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getDiplomaConfig(),
  ]);

  const diplomaPrograms = diplomaConfig.programs.filter((program) => program.status === "PUBLISHED");

  const firstName = session?.user?.name?.split(/\s+/)[0] ?? "";

  return (
    <DashboardHomeClient
      firstName={firstName}
      totalStudyMinutes={totalStudyMinutes}
      completedLessonCount={completedLessonCount}
      completedCount={completedCount}
      enrollmentsCount={enrollments.length}
      certificatesCount={completedCount}
      weekDays={weekDays}
      weeklyTotalLessons={weeklyTotalLessons}
      weeklyTotalMinutes={weeklyTotalMinutes}
      maxActivity={maxActivity}
      recommended={recommended.map((course) => ({
        id: course.id,
        slug: course.slug,
        title: course.title,
        price: Number(course.price),
        durationHours: course.durationHours != null ? Number(course.durationHours) : null,
        thumbnail: course.thumbnail,
        categoryName: course.category.name,
        categorySlug: course.category.slug,
      }))}
      diplomaPrograms={diplomaPrograms}
      diplomaProgramsEyebrow={diplomaConfig.programsEyebrow}
      diplomaProgramsTitle={diplomaConfig.programsTitle}
    />
  );
}
