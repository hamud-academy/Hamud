import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const studentCount = await prisma.user.count({
    where: { role: "STUDENT" },
  });
  return NextResponse.json({ studentCount });
}
