import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ChangeTextsForm from "./ChangeTextsForm";

export default async function ChangeTextsPage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") redirect("/admin");

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Change Texts</h1>
      <p className="text-slate-600 mb-6">Edit the landing page hero texts (tagline, heading, description, student count).</p>
      <ChangeTextsForm />
    </div>
  );
}
