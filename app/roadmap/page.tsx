// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import { supabase } from "@/utils/supabase/supabaseClient";
// import { useSyncUser } from "@/app/hooks/sync-user";
// import PaymentPlan from "@/components/PaymentPlan";
// import FloatingNavbar from "@/components/Navbar";
// import ProgressBar from "@/components/ProgressBar";
// // Import your updated utility functions
// import { calculateTaskCountProgress } from "@/utils/calcTaskCountProgress"; 
// import { calculateWeightProgress } from "@/utils/calcWeightProgress"; 
// import { AnimatedTooltip } from "@/components/ui/AnimatedTooltip";
// import USDPaymentPlan from "@/components/USDPaymentPlan";
// import RoadmapDisplay from "@/components/RoadmapDisplay";

// // --- RoadmapPage Component ---
// export default function RoadmapPage() {
//   useSyncUser();
//   const { user, isSignedIn, isLoaded } = useUser();
//   const router = useRouter();

//   const [parsedRoadmap, setParsedRoadmap] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const [showPaymentPlan, setShowPaymentPlan] = useState(false);
  
//   // State for weighted progress (for potential use or analytics page context)
//   const [weightedOverallProgress, setWeightedOverallProgress] = useState<number>(0); 
//   // State for count-based percentage progress (for the main roadmap page progress bar)
//   const [taskCountPercentageProgress, setTaskCountPercentageProgress] = useState<number>(0);

//   const [openYearIndices, setOpenYearIndices] = useState<number[]>([]);
//   const [updating, setUpdating] = useState<boolean>(false);
//   const [similarUsers, setSimilarUsers] = useState<any[]>([]);
//   const [desiredCareer, setDesiredCareer] = useState<string>("");
//   const [userCountryCode, setUserCountryCode] = useState<string | null>(null);

//   const dashboardLinks = [
//     { href: "/dashboard", label: "Renew" },
//     { href: "/events", label: "Events" },
//     { href: "/analytics", label: "User Analysis" },
//     { href: "/jobs", label: "Jobs" },
//   ];

//   function cleanJSONString(jsonString: string): string {
//     try {
//         JSON.parse(jsonString);
//         return jsonString; 
//     } catch (e) {
//         console.warn("Initial JSON parsing failed, attempting to clean...");
//         try {
//             let cleaned = jsonString
//                 .replace(/[\x00-\x1F\x7F-\x9F]/g, "") 
//                 .replace(/\\n/g, "\\n") 
//                 .replace(/\\r/g, "\\r")
//                 .replace(/\\t/g, "\\t")
//                 .replace(/\\b/g, "\\b")
//                 .replace(/\\f/g, "\\f")
//                 .replace(/\uFEFF/g, '') 
//                 .replace(/\u200B/g, '') 
//                 .replace(/[\u2028\u2029]/g, "");
//             cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');
//             JSON.parse(cleaned);
//             console.log("JSON cleaned successfully.");
//             return cleaned;
//         } catch (cleanError) {
//             console.error("Error during JSON cleaning or parsing cleaned string:", cleanError);
//             console.error("Problematic JSON string (first 2000 chars):", jsonString.substring(0, 2000)); 
//             return jsonString; 
//         }
//     }
//   }
  
//   const handleTaskUpdate = useCallback((updatedRoadmapData: any) => {
//     setParsedRoadmap(updatedRoadmapData);
//     // Update weighted progress
//     setWeightedOverallProgress(calculateWeightProgress(updatedRoadmapData));
//     // Update count-based percentage progress using the percentage from your updated function
//     setTaskCountPercentageProgress(calculateTaskCountProgress(updatedRoadmapData).percentage);
//   }, []);

//   const fetchRoadmap = useCallback(async () => {
//     setLoading(true);
//     setErrorMessage(null);
//     setShowPaymentPlan(false);

//     try {
//       if (user) {
//         const { data: userRecord, error: userError } = await supabase
//           .from("users")
//           .select("id, subscription_status")      //add .select("id, subscription_status, subscription_end")
//           .eq("clerk_id", user.id)
//           .single();

//         if (userError || !userRecord) {
//           console.error("Supabase user fetch error:", userError);
//           setErrorMessage("User record not found or failed to fetch.");
//           setLoading(false);
//           return;
//         }

//         const {
//           subscription_status,
//           subscription_end,
//           id: userId,
//         } = userRecord;
        
