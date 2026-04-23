import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getAboutConfig } from "@/lib/about-config";

export default async function AboutPage() {
  const config = await getAboutConfig();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f5f5f7]">
        {/* Hero Section */}
        <section
          className="relative min-h-[420px] sm:min-h-[480px] flex items-center overflow-hidden pt-16 bg-[#1e3a3a] bg-cover bg-center"
          style={
            config.heroBackgroundImageUrl
              ? { backgroundImage: `url(${config.heroBackgroundImageUrl})` }
              : undefined
          }
        >
          {config.heroBackgroundImageUrl && (
            <div className="absolute inset-0 bg-[#1e3a3a]/85" aria-hidden />
          )}
          {!config.heroBackgroundImageUrl && (
            <div className="absolute inset-0 opacity-15">
              <svg className="w-full h-full object-cover" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="400" y="80" width="320" height="200" rx="8" fill="currentColor" className="text-emerald-900/80" />
                <line x1="420" y1="120" x2="680" y2="120" stroke="currentColor" strokeWidth="2" className="text-white/60" />
                <line x1="420" y1="160" x2="620" y2="160" stroke="currentColor" strokeWidth="2" className="text-white/60" />
                <circle cx="150" cy="260" r="36" fill="currentColor" className="text-white" />
                <circle cx="320" cy="240" r="32" fill="currentColor" className="text-white" />
                <circle cx="500" cy="250" r="34" fill="currentColor" className="text-white" />
                <rect x="100" y="180" width="100" height="56" rx="6" fill="currentColor" className="text-white/90" />
                <rect x="270" y="160" width="100" height="56" rx="6" fill="currentColor" className="text-white/90" />
                <rect x="450" y="170" width="100" height="56" rx="6" fill="currentColor" className="text-white/90" />
              </svg>
            </div>
          )}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 w-full">
            <span className="inline-block px-4 py-2 bg-blue-700 text-blue-100 text-xs font-semibold uppercase tracking-wider mb-5">
              {config.heroTagline}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4 max-w-2xl">
              {config.heroHeading}
            </h1>
            <p className="text-white/95 text-base sm:text-lg max-w-2xl leading-relaxed">
              {config.heroDescription}
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 -mt-6 sm:-mt-8 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <article className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg shadow-slate-200/50 border border-slate-100">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">{config.missionTitle}</h2>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                    {config.missionText}
                  </p>
                </div>
              </div>
            </article>
            <article className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg shadow-slate-200/50 border border-slate-100">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">{config.visionTitle}</h2>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                    {config.visionText}
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 pb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center mb-3">
            {config.whyChooseUsTitle}
          </h2>
          <p className="text-slate-600 text-center max-w-2xl mx-auto mb-10 sm:mb-14 text-sm sm:text-base">
            {config.whyChooseUsIntro}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {config.features.map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-100 text-center flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center mb-4 flex-shrink-0">
                  {i === 0 && (
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                    </svg>
                  )}
                  {i === 1 && (
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" />
                    </svg>
                  )}
                  {i === 2 && (
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href={config.ctaHref}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-md"
            >
              {config.ctaLabel}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
