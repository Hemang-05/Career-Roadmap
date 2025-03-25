// // app/page.tsx (or pages/index.tsx)
// "use client";
// import { useEffect } from "react";
// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";

// // Importing the components
// import Navbar from "../components/Navbar";
// import HeroSection from "../components/HeroSection";
// import FeaturesSection from "../components/FeaturesSection";
// import FAQSection from "../components/FAQSection";
// import PricingSection from "../components/PricingSection";
// import TestimonialsSection from "../components/TestimonialsSection";
// import Footer from "../components/Footer";

// export default function LandingPage() {
//   const { user, isLoaded } = useUser();
//   const router = useRouter();

//   // useEffect(() => {
//   //   if (isLoaded && user) {
//   //     router.push('/dashboard')
//   //   }
//   // }, [isLoaded, user, router])

//   return (
//     <div className="min-h-screen flex flex-col bg-white">
//       <Navbar />
//       <main className="flex-grow w-full pt-24">
//         <HeroSection />
//         <FeaturesSection />
//         <PricingSection />
//         <TestimonialsSection />
//         <FAQSection />
//       </main>
//       <Footer />
//     </div>
//   );
// }

// app/page.tsx (or pages/index.tsx)
"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// Importing the components
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import FAQSection from "../components/FAQSection";
import PricingSection from "../components/PricingSection";
import TestimonialsSection from "../components/TestimonialsSection";
import Footer from "../components/Footer";
import UniversityDataModal from "../components/ui/UniversityDataModal";

export default function LandingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Uncomment if you want to redirect authenticated users:
  // useEffect(() => {
  //   if (isLoaded && user) {
  //     router.push('/dashboard')
  //   }
  // }, [isLoaded, user, router]);

  // Dummy handler for form submission - extend to call your API/Supabase function.
  const handleFormSubmit = (data: any) => {
    console.log("University Data Submitted:", data);
    // Add your API call or Supabase integration here.
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow w-full pt-24">
        <HeroSection />
        {/* Optional: Button to open the University Data Modal */}

        <div className="w-full bg-gray-100 py-4 flex justify-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Enter University Data
          </button>
        </div>
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <Footer />

      {/* Combined University Data Modal */}
      <UniversityDataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
