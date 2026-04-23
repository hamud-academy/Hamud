"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const defaultConfig = {
  heroImageUrl: "",
  heroTagline: "THE FUTURE OF SOMALI E-LEARNING",
  heroHeading: "Baro aqoon tayo leh, meel kasta oo aad joogto",
  heroHeadingHighlight: "meel kasta",
  heroDescription: "Ku biir kumanaan arday ah oo baranaya xirfadihii ugu dambeeyay. Dhiso mustaqbalkaaga maanta.",
  heroStudentCountText: "Ku biir 10,000+ arday E-fircoon",
  studentCount: 0 as number | undefined,
  studentProfiles: [] as { name: string; image: string | null }[],
};

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [config, setConfig] = useState(defaultConfig);

  useEffect(() => {
    fetch("/api/landing-config")
      .then((r) => r.json())
      .then((data) => setConfig({ ...defaultConfig, ...data }))
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) window.location.href = `/courses?search=${encodeURIComponent(q)}`;
    else window.location.href = "/courses";
  };

  const { heroTagline, heroHeading, heroHeadingHighlight, heroDescription, heroStudentCountText, heroImageUrl, studentCount, studentProfiles } = config;
  const displayStudentText =
    typeof studentCount === "number" && studentCount >= 0
      ? `Join ${studentCount.toLocaleString()}+ active students`
      : heroStudentCountText;
  const highlightIdx = heroHeadingHighlight && heroHeading.includes(heroHeadingHighlight)
    ? heroHeading.indexOf(heroHeadingHighlight)
    : -1;
  const beforeHighlight = highlightIdx >= 0 ? heroHeading.slice(0, highlightIdx) : heroHeading;
  const afterHighlight = highlightIdx >= 0 ? heroHeading.slice(highlightIdx + heroHeadingHighlight.length) : "";

  return (
    <section className="relative pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-10 sm:pb-12 lg:pb-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-900 dark:to-slate-950 overflow-hidden min-h-0 max-h-[100vh] flex flex-col">
      <div className="max-w-7xl mx-auto flex-1 min-h-0 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center min-h-0">
          {/* Left: copy + search + social proof */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm border border-blue-200/50 dark:border-blue-800/50">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{heroTagline}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] xl:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-4 sm:mb-5 max-w-xl mx-auto lg:mx-0">
              {beforeHighlight}
              {heroHeadingHighlight && highlightIdx >= 0 && (
                <span className="text-blue-600 dark:text-blue-400">{heroHeadingHighlight}</span>
              )}
              {afterHighlight}
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-lg mx-auto lg:mx-0 mb-6 sm:mb-8 leading-relaxed">
              {heroDescription}
            </p>

            <form onSubmit={handleSearch} className="max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 bg-white dark:bg-slate-800/80 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-600 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 overflow-hidden">
                <span className="flex items-center pl-4 sm:pl-5 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for courses (e.g. Coding, Design)"
                  className="flex-1 min-w-0 py-3.5 sm:py-4 px-3 sm:px-4 border-0 focus:ring-0 focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent text-sm sm:text-base"
                />
                <button
                  type="submit"
                  className="sm:ml-2 px-5 sm:px-6 py-3.5 sm:py-4 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-sm sm:text-base flex-shrink-0"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex -space-x-2">
                {(studentProfiles && studentProfiles.length > 0
                  ? studentProfiles.slice(0, 6)
                  : [{ name: "A", image: null }, { name: "B", image: null }, { name: "C", image: null }, { name: "D", image: null }]
                ).map((student, i) => (
                  <span
                    key={i}
                    title={student.name}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white dark:border-slate-700 flex items-center justify-center text-white text-xs font-semibold overflow-hidden flex-shrink-0 ring-2 ring-white dark:ring-slate-800"
                  >
                    {student.image ? (
                      <img src={student.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{student.name.charAt(0).toUpperCase()}</span>
                    )}
                  </span>
                ))}
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300">{displayStudentText}</span>
            </div>
          </div>

          {/* Right: image card + overlay stats */}
          <div className="order-1 lg:order-2 relative min-h-0 flex items-center">
            <div className={`relative w-full max-w-2xl mx-auto lg:max-w-none rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl shadow-slate-300/30 dark:shadow-slate-950/60 ring-1 ring-slate-200/50 dark:ring-slate-700/50 ${heroImageUrl ? "aspect-[4/3] lg:aspect-[5/4] max-h-[45vh] sm:max-h-[50vh] lg:max-h-[55vh]" : "aspect-[4/3] lg:aspect-[6/5]"}`}>
                  {heroImageUrl ? (
                <>
                  <img
                    src={heroImageUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain object-center"
                  />
                  {/* Overlay cards on top of image */}
                  <div className="absolute top-4 left-4 sm:top-5 sm:left-5 right-auto w-auto">
                    <div className="flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-emerald-50 shadow-md border border-emerald-100">
                      <div className="w-8 h-8 rounded-md bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-semibold text-emerald-800 uppercase tracking-wide">Success Rate</p>
                        <p className="text-sm sm:text-base font-bold text-emerald-900">98.5%</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 left-auto w-auto">
                    <div className="flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-slate-800 shadow-md border border-slate-700">
                      <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wide">Quality Courses</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-800 via-slate-800 to-slate-900" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 h-3/4 max-w-sm aspect-video rounded-xl bg-slate-700/50 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                      <svg className="w-16 h-16 sm:w-20 sm:h-20 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 sm:top-5 sm:left-5 right-auto w-auto">
                    <div className="flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-emerald-50 shadow-md border border-emerald-100">
                      <div className="w-8 h-8 rounded-md bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-semibold text-emerald-800 uppercase tracking-wide">Success Rate</p>
                        <p className="text-sm sm:text-base font-bold text-emerald-900">98.5%</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 left-auto w-auto">
                    <div className="flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-slate-800 shadow-md border border-slate-700">
                      <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wide">Quality Courses</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