//         const { data: careerData, error: careerError } = await supabase
//           .from("career_info")
//           .select("roadmap, user_id, desired_career, residing_country")
//           .eq("user_id", userId)
//           .single();

//         if (careerError || !careerData) {
//           console.error("Supabase career_info fetch error:", careerError);
//           setErrorMessage("Error fetching roadmap details: " + (careerError?.message || "Not found"));
//           setLoading(false);
//           return;
//         }
        
//         setUserCountryCode(careerData.residing_country || null);

//         const currentDate = new Date();
//         const subscriptionEndDate = subscription_end ? new Date(subscription_end) : null;

//         if (subscription_status !== true) {          //(!subscription_status || !subscriptionEndDate || subscriptionEndDate < currentDate)
//           console.log("Subscription invalid or expired.");
//           setShowPaymentPlan(true);
//           setLoading(false);
//           return;
//         }

//         if (!careerData.roadmap) {
//           console.log("No roadmap data found for user:", userId);
//           setErrorMessage("No roadmap found. Please generate your roadmap first from the dashboard.");
//           setLoading(false);
//           return;
//         }
        
//         setDesiredCareer(careerData.desired_career || "Your Goal");

//         try {
//           const roadmapString = typeof careerData.roadmap === 'string'
//             ? careerData.roadmap
//             : JSON.stringify(careerData.roadmap);
          
//           const cleanedRoadmap = cleanJSONString(roadmapString);
//           const parsed = JSON.parse(cleanedRoadmap);

//           parsed.user_id = userId; 

//           if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.yearly_roadmap)) {
//             console.error("Invalid roadmap structure after parsing:", parsed);
//             throw new Error("Invalid roadmap structure. Try regenerating from dashboard.");
//           }

//           setParsedRoadmap(parsed);
//           // Set initial weighted progress
//           setWeightedOverallProgress(calculateWeightProgress(parsed));
//           // Set initial count-based percentage progress using your updated function
//           setTaskCountPercentageProgress(calculateTaskCountProgress(parsed).percentage);

//           if (parsed.yearly_roadmap.length > 0 && openYearIndices.length === 0) {
//             setOpenYearIndices([0]); 
//           }
//         } catch (parseError: any) {
//           console.error("Detailed JSON Parsing/Cleaning Error:", parseError);
//           console.error("Original Roadmap Data (first 2000 chars):", String(careerData.roadmap).substring(0,2000));
//           setErrorMessage(
//             `Failed to process roadmap data. Please try regenerating your roadmap from the dashboard. (Error: ${parseError.message || 'Unknown parse error'})`
//           );
//         }
//       } else {
//         setErrorMessage("User data not available.");
//       }
//     } catch (err: any) {
//       console.error("Unexpected Error in fetchRoadmap:", err);
//       setErrorMessage(
//         `An unexpected error occurred: ${err.message || "Please try again later."}`
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [user, openYearIndices.length]);

//   const toggleYear = (index: number) => {
//     setOpenYearIndices((prev) => {
//       const newOpenIndices = prev.includes(index)
//         ? prev.filter((i) => i !== index)
//         : [...prev, index];
//       return newOpenIndices;
//     });
//   };

//   const refreshFutureRoadmap = async () => {
//     if (!parsedRoadmap?.user_id) {
//       console.error("Cannot refresh roadmap, user_id not available.");
//       setErrorMessage("User information is missing, cannot refresh.");
//       return;
//     }
//     setUpdating(true);
//     try {
//       const res = await fetch("/api/update-user-roadmap", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ user_id: parsedRoadmap.user_id }),
//       });

