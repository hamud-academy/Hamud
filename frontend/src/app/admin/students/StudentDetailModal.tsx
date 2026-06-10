"use client";

import { formatOrderDate, safeAmount } from "@/app/admin/requests/order-display";

export type StudentPayment = {
  id: string;
  kind: "COURSE" | "DIPLOMA";
  status: "PENDING" | "PAID";
  amount: number;
  paymentMethod: string;
  paymentRef: string | null;
  phone: string | null;
  itemTitle: string;
  itemSubtitle: string | null;
  createdAt: string;
  paidAt: string | null;
};

export type StudentDetail = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  whatsappPhone: string | null;
  enrollments: {
    id: string;
    courseId: string;
    courseTitle: string;
    courseSlug: string;
    enrolledAt: string;
    progress: number;
  }[];
  diplomaEnrollments: {
    id: string;
    programId: string;
    programTitle: string;
    programSlug: string;
    planType: string;
    planTitle: string | null;
    enrolledAt: string;
  }[];
  payments: StudentPayment[];
  paymentSummary: {
    totalPaid: number;
    totalPending: number;
    paidCount: number;
    pendingCount: number;
  };
};

function whatsappDigits(phone: string) {
  return phone.replace(/\D/g, "");
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: "PENDING" | "PAID" }) {
  const paid = status === "PAID";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
      }`}
    >
      {paid ? "Paid" : "Pending"}
    </span>
  );
}

export default function StudentDetailModal({
  detail,
  loading,
  error,
  onClose,
  onResetPassword,
}: {
  detail: StudentDetail | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onResetPassword?: () => void;
}) {
  if (!detail && !loading) return null;

  const waPhone = detail?.whatsappPhone?.trim() ?? "";
  const waHref = waPhone ? `https://wa.me/${whatsappDigits(waPhone)}` : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 sm:px-8">
          <h2 className="text-xl font-bold text-slate-900 min-w-0 truncate">
            {loading ? "Loading…" : detail?.name?.trim() || "Student details"}
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            {detail && onResetPassword ? (
              <button
                type="button"
                onClick={onResetPassword}
                className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
              >
                Reset password
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-slate-500">Loading student details…</div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : detail ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                      <p className="font-medium text-slate-900">{detail.email}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-2.121 3.9h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        WhatsApp number
                      </p>
                      {waPhone ? (
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          <p className="font-medium text-slate-900">{waPhone}</p>
                          {waHref ? (
                            <a
                              href={waHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700"
                            >
                              Open chat
                            </a>
                          ) : null}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">Not provided at registration</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <section>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Payment history</h3>
                    <p className="text-sm text-slate-500">
                      {detail.paymentSummary.paidCount} paid
                      {detail.paymentSummary.pendingCount > 0
                        ? ` · ${detail.paymentSummary.pendingCount} pending`
                        : ""}
                      {detail.paymentSummary.totalPending > 0
                        ? ` · $${safeAmount(detail.paymentSummary.totalPending)} awaiting approval`
                        : ""}
                    </p>
                  </div>
                </div>

                {detail.payments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    No payment records found for this student.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <div className="responsive-data-table">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/80">
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Order
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Amount
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Method
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Status
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {detail.payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-slate-50/50">
                              <td data-label="Order" className="px-4 py-3">
                                <span
                                  className={`mb-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                    payment.kind === "DIPLOMA"
                                      ? "bg-teal-100 text-teal-700"
                                      : "bg-violet-100 text-violet-700"
                                  }`}
                                >
                                  {payment.kind === "DIPLOMA" ? "Diploma" : "Course"}
                                </span>
                                <p className="font-medium text-slate-900">{payment.itemTitle}</p>
                                {payment.itemSubtitle ? (
                                  <p className="text-xs text-slate-500">{payment.itemSubtitle}</p>
                                ) : null}
                                {payment.paymentRef ? (
                                  <p className="text-xs text-slate-400 mt-0.5">Ref: {payment.paymentRef}</p>
                                ) : null}
                              </td>
                              <td data-label="Amount" className="px-4 py-3 font-semibold text-slate-900">
                                ${safeAmount(payment.amount)}
                              </td>
                              <td data-label="Method" className="px-4 py-3 text-slate-600">{payment.paymentMethod}</td>
                              <td data-label="Status" className="px-4 py-3">
                                <StatusBadge status={payment.status} />
                              </td>
                              <td data-label="Date" className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                {formatOrderDate(payment.paidAt ?? payment.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>

              <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 p-5">
                  <h3 className="text-base font-bold text-slate-900">Course enrollments</h3>
                  {detail.enrollments.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">No course enrollments</p>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {detail.enrollments.map((e) => (
                        <li
                          key={e.id}
                          className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5"
                        >
                          <span className="font-medium text-slate-900">{e.courseTitle}</span>
                          <span className="shrink-0 text-xs text-slate-500">
                            {formatShortDate(e.enrolledAt)} · {e.progress}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="rounded-2xl border border-teal-100 bg-teal-50/30 p-5">
                  <h3 className="text-base font-bold text-slate-900">Diploma enrollments</h3>
                  {detail.diplomaEnrollments.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">No diploma enrollments</p>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {detail.diplomaEnrollments.map((d) => (
                        <li
                          key={d.id}
                          className="flex items-center justify-between gap-3 rounded-xl bg-white/80 px-3 py-2.5 border border-teal-100"
                        >
                          <div>
                            <p className="font-medium text-teal-900">{d.programTitle}</p>
                            {d.planTitle ? (
                              <p className="text-xs text-slate-500">{d.planTitle}</p>
                            ) : null}
                          </div>
                          <span className="shrink-0 text-xs text-slate-500">
                            {formatShortDate(d.enrolledAt)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
