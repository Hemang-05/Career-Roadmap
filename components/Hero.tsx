// components/HeroSection.tsx

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignInButton, useUser } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useRouter } from "next/navigation";

export default function Hero() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [hasRoadmap, setHasRoadmap] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [stateReady, setStateReady] = useState<boolean>(false);
  const router = useRouter();

  // Track if the user state just changed (e.g., just signed in)
  const [userJustSignedIn, setUserJustSignedIn] = useState<boolean>(false);

  // Track when user signs in
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setUserJustSignedIn(true);
    }
  }, [isLoaded, isSignedIn, user]);

  // Check if the signed-in user already has a roadmap
  useEffect(() => {
    if (!isLoaded) return;

    async function checkUserRoadmap() {
      setLoading(true);
      setStateReady(false);

      if (!user) {
        setHasRoadmap(false);
        setLoading(false);
        setStateReady(true);
        return;
      }

      try {
        console.log("Checking roadmap for user:", user.id);

        // Step 1: Get the internal user_id from users table using clerk_id
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", user.id)
          .single();

        if (userError || !userData) {
          console.log("Error fetching user data:", userError);
          setHasRoadmap(false);
          setLoading(false);
          setStateReady(true);
          return;
        }

        console.log("Found internal user_id:", userData.id);

        // Step 2: Use the internal user_id to check if a roadmap exists
        const { data: careerData, error: careerError } = await supabase
          .from("career_info")
          .select("roadmap")
          .eq("user_id", userData.id)
          .maybeSingle();

        console.log("Career data received:", careerData);

        if (careerError) {
          console.log("Error fetching career data:", careerError);
          setHasRoadmap(false);
        } else {
          const roadmapExists = !!(
            careerData &&
            careerData.roadmap &&
            typeof careerData.roadmap === "object" &&
            Object.keys(careerData.roadmap).length > 0
          );
          console.log("Does roadmap exist and have content?", roadmapExists);
          setHasRoadmap(roadmapExists);
        }
      } catch (error) {
        console.error("Unexpected error checking roadmap:", error);
        setHasRoadmap(false);
      } finally {
        setLoading(false);
        setStateReady(true);
      }
    }

    checkUserRoadmap();
  }, [isLoaded, user]);

  // Auto-redirect effect once state is ready (no delay, just immediate redirection)
  useEffect(() => {
    if (userJustSignedIn && stateReady && !loading) {
      console.log("User just signed in and state is ready. Redirecting now...");
      const destination = hasRoadmap ? "/roadmap" : "/dashboard";
      router.push(destination);
      setUserJustSignedIn(false);
    }
  }, [userJustSignedIn, stateReady, loading, hasRoadmap, router]);

  // Handle the navigation when the button is clicked manually
  const handleStartNow = () => {
    if (isSignedIn) {
      const destination = hasRoadmap ? "/roadmap" : "/dashboard";
      console.log("Manual navigation to:", destination);
      router.push(destination);
    }
  };

  return (
    <section className="relative py-12 sm:py-16 lg:pb-40">
      <div className="absolute bottom-0 right-0 overflow-hidden">
        <img
          className="w-full h-auto origin-bottom-right transform scale-150 lg:w-auto lg:mx-auto lg:object-cover lg:scale-75"
          src="https://cdn.rareblocks.xyz/collection/clarity/images/hero/1/background-pattern.png"
          alt=""
        />
      </div>

      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
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
                {isSignedIn ? (
                  <button
                    onClick={handleStartNow}
                    className="bg-white text-black py-5 px-12 rounded-full border-2 border-black hover:border-transparent transition-all duration-500 hover:bg-orange-400 mb-2"
                    disabled={loading || !stateReady}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin h-5 w-5 text-black mr-2"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          ></path>
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      `Start Now`
                    )}
                  </button>
                ) : (
                  <SignInButton mode="modal">
                    <button className="bg-white text-black py-5 px-12 rounded-3xl border-2 hover:border-transparent transition-all duration-500 hover:bg-orange-400 mb-2">
                      Start Now
                    </button>
                  </SignInButton>
                )}
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

            {/* Optional: Add a subtle overlay on hover for better contrast */}
            {/* <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl pointer-events-none"></div> */}
          </div>
        </div>
      </div>
    </section>
  );
}