//       if (!res.ok) {
//         const errorData = await res.json().catch(() => ({ message: 'Failed to parse error response' }));
//         throw new Error(`Failed to refresh roadmap: ${res.status} ${res.statusText}. ${errorData.message || ''}`);
//       }
//       await fetchRoadmap(); 
//     } catch (err: any) {
//       console.error("Error refreshing future roadmap:", err);
//       setErrorMessage(`Error refreshing roadmap: ${err.message || 'Unknown error'}`);
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const fetchSimilarUsers = useCallback(async () => {
//     if(!user) return; 
//     console.log("Fetching similar users...");
//     try {
//       const response = await fetch("/api/get-similar-users"); 
//       if (!response.ok) {
//         console.error("API response not OK for similar users:", response.status, response.statusText);
//         return;
//       }
//       const data = await response.json();
//       if (Array.isArray(data)) {
//         setSimilarUsers(data);
//       } else {
//         console.warn("API response for similar users is not an array:", data);
//         setSimilarUsers([]);
//       }
//     } catch (error) {
//       console.error("Network or parsing error fetching similar users:", error);
//       setSimilarUsers([]);
//     }
//   }, [user]); 

//   useEffect(() => {
//     if (isLoaded && !isSignedIn) {
//       router.push("/");
//     } else if (isLoaded && isSignedIn && user) {
//       // These fetch calls are memoized with useCallback, 
//       // so they will only re-run if their own dependencies change (e.g., user).
//       // Additional checks prevent re-fetching if data is already present.
//       if (!parsedRoadmap) { 
//         fetchRoadmap();
//       }
//       if (similarUsers.length === 0) { 
//         fetchSimilarUsers();
//       }
//     } else if (!isLoaded) {
//       setLoading(true); 
//     }
//   }, [isLoaded, isSignedIn, user, router, fetchRoadmap, fetchSimilarUsers, parsedRoadmap, similarUsers.length]);


//   // --- Render Logic ---
//   if (loading && !parsedRoadmap && !errorMessage) { 
//     return <div className="flex justify-center items-center min-h-screen text-black">Loading Roadmap...</div>;
//   }

//   if (showPaymentPlan && user?.id) {
//     const subcontinentCountryCodes = ["IN", "PK", "BD"]; 
//     const isSubcontinentUser = userCountryCode && 
//       subcontinentCountryCodes.includes(userCountryCode.toUpperCase());

//     return isSubcontinentUser ? (
//       <PaymentPlan
//         clerk_id={user.id}
//         onSuccess={() => window.location.reload()}
//         message="Your subscription has expired or is inactive. Please choose a plan to continue accessing your roadmap."
//       />
//     ) : (
//       <USDPaymentPlan
//         clerk_id={user.id}
//         onSuccess={() => window.location.reload()}
//         message="Your subscription has expired or is inactive. Please choose a plan to continue accessing your roadmap."
//       />
//     );
//   }
  
//   const img_ = [
//     { image: "https://res.cloudinary.com/ditn9req1/image/upload/v1744966691/kid1_xkapd9.jpg" },
//     { image: "https://res.cloudinary.com/ditn9req1/image/upload/v1744966689/kid2_imcmyf.jpg" },
//     { image: "https://res.cloudinary.com/ditn9req1/image/upload/v1744966693/kid3_ajkhfl.jpg" },
//   ];

//   return (
//     <div className="min-h-screen bg-[#f8fcf7] md:bg-[#fafff9] flex flex-col pt-20 md:pt-24">
//       <FloatingNavbar navLinks={dashboardLinks} />
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-48 mt-8 md:mt-12 flex-grow">
//         {/* TEST BUTTON - Added at the top for API testing */}
//         {parsedRoadmap && (
//           <div className="mb-6 flex justify-center">
//             <button
//               onClick={refreshFutureRoadmap}
//               disabled={updating}
//               className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all flex items-center justify-center"
//             >
//               {updating ? (
//                 <>
//                   <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Testing AI Update...
//                 </>
//               ) : (
//                 <>
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                   </svg>
//                   Test API: Update Roadmap with AI
//                 </>
//               )}
//             </button>
//           </div>
//         )}

//         <h1 className="text-3xl sm:text-4xl lg:text-5xl text-black font-bold mb-8 md:mb-12 lg:mb-16 text-center sm:text-left">
//           Your <span className="text-[#FF6500]">Career</span> Roadmap
//         </h1>

//         {updating && (
//           <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//             <div className="bg-white p-6 rounded-lg shadow-xl flex items-center">
//               <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//               <p className="text-lg text-black font-semibold">Updating roadmap with AI...</p>
//             </div>
//           </div>
//         )}

//         {parsedRoadmap && (
//         <>
//             <div className="mb-8 md:mb-10">
//               <h2 className="text-lg md:text-xl mb-3 md:mb-4 text-black font-semibold">Overall Task Completion</h2>
//               {/* Use the count-based percentage progress for this bar on the roadmap page */}
//               <ProgressBar progress={taskCountPercentageProgress} /> 
//             </div>

//             {/* For your analytics page, you would use weightedOverallProgress. 
//               Example of how you might display it if needed on this page:
//             */}
//             {/* <div className="mb-8 md:mb-10">
//               <h2 className="text-lg md:text-xl mb-3 md:mb-4 text-black font-semibold">Likelihood to Achieve Goal (Weighted)</h2>
//               <ProgressBar progress={weightedOverallProgress} />
//             </div> 
//             */}

//             <div className="mb-10 md:mb-12 mt-8 md:mt-16">
//               <h2 className="text-lg md:text-xl mb-4 text-black font-semibold">
//                 Peers on Your Path
//               </h2>
//               <div className="flex flex-wrap justify-center sm:justify-start">
//                 {similarUsers.length > 0 && img_.length > 0 ? ( 
//                   <AnimatedTooltip
//                     items={similarUsers.map((u, index) => ({
//                       id: u?.id ?? index, 
//                       name: u?.name ?? 'N/A',
//                       designation: u?.designation ?? 'Unknown Role',
//                       image: img_[index % img_.length].image, 
//                     }))}
//                   />
//                 ) : (
//                   <p className="text-black text-sm md:text-base"> 
//                     Looking for peers with a similar path...
//                   </p>
//                 )}
//               </div>
//             </div>

//             <div className="text-center mb-8 md:mb-12">
//               <span className="font-extrabold text-[#FF6500] text-2xl md:text-3xl">{desiredCareer}</span>
//             </div>
//         </>
//         )}

//         {parsedRoadmap ? (
//           <div className="p-0 md:p-4 lg:p-8 xl:p-12">
//             <RoadmapDisplay
//               roadmapData={parsedRoadmap}
//               onTaskUpdate={handleTaskUpdate} 
//               openYearIndices={openYearIndices}
//               toggleYear={toggleYear}
//             />
//           </div>
//         ) : !loading && errorMessage ? ( 
//           <div className="bg-white p-4 md:p-6 rounded-md shadow-md text-center">
//             <p className="text-red-600 font-semibold">
//               {errorMessage}
//             </p>
//             {(errorMessage.includes("generate") || errorMessage.includes("regenerating")) && (
//               <button
//                 onClick={() => router.push('/dashboard')} 
//                 className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//               >
//                 Go to Dashboard
//               </button>
//             )}
//           </div>
//         ) : null}
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useSyncUser } from "@/app/hooks/sync-user";
import PaymentPlan from "@/components/PaymentPlan";
import FloatingNavbar from "@/components/Navbar";
import ProgressBar from "@/components/ProgressBar";
// Import your updated utility functions
import { calculateTaskCountProgress } from "@/utils/calcTaskCountProgress"; 
import { calculateWeightProgress } from "@/utils/calcWeightProgress"; 
import { AnimatedTooltip } from "@/components/ui/AnimatedTooltip";
import { isYearComplete } from "@/components/RoadmapDisplay";
import USDPaymentPlan from "@/components/USDPaymentPlan";
import RoadmapDisplay from "@/components/RoadmapDisplay";

// --- RoadmapPage Component ---
export default function RoadmapPage() {
  useSyncUser();
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const [parsedRoadmap, setParsedRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPaymentPlan, setShowPaymentPlan] = useState(false);
  
  // State for weighted progress (for potential use or analytics page context)
  const [weightedOverallProgress, setWeightedOverallProgress] = useState<number>(0); 
  // State for count-based percentage progress (for the main roadmap page progress bar)
  const [taskCountPercentageProgress, setTaskCountPercentageProgress] = useState<number>(0);

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
                .replace(/\uFEFF/g, '') 
                .replace(/\u200B/g, '') 
                .replace(/[\u2028\u2029]/g, "");
            cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');
            JSON.parse(cleaned);
            console.log("JSON cleaned successfully.");
            return cleaned;
        } catch (cleanError) {
            console.error("Error during JSON cleaning or parsing cleaned string:", cleanError);
            console.error("Problematic JSON string (first 2000 chars):", jsonString.substring(0, 2000)); 
            return jsonString; 
        }
    }
  }
  const handleTaskUpdate = useCallback((updatedRoadmapData: any) => {
    setParsedRoadmap(updatedRoadmapData);
    // Update weighted progress
    setWeightedOverallProgress(calculateWeightProgress(updatedRoadmapData));
    // Update count-based percentage progress using the percentage from your updated function
    setTaskCountPercentageProgress(calculateTaskCountProgress(updatedRoadmapData).percentage);
  }, []);

  const fetchRoadmap = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    setShowPaymentPlan(false);

    try {
      if (user) {
        const { data: userRecord, error: userError } = await supabase
          .from("users")
          .select("id, subscription_status")      //add .select("id, subscription_status, subscription_end")
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
          setErrorMessage("Error fetching roadmap details: " + (careerError?.message || "Not found"));
          setLoading(false);
          return;
        }
        
        setUserCountryCode(careerData.residing_country || null);

        const currentDate = new Date();
        const subscriptionEndDate = subscription_end ? new Date(subscription_end) : null;

        if (subscription_status !== true) {          //(!subscription_status || !subscriptionEndDate || subscriptionEndDate < currentDate)
          console.log("Subscription invalid or expired.");
          setShowPaymentPlan(true);
          setLoading(false);
          return;
        }

        if (!careerData.roadmap) {
          console.log("No roadmap data found for user:", userId);
          setErrorMessage("No roadmap found. Please generate your roadmap first from the dashboard.");
          setLoading(false);
          return;
        }
        
        setDesiredCareer(careerData.desired_career || "Your Goal");

        try {
          const roadmapString = typeof careerData.roadmap === 'string'
            ? careerData.roadmap
            : JSON.stringify(careerData.roadmap);
          
          const cleanedRoadmap = cleanJSONString(roadmapString);
          const parsed = JSON.parse(cleanedRoadmap);

          parsed.user_id = userId; 

          if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.yearly_roadmap)) {
            console.error("Invalid roadmap structure after parsing:", parsed);
            throw new Error("Invalid roadmap structure. Try regenerating from dashboard.");
          }

          setParsedRoadmap(parsed);
          // Set initial weighted progress
          setWeightedOverallProgress(calculateWeightProgress(parsed));
          // Set initial count-based percentage progress using your updated function
          setTaskCountPercentageProgress(calculateTaskCountProgress(parsed).percentage);

          if (parsed.yearly_roadmap.length > 0 && openYearIndices.length === 0) {
            setOpenYearIndices([0]); 
          }
        } catch (parseError: any) {
          console.error("Detailed JSON Parsing/Cleaning Error:", parseError);
          console.error("Original Roadmap Data (first 2000 chars):", String(careerData.roadmap).substring(0,2000));
          setErrorMessage(
            `Failed to process roadmap data. Please try regenerating your roadmap from the dashboard. (Error: ${parseError.message || 'Unknown parse error'})`
          );
        }
      } else {
        setErrorMessage("User data not available.");
      }
    } catch (err: any) {
      console.error("Unexpected Error in fetchRoadmap:", err);
      setErrorMessage(
        `An unexpected error occurred: ${err.message || "Please try again later."}`
      );
    } finally {
      setLoading(false);
    }
  }, [user, openYearIndices.length]);

  /**
   * 1) Batch-fetch fresh video info for tasks that already have a `video` object
   */
    const toggleYear = useCallback((index: number) => {
    setOpenYearIndices(prev => {
      const isOpening = !prev.includes(index);
      const next = isOpening ? [...prev, index] : prev.filter(i => i !== index);
      return next;
    });
  }, []);

  const refreshFutureRoadmap = async () => {
    if (!parsedRoadmap?.user_id) {
      console.error("Cannot refresh roadmap, user_id not available.");
      setErrorMessage("User information is missing, cannot refresh.");
      return;
    }
    setUpdating(true);
    try {
      const res = await fetch("/api/update-user-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: parsedRoadmap.user_id }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to parse error response' }));
        throw new Error(`Failed to refresh roadmap: ${res.status} ${res.statusText}. ${errorData.message || ''}`);
      }
      await fetchRoadmap(); 
    } catch (err: any) {
      console.error("Error refreshing future roadmap:", err);
      setErrorMessage(`Error refreshing roadmap: ${err.message || 'Unknown error'}`);
    } finally {
      setUpdating(false);
    }
  };

  const fetchSimilarUsers = useCallback(async () => {
    if(!user) return; 
    console.log("Fetching similar users...");
    try {
      const response = await fetch("/api/get-similar-users"); 
      if (!response.ok) {
        console.error("API response not OK for similar users:", response.status, response.statusText);
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
    const next = parsedRoadmap.yearly_roadmap.findIndex((y: any) => !isYearComplete(y));
    if (next !== -1 && !openYearIndices.includes(next)) {
      setOpenYearIndices(prev => [...prev, next]);
    }
  }, [parsedRoadmap, openYearIndices]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    } else if (isLoaded && isSignedIn && user) {
      // These fetch calls are memoized with useCallback, 
      // so they will only re-run if their own dependencies change (e.g., `user`).
      // Additional checks prevent re-fetching if data is already present.
      if (!parsedRoadmap) { 
        fetchRoadmap();
      }
      if (similarUsers.length === 0) { 
        fetchSimilarUsers();
      }
    } else if (!isLoaded) {
      setLoading(true); 
    }
  }, [isLoaded, isSignedIn, user, router, fetchRoadmap, fetchSimilarUsers, parsedRoadmap, similarUsers.length]);


  // --- Render Logic ---
  if (loading && !parsedRoadmap && !errorMessage) { 
    return <div className="flex justify-center items-center min-h-screen text-black">Loading Roadmap...</div>;
  }

  if (showPaymentPlan && user?.id) {
    const subcontinentCountryCodes = ["IN", "PK", "BD"]; 
    const isSubcontinentUser = userCountryCode && 
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
    { image: "https://res.cloudinary.com/ditn9req1/image/upload/v1744966691/kid1_xkapd9.jpg" },
    { image: "https://res.cloudinary.com/ditn9req1/image/upload/v1744966689/kid2_imcmyf.jpg" },
    { image: "https://res.cloudinary.com/ditn9req1/image/upload/v1744966693/kid3_ajkhfl.jpg" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fcf7] md:bg-[#fafff9] flex flex-col pt-20 md:pt-24">
      <FloatingNavbar navLinks={dashboardLinks} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-48 mt-8 md:mt-12 flex-grow">
        {/* TEST BUTTON - Added at the top for API testing  */}
        {/* {parsedRoadmap && (
          <div className="mb-6 flex justify-center">
            <button
              onClick={refreshFutureRoadmap}
              disabled={updating}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all flex items-center justify-center"
            >
              {updating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Testing AI Update...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Test API: Update Roadmap with AI
                </>
              )}
            </button>
          </div>
        )} */}

        <h1 className="text-3xl sm:text-4xl lg:text-5xl text-black font-bold mb-8 md:mb-12 lg:mb-16 text-center sm:text-left">
          Your <span className="text-[#FF6500]">Career</span> Roadmap
        </h1>

        {updating && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg text-black font-semibold">Updating roadmap with AI...</p>
            </div>
          </div>
        )}

        {parsedRoadmap && (
        <>
            <div className="mb-8 md:mb-10">
              <h2 className="text-lg md:text-xl mb-3 md:mb-4 text-black font-semibold">Overall Task Completion</h2>
              {/* Use the count-based percentage progress for this bar on the roadmap page */}
              <ProgressBar progress={taskCountPercentageProgress} /> 
            </div>

            {/* For your analytics page, you would use `weightedOverallProgress`. 
              Example of how you might display it if needed on this page:
            */}
            {/* <div className="mb-8 md:mb-10">
              <h2 className="text-lg md:text-xl mb-3 md:mb-4 text-black font-semibold">Likelihood to Achieve Goal (Weighted)</h2>
              <ProgressBar progress={weightedOverallProgress} />
            </div> 
            */}

            <div className="mb-10 md:mb-12 mt-8 md:mt-16">
              <h2 className="text-lg md:text-xl mb-4 text-black font-semibold">
                Peers on Your Path
              </h2>
              <div className="flex flex-wrap justify-center sm:justify-start">
                {similarUsers.length > 0 && img_.length > 0 ? ( 
                  <AnimatedTooltip
                    items={similarUsers.map((u, index) => ({
                      id: u?.id ?? index, 
                      name: u?.name ?? 'N/A',
                      designation: u?.designation ?? 'Unknown Role',
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

            <div className="text-center mb-8 md:mb-12">
              <span className="font-extrabold text-[#FF6500] text-2xl md:text-3xl">{desiredCareer}</span>
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
            <p className="text-red-600 font-semibold">
              {errorMessage}
            </p>
            {(errorMessage.includes("generate") || errorMessage.includes("regenerating")) && (
              <button
                onClick={() => router.push('/dashboard')} 
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}