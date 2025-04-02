// app/page.tsx (or pages/index.tsx)
"use client";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import FAQSection from "../components/FAQSection";

import TestimonialsSection from "../components/TestimonialsSection";
import Footer from "../components/Footer";
import PricingSection from "@/components/PricingSection";


export default function LandingPage() {

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow w-full pt-24">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
