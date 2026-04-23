import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ContactConfigClient from "./ContactConfigClient";

export default async function ContactConfigPage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") redirect("/admin");

  return <ContactConfigClient />;
}
