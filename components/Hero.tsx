// components/HeroSection.tsx

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useRouter } from "next/navigation";
import AuthModal from "./AuthModal"; // Import your custom modal

export default function Hero() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [hasRoadmap, setHasRoadmap] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // State to control your custom modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // This effect runs when the component loads to check user status
    if (isSignedIn && isLoaded) {
      setLoading(true);
      // Logic to check if the signed-in user already has a roadmap
      async function checkUserRoadmap() {
        if (!user) {
          setLoading(false);
          return;
        }
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", user.id)
          .single();

        if (userData) {
          const { data: careerData } = await supabase
            .from("career_info")
            .select("roadmap")
            .eq("user_id", userData.id)
            .maybeSingle();
          const roadmapExists = !!(
            careerData &&
            careerData.roadmap &&
            Object.keys(careerData.roadmap).length > 0
          );
          setHasRoadmap(roadmapExists);
        }
        setLoading(false);
      }
      checkUserRoadmap();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, user]);

  const handleStartNow = () => {
    if (isSignedIn) {
      // If signed in, navigate them to the correct page
      router.push(hasRoadmap ? "/roadmap" : "/dashboard");
    } else {
      // If not signed in, open your custom modal
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {/* Conditionally render your modal. It will appear when isModalOpen is true. */}
      {isModalOpen && (
        <AuthModal
          onClose={() => setIsModalOpen(false)}
          afterSignUpUrl="/"
          afterSignInUrl={hasRoadmap ? "/roadmap" : "/dashboard"}
        />
      )}

      <section className="relative py-12 sm:py-16 lg:pb-40">
        <div className="absolute bottom-0 right-0 overflow-hidden">
          <img
            className="w-full h-auto origin-bottom-right transform scale-150 lg:w-auto lg:mx-auto lg:object-cover lg:scale-75"
            src="https://cdn.rareblocks.xyz/collection/clarity/images/hero/1/background-pattern.png"
            alt=""
          />
        </div>

        <div className="relative px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-y-4 lg:items-center lg:grid-cols-2 xl:grid-cols-2">
            <div className="text-center xl:col-span-1 lg:text-left md:px-16 lg:px-0 xl:pr-20">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight mb-8">
                <div>Your Journey.</div>
                <div className="md:text-5xl">
                  Our <span className="text-[#FF6500] text-7xl">Roadmap</span>.
                </div>
              </h1>
              <p className="mt-2 text-lg text-gray-600 sm:mt-6 font-inter">
                AI-driven roadmaps, real-time updates, exclusive opportunities,
                and personalized guidance, your complete career partner, all in
                one place.
              </p>

              <div className="flex flex-col md:flex-row md:space-x-12 items-center justify-center md:justify-start mt-8">
                <div className="relative inline-block">
                  <button
                    onClick={handleStartNow}
                    className="bg-white text-black py-5 px-12 rounded-full border-2 border-black hover:border-transparent transition-all duration-500 hover:bg-orange-400 mb-2"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Start Now"}
                  </button>
                </div>
                <Link
                  href="https://res.cloudinary.com/ditn9req1/video/upload/v1745336963/2025-04-22-Career_Roadmap__3_gbjkga.mp4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-transparent text-[#FF6500] py-5 px-8 rounded-3xl border border-[#FF6500] hover:bg-[#FF6500] hover:text-white transition-all duration-500"
                >
                  Video Demo
                </Link>
              </div>
            </div>

            <div className="xl:col-span-1 relative group">
              <img
                className="w-full mx-auto rounded-2xl "
                src="hero1.png"
                alt="Career Roadmap"
              />

              {/* Events Hover Card */}
              <div className="absolute -bottom-4 -right-4 lg:-bottom-12 lg:-right-8 z-10 animate-float">
                <div className="bg-white rounded-2xl p-3 lg:p-6 shadow-2xl border border-gray-100 backdrop-blur-sm min-w-[180px] max-w-[180px] lg:min-w-[280px] lg:max-w-xs">
                  <h3 className="text-base lg:text-xl font-bold text-gray-900 mb-2 lg:mb-3">
                    Events
                  </h3>
                  <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">
                    It provides the events that are actually beneficial for your
                    portfolio and integrates them with roadmap, so you're prepared
                    for every manoeuvre.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}