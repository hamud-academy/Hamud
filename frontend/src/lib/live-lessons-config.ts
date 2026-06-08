import { getAppConfig, saveAppConfig } from "@/lib/app-config-store";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import {
  defaultLiveLessonsConfig,
  type LiveLessonsConfig,
} from "@/lib/live-lessons-config-defaults";

const CONFIG_KEY = "live-lessons-config";

function normalizeLiveLessonsConfig(data: Partial<LiveLessonsConfig> | null | undefined): LiveLessonsConfig {
  const classes = Array.isArray(data?.classes) && data.classes.length > 0
    ? data.classes.map((item, index) => ({
        id: item.id?.trim() || `live-class-${index + 1}`,
        title: item.title?.trim() || `Live Class ${index + 1}`,
        badge: item.badge?.trim() || "LC",
        imageUrl: resolveMediaUrl(item.imageUrl) ?? "",
        duration: item.duration?.trim() || "3 Months",
        delivery: item.delivery?.trim() || "Zoom",
        date: item.date?.trim() || "Coming soon",
        time: item.time?.trim() || "Schedule TBA",
        price: item.price?.trim() || "$0",
        paymentText: item.paymentText?.trim() || "One Time Payment",
        buttonLabel: item.buttonLabel?.trim() || "Hada Dalbo",
        buttonHref: item.buttonHref?.trim() || "/contact",
        features: Array.isArray(item.features) && item.features.length > 0
          ? item.features.map((feature) => String(feature).trim()).filter(Boolean)
          : ["Live teacher session"],
      }))
    : defaultLiveLessonsConfig.classes;

  return {
    heroImageUrl:
      resolveMediaUrl(data?.heroImageUrl ?? defaultLiveLessonsConfig.heroImageUrl) ??
      defaultLiveLessonsConfig.heroImageUrl,
    classroomEyebrow: data?.classroomEyebrow?.trim() || defaultLiveLessonsConfig.classroomEyebrow,
    classroomTitle: data?.classroomTitle?.trim() || defaultLiveLessonsConfig.classroomTitle,
    classroomDescription:
      data?.classroomDescription?.trim() || defaultLiveLessonsConfig.classroomDescription,
    classroomFeatures:
      Array.isArray(data?.classroomFeatures) && data.classroomFeatures.length > 0
        ? data.classroomFeatures.map((feature) => String(feature).trim()).filter(Boolean)
        : defaultLiveLessonsConfig.classroomFeatures,
    introEyebrow: data?.introEyebrow?.trim() || defaultLiveLessonsConfig.introEyebrow,
    introTitle: data?.introTitle?.trim() || defaultLiveLessonsConfig.introTitle,
    introDescription: data?.introDescription?.trim() || defaultLiveLessonsConfig.introDescription,
    primaryButtonLabel:
      data?.primaryButtonLabel?.trim() || defaultLiveLessonsConfig.primaryButtonLabel,
    primaryButtonHref:
      data?.primaryButtonHref?.trim() || defaultLiveLessonsConfig.primaryButtonHref,
    secondaryButtonLabel:
      data?.secondaryButtonLabel?.trim() || defaultLiveLessonsConfig.secondaryButtonLabel,
    secondaryButtonHref:
      data?.secondaryButtonHref?.trim() || defaultLiveLessonsConfig.secondaryButtonHref,
    classesEyebrow: data?.classesEyebrow?.trim() || defaultLiveLessonsConfig.classesEyebrow,
    classesTitle: data?.classesTitle?.trim() || defaultLiveLessonsConfig.classesTitle,
    classes,
  };
}

export async function getLiveLessonsConfig(): Promise<LiveLessonsConfig> {
  const config = await getAppConfig<Partial<LiveLessonsConfig>>(CONFIG_KEY);
  return normalizeLiveLessonsConfig(config);
}

export async function saveLiveLessonsConfig(config: LiveLessonsConfig): Promise<LiveLessonsConfig> {
  const normalized = normalizeLiveLessonsConfig(config);
  await saveAppConfig(CONFIG_KEY, normalized);
  return normalized;
}
