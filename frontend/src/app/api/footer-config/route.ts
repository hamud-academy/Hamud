import { getFooterConfig } from "@/lib/footer-config";
import { jsonWithPublicCache } from "@/lib/http-cache";

export async function GET() {
  const config = await getFooterConfig();
  return jsonWithPublicCache(config);
}
