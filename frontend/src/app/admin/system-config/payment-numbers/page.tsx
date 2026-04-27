import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PaymentNumbersForm from "./PaymentNumbersForm";

export default async function PaymentNumbersPage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") redirect("/admin");

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Numbers</h1>
      <p className="text-slate-600 mb-6">
        Manage the manual payment numbers shown on the checkout page.
      </p>
      <PaymentNumbersForm />
    </div>
  );
}
