import { NextResponse } from "next/server";
import { getLandingConfig } from "@/lib/landing-config";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [config, studentCount, studentProfiles] = await Promise.all([
    getLandingConfig(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { name: true, image: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);
  const profiles = studentProfiles.map((u) => ({
    name: u.name ?? "Student",
    image: u.image ?? null,
  }));
  return NextResponse.json({ ...config, studentCount, studentProfiles: profiles });
}
