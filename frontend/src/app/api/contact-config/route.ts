import { getContactConfig } from "@/lib/contact-config";
import { jsonWithPublicCache } from "@/lib/http-cache";

export async function GET() {
  const config = await getContactConfig();
  return jsonWithPublicCache(config);
}
