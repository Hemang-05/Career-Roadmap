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


// Importing the components
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import FAQSection from "../components/FAQSection";
import PricingSection from "../components/PricingSection";
import TestimonialsSection from "../components/TestimonialsSection";
import Footer from "../components/Footer";

export default function LandingPage() {
 

  

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

        
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <Footer />

      {/* Combined University Data Modal */}
      
    </div>
  );
}
