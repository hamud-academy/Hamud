import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { auth } from "@/auth";
import { saveUploadedFile, uploadErrorMessage } from "@/lib/upload-storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const MAX_SIZE = 10 * 1024 * 1024;

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
    return NextResponse.json({ error: "Invalid file type. Use JPEG, PNG, WebP or GIF." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image too large. Max 10MB." }, { status: 400 });
  }

  const ext = path.extname(file.name)?.toLowerCase() || ".jpg";
  const safeExt = ALLOWED_EXT.includes(ext) ? ext : ".jpg";
  const filename = `diploma-hero-${Date.now()}${safeExt}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const relativePath = `uploads/diploma/${filename}`;
  const contentType = file.type && file.type !== "" ? file.type : "application/octet-stream";

  try {
    const { url } = await saveUploadedFile(relativePath, buffer, contentType, {
      requirePublicUrl: true,
    });
    return NextResponse.json({ url, filename });
  } catch (error) {
    console.error("Diploma hero image upload error:", error);
    return NextResponse.json({ error: uploadErrorMessage(error) }, { status: 500 });
  }
}
