"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CyclingGradientPanel, { useCyclingGradientOnReturn } from "@/components/CyclingGradientPanel";
import { buildDiplomaCheckoutHref } from "@/lib/diploma-checkout-utils";
import {
  DIPLOMA_PLAN_LABELS,
  DIPLOMA_PLAN_TYPES,
  type DiplomaPlanType,
  type DiplomaProgramConfig,
} from "@/lib/diploma-config-defaults";
import { PLAN_THEME_GRADIENT_INDEX } from "@/lib/diploma-gradient-palettes";

function PlanDropdown({
  value,
  onChange,
  onGradient = false,
  plans,
}: {
  value: DiplomaPlanType | null;
  onChange: (value: DiplomaPlanType | null) => void;
  onGradient?: boolean;
  plans: DiplomaProgramConfig["paymentPlans"];
}) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  function updateMenuPosition() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = 220;
    setMenuPosition({
      top: rect.bottom + 8,
      left: Math.max(12, rect.right - width),
      width,
    });
  }

  function openMenu() {
    updateMenuPosition();
    setOpen(true);
  }

  function closeMenu() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      closeMenu();
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu();
    }

    function handleReposition() {
      updateMenuPosition();
    }

    const timer = window.setTimeout(() => {
      document.addEventListener("mousedown", handlePointerDown);
    }, 0);

    window.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open]);

  function planLabel(type: DiplomaPlanType) {
    return plans.find((plan) => plan.type === type)?.title ?? DIPLOMA_PLAN_LABELS[type];
  }

  const menu =
    open && menuPosition && typeof document !== "undefined"
      ? createPortal(
          <ul
            ref={menuRef}
            role="listbox"
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
            }}
            className="z-[9999] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-2xl"
          >
            {value && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onChange(null);
                    closeMenu();
                  }}
                  className="block w-full border-b border-slate-100 px-4 py-2.5 text-left text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
                >
                  Default View
                </button>
              </li>
            )}
            {DIPLOMA_PLAN_TYPES.map((type) => (
              <li key={type}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === type}
                  onClick={() => {
                    onChange(type);
                    closeMenu();
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm font-semibold transition hover:bg-slate-50 ${
                    value === type ? "bg-blue-50 text-blue-700" : "text-slate-700"
                  }`}
                >
                  {planLabel(type)}
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          if (open) closeMenu();
          else openMenu();
        }}
        className={
          onGradient
            ? "inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
            : "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        }
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{value ? planLabel(value) : "Choose Plan"}</span>
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-slate-500">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {menu}
    </>
  );
}

function DefaultProgramCard({
  program,
  selectedType,
  onSelectPlan,
  cardIndex,
}: {
  program: DiplomaProgramConfig;
  selectedType: DiplomaPlanType | null;
  onSelectPlan: (value: DiplomaPlanType | null) => void;
  cardIndex: number;
}) {
  const { gradient, shimmerKey, onMouseEnter, onMouseLeave } = useCyclingGradientOnReturn(cardIndex);

  return (
    <article
      className="overflow-hidden rounded-xl bg-white shadow-lg shadow-blue-100/80 transition duration-500 hover:-translate-y-1 hover:shadow-2xl dark:bg-slate-900 dark:shadow-black/20"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CyclingGradientPanel gradient={gradient} shimmerKey={shimmerKey} className="rounded-t-xl px-6 pb-6 pt-5">
        <div className="flex justify-end">
          <PlanDropdown
            value={selectedType}
            onChange={onSelectPlan}
            onGradient
            plans={program.paymentPlans}
          />
        </div>
        <h2 className="mt-4 text-xl font-extrabold text-white">{program.title}</h2>
        <p className="mt-2 text-sm leading-6 text-white/90">{program.summary}</p>
      </CyclingGradientPanel>

      <div className="px-6 pb-8 pt-5">
        <div className="grid grid-cols-2 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
          <div>{program.duration}</div>
          <div>{program.courses}</div>
        </div>

        <ul className="mt-7 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {program.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function PaymentPlanCard({
  program,
  selectedType,
  onSelectPlan,
  cardIndex,
  fromDashboard = false,
}: {
  program: DiplomaProgramConfig;
  selectedType: DiplomaPlanType;
  onSelectPlan: (value: DiplomaPlanType | null) => void;
  cardIndex: number;
  fromDashboard?: boolean;
}) {
  const selectedPlan = useMemo(
    () => program.paymentPlans.find((plan) => plan.type === selectedType) ?? program.paymentPlans[0],
    [program.paymentPlans, selectedType]
  );

  const themeStartIndex = selectedPlan
    ? PLAN_THEME_GRADIENT_INDEX[selectedPlan.theme] ?? cardIndex
    : cardIndex;
  const { gradient, accent, shimmerKey, onMouseEnter, onMouseLeave } = useCyclingGradientOnReturn(themeStartIndex);

  if (!selectedPlan) return null;

  return (
    <article
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-blue-100/80 transition duration-500 hover:-translate-y-1 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CyclingGradientPanel gradient={gradient} shimmerKey={shimmerKey} className="px-6 pb-6 pt-5 text-center text-white">
        <div className="flex justify-end">
          <PlanDropdown
            value={selectedType}
            onChange={onSelectPlan}
            onGradient
            plans={program.paymentPlans}
          />
        </div>
        <h3 className="mt-4 text-2xl font-extrabold">{selectedPlan.title}</h3>
        <p className="mt-1 text-sm text-white/90">{selectedPlan.subtitle}</p>
      </CyclingGradientPanel>

      <div className="px-6 py-5 text-center">
        <div className="flex flex-wrap items-end justify-center gap-2">
          <span className="text-lg text-slate-400 line-through">{selectedPlan.originalPrice}</span>
          <span className="text-3xl font-extrabold transition-colors duration-500" style={{ color: accent }}>
            {selectedPlan.price}
          </span>
          <span className="pb-1 text-sm text-slate-500">{selectedPlan.priceSuffix}</span>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800">
        {selectedPlan.details.map((detail, index) => (
          <div
            key={`${selectedPlan.type}-${index}`}
            className="border-b border-slate-100 px-6 py-3 text-center text-sm text-slate-700 last:border-b-0 dark:border-slate-800 dark:text-slate-200"
          >
            {detail.toLowerCase().includes("zoom") ? (
              <span className="inline-flex items-center justify-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" style={{ color: accent }} aria-hidden="true">
                  <path
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                {detail}
              </span>
            ) : (
              detail
            )}
          </div>
        ))}
      </div>

      <div className="p-6 pt-4">
        <Link
          href={buildDiplomaCheckoutHref(program.slug, selectedPlan.type, { fromDashboard })}
          className="inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition hover:opacity-90"
          style={{ backgroundColor: accent }}
        >
          {selectedPlan.ctaLabel}
        </Link>
      </div>
    </article>
  );
}

function DiplomaProgramCardWithState({
  program,
  cardIndex,
  fromDashboard = false,
}: {
  program: DiplomaProgramConfig;
  cardIndex: number;
  fromDashboard?: boolean;
}) {
  const [selectedType, setSelectedType] = useState<DiplomaPlanType | null>(null);

  if (selectedType) {
    return (
      <PaymentPlanCard
        key={selectedType}
        program={program}
        selectedType={selectedType}
        onSelectPlan={setSelectedType}
        cardIndex={cardIndex}
        fromDashboard={fromDashboard}
      />
    );
  }

  return (
    <DefaultProgramCard
      program={program}
      selectedType={selectedType}
      onSelectPlan={setSelectedType}
      cardIndex={cardIndex}
    />
  );
}

export default function DiplomaProgramCards({
  programs,
  fromDashboard = false,
  enrolledProgramKeys = [],
}: {
  programs: DiplomaProgramConfig[];
  fromDashboard?: boolean;
  enrolledProgramKeys?: string[];
}) {
  if (programs.length === 0) {
    return (
      <div
        className={`rounded-3xl border border-dashed border-blue-200 bg-white/70 p-12 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 ${
          fromDashboard ? "" : "mt-12"
        }`}
      >
        Diploma programs are being prepared.
      </div>
    );
  }

  return (
    <div
      className={`grid gap-6 md:grid-cols-2 xl:grid-cols-3 ${fromDashboard ? "" : "mt-8 gap-8"}`}
    >
      {programs.map((program, index) => (
        <DiplomaProgramCardWithState
          key={program.id}
          program={program}
          cardIndex={index}
          fromDashboard={fromDashboard}
        />
      ))}
    </div>
  );
}
