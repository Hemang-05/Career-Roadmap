// app/page.tsx (or pages/index.tsx)
"use client";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import FAQSection from "../components/FAQSection";

import TestimonialsSection from "../components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import Plans from "@/components/Plans";
import VideoDemo from "@/components/VideoDemo";
import { NotificationPopup } from "@/components/NotificationPopup";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <NotificationPopup />
      <main className="flex-grow w-full pt-24">
        <HeroSection />
        <VideoDemo />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <Plans />
        <FAQSection />
      </main>
    </div>
  );
}
