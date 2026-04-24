import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveUploadedFile, uploadErrorMessage } from "@/lib/upload-storage";
import path from "path";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB for hero

export async function POST(request: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") {
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
      { error: "No file. Please select an image." },
      { status: 400 }
    );
  }

  const isImage =
    ALLOWED_TYPES.includes(file.type) ||
    ALLOWED_EXT.some((ext) => file.name.toLowerCase().endsWith(ext));
  if (!isImage) {
    return NextResponse.json(
      { error: "Invalid file type. Use JPEG, PNG, WebP or GIF." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Image too large. Max 10MB." },
      { status: 400 }
    );
  }

  const ext = path.extname(file.name)?.toLowerCase() || ".jpg";
  const safeExt = ALLOWED_EXT.includes(ext) ? ext : ".jpg";
  const filename = `hero-${Date.now()}${safeExt}`;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const relativePath = `uploads/hero/${filename}`;
  const contentType =
    file.type && file.type !== "" ? file.type : "application/octet-stream";

  let url: string;
  try {
    ({ url } = await saveUploadedFile(relativePath, buffer, contentType));
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: uploadErrorMessage(e) }, { status: 500 });
  }

  return NextResponse.json({ url, filename });
}
