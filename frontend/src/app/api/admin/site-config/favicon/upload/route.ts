import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveUploadedFile, uploadErrorMessage } from "@/lib/upload-storage";
import path from "path";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
];
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".ico"];
const MAX_SIZE = 200 * 1024 * 1024;

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
    return NextResponse.json({ error: "No file. Please select an image." }, { status: 400 });
  }

  const isImage =
    ALLOWED_TYPES.includes(file.type) ||
    ALLOWED_EXT.some((ext) => file.name.toLowerCase().endsWith(ext));
  if (!isImage) {
    return NextResponse.json(
      { error: "Invalid file type. Use ICO, JPEG, JPG, PNG, WebP, GIF or SVG." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large. Max 200MB." }, { status: 400 });
  }

  const ext = path.extname(file.name)?.toLowerCase() || ".png";
  const safeExt = ALLOWED_EXT.includes(ext) ? ext : ".png";
  const filename = `favicon-${Date.now()}${safeExt}`;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const relativePath = `uploads/favicon/${filename}`;
  const contentType =
    file.type && file.type !== "" ? file.type : "application/octet-stream";

  let url: string;
  try {
    ({ url } = await saveUploadedFile(relativePath, buffer, contentType, {
      requirePublicUrl: true,
    }));
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: uploadErrorMessage(e) }, { status: 500 });
  }

  return NextResponse.json({ url, filename });
}
