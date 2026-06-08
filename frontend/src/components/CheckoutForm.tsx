"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PaymentNumber } from "@/lib/payment-numbers";
import type { PaymentGatewayPublicConfig } from "@/lib/payment-gateway-config";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";
import PaymentBrandIcons from "@/components/PaymentBrandIcons";
import PayPalCheckoutButton from "@/components/PayPalCheckoutButton";
import { isStrongPassword, strongPasswordMessage } from "@/lib/password-strength";
import { splitFullName, type CheckoutCustomer } from "@/lib/checkout-customer-types";

const checkoutInputClass =
  "w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:focus:ring-emerald-400 dark:focus:border-emerald-400";
const checkoutLabelClass = "block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1";
const checkoutCardClass =
  "bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden";
const checkoutHeadingClass = "text-lg font-bold text-gray-900 dark:text-slate-100";
const checkoutMutedClass = "text-sm text-gray-500 dark:text-slate-400";

const COUNTRY_NAMES =
  "Afghanistan|Albania|Algeria|Andorra|Angola|Antigua and Barbuda|Argentina|Armenia|Australia|Austria|Azerbaijan|Bahamas|Bahrain|Bangladesh|Barbados|Belarus|Belgium|Belize|Benin|Bhutan|Bolivia|Bosnia and Herzegovina|Botswana|Brazil|Brunei|Bulgaria|Burkina Faso|Burundi|Cabo Verde|Cambodia|Cameroon|Canada|Central African Republic|Chad|Chile|China|Colombia|Comoros|Congo|Costa Rica|Croatia|Cuba|Cyprus|Czechia|Democratic Republic of the Congo|Denmark|Djibouti|Dominica|Dominican Republic|Ecuador|Egypt|El Salvador|Equatorial Guinea|Eritrea|Estonia|Eswatini|Ethiopia|Fiji|Finland|France|Gabon|Gambia|Georgia|Germany|Ghana|Greece|Grenada|Guatemala|Guinea|Guinea-Bissau|Guyana|Haiti|Honduras|Hungary|Iceland|India|Indonesia|Iran|Iraq|Ireland|Israel|Italy|Jamaica|Japan|Jordan|Kazakhstan|Kenya|Kiribati|Kuwait|Kyrgyzstan|Laos|Latvia|Lebanon|Lesotho|Liberia|Libya|Liechtenstein|Lithuania|Luxembourg|Madagascar|Malawi|Malaysia|Maldives|Mali|Malta|Marshall Islands|Mauritania|Mauritius|Mexico|Micronesia|Moldova|Monaco|Mongolia|Montenegro|Morocco|Mozambique|Myanmar|Namibia|Nauru|Nepal|Netherlands|New Zealand|Nicaragua|Niger|Nigeria|North Korea|North Macedonia|Norway|Oman|Pakistan|Palau|Palestine|Panama|Papua New Guinea|Paraguay|Peru|Philippines|Poland|Portugal|Qatar|Romania|Russia|Rwanda|Saint Kitts and Nevis|Saint Lucia|Saint Vincent and the Grenadines|Samoa|San Marino|Sao Tome and Principe|Saudi Arabia|Senegal|Serbia|Seychelles|Sierra Leone|Singapore|Slovakia|Slovenia|Solomon Islands|Somalia|South Africa|South Korea|South Sudan|Spain|Sri Lanka|Sudan|Suriname|Sweden|Switzerland|Syria|Taiwan|Tajikistan|Tanzania|Thailand|Timor-Leste|Togo|Tonga|Trinidad and Tobago|Tunisia|Turkey|Turkmenistan|Tuvalu|Uganda|Ukraine|United Arab Emirates|United Kingdom|United States|Uruguay|Uzbekistan|Vanuatu|Vatican City|Venezuela|Vietnam|Yemen|Zambia|Zimbabwe".split("|");

interface Props {
  courseId?: string;
  courseSlug?: string;
  courseTitle: string;
  amount: number;
  courseThumbnail?: string | null;
  courseCategory: string;
  productImageFit?: "cover" | "contain";
  moduleCount?: number;
  totalLessons?: number;
  paymentNumbers: PaymentNumber[];
  paymentGateway: PaymentGatewayPublicConfig;
  diplomaProgramId?: string;
  diplomaProgramSlug?: string;
  diplomaPlanType?: string;
  productHighlights?: string[];
  loggedInCustomer?: CheckoutCustomer | null;
  studentSectionCheckout?: boolean;
}

