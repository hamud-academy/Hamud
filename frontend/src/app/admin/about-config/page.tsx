import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AboutConfigClient from "./AboutConfigClient";

export default async function AboutConfigPage() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN") redirect("/admin");

  return <AboutConfigClient />;
}
