import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Categories from "@/components/Categories";
import PopularCourses from "@/components/PopularCourses";
import WhyChoose from "@/components/WhyChoose";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Categories />
        <PopularCourses />
        <WhyChoose />
        <Testimonials />
        <CTA />
        <Footer />
      </main>
    </>
  );
}
