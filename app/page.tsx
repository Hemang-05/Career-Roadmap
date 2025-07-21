// // app/page.tsx (or pages/index.tsx)
// "use client";
// import Navbar from "../components/Navbar";
// import HeroSection from "../components/HeroSection";
// import FeaturesSection from "../components/FeaturesSection";
// import FAQSection from "../components/FAQSection";

// import TestimonialsSection from "../components/TestimonialsSection";
// import PricingSection from "@/components/PricingSection";
// import Plans from "@/components/Plans";
// import VideoDemo from "@/components/VideoDemo";
// import { NotificationPopup } from "@/components/NotificationPopup";

// export default function LandingPage() {
//   return (
//     <div className="min-h-screen flex flex-col bg-white relative before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.15),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,121,198,0.15),transparent_50%),radial-gradient(circle_at_40%_40%,rgba(120,219,226,0.1),transparent_50%)] before:animate-pulse">
//       <Navbar />
//       {/* <NotificationPopup /> */}
//       <main className="flex-grow w-full pt-24">
//         <HeroSection />
//         {/* <VideoDemo /> */}
//         <FeaturesSection />
//         <PricingSection />
//         <TestimonialsSection />
//         <Plans />
//         <FAQSection />
//       </main>
//     </div>
//   );
// }

// app/page.tsx (or pages/index.tsx)
// app/page.tsx (or pages/index.tsx)
"use client";
import Navbar from "../components/Navbar";
import FeaturesSection from "../components/FeaturesSection";
import FAQSection from "../components/FAQSection";
import TestimonialsSection from "../components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import Plans from "@/components/Plans";
import { NotificationPopup } from "@/components/NotificationPopup";
import Image from "next/image"; // <--- Add this import
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

export default function LandingPage() {
  const backgroundImageSrc = "/20.jpg";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 z-0">
        {/* <Image
          src={backgroundImageSrc}
          alt="Parallax background"
          layout="fill" // Stretches the image to fill the parent div
          objectFit="cover" // Ensures the image covers the area, cropping if necessary
          quality={100} // Optional: Adjust quality (default is 75)
          priority // Optional: Loads this image with high priority
          className="pointer-events-none" // Prevents interaction with the image itself
        /> */}
        {/* Optional: Add an overlay for better text readability */}
        <div className="absolute inset-0"></div>
        {/* Your existing background animation (if desired) */}
      </div>
      {/* Main content container - this is what will scroll */}
      <div className="relative z-10 bg-transparent">
        <Navbar />
        {/* <NotificationPopup /> */}
        <main className="flex-grow w-full pt-24">
          {/* <HeroSection /> */}
          <Hero />
          {/* <VideoDemo /> */}
          <FeaturesSection />
          <PricingSection />
          <TestimonialsSection />

          <Plans />
          <FAQSection />
        </main>
      </div>
    </div>
  );
}
