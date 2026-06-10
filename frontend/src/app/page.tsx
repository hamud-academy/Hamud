import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Categories from "@/components/Categories";
import PopularCourses from "@/components/PopularCourses";
import WhyChoose from "@/components/WhyChoose";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import PartnersMarquee from "@/components/PartnersMarquee";
import Footer from "@/components/Footer";

export const revalidate = 60;

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-w-0 overflow-x-clip">
        <Hero />
        <Features />
        <Categories />
        <PopularCourses />
        <WhyChoose />
        <Testimonials />
        <CTA />
        <PartnersMarquee />
        <Footer />
      </main>
    </>
  );
}
