import { getSiteConfig } from "@/lib/site-config";
import { getSiteBranding } from "@/lib/site-branding";
import { jsonWithPublicCache } from "@/lib/http-cache";

export async function GET() {
  const [config, branding] = await Promise.all([getSiteConfig(), getSiteBranding()]);
  return jsonWithPublicCache({ ...config, ...branding });
}
