import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDiplomaConfig } from "@/lib/diploma-config";
import DiplomaManagementClient from "./DiplomaManagementClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDiplomasPage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    redirect("/login");
  }

  const [config, instructors, courses] = await Promise.all([
    getDiplomaConfig(),
    prisma.user.findMany({
      where: { role: "INSTRUCTOR" },
      orderBy: [{ name: "asc" }, { email: "asc" }],
      select: { id: true, name: true, email: true },
    }),
    prisma.course.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true, instructorId: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <div className="p-4 sm:p-6 md:p-8">
        <DiplomaManagementClient initialConfig={config} instructors={instructors} courses={courses} />
      </div>
    </div>
  );
}
