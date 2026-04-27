import { auth } from "@/auth";
import { redirect } from "next/navigation";
import FooterConfigClient from "./FooterConfigClient";

export default async function FooterConfigPage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") redirect("/admin");

  return <FooterConfigClient />;
}
