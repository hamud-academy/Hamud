"use client";

import CyclingGradientPanel, { useCyclingGradientOnReturn } from "@/components/CyclingGradientPanel";

export default function DiplomaSpotlightCard({
  eyebrow,
  title,
  description,
  features,
}: {
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
}) {
  const { gradient, shimmerKey, onMouseEnter, onMouseLeave } = useCyclingGradientOnReturn(0);

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/50 transition duration-500 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
      <CyclingGradientPanel
        gradient={gradient}
        shimmerKey={shimmerKey}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="rounded-[1.5rem] p-5 text-white shadow-lg shadow-blue-300/30"
      >
        <p className="text-xs font-black uppercase tracking-[0.22em] text-white/80">{eyebrow}</p>
        <h2 className="mt-3 text-2xl font-extrabold leading-tight sm:text-[1.7rem]">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-white/90">{description}</p>
      </CyclingGradientPanel>

      <div className="mt-4 space-y-3">
        {features.map((feature) => (
          <div
            key={feature}
            className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 dark:bg-slate-800/70 dark:text-slate-200"
          >
            {feature}
          </div>
        ))}
      </div>
    </div>
  );
}
