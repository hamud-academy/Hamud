export type PartnerLogoConfig = {
  id: string;
  name: string;
  logoUrl: string;
};

export type PartnersConfig = {
  eyebrow: string;
  title: string;
  partners: PartnerLogoConfig[];
};

export const defaultPartnersConfig: PartnersConfig = {
  eyebrow: "Partners we collaborate",
  title: "Trusted learning collaborators",
  partners: [
    { id: "education", name: "Education Partner", logoUrl: "" },
    { id: "tech", name: "Tech Partner", logoUrl: "" },
    { id: "training", name: "Training Partner", logoUrl: "" },
    { id: "community", name: "Community Partner", logoUrl: "" },
    { id: "certificate", name: "Certificate Partner", logoUrl: "" },
    { id: "career", name: "Career Partner", logoUrl: "" },
  ],
};
