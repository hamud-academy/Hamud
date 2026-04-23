import { NextResponse } from "next/server";
import { getContactConfig } from "@/lib/contact-config";

export async function GET() {
  const config = await getContactConfig();
  return NextResponse.json(config);
}