export default function CheckoutForm({
  courseId,
  courseSlug,
  courseTitle,
  amount,
  courseThumbnail,
  courseCategory,
  productImageFit = "cover",
  moduleCount = 0,
  totalLessons = 0,
  paymentNumbers,
  paymentGateway,
  diplomaProgramId,
  diplomaProgramSlug,
  diplomaPlanType,
  productHighlights,
  loggedInCustomer,
  studentSectionCheckout = false,
}: Props) {
  const router = useRouter();
  const isReturningStudent = Boolean(studentSectionCheckout && loggedInCustomer);
  const nameParts = loggedInCustomer
    ? splitFullName(loggedInCustomer.fullName)
    : { firstNameMiddle: "", lastName: "" };
  const savedRegion = loggedInCustomer?.region ?? "";
  const knownRegions = new Set([
    "Maroodi Jeex", "Banaadir", "Galguduud", "Hiiraan", "Mudug", "Nugaal", "Bari", "Sool",
    "Sanaag", "Togdheer", "Woqooyi Galbeed", "Awdal", "Gedo", "Bay", "Bakool",
    "Shabeellaha Hoose", "Shabeellaha Dhexe", "Jubbada Hoose", "Jubbada Dhexe",
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstNameMiddle: nameParts.firstNameMiddle,
    lastName: nameParts.lastName,
    country: loggedInCustomer?.country ?? "Somalia",
    address: loggedInCustomer?.address ?? "",
    region: savedRegion && knownRegions.has(savedRegion) ? savedRegion : savedRegion ? "__manual__" : "",
    postcode: loggedInCustomer?.postcode ?? "",
    phone: loggedInCustomer?.phone ?? "",
    email: loggedInCustomer?.email ?? "",
    username: "",
    paymentMethod: "Manual" as "Manual" | "Card" | "PayPal",
    paymentRef: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [manualRegion, setManualRegion] = useState(
    savedRegion && !knownRegions.has(savedRegion) ? savedRegion : ""
  );
  const isDiplomaCheckout = Boolean(diplomaProgramId && diplomaPlanType);
  const orderHighlights = (
    productHighlights && productHighlights.length > 0
      ? productHighlights
      : [`${moduleCount} modules`, `${totalLessons} lessons`, "Course Certificate"]
  )
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, items) => items.indexOf(item) === index);

  function buildCheckoutPayload(fullName: string, region: string) {
    if (isReturningStudent) {
      const studentBase = {
        studentCheckout: true as const,
        studentId: loggedInCustomer!.userId,
        paymentMethod: form.paymentMethod,
        paymentRef: form.paymentRef || undefined,
        amount,
      };

      if (isDiplomaCheckout) {
        return {
          orderType: "diploma" as const,
          programId: diplomaProgramId,
          programSlug: diplomaProgramSlug,
          planType: diplomaPlanType,
          ...studentBase,
        };
      }

      return {
        orderType: "course" as const,
        courseId,
        ...studentBase,
      };
    }

    const base: Record<string, unknown> = {
      fullName,
      email: form.email,
      phone: form.phone || undefined,
      paymentMethod: form.paymentMethod,
      paymentRef: form.paymentRef || undefined,
      amount,
      password: form.password,
      country: form.country || undefined,
      address: form.address || undefined,
      region: region || undefined,
      postcode: form.postcode || undefined,
    };

    if (isDiplomaCheckout) {
      return {
        orderType: "diploma" as const,
        programId: diplomaProgramId,
        programSlug: diplomaProgramSlug,
        planType: diplomaPlanType,
        ...base,
      };
    }

    return {
      orderType: "course" as const,
      courseId,
      ...base,
    };
  }

  function getCheckoutFullName() {
    if (isReturningStudent && loggedInCustomer?.fullName.trim()) {
      return loggedInCustomer.fullName.trim();
    }
    return [form.firstNameMiddle.trim(), form.lastName.trim()].filter(Boolean).join(" ");
  }

  function validateCheckoutForm() {
    if (isReturningStudent) return true;
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!isStrongPassword(form.password)) {
      setError(strongPasswordMessage());
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validateCheckoutForm()) return;

    const fullName = getCheckoutFullName();
    const region = form.region === "__manual__" ? manualRegion.trim() : form.region;

    if (isReturningStudent && !courseId && !isDiplomaCheckout) {
      setError("Course not found. Please go back and try again.");
      return;
    }

    if (form.paymentMethod === "Card") {
      if (!paymentGateway.stripeEnabled) {
        setError("Online card checkout is not available yet. Please choose another payment method.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/payments/stripe/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(buildCheckoutPayload(fullName, region)),
        });
        const data = await res.json();
        if (!res.ok || !data.url) {
          setError(data.error ?? "Unable to start card checkout.");
          return;
        }
        window.location.href = data.url as string;
      } catch {
        setError("Connection error");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (form.paymentMethod === "PayPal") {
      setError("Use the PayPal button below to complete your payment.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(isDiplomaCheckout ? "/api/orders/diploma" : "/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(buildCheckoutPayload(fullName, region)),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      const successUrl = isDiplomaCheckout
        ? `/checkout/success?diploma=${encodeURIComponent(diplomaProgramSlug ?? "")}&plan=${encodeURIComponent(diplomaPlanType ?? "")}`
        : `/checkout/success${courseSlug ? `?slug=${encodeURIComponent(courseSlug)}` : ""}`;
      router.push(successUrl);
      router.refresh();
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  async function handlePayPalCreateOrder() {
    setError("");
    if (!validateCheckoutForm()) {
      throw new Error(isReturningStudent ? "Unable to start PayPal checkout." : "Please complete all required billing fields.");
    }

    const fullName = getCheckoutFullName();
    const region = form.region === "__manual__" ? manualRegion.trim() : form.region;
    const res = await fetch("/api/payments/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(buildCheckoutPayload(fullName, region)),
    });
    const data = await res.json();
    if (!res.ok || !data.paypalOrderId) {
      throw new Error(data.error ?? "Unable to start PayPal checkout.");
    }
    return { paypalOrderId: data.paypalOrderId as string, orderId: data.orderId as string };
  }

  async function handlePayPalApprove(payload: { paypalOrderId: string; orderId: string }) {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/paypal/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paypalOrderId: payload.paypalOrderId,
          orderId: payload.orderId,
          orderType: isDiplomaCheckout ? "diploma" : "course",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "PayPal payment failed.");
        return;
      }

      const successUrl = isDiplomaCheckout
        ? `/checkout/success?paid=1&diploma=${encodeURIComponent(diplomaProgramSlug ?? "")}&plan=${encodeURIComponent(diplomaPlanType ?? "")}`
        : `/checkout/success?paid=1${courseSlug ? `&slug=${encodeURIComponent(courseSlug)}` : ""}`;
      router.push(successUrl);
      router.refresh();
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  const showManualPaymentDetails = form.paymentMethod === "Manual";
  const showCardCheckout = form.paymentMethod === "Card";
  const showPayPalCheckout = form.paymentMethod === "PayPal" && paymentGateway.paypalEnabled;
  const showPlaceOrderButton = form.paymentMethod !== "PayPal";

  return (
    <form onSubmit={handleSubmit}>
      <div
        className={
          isReturningStudent
            ? "flex justify-center w-full max-w-full min-w-0"
            : "flex flex-col md:flex-row md:items-start gap-8 md:gap-8 lg:gap-10 w-full max-w-full min-w-0"
        }
      >
        {/* Left: BILLING DETAILS — hidden for logged-in students */}
        {!isReturningStudent ? (
        <div className={`w-full md:flex-1 md:min-w-0 order-1 ${checkoutCardClass}`}>
          <div className="px-5 sm:px-6 lg:px-8 py-5 border-b border-gray-100 dark:border-slate-800">
            <h2 className={`${checkoutHeadingClass} tracking-tight`}>BILLING DETAILS</h2>
            <p className={`${checkoutMutedClass} mt-0.5`}>* Required fields</p>
          </div>
          <div className="p-5 sm:p-6 lg:p-8 space-y-4">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-sm border border-red-100 dark:border-red-900/50">
                {error}
              </div>
            )}
            <div>
              <label className={checkoutLabelClass}>
                First and middle name *
              </label>
              <input
                type="text"
                required
                value={form.firstNameMiddle}
                onChange={(e) => setForm((f) => ({ ...f, firstNameMiddle: e.target.value }))}
                className={checkoutInputClass}
                placeholder="Enter your first and middle name"
              />
            </div>
            <div>
              <label className={checkoutLabelClass}>
                Last name *
              </label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className={checkoutInputClass}
                placeholder="Enter your last name"
              />
            </div>
            <div>
              <label className={checkoutLabelClass}>
                Country *
              </label>
              <select
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                className={checkoutInputClass}
              >
                {COUNTRY_NAMES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={checkoutLabelClass}>
                Street address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className={checkoutInputClass}
                placeholder="Example: Main Street"
              />
            </div>
            <div>
              <label className={checkoutLabelClass}>
                Region
              </label>
              <select
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                className={checkoutInputClass}
              >
                <option value="">Example: Maroodi Jeex or Banaadir</option>
                <option value="Maroodi Jeex">Maroodi Jeex</option>
                <option value="Banaadir">Banaadir</option>
                <option value="Galguduud">Galguduud</option>
                <option value="Hiiraan">Hiiraan</option>
                <option value="Mudug">Mudug</option>
                <option value="Nugaal">Nugaal</option>
                <option value="Bari">Bari</option>
                <option value="Sool">Sool</option>
                <option value="Sanaag">Sanaag</option>
                <option value="Togdheer">Togdheer</option>
                <option value="Woqooyi Galbeed">Woqooyi Galbeed</option>
                <option value="Awdal">Awdal</option>
                <option value="Gedo">Gedo</option>
                <option value="Bay">Bay</option>
                <option value="Bakool">Bakool</option>
                <option value="Shabeellaha Hoose">Shabeellaha Hoose</option>
                <option value="Shabeellaha Dhexe">Shabeellaha Dhexe</option>
                <option value="Jubbada Hoose">Jubbada Hoose</option>
                <option value="Jubbada Dhexe">Jubbada Dhexe</option>
                <option value="__manual__">Other / Manual entry</option>
              </select>
              {form.region === "__manual__" && (
                <input
                  type="text"
                  value={manualRegion}
                  onChange={(e) => setManualRegion(e.target.value)}
                  className={`mt-2 ${checkoutInputClass}`}
                  placeholder="Enter your region"
                />
              )}
            </div>
            <div>
              <label className={checkoutLabelClass}>
                Postcode / ZIP
              </label>
              <input
                type="text"
                value={form.postcode}
                onChange={(e) => setForm((f) => ({ ...f, postcode: e.target.value }))}
                className={checkoutInputClass}
                placeholder="ZIP code or country code, e.g. 252, 251, or 254"
              />
            </div>
            <div>
              <label className={checkoutLabelClass}>
                WhatsApp Number *
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className={checkoutInputClass}
                placeholder="Enter your WhatsApp number"
              />
            </div>
            <div>
              <label className={checkoutLabelClass}>
                Email address *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={checkoutInputClass}
                placeholder="Gmail, Hotmail, Outlook"
              />
              <p className={`text-xs mt-1 ${checkoutMutedClass}`}>
                Your email & card info are saved so we can send email reminders about this order. No Thanks.
              </p>
            </div>
            <div>
              <label className={checkoutLabelClass}>
                Account username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                className={checkoutInputClass}
                placeholder="Username"
              />
            </div>
            <div>
              <label className={checkoutLabelClass}>
                Create account password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className={`w-full px-3 py-2.5 pr-10 ${checkoutInputClass.replace("w-full ", "")}`}
                  placeholder="Strong password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              <PasswordStrengthMeter password={form.password} confirmPassword={form.confirmPassword} showMatch />
            </div>
            <div>
              <label className={checkoutLabelClass}>
                Confirm password *
              </label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                className={checkoutInputClass}
                placeholder="Confirm your password"
              />
            </div>
          </div>
        </div>
        ) : null}

        {/* YOUR ORDER + PAYMENT METHOD + submit */}
        <div
          className={
            isReturningStudent
              ? "w-full max-w-md space-y-6"
              : "w-full md:w-[min(100%,400px)] md:flex-shrink-0 md:max-w-[420px] order-2 space-y-6"
          }
        >
          {error && isReturningStudent ? (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-sm border border-red-100 dark:border-red-900/50">
              {error}
            </div>
          ) : null}
          <div className={checkoutCardClass}>
            {/* YOUR ORDER */}
            <div className="px-4 sm:px-6 py-5 border-b border-gray-100 dark:border-slate-800">
              <h2 className={checkoutHeadingClass}>YOUR ORDER</h2>
              {isReturningStudent && loggedInCustomer ? (
                <p className={`${checkoutMutedClass} mt-1`}>
                  Ordering as {loggedInCustomer.fullName} ({loggedInCustomer.email})
                </p>
              ) : null}
            </div>
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-slate-800">
              <div className="grid grid-cols-[1fr,auto] gap-2 mb-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                <span>Product</span>
                <span>Total</span>
              </div>
              <div className="flex gap-4 pb-4">
                {courseThumbnail ? (
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <img
                      src={courseThumbnail}
                      alt=""
                      className={`h-full w-full ${productImageFit === "contain" ? "object-contain p-1.5" : "object-cover"}`}
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-slate-500 text-xs font-bold">
                    {courseCategory.slice(0, 2)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 dark:text-slate-100 line-clamp-2">{courseTitle}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{courseCategory}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">QTY: 1</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="font-bold text-gray-900 dark:text-slate-100">${amount.toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-2 py-4 text-sm text-gray-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${amount.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-slate-800">
                <span className="font-bold text-gray-900 dark:text-slate-100">TOTAL</span>
                <span className="text-xl font-bold text-gray-900 dark:text-slate-100">${amount.toFixed(2)}</span>
              </div>
              <ul className="mt-6 space-y-2 text-sm text-gray-500 dark:text-slate-400">
                {orderHighlights.map((highlight, index) => (
                  <li key={`order-highlight-${index}`} className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Methods - same section */}
            <div className="p-4 sm:p-6">
            <h3 className={`${checkoutHeadingClass} mb-4`}>Payment Methods</h3>
            <div className="space-y-4">
              <label
                className={`flex w-full min-h-[56px] cursor-pointer items-center gap-3 rounded-lg border-2 p-4 ${
                  form.paymentMethod === "Manual"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30"
                    : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Manual"
                  checked={form.paymentMethod === "Manual"}
                  onChange={() => setForm((f) => ({ ...f, paymentMethod: "Manual" }))}
                  className="shrink-0 text-emerald-600"
                />
                <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-slate-100">Manual payments</span>
              </label>
              <label
                className={`flex w-full min-h-[56px] cursor-pointer items-center gap-3 rounded-lg border-2 p-4 ${
                  form.paymentMethod === "Card"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30"
                    : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Card"
                  checked={form.paymentMethod === "Card"}
                  onChange={() => setForm((f) => ({ ...f, paymentMethod: "Card" }))}
                  className="shrink-0 text-emerald-600"
                />
                <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-slate-100">Credit / Debit Card</span>
                  <PaymentBrandIcons brands={["visa", "mastercard", "amex"]} size="compact" className="shrink-0" />
                </span>
              </label>
              {paymentGateway.paypalEnabled ? (
                <label
                  className={`flex w-full min-h-[56px] cursor-pointer items-center gap-3 rounded-lg border-2 p-4 ${
                    form.paymentMethod === "PayPal"
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30"
                      : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PayPal"
                    checked={form.paymentMethod === "PayPal"}
                    onChange={() => setForm((f) => ({ ...f, paymentMethod: "PayPal" }))}
                    className="shrink-0 text-emerald-600"
                  />
                  <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                    <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-slate-100">PayPal</span>
                    <PaymentBrandIcons brands={["paypal"]} size="compact" className="shrink-0" />
                  </span>
                </label>
              ) : null}
            </div>

            {showManualPaymentDetails && (
              <div className="mt-4 space-y-2">
                <p className={`text-sm font-semibold ${checkoutHeadingClass}`}>Manual Payments</p>
                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-3">
                  <div className="space-y-2">
                    {paymentNumbers.map((item) => (
                      <div key={item.id} className="flex items-start gap-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                        <span
                          className="mt-0.5 flex w-7 shrink-0 items-center justify-center"
                          style={{ fontSize: `${item.iconSize}px` }}
                        >
                          {item.icon}
                        </span>
                        <span className="min-w-0">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}:</span>{" "}
                          <span className="font-bold text-slate-800 dark:text-slate-100">{item.value}</span>
                          {item.note ? <span className="text-slate-600 dark:text-slate-400"> {item.note}</span> : null}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {showCardCheckout && (
              <div className="mt-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-4 text-sm">
                <p className={`font-semibold ${checkoutHeadingClass}`}>Secure card checkout</p>
                <p className={`mt-2 ${checkoutMutedClass}`}>
                  {paymentGateway.stripeEnabled
                    ? "You will be redirected to Stripe to pay with Visa, Mastercard, or American Express."
                    : "Online card checkout is not available yet. Please choose Manual payments or PayPal."}
                </p>
              </div>
            )}

            {showPayPalCheckout && (
              <div className="mt-4 space-y-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-4">
                <p className={`text-sm font-semibold ${checkoutHeadingClass}`}>Pay with PayPal</p>
                <p className={`text-xs ${checkoutMutedClass}`}>
                  {isReturningStudent
                    ? "Use the PayPal button below to complete your payment."
                    : "Complete billing details above, then use the PayPal button below."}
                </p>
                <PayPalCheckoutButton
                  clientId={paymentGateway.paypalClientId}
                  disabled={loading}
                  onCreateOrder={handlePayPalCreateOrder}
                  onApprove={handlePayPalApprove}
                  onError={(message) => setError(message)}
                />
              </div>
            )}
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {showPlaceOrderButton ? (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition text-base"
              >
                {loading
                  ? "Processing..."
                  : form.paymentMethod === "Card"
                    ? "Continue to secure checkout"
                    : "Place order"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
}
