import { readFile } from "fs/promises";
import path from "path";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

const CONFIG_PATH = path.join(process.cwd(), "data", "landing-config.json");

export const defaultLandingConfig = {
  heroImageUrl: "",
  heroTagline: "THE FUTURE OF SOMALI E-LEARNING",
  heroHeading: "Baro aqoon tayo leh, meel kasta oo aad joogto",
  heroHeadingHighlight: "meel kasta",
  heroDescription: "Ku biir kumanaan arday ah oo baranaya xirfadihii ugu dambeeyay. Dhiso mustaqbalkaaga maanta.",
  heroStudentCountText: "Ku biir 10,000+ arday E-fircoon",
};

export type LandingConfig = typeof defaultLandingConfig;

export async function getLandingConfig(): Promise<LandingConfig> {
  try {
    const raw = await readFile(CONFIG_PATH, "utf-8");
    const data = JSON.parse(raw) as Partial<LandingConfig>;
    return {
      heroImageUrl: resolveMediaUrl(
        data.heroImageUrl ?? defaultLandingConfig.heroImageUrl
      ) ?? defaultLandingConfig.heroImageUrl,
      heroTagline: data.heroTagline ?? defaultLandingConfig.heroTagline,
      heroHeading: data.heroHeading ?? defaultLandingConfig.heroHeading,
      heroHeadingHighlight: data.heroHeadingHighlight ?? defaultLandingConfig.heroHeadingHighlight,
      heroDescription: data.heroDescription ?? defaultLandingConfig.heroDescription,
      heroStudentCountText: data.heroStudentCountText ?? defaultLandingConfig.heroStudentCountText,
    };
  } catch {
    return defaultLandingConfig;
  }
}
