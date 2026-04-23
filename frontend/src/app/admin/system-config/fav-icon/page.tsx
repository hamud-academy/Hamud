import { auth } from "@/auth";
import { redirect } from "next/navigation";
import FavIconForm from "./FavIconForm";

export default async function FavIconPage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") redirect("/admin");

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Fav icon</h1>
      <p className="text-slate-600 mb-6">Upload the site favicon and set the browser tab title.</p>
      <FavIconForm />
    </div>
  );
}
