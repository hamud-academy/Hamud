import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const ALLOWED_EXT = /\.(pdf|doc|docx|xls|xlsx)$/i;
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

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
      { error: "No file. Please select a document." },
      { status: 400 }
    );
  }

  const isAllowed =
    ALLOWED_TYPES.includes(file.type) || ALLOWED_EXT.test(file.name);
  if (!isAllowed) {
    return NextResponse.json(
      { error: "Invalid file type. Use PDF, Word (.doc, .docx), or Excel (.xls, .xlsx)." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Max 50MB." },
      { status: 400 }
    );
  }

  const ext = path.extname(file.name).toLowerCase() || ".pdf";
  const safeExt = [".pdf", ".doc", ".docx", ".xls", ".xlsx"].includes(ext)
    ? ext
    : ".pdf";
  const filename = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}${safeExt}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "documents");

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
  const url = `${baseUrl}/uploads/documents/${filename}`;

  return NextResponse.json({ url, filename });
}
