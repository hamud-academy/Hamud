import { redirect } from "next/navigation";
import { auth } from "@/auth";
import TestimonyForm from "./TestimonyForm";

export default async function TestimonyPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/testimony");
  }
  const user = session.user as { role?: string };
  if (user.role !== "STUDENT") {
    redirect("/dashboard");
  }

  return <TestimonyForm />;
}
