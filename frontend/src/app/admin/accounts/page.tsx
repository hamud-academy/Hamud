import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AccountsPageClient from "./AccountsPageClient";

export default async function AdminAccountsPage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="p-4 sm:p-6 md:p-8">
        <AccountsPageClient />
      </div>
    </div>
  );
}
