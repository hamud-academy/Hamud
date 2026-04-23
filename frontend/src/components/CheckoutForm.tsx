"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  courseId: string;
  courseSlug?: string;
  courseTitle: string;
  amount: number;
  courseThumbnail?: string | null;
  courseCategory: string;
  moduleCount: number;
  totalLessons: number;
}

export default function CheckoutForm({
  courseId,
  courseSlug,
  courseTitle,
  amount,
  courseThumbnail,
  courseCategory,
  moduleCount,
  totalLessons,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstNameMiddle: "",
    lastName: "",
    country: "Somalia",
    address: "",
    region: "",
    postcode: "",
    phone: "",
    email: "",
    username: "",
    paymentMethod: "Manual" as "Manual" | "Card",
    paymentRef: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    saveCard: false,
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.termsAccepted) {
      setError("Fadlan aqbal xeer-hoosaadka (terms and conditions).");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    const fullName = [form.firstNameMiddle.trim(), form.lastName.trim()].filter(Boolean).join(" ");
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          fullName,
          email: form.email,
          phone: form.phone || undefined,
          paymentMethod: form.paymentMethod,
          paymentRef: form.paymentRef || undefined,
          amount,
          password: form.password,
          country: form.country || undefined,
          address: form.address || undefined,
          region: form.region || undefined,
          postcode: form.postcode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push(`/checkout/success${courseSlug ? `?slug=${encodeURIComponent(courseSlug)}` : ""}`);
      router.refresh();
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  const showManualPaymentDetails = form.paymentMethod === "Manual";
  const showCardForm = form.paymentMethod === "Card";

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-8 lg:gap-10 w-full max-w-full min-w-0">
        {/* Left: BILLING DETAILS */}
        <div className="w-full md:flex-1 md:min-w-0 order-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 lg:px-8 py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">BILLING DETAILS</h2>
            <p className="text-sm text-gray-500 mt-0.5">* Waa lagu talagalay in la buuxiyo</p>
          </div>
          <div className="p-5 sm:p-6 lg:p-8 space-y-4">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Magacaaga Koowaad iyo Magaca aabahaa *
              </label>
              <input
                type="text"
                required
                value={form.firstNameMiddle}
                onChange={(e) => setForm((f) => ({ ...f, firstNameMiddle: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Halkaan Gali Magacaaga iyo Magaca Aabahaa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Magacaaga Awowgaa *
              </label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Halkaan Gali Magaca Awowgaa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wadanka *
              </label>
              <select
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="Somalia">Somalia</option>
                <option value="Djibouti">Djibouti</option>
                <option value="Ethiopia">Ethiopia</option>
                <option value="Kenya">Kenya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wadada Aad Dagantahay
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Sida Wadada Sodonika oo kale"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gobolka
              </label>
              <select
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Sida Maroodi Jeex ama Banaadir</option>
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
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postcode / ZIP (Furaha wadanka sida 252)
              </label>
              <input
                type="text"
                value={form.postcode}
                onChange={(e) => setForm((f) => ({ ...f, postcode: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="ZIP CODE AMA FURAHA WADANKA SIDA 252, 251 ama 254"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number *
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="WhatsAPP Numberkaaga Gali Halkaan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address (Gmail kaaga) *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Gmail, Hotmail, Outlook"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your email & card info are saved so we can send email reminders about this order. No Thanks.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Create account password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password *
              </label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Confirm your password"
              />
            </div>
          </div>
        </div>

        {/* Right: YOUR ORDER + PAYMENT METHOD + terms + submit */}
        <div className="w-full md:w-[min(100%,400px)] md:flex-shrink-0 md:max-w-[420px] order-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* YOUR ORDER */}
            <div className="px-4 sm:px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">YOUR ORDER</h2>
            </div>
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="grid grid-cols-[1fr,auto] gap-2 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <span>Product</span>
                <span>Total</span>
              </div>
              <div className="flex gap-4 pb-4">
                {courseThumbnail ? (
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <img src={courseThumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">
                    {courseCategory.slice(0, 2)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 line-clamp-2">{courseTitle}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{courseCategory}</p>
                  <p className="text-xs text-gray-500 mt-1">QTY: 1</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="font-bold text-gray-900">${amount.toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-2 py-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${amount.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="font-bold text-gray-900">TOTAL</span>
                <span className="text-xl font-bold text-gray-900">${amount.toFixed(2)}</span>
              </div>
              <ul className="mt-6 space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {moduleCount} modules
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {totalLessons} lessons
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Course Certificate
                </li>
              </ul>
            </div>

            {/* Payment Methods - same section */}
            <div className="p-4 sm:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Methods</h3>
            <div className="space-y-4">
              <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer ${form.paymentMethod === "Manual" ? "border-emerald-500 bg-emerald-50/50" : "border-gray-200 hover:border-gray-300"}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Manual"
                  checked={form.paymentMethod === "Manual"}
                  onChange={() => setForm((f) => ({ ...f, paymentMethod: "Manual" }))}
                  className="mt-1 text-emerald-600"
                />
                <span className="font-medium text-gray-900">WaafiPay - EVC+, Zaad iyo Sahal</span>
              </label>
              <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer ${form.paymentMethod === "Card" ? "border-emerald-500 bg-emerald-50/50" : "border-gray-200 hover:border-gray-300"}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Card"
                  checked={form.paymentMethod === "Card"}
                  onChange={() => setForm((f) => ({ ...f, paymentMethod: "Card" }))}
                  className="mt-1 text-emerald-600"
                />
                <span className="font-medium text-gray-900">Credit / Debit Card</span>
              </label>
            </div>

            {showManualPaymentDetails && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-semibold text-gray-900">Manual Payments</p>
                <img src="/images/manual-payments.svg" alt="Manual Payments" className="w-full max-w-md rounded-lg border border-gray-200" />
                <p className="text-gray-600 text-sm">Please enter your payment reference when you pay.</p>
                <input
                  type="text"
                  value={form.paymentRef}
                  onChange={(e) => setForm((f) => ({ ...f, paymentRef: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900"
                  placeholder="Reference (e.g. 1234 or ABC123)"
                />
              </div>
            )}

            {showCardForm && (
              <div className="mt-4 p-4 rounded-lg bg-gray-50 border border-gray-200 text-sm space-y-4">
                <p className="font-semibold text-gray-900 text-base">Credit / Debit Card</p>
                <div className="flex justify-center py-2">
                  <img src="/images/manual-person.svg" alt="" className="w-20 h-28 object-contain" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Card number</label>
                  <input
                    type="text"
                    value={form.cardNumber}
                    onChange={(e) => setForm((f) => ({ ...f, cardNumber: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg"
                    placeholder="1234 1234 1234 1234"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 mb-1">Expiration date</label>
                    <input
                      type="text"
                      value={form.cardExpiry}
                      onChange={(e) => setForm((f) => ({ ...f, cardExpiry: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg"
                      placeholder="MM / YY"
                      maxLength={7}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Security code (CVC)</label>
                    <input
                      type="text"
                      value={form.cardCvc}
                      onChange={(e) => setForm((f) => ({ ...f, cardCvc: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg"
                      placeholder="CVC"
                      maxLength={4}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.saveCard}
                    onChange={(e) => setForm((f) => ({ ...f, saveCard: e.target.checked }))}
                    className="rounded border-gray-300 text-emerald-600"
                  />
                  <span className="text-gray-700">Save payment information to my account for future purchases.</span>
                </label>
              </div>
            )}
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-600">
              Fadlan Iska Hubi inta Course/Diploma ee ku jirta saladaada inta aadan taaban HADA DALBO. Hadii qaar qaldan ay kaa soo raaceen ka saar X. Fadlan TOTAL ka iska Hubi Markale.
            </p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.termsAccepted}
                onChange={(e) => setForm((f) => ({ ...f, termsAccepted: e.target.checked }))}
                className="mt-1 rounded border-gray-300 text-emerald-600"
              />
              <span className="text-sm text-gray-700">
                Fadlan Soo Akhri oo Aqbal &quot;Xeer Hoosaadka Hurbad&quot; terms and conditions.
              </span>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition text-base"
            >
              {loading ? "Processing..." : "HADA DALBO"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
