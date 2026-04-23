import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const list = await prisma.testimony.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        body: true,
        createdAt: true,
        user: {
          select: { name: true, image: true },
        },
      },
    });
    const items = list.map((t) => ({
      id: t.id,
      title: t.title,
      body: t.body,
      createdAt: t.createdAt.toISOString(),
      userName: t.user.name ?? "Student",
      userImage: t.user.image ?? null,
    }));
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
