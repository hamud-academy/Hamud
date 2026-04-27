"use client";

import { useEffect, useState } from "react";
import type { PaymentNumber } from "@/lib/payment-numbers";

const COUNTRY_CODES =
  "AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW";

function countryFlag(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

const COUNTRY_FLAG_OPTIONS = COUNTRY_CODES.split(" ").map((code) => {
  const flag = countryFlag(code);
  const name = regionNames?.of(code) ?? code;
  return { value: flag, label: `${flag} ${name}` };
});

const ICON_OPTIONS = [
  ...COUNTRY_FLAG_OPTIONS,
  { value: "🌍", label: "🌍 Global" },
  { value: "💳", label: "💳 Card" },
  { value: "🏦", label: "🏦 Bank" },
  { value: "📱", label: "📱 Mobile money" },
  { value: "💵", label: "💵 Cash" },
  { value: "⭐", label: "⭐ Star" },
];

function emptyPaymentNumber(): PaymentNumber {
  return {
    id: `payment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    icon: "🇸🇴",
    label: "",
    value: "",
    note: "",
    iconSize: 22,
  };
}

export default function PaymentNumbersForm() {
  const [numbers, setNumbers] = useState<PaymentNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/payment-numbers")
      .then((res) => res.json())
      .then((data) => setNumbers(Array.isArray(data.numbers) ? data.numbers : []))
      .catch(() => setMessage({ type: "err", text: "Could not load payment numbers." }))
      .finally(() => setLoading(false));
  }, []);

  function updateNumber(id: string, patch: Partial<PaymentNumber>) {
    setNumbers((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function deleteNumber(id: string) {
    setNumbers((current) => current.filter((item) => item.id !== id));
  }

  function selectedIconValue(icon: string) {
    return ICON_OPTIONS.some((option) => option.value === icon) ? icon : "custom";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/payment-numbers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numbers }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Failed to save payment numbers." });
        return;
      }
      setNumbers(Array.isArray(data.numbers) ? data.numbers : numbers);
      setMessage({ type: "ok", text: "Payment numbers saved." });
    } catch {
      setMessage({ type: "err", text: "Connection error." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            message.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setNumbers((current) => [...current, emptyPaymentNumber()])}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          Add payment number
        </button>
        <p className="text-sm text-slate-500">
          Use emoji flags/icons such as 🇸🇴, 🇩🇯, 🇪🇹, 🇰🇪, 🌍.
        </p>
      </div>

      <div className="space-y-4">
        {numbers.map((item, index) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100"
                  style={{ fontSize: `${item.iconSize}px` }}
                >
                  {item.icon || "💳"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">Payment #{index + 1}</p>
                  <p className="truncate text-xs text-slate-500">
                    {item.label || "Untitled"} {item.value ? `- ${item.value}` : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => deleteNumber(item.id)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
              >
                Delete
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-[220px_1fr_1fr]">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Icon/flag</label>
                <div className="grid grid-cols-[1fr_70px] gap-2">
                  <select
                    value={selectedIconValue(item.icon)}
                    onChange={(e) => {
                      if (e.target.value !== "custom") updateNumber(item.id, { icon: e.target.value });
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {ICON_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    <option value="custom">Custom</option>
                  </select>
                  <input
                    type="text"
                    value={item.icon}
                    onChange={(e) => updateNumber(item.id, { icon: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-2 py-2.5 text-center text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="🇸🇴"
                    aria-label="Custom icon or flag"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Label</label>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateNumber(item.id, { label: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="EVC+"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Number / code</label>
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => updateNumber(item.id, { value: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="+252..."
                />
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_220px]">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Note (optional)</label>
                <input
                  type="text"
                  value={item.note}
                  onChange={(e) => updateNumber(item.id, { note: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Wajaale Exchange Rate."
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Icon size: {item.iconSize}px
                </label>
                <input
                  type="range"
                  min={12}
                  max={48}
                  value={item.iconSize}
                  onChange={(e) => updateNumber(item.id, { iconSize: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
      >
        {saving ? "Saving..." : "Save Payment Numbers"}
      </button>
    </form>
  );
}
