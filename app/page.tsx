// // app/page.tsx (or pages/index.tsx)
// "use client";
// import Navbar from "../components/Navbar";
// import FeaturesSection from "../components/FeaturesSection";
// import FAQSection from "../components/FAQSection";
// import TestimonialsSection from "../components/TestimonialsSection";
// import Plans from "@/components/Plans";
// import HeroSection from "@/components/HeroSection";
// import HowWeWork from "@/components/HowWeWork";
// import AutoCarouselSlider from "@/components/ui/Slider";
// import Crumbs from "@/components/ui/Crumbs";
// import Footer from "@/components/Footer";

// export default function LandingPage() {
//   return (
//     <div className="relative min-h-screen overflow-hidden">
//       <div className="fixed inset-0 z-0">
//         <div className="absolute inset-0"></div>
//       </div>

//       <div className="relative z-10 bg-transparent">
//         <Navbar />

//         <main className="flex-grow  w-full pt-24">
//           <HeroSection />
//           <AutoCarouselSlider />
//           <FeaturesSection />
//           <HowWeWork />
//           <Crumbs />
//           <Plans />
//           <TestimonialsSection />
//           <FAQSection />
//         </main>
//         <Footer />
//       </div>
//     </div>
//   );
// }

// app/page.tsx
"use client";
import { useEffect } from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import FeaturesSection from "../components/FeaturesSection";
import FAQSection from "../components/FAQSection";
import TestimonialsSection from "../components/TestimonialsSection";
import Plans from "@/components/Plans";
import HeroSection from "@/components/HeroSection";
import HowWeWork from "@/components/HowWeWork";
import AutoCarouselSlider from "@/components/ui/Slider";
import Crumbs from "@/components/ui/Crumbs";
import Footer from "@/components/Footer";

// Structured Data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AI Career Roadmap",
  description:
    "Get personalized career roadmaps for any field using state-of-the-art AI. Discover relevant events and opportunities to boost your career prospects and earning potential.",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",

  provider: {
    "@type": "Organization",
    name: "Careeroadmap",
  },
  featureList: [
    "AI-powered career roadmaps",
    "Personalized learning paths",
    "Industry-relevant events",
    "Career growth tracking",
    "Higher salary potential guidance",
  ],
};

export default function LandingPage() {
  useEffect(() => {
    // Add structured data to head
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>
          AI Career Roadmap Generator | Personalized Career Guidance for
          Students
        </title>
        <meta
          name="title"
          content="AI Career Roadmap | Personalized Career Guidance for Students"
        />
        <meta
          name="description"
          content="Get AI-powered career roadmaps for any field. Discover events, opportunities, and strategies to boost your career prospects and increase earning potential. Free career guidance for students."
        />
        <meta
          name="keywords"
          content="career roadmap, AI career guidance, student career planning, career development, job opportunities, higher salary, career events, professional growth, career path generator"
        />
        <meta name="robots" content="index, follow" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="language" content="English" />
        <meta name="author" content="Careeroadmap" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://careeroadmap.com/" />
        <meta
          property="og:title"
          content="AI Career Roadmap | Personalized Career Guidance for Students"
        />
        <meta
          property="og:description"
          content="Get AI-powered career roadmaps for any field. Discover events, opportunities, and strategies to boost your career prospects and increase earning potential."
        />
        <meta
          property="og:image"
          content="https://careeroadmap.com/og-image.png"
        />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://careeroadmap.com/" />
        <meta
          property="twitter:title"
          content="AI Career Roadmap | Personalized Career Guidance for Students"
        />
        <meta
          property="twitter:description"
          content="Get AI-powered career roadmaps for any field. Discover events, opportunities, and strategies to boost your career prospects and increase earning potential."
        />
        <meta
          property="twitter:image"
          content="https://careeroadmap.com/og-image.png"
        />

        {/* Additional SEO Meta Tags */}
        <link rel="canonical" href="https://careeroadmap.com/" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative min-h-screen overflow-hidden">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0"></div>
        </div>

        <div className="relative z-10 bg-transparent">
          <Navbar />

          <main className="flex-grow w-full pt-24" role="main">
            {/* Hero Section with SEO-friendly content */}
            <section aria-label="Hero section">
              <HeroSection />
            </section>

            {/* Carousel Section */}
            <section aria-label="User country carousel">
              <AutoCarouselSlider />
            </section>

            {/* Features Section */}
            <section aria-label="Platform features" id="features">
              <FeaturesSection />
            </section>

            {/* How We Work Section */}
            <section aria-label="How our platform works" id="how-it-works">
              <HowWeWork />
            </section>

            {/* Breadcrumbs/Navigation */}
            <nav aria-label="Advantages about our platform">
              <Crumbs />
            </nav>

            {/* Pricing Plans */}
            <section aria-label="Pricing plans" id="pricing">
              <Plans />
            </section>

            {/* Testimonials */}
            <section aria-label="Customer testimonials" id="testimonials">
              <TestimonialsSection />
            </section>

            {/* FAQ Section */}
            <section aria-label="Frequently asked questions" id="faq">
              <FAQSection />
            </section>
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
}
