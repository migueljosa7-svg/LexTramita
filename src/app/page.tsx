import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { RentCalculator } from "@/components/landing/rent-calculator";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { CTA, Footer } from "@/components/landing/cta-footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <RentCalculator />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
