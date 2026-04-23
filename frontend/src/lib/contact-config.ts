import { readFile } from "fs/promises";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "data", "contact-config.json");

export type ContactPhone = { id: string; number: string; callbackLabel: string };
export type ContactEmail = { id: string; address: string; messageLabel: string };
export type ContactHeadOffice = { id: string; text: string };
export type ContactSocialLink = { id: string; platform: string; url: string };
export type OurLocation = { title: string; description: string; mapUrl: string; mapEmbedCode: string };

export type ContactConfig = {
  getInTouchTitle: string;
  getInTouchDescription: string;
  phones: ContactPhone[];
  emails: ContactEmail[];
  headOffices: ContactHeadOffice[];
  socialLinks: ContactSocialLink[];
  ourLocation: OurLocation;
};

export const defaultContactConfig: ContactConfig = {
  getInTouchTitle: "Get in Touch",
  getInTouchDescription:
    "Have a question or looking to start a project? Our team is ready to help you navigate your digital transformation.",
  phones: [
    { id: "1", number: "+252 61 507 9785", callbackLabel: "Request a callback" },
  ],
  emails: [
    { id: "2", address: "support@goltech.so", messageLabel: "Send us a message" },
  ],
  headOffices: [{ id: "3", text: "Hargeisa, Somaliland" }],
  socialLinks: [
    { id: "4", platform: "facebook", url: "#" },
    { id: "5", platform: "youtube", url: "#" },
    { id: "6", platform: "x", url: "#" },
    { id: "7", platform: "linkedin", url: "#" },
  ],
  ourLocation: {
    title: "Our Location",
    description: "Located in the heart of Hargeisa, Somaliland.",
    mapUrl: "https://www.google.com/maps",
    mapEmbedCode: "",
  },
};

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function ensureIds<T extends Record<string, unknown> & { id?: string }>(items: T[]): (T & { id: string })[] {
  return items.map((item) => ({ ...item, id: item.id && String(item.id) ? String(item.id) : genId() })) as (T & { id: string })[];
}

function parseList<T>(saved: unknown, defaultList: T[]): T[] {
  if (!saved || !Array.isArray(saved)) return defaultList;
  return ensureIds(saved as { id?: string }[]) as T[];
}

export async function getContactConfig(): Promise<ContactConfig> {
  try {
    const raw = await readFile(CONFIG_PATH, "utf-8");
    const data = JSON.parse(raw) as Partial<ContactConfig>;
    return {
      getInTouchTitle: data.getInTouchTitle ?? defaultContactConfig.getInTouchTitle,
      getInTouchDescription: data.getInTouchDescription ?? defaultContactConfig.getInTouchDescription,
      phones: parseList(data.phones, defaultContactConfig.phones) as ContactPhone[],
      emails: parseList(data.emails, defaultContactConfig.emails) as ContactEmail[],
      headOffices: parseList(data.headOffices, defaultContactConfig.headOffices) as ContactHeadOffice[],
      socialLinks: parseList(data.socialLinks, defaultContactConfig.socialLinks) as ContactSocialLink[],
      ourLocation: {
        title: data.ourLocation?.title ?? defaultContactConfig.ourLocation.title,
        description: data.ourLocation?.description ?? defaultContactConfig.ourLocation.description,
        mapUrl: data.ourLocation?.mapUrl ?? defaultContactConfig.ourLocation.mapUrl,
        mapEmbedCode: data.ourLocation?.mapEmbedCode ?? defaultContactConfig.ourLocation.mapEmbedCode ?? "",
      },
    };
  } catch {
    return defaultContactConfig;
  }
}
