import { prisma } from "@/lib/prisma";
import { jsonWithPublicCache } from "@/lib/http-cache";

export async function GET() {
  const studentCount = await prisma.user.count({
    where: { role: "STUDENT" },
  });
  return jsonWithPublicCache({ studentCount });
}
