import { getPartnersConfig } from "@/lib/partners-config";
import type { PartnerLogoConfig } from "@/lib/partners-config-defaults";
import { getServerTranslator } from "@/lib/i18n/server-locale";

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("") || "P";
}

function PartnerLogo({ name, logoUrl }: PartnerLogoConfig) {
  const initials = getInitials(name);

  return (
    <div className="mx-8 flex w-32 shrink-0 flex-col items-center gap-3.5 text-center sm:mx-12 sm:w-36 lg:mx-14">
      <div className="flex h-28 w-28 items-center justify-center transition hover:-translate-y-1 sm:h-32 sm:w-32">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={name}
            className="max-h-28 max-w-28 object-contain sm:max-h-32 sm:max-w-32"
          />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-black tracking-wide text-white shadow-md shadow-blue-500/25 sm:h-20 sm:w-20">
            {initials}
          </span>
        )}
      </div>
      <p className="text-xs font-extrabold uppercase leading-tight tracking-[0.02em] text-slate-900 dark:text-slate-50">
        {name}
      </p>
    </div>
  );
}

export default async function PartnersMarquee() {
  const config = await getPartnersConfig();
  const { locale, t } = await getServerTranslator();
  const marqueeItems = [...config.partners, ...config.partners];

  const eyebrow = locale === "en" ? config.eyebrow : t("landing.partnersEyebrow");
  const title = locale === "en" ? config.title : t("landing.partnersTitle");

  return (
    <section className="bg-white px-4 pb-2 pt-2 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            {title}
          </h2>
        </div>

        <div className="partners-marquee relative overflow-hidden rounded-[1.75rem] border border-slate-100 bg-slate-50/70 py-7 dark:border-slate-800 dark:bg-slate-900/45">
          <div className="partners-marquee-track flex w-max items-center">
            {marqueeItems.map((partner, index) => (
              <PartnerLogo
                key={`${partner.id}-${index}`}
                id={partner.id}
                name={partner.name}
                logoUrl={partner.logoUrl}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
