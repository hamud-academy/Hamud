import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTeacherAssignedDiplomaSubjects } from "@/lib/diploma-teacher-access";
import TeacherDiplomaClient from "./TeacherDiplomaClient";

export const dynamic = "force-dynamic";

export default async function TeacherDiplomaPage() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || user.role !== "INSTRUCTOR") {
    redirect("/login");
  }

  const assignedSubjects = await getTeacherAssignedDiplomaSubjects(user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="p-4 sm:p-6 md:p-8">
        <TeacherDiplomaClient assignedSubjects={assignedSubjects} />
      </div>
    </div>
  );
}
