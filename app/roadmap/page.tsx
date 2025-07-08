"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useSyncUser } from "@/app/hooks/sync-user";
import PaymentPlan from "@/components/PaymentPlan";
import FloatingNavbar from "@/components/Navbar";
import ProgressBar from "@/components/ProgressBar";
import { calculateTaskCountProgress } from "@/utils/calcTaskCountProgress";
import { calculateWeightProgress } from "@/utils/calcWeightProgress";
import { AnimatedTooltip } from "@/components/ui/AnimatedTooltip";
import { isYearComplete } from "@/components/RoadmapDisplay";
import USDPaymentPlan from "@/components/USDPaymentPlan";
import RoadmapDisplay from "@/components/RoadmapDisplay";
import { cn } from "@/utils/utils";

// --- RoadmapPage Component ---
export default function RoadmapPage() {
  useSyncUser();
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const [parsedRoadmap, setParsedRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPaymentPlan, setShowPaymentPlan] = useState(false);

  const [weightedOverallProgress, setWeightedOverallProgress] =
    useState<number>(0);
  const [taskCountPercentageProgress, setTaskCountPercentageProgress] =
    useState<number>(0);

  const [openYearIndices, setOpenYearIndices] = useState<number[]>([]);
  const [updating, setUpdating] = useState<boolean>(false);
  const [similarUsers, setSimilarUsers] = useState<any[]>([]);
  const [desiredCareer, setDesiredCareer] = useState<string>("");
  const [userCountryCode, setUserCountryCode] = useState<string | null>(null);

  const dashboardLinks = [
    { href: "/dashboard", label: "Renew" },
    { href: "/events", label: "Events" },
    { href: "/analytics", label: "User Analysis" },
    { href: "/jobs", label: "Jobs" },
  ];

  function cleanJSONString(jsonString: string): string {
    try {
      JSON.parse(jsonString);
      return jsonString;
    } catch (e) {
      console.warn("Initial JSON parsing failed, attempting to clean...");
      try {
        let cleaned = jsonString
          .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
          .replace(/\\n/g, "\\n")
          .replace(/\\r/g, "\\r")
          .replace(/\\t/g, "\\t")
          .replace(/\\b/g, "\\b")
          .replace(/\\f/g, "\\f")
          .replace(/\uFEFF/g, "")
          .replace(/\u200B/g, "")
          .replace(/[\u2028\u2029]/g, "");
        cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");
        JSON.parse(cleaned);
        console.log("JSON cleaned successfully.");
        return cleaned;
      } catch (cleanError) {
        console.error(
          "Error during JSON cleaning or parsing cleaned string:",
          cleanError
        );
        console.error(
          "Problematic JSON string (first 2000 chars):",
          jsonString.substring(0, 2000)
        );
        return jsonString;
      }
    }
  }

  const handleTaskUpdate = useCallback((updatedRoadmapData: any) => {
    setParsedRoadmap(updatedRoadmapData);
    setWeightedOverallProgress(calculateWeightProgress(updatedRoadmapData));
    setTaskCountPercentageProgress(
      calculateTaskCountProgress(updatedRoadmapData).percentage
    );
  }, []);

  const fetchRoadmap = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    // Do NOT set setShowPaymentPlan(false) here, as it might cause a flicker
    // if the subscription is determined to be invalid immediately after.

    try {
      if (user) {
        const { data: userRecord, error: userError } = await supabase
          .from("users")
          .select("id, subscription_status, subscription_end")
          .eq("clerk_id", user.id)
          .single();

        if (userError || !userRecord) {
          console.error("Supabase user fetch error:", userError);
          setErrorMessage("User record not found or failed to fetch.");
          setLoading(false);
          return;
        }

        const {
          subscription_status,
          subscription_end,
          id: userId,
        } = userRecord;

        const { data: careerData, error: careerError } = await supabase
          .from("career_info")
          .select("roadmap, user_id, desired_career, residing_country")
          .eq("user_id", userId)
          .single();

        if (careerError || !careerData) {
          console.error("Supabase career_info fetch error:", careerError);
          setErrorMessage(
            "Error fetching roadmap details: " +
              (careerError?.message || "Not found")
          );
          setLoading(false);
          return;
        }

        setUserCountryCode(careerData.residing_country || null);

        const currentDate = new Date();
        const subscriptionEndDate = subscription_end
          ? new Date(subscription_end)
          : null;

        if (
          subscription_status !== true ||
          !subscriptionEndDate ||
          subscriptionEndDate < currentDate
        ) {
          console.log("Subscription invalid or expired.");
          setShowPaymentPlan(true); // <-- This is where the state is set to true
          setLoading(false);
          return; // <-- IMPORTANT: Exit immediately to prevent further roadmap processing
        }

        // If subscription is valid, proceed with roadmap parsing and display
        setShowPaymentPlan(false); // Ensure modal is hidden if subscription becomes valid

        if (!careerData.roadmap) {
          console.log("No roadmap data found for user:", userId);
          setErrorMessage(
            "No roadmap found. Please generate your roadmap first from the dashboard."
          );
          setLoading(false);
          return;
        }

        setDesiredCareer(careerData.desired_career || "Your Goal");

        try {
          const roadmapString =
            typeof careerData.roadmap === "string"
              ? careerData.roadmap
              : JSON.stringify(careerData.roadmap);

          const cleanedRoadmap = cleanJSONString(roadmapString);
          const parsed = JSON.parse(cleanedRoadmap);

          parsed.user_id = userId;

          if (
            !parsed ||
            typeof parsed !== "object" ||
            !Array.isArray(parsed.yearly_roadmap)
          ) {
            console.error("Invalid roadmap structure after parsing:", parsed);
            throw new Error(
              "Invalid roadmap structure. Try regenerating from dashboard."
            );
          }

          setParsedRoadmap(parsed);
          setWeightedOverallProgress(calculateWeightProgress(parsed));
          setTaskCountPercentageProgress(
            calculateTaskCountProgress(parsed).percentage
          );

          if (
            parsed.yearly_roadmap.length > 0 &&
            openYearIndices.length === 0
          ) {
            setOpenYearIndices([0]);
          }
        } catch (parseError: any) {
          console.error("Detailed JSON Parsing/Cleaning Error:", parseError);
          console.error(
            "Original Roadmap Data (first 2000 chars):",
            String(careerData.roadmap).substring(0, 2000)
          );
          setErrorMessage(
            `Failed to process roadmap data. Please try regenerating your roadmap from the dashboard. (Error: ${
              parseError.message || "Unknown parse error"
            })`
          );
        }
      } else {
        setErrorMessage("User data not available.");
      }
    } catch (err: any) {
      console.error("Unexpected Error in fetchRoadmap:", err);
      setErrorMessage(
        `An unexpected error occurred: ${
          err.message || "Please try again later."
        }`
      );
    } finally {
      setLoading(false);
    }
  }, [user, openYearIndices.length]);

  const toggleYear = useCallback((index: number) => {
    setOpenYearIndices((prev) => {
      const isOpening = !prev.includes(index);
      const next = isOpening
        ? [...prev, index]
        : prev.filter((i) => i !== index);
      return next;
    });
  }, []);

  const fetchSimilarUsers = useCallback(async () => {
    if (!user) return;
    console.log("Fetching similar users...");
    try {
      const response = await fetch("/api/get-similar-users");
      if (!response.ok) {
        console.error(
          "API response not OK for similar users:",
          response.status,
          response.statusText
        );
        return;
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setSimilarUsers(data);
      } else {
        console.warn("API response for similar users is not an array:", data);
        setSimilarUsers([]);
      }
    } catch (error) {
      console.error("Network or parsing error fetching similar users:", error);
      setSimilarUsers([]);
    }
  }, [user]);

  useEffect(() => {
    if (!parsedRoadmap) return;
    const next = parsedRoadmap.yearly_roadmap.findIndex(
      (y: any) => !isYearComplete(y)
    );
    if (next !== -1 && !openYearIndices.includes(next)) {
      setOpenYearIndices((prev) => [...prev, next]);
    }
  }, [parsedRoadmap, openYearIndices]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    } else if (isLoaded && isSignedIn && user) {
      // Only fetch roadmap if it hasn't been fetched AND we're not already showing the payment plan
      if (!parsedRoadmap && !showPaymentPlan) {
        // IMPORTANT CHANGE HERE
        fetchRoadmap();
      }
      if (similarUsers.length === 0) {
        fetchSimilarUsers();
      }
    } else if (!isLoaded) {
      setLoading(true);
    }
  }, [
    isLoaded,
    isSignedIn,
    user,
    router,
    fetchRoadmap,
    fetchSimilarUsers,
    parsedRoadmap,
    similarUsers.length,
    showPaymentPlan, // IMPORTANT: Add showPaymentPlan to dependencies
  ]);

  // --- Render Logic ---
  if (loading && !parsedRoadmap && !errorMessage) {
    return (
      <div className="flex justify-center items-center min-h-screen text-black">
        Loading Roadmap...
      </div>
    );
  }

  if (showPaymentPlan && user?.id) {
    const subcontinentCountryCodes = ["IN", "PK", "BD"];
    const isSubcontinentUser =
      userCountryCode &&
      subcontinentCountryCodes.includes(userCountryCode.toUpperCase());

    return isSubcontinentUser ? (
      <PaymentPlan
        clerk_id={user.id}
        onSuccess={() => window.location.reload()}
        message="Your subscription has expired or is inactive. Please choose a plan to continue accessing your roadmap."
      />
    ) : (
      <USDPaymentPlan
        clerk_id={user.id}
        onSuccess={() => window.location.reload()}
        message="Your subscription has expired or is inactive. Please choose a plan to continue accessing your roadmap."
      />
    );
  }

  const img_ = [
    {
      image:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1744966691/kid1_xkapd9.jpg",
    },
    {
      image:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1744966689/kid2_imcmyf.jpg",
    },
    {
      image:
        "https://res.cloudinary.com/ditn9req1/image/upload/v1744966693/kid3_ajkhfl.jpg",
    },
  ];

  return (
    <div className="relative min-h-screen bg-white md:bg-white flex flex-col pt-20 md:pt-24">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:30px_30px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]"
        )}
      />

      {/* Radial gradient overlay for faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

      {/* Your content */}
      <div className="relative z-10">
        <FloatingNavbar navLinks={dashboardLinks} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-48 mt-8 md:mt-12 flex-grow">
          {/* The updating overlay remains in its current fixed position */}
          {updating && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-6 w-6 text-orange-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-lg text-black font-semibold">
                  Updating roadmap with AI...
                </p>
              </div>
            </div>
          )}

          {/* Main content wrapper for title, peers, and progress bar */}
          {parsedRoadmap && (
            <>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 md:mb-8 lg:mb-8 px-0 md:px-4 lg:px-8 xl:px-12">
                {/* Your Career Roadmap Title - Takes up available space (flex-grow) */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl text-black font-bold text-center sm:text-left mb-4 sm:mb-0 sm:mr-4 flex-grow">
                  Your <span className="text-[#FF6500]">Career</span> Roadmap
                </h1>

                {/* Peers on Your Path - Aligned to the right on larger screens */}
                <div className="flex-shrink-0 text-center sm:text-right">
                  {" "}
                  {/* Added flex-shrink-0 */}
                  <h2 className="text-lg md:text-xl mb-4 text-black font-extralight">
                    Peers on Your Path
                  </h2>
                  <div className="flex flex-wrap justify-center sm:justify-end">
                    {" "}
                    {/* Changed sm:justify-start to sm:justify-end */}
                    {similarUsers.length > 0 && img_.length > 0 ? (
                      <AnimatedTooltip
                        items={similarUsers.map((u, index) => ({
                          id: u?.id ?? index,
                          name: u?.name ?? "N/A",
                          designation: u?.designation ?? "Unknown Role",
                          image: img_[index % img_.length].image,
                        }))}
                      />
                    ) : (
                      <p className="text-black text-sm md:text-base">
                        Looking for peers with a similar path...
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar - Always below the above row */}
              <div className="mb-8 md:mb-12 px-0 md:px-6 lg:px-10 xl:px-16">
                <h2 className="text-lg md:text-xl mb-3 md:mb-4 text-black font-thin">
                  Overall Task Completion
                </h2>
                <ProgressBar progress={taskCountPercentageProgress} />
              </div>

              {/* Desired Career - Positioned below the progress bar or wherever you prefer */}
              <div className="text-center mb-8 md:mb-12">
                <span className="font-extrabold text-[#FF6500] text-2xl md:text-3xl">
                  {desiredCareer}
                </span>
              </div>
            </>
          )}

          {parsedRoadmap ? (
            <div className="p-0 md:p-4 lg:p-8 xl:p-12">
              <RoadmapDisplay
                roadmapData={parsedRoadmap}
                onTaskUpdate={handleTaskUpdate}
                openYearIndices={openYearIndices}
                toggleYear={toggleYear}
              />
            </div>
          ) : !loading && errorMessage ? (
            <div className="bg-white p-4 md:p-6 rounded-md shadow-md text-center">
              <p className="text-red-600 font-semibold">{errorMessage}</p>
              {(errorMessage.includes("generate") ||
                errorMessage.includes("regenerating")) && (
                <button
                  onClick={() => router.push("/dashboard")}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Go to Dashboard
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
