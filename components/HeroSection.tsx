// components/HeroSection.tsx

"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignInButton, useUser } from "@clerk/nextjs";
import { AnimatedTooltip } from "@/components/ui/AnimatedTooltip";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useRouter } from "next/navigation";

export default function HeroSection() {
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

  // Sample data for enrolled users
  const enrolledUsers = [
    {
      id: 1,
      name: "Alice",
      designation: "Student",
      image:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1744966691/kid1_xkapd9.jpg",
    },
    {
      id: 2,
      name: "Bob",
      designation: "Student",
      image:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1744966689/kid2_imcmyf.jpg",
    },
    {
      id: 3,
      name: "Carol",
      designation: "Student",
      image:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1744966693/kid3_ajkhfl.jpg",
    },
    {
      id: 4,
      name: "Jake",
      designation: "Student",
      image:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1744966690/kid4_n62q2f.jpg",
    },
  ];

  // Debug info for development
  useEffect(() => {
    console.log("hasRoadmap state updated to:", hasRoadmap);
  }, [hasRoadmap]);

  return (
    <section
      id="hero"
      className="container  mx-auto flex flex-col md:flex-row items-center justify-center px-44 py-12 relative overflow-hidden"
    >
      {/* Text content */}
      <div className="md:w-1/2 mb-10  md:mb-0 md:pr-8 text-center md:text-left z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight mb-8">
          <div>Your Journey.</div>
          <div className="md:text-5xl">
            Our <span className="text-[#FF6500] text-7xl">Roadmap</span>.
          </div>
        </h1>
        <p className="text-xl text-gray-600 mb-20">
          AI-driven roadmaps, real-time updates, exclusive opportunities, and
          personalized guidance—your complete career partner, all in one place.
        </p>
        {/* Button Section */}
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
                <button className="bg-white text-black py-5 px-12 rounded-full border-2 border-black hover:border-transparent transition-all duration-500 hover:bg-orange-400 mb-2">
                  Start Now
                </button>
              </SignInButton>
            )}
            {/* <div className="flex flex-col items-center mt-4 pointer-events-none">
              <AnimatedTooltip items={enrolledUsers} />
            </div> */}
          </div>
        </div>
        {/* <p className="text-gray-500 text-sm mt-2">
          1278+ joined for achieving their goal
        </p> */}
      </div>

      {/* 3D Career Illustrations Section */}
    </section>
  );
}
