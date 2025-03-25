"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignInButton, useUser } from "@clerk/nextjs";
import { AnimatedTooltip } from "@/components/ui/AnimatedTooltip";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const angleRef = useRef(0);
  const { user, isSignedIn, isLoaded } = useUser();
  const [hasRoadmap, setHasRoadmap] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [stateReady, setStateReady] = useState<boolean>(false);
  const router = useRouter();

  // Track if the user state just changed (e.g., just signed in)
  const [userJustSignedIn, setUserJustSignedIn] = useState<boolean>(false);

  // Animation effect for the 3D illustrations
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const illustrations = container.querySelectorAll(".career-illustration");
    const totalItems = illustrations.length;

    function mapRange(
      value: number,
      in_min: number,
      in_max: number,
      out_min: number,
      out_max: number
    ) {
      return (
        ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
      );
    }

    const animate = () => {
      const radius = 220;

      illustrations.forEach((illustration, index) => {
        const offset = ((Math.PI * 2) / totalItems) * index;
        const x = Math.cos(angleRef.current + offset) * radius;
        const z = Math.sin(angleRef.current + offset) * radius;
        const scale = mapRange(z, -radius, radius, 0.6, 1.2);
        const opacity = mapRange(z, -radius, radius, 0.7, 1);
        const zIndex = Math.floor(mapRange(z, -radius, radius, 1, 10));
        const el = illustration as HTMLElement;
        el.style.transform = `translateX(${x}px) scale(${scale})`;
        el.style.opacity = opacity.toString();
        el.style.zIndex = zIndex.toString();
      });

      angleRef.current += 0.005;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

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
            careerData.roadmap.trim().length > 0
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
    { id: 1, name: "Alice", designation: "Student", image: "/kid1.jpeg" },
    { id: 2, name: "Bob", designation: "Student", image: "/kid2.jpeg" },
    { id: 3, name: "Carol", designation: "Student", image: "/kid3.jpeg" },
    { id: 4, name: "Jake", designation: "Student", image: "/kid4.jpeg" },
  ];

  // Debug info for development
  useEffect(() => {
    console.log("hasRoadmap state updated to:", hasRoadmap);
  }, [hasRoadmap]);

  return (
    <section
      id="hero"
      className="container mx-auto flex flex-col md:flex-row items-center justify-center px-4 py-16 relative overflow-hidden"
    >
      {/* Text content */}
      <div className="md:w-1/2 mb-10 md:mb-0 md:pr-8 text-center md:text-left z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight mb-8">
          <div>Your Journey.</div>
          <div className="md:text-5xl">
            Our <span className="text-[#FF6500] text-7xl">Roadmap</span>.
          </div>
        </h1>
        <p className="text-xl text-gray-600 mb-20">
          We guide you from the first step to the finish line, ensuring no
          opportunity slips by.
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
            <div className="flex flex-col items-center mt-4">
              <AnimatedTooltip items={enrolledUsers} />
            </div>
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-2">
          1278+ joined for achieving their goal
        </p>
      </div>

      {/* 3D Career Illustrations Section */}
      <div
        className="w-full md:w-1/2 flex items-center justify-center relative h-60 md:h-96"
        ref={containerRef}
      >
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="career-illustration absolute transition-transform will-change-transform transform scale-75 md:scale-100"
            style={{
              transformOrigin: "center center",
              willChange: "transform, opacity",
            }}
          >
            <Image
              src={`/${index + 1}.png`}
              alt={`career-${index + 1}`}
              width={index === 0 ? 150 : 180}
              height={index === 0 ? 150 : 200}
              className="object-contain"
              loading="eager"
              priority={index < 3}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
