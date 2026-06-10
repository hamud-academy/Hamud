import { formatOrderDate, safeAmount } from "./order-display";
import OrderActionButtons from "./OrderActionButtons";

export type AdminOrderRow = {
  id: string;
  kind: "course" | "diploma";
  fullName: string;
  email: string;
  paymentMethod: string;
  paymentRef: string | null;
  amount: number;
  createdAt: string;
  itemTitle: string;
  itemSubtitle: string | null;
};

export default function AdminOrdersTable({ orders }: { orders: AdminOrderRow[] }) {
  if (orders.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <p className="text-slate-600 font-medium">No pending orders</p>
        <p className="text-slate-500 text-sm mt-1">
          When students place course or diploma orders, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="responsive-data-table">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Applicant
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={`${order.kind}-${order.id}`} className="hover:bg-slate-50/50 transition">
                <td data-label="Applicant" className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-slate-900">{order.fullName}</p>
                    <p className="text-xs text-slate-500 break-all">{order.email}</p>
                    {order.paymentRef ? (
                      <p className="text-xs text-slate-400 mt-0.5">Ref: {order.paymentRef}</p>
                    ) : null}
                  </div>
                </td>
                <td data-label="Order" className="px-6 py-4 text-slate-700">
                  <div>
                    <span
                      className={`mb-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        order.kind === "diploma"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {order.kind === "diploma" ? "Diploma" : "Course"}
                    </span>
                    <p className="font-medium text-slate-900">{order.itemTitle}</p>
                    {order.itemSubtitle ? (
                      <p className="text-xs text-slate-500">{order.itemSubtitle}</p>
                    ) : null}
                  </div>
                </td>
                <td data-label="Amount" className="px-6 py-4">
                  <span className="font-semibold text-slate-900">${safeAmount(order.amount)}</span>
                  <span className="text-xs text-slate-500 block">{order.paymentMethod}</span>
                </td>
                <td data-label="Date" className="px-6 py-4 text-slate-600">{formatOrderDate(order.createdAt)}</td>
                <td data-label="Actions" className="responsive-data-table__actions px-6 py-4 text-right">
                  <OrderActionButtons orderId={order.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
