import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import LogoutConfirm from "./LogoutConfirm";

export const metadata: Metadata = {
  title: "Sign out - BaroSmart",
  description: "Confirm sign out of your account",
};

export default function LogoutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-14 sm:pt-16 flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
        <LogoutConfirm />
      </main>
      <footer className="sr-only">
        <Link href="/">Home</Link>
      </footer>
    </>
  );
}
