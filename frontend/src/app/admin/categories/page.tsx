import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CategoriesAdminClient, { type AdminCategoryRow } from "./CategoriesAdminClient";

export default async function AdminCategoriesPage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") redirect("/admin");

  const rows = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { courses: true } } },
  });

  const initialCategories: AdminCategoryRow[] = rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    courseCount: c._count.courses,
    createdAt: c.createdAt.toISOString(),
  }));

  return <CategoriesAdminClient initialCategories={initialCategories} />;
}
