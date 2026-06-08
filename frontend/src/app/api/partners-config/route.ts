import { getPartnersConfig } from "@/lib/partners-config";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await getPartnersConfig();
  return NextResponse.json(config, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
