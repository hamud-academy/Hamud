import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { getContactConfig } from "@/lib/contact-config";

export default async function ContactPage() {
  const initialConfig = await getContactConfig();
  return (
    <>
      <Header />
      <main className="min-h-screen pt-16 bg-slate-50 dark:bg-slate-950">
        <ContactSection initialConfig={initialConfig} />
      </main>
      <Footer />
    </>
  );
}
