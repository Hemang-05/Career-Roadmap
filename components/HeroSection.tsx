// components/HeroSection.tsx

"use client";
import { useEffect, useRef, useState } from "react";

import { SignUpButton, useUser } from "@clerk/nextjs";

import { supabase } from "@/utils/supabase/supabaseClient";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [hasRoadmap, setHasRoadmap] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [stateReady, setStateReady] = useState<boolean>(false);
  const router = useRouter();

  const [userJustSignedIn, setUserJustSignedIn] = useState<boolean>(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setUserJustSignedIn(true);
    }
  }, [isLoaded, isSignedIn, user]);

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

  useEffect(() => {
    if (userJustSignedIn && stateReady && !loading) {
      console.log("User just signed in and state is ready. Redirecting now...");
      const destination = hasRoadmap ? "/roadmap" : "/dashboard";
      router.push(destination);
      setUserJustSignedIn(false);
    }
  }, [userJustSignedIn, stateReady, loading, hasRoadmap, router]);

  const handleStartNow = () => {
    if (isSignedIn) {
      const destination = hasRoadmap ? "/roadmap" : "/dashboard";
      console.log("Manual navigation to:", destination);
      router.push(destination);
    }
  };

  useEffect(() => {
    console.log("hasRoadmap state updated to:", hasRoadmap);
  }, [hasRoadmap]);

  return (
    <section
      id="hero"
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden mx-[5%] rounded-[4rem]"
      style={{
        backgroundImage:
          "url('https://res.cloudinary.com/ditn9req1/image/upload/v1753625003/17_irdmsq.jpg')", // Replace with your image
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-24 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Main Headline - Reduced from text-4xl/6xl/7xl to text-3xl/5xl/6xl */}
          <h1 className="text-2xl md:text-3xl lg:text-5xl font-medium text-white leading-tight mb-4">
            AI for your dream career
            <br />
            <span className="text-white">Your big money, your Roadmap.</span>
          </h1>

          {/* Subheading - Reduced from text-lg/xl/2xl to text-base/lg/xl */}
          <p className="text-base md:text-lg lg:text-xl text-white/90 mb-8 max-w-3xl mx-auto font-light ">
            Careeroadmap’s AI crafts a personalized path to your dream job
          </p>

          {/* CTA Button */}
          <div className="flex justify-center">
            <div className="relative inline-block">
              {isSignedIn ? (
                <button
                  onClick={handleStartNow}
                  className="bg-black hover:bg-white text-white hover:text-black font-semibold py-4 px-8 md:py-5 md:px-12 rounded-full text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  disabled={loading || !stateReady}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 text-black mr-3"
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
                    <span className="flex items-center">
                      Start your journey
                      <svg
                        className="ml-2 w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              ) : (
                <SignUpButton mode="modal">
                  <button className="bg-black hover:bg-white text-white hover:text-black font-semibold py-4 px-8 md:py-5 md:px-12 rounded-full text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    <span className="flex items-center">
                      Start your journey
                      <svg
                        className="ml-2 w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </span>
                  </button>
                </SignUpButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
