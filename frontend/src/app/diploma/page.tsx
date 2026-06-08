import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getDiplomaConfig } from "@/lib/diploma-config";
import DiplomaProgramCards from "@/app/diploma/DiplomaProgramCards";
import DiplomaSpotlightCard from "@/app/diploma/DiplomaSpotlightCard";

export const metadata = {
  title: "Diploma - Hamud-Academy",
  description: "Explore diploma learning paths and structured programs.",
};

export const revalidate = 60;

export default async function DiplomaPage() {
  const diplomaConfig = await getDiplomaConfig();
  const publishedPrograms = diplomaConfig.programs.filter((program) => program.status === "PUBLISHED");

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#eef6ff] pt-20 dark:bg-slate-950">
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <DiplomaSpotlightCard
              eyebrow={diplomaConfig.spotlightEyebrow}
              title={diplomaConfig.spotlightTitle}
              description={diplomaConfig.spotlightDescription}
              features={diplomaConfig.spotlightFeatures}
            />

            <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
              <div className="overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-blue-300 to-blue-500 text-center shadow-lg shadow-blue-500/20">
                {diplomaConfig.heroImageUrl ? (
                  <img
                    src={diplomaConfig.heroImageUrl}
                    alt={diplomaConfig.heroTitle}
                    className="h-40 w-full object-cover sm:h-48"
                  />
                ) : (
                  <div className="p-6">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white shadow-xl">
                      <div>
                        <div className="text-[11px] font-black uppercase leading-none text-slate-800">Diploma</div>
                        <div className="mt-1 text-[10px] font-bold text-slate-500">Program</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                  {diplomaConfig.heroEyebrow}
                </p>
                <h1 className="mt-2 max-w-3xl text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                  {diplomaConfig.heroTitle}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                  {diplomaConfig.heroDescription}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mb-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              {diplomaConfig.programsEyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              {diplomaConfig.programsTitle}
            </h2>
          </div>

          <DiplomaProgramCards programs={publishedPrograms} />
        </section>
      </main>
      <Footer />
    </>
  );
}
