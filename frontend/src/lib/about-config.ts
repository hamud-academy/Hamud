import { readFile } from "fs/promises";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "data", "about-config.json");

export type AboutFeature = { title: string; description: string };

export type AboutConfig = {
  heroTagline: string;
  heroHeading: string;
  heroDescription: string;
  heroBackgroundImageUrl: string;
  missionTitle: string;
  missionText: string;
  visionTitle: string;
  visionText: string;
  whyChooseUsTitle: string;
  whyChooseUsIntro: string;
  features: AboutFeature[];
  ctaLabel: string;
  ctaHref: string;
};

export const defaultAboutConfig: AboutConfig = {
  heroTagline: "Transforming Education",
  heroHeading: "Empowering Minds, Shaping Futures.",
  heroDescription:
    "We're on a mission to break down barriers to education and provide world-class learning opportunities to anyone, anywhere.",
  heroBackgroundImageUrl: "",
  missionTitle: "Our Mission",
  missionText:
    "To provide accessible, high-quality education for everyone, everywhere. We believe knowledge should be a universal right, not a privilege.",
  visionTitle: "Our Vision",
  visionText:
    "To become the global standard for digital learning and career growth, fostering a world where every learner reaches their full potential.",
  whyChooseUsTitle: "Why Choose Us?",
  whyChooseUsIntro:
    "We combine cutting-edge technology with world-class pedagogical methods to deliver an unmatched learning experience.",
  features: [
    {
      title: "Expert Instructors",
      description:
        "Learn from industry leaders and academic experts with years of real-world experience.",
    },
    {
      title: "Flexible Learning",
      description:
        "Study at your own pace, on your own schedule. Access courses from any device, anywhere.",
    },
    {
      title: "Community Support",
      description:
        "Join a vibrant community of learners. Get 24/7 peer support and mentor guidance.",
    },
  ],
  ctaLabel: "Explore Courses",
  ctaHref: "/courses",
};

function str(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

export async function getAboutConfig(): Promise<AboutConfig> {
  try {
    const raw = await readFile(CONFIG_PATH, "utf-8");
    const data = JSON.parse(raw) as Partial<AboutConfig>;
    const d = defaultAboutConfig;
    const features = Array.isArray(data.features) && data.features.length >= 3
      ? data.features.slice(0, 3).map((f: { title?: string; description?: string }) => ({
          title: str(f.title) || "Feature",
          description: str(f.description) || "",
        }))
      : d.features;
    return {
      heroTagline: str(data.heroTagline) || d.heroTagline,
      heroHeading: str(data.heroHeading) || d.heroHeading,
      heroDescription: str(data.heroDescription) || d.heroDescription,
      heroBackgroundImageUrl: str(data.heroBackgroundImageUrl) || d.heroBackgroundImageUrl,
      missionTitle: str(data.missionTitle) || d.missionTitle,
      missionText: str(data.missionText) || d.missionText,
      visionTitle: str(data.visionTitle) || d.visionTitle,
      visionText: str(data.visionText) || d.visionText,
      whyChooseUsTitle: str(data.whyChooseUsTitle) || d.whyChooseUsTitle,
      whyChooseUsIntro: str(data.whyChooseUsIntro) || d.whyChooseUsIntro,
      features,
      ctaLabel: str(data.ctaLabel) || d.ctaLabel,
      ctaHref: str(data.ctaHref) || d.ctaHref,
    };
  } catch {
    return defaultAboutConfig;
  }
}
