import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
];
const MAX_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

export async function POST(request: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "No file. Please select a video." },
      { status: 400 }
    );
  }

  const isVideo = ALLOWED_TYPES.includes(file.type) || /\.(mp4|webm|ogg|mov)$/i.test(file.name);
  if (!isVideo) {
    return NextResponse.json(
      { error: "Invalid file type. Use MP4, WebM, OGG or MOV." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Video too large. Max 5GB." },
      { status: 400 }
    );
  }

  const ext = path.extname(file.name) || ".mp4";
  const safeExt = [".mp4", ".webm", ".ogg", ".mov"].includes(ext.toLowerCase())
    ? ext.toLowerCase()
    : ".mp4";
  const filename = `video-${Date.now()}-${Math.random().toString(36).slice(2, 9)}${safeExt}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "videos");

  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (e) {
    console.error("Mkdir error:", e);
    return NextResponse.json(
      { error: "Failed to create upload directory" },
      { status: 500 }
    );
  }

  const filepath = path.join(uploadDir, filename);
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    await writeFile(filepath, buffer);
  } catch (e) {
    console.error("Write error:", e);
    return NextResponse.json(
      { error: "Failed to save file" },
      { status: 500 }
    );
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const url = `${baseUrl}/uploads/videos/${filename}`;

  return NextResponse.json({ url, filename });
}
