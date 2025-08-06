
// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import Head from "next/head";
// import { supabase } from "@/utils/supabase/supabaseClient";
// import { useSyncUser } from "@/app/hooks/sync-user";
// import PaymentPlan from "@/components/PaymentPlan";
// import FloatingNavbar from "@/components/Navbar";
// import ProgressBar from "@/components/ProgressBar";
// import { calculateTaskCountProgress } from "@/utils/calcTaskCountProgress";
// import { calculateWeightProgress } from "@/utils/calcWeightProgress";
// import { AnimatedTooltip } from "@/components/ui/AnimatedTooltip";
// import { isYearComplete } from "@/components/RoadmapDisplay";
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

//   const [weightedOverallProgress, setWeightedOverallProgress] =
//     useState<number>(0);
//   const [taskCountPercentageProgress, setTaskCountPercentageProgress] =
//     useState<number>(0);

//   const [openYearIndices, setOpenYearIndices] = useState<number[]>([]);
//   const [updating, setUpdating] = useState<boolean>(false);
//   const [similarUsers, setSimilarUsers] = useState<any[]>([]);
//   const [desiredCareer, setDesiredCareer] = useState<string>("");
//   const [userCountryCode, setUserCountryCode] = useState<string | null>(null);

//   const dashboardLinks = [
//     { href: "/dashboard", label: "Renew" },
//     { href: "/events", label: "Events" },
//     { href: "/analytics", label: "User Analysis" },
//   ];

//   // SEO Meta Data
//   const seoData = {
//     title: desiredCareer
//       ? `${desiredCareer} Career Roadmap | AI-Powered Career Planning`
//       : "AI Career Roadmap Generator | Personalized Career Planning with AI",
//     description: desiredCareer
//       ? `Get your personalized ${desiredCareer} career roadmap with AI-powered guidance. Track progress, connect with peers, and achieve your career goals with step-by-step planning.`
//       : "Generate personalized career roadmaps for any profession using state-of-the-art AI. Traditional and unorthodox career paths with detailed planning, progress tracking, and peer connections.",
//     keywords: [
//       "career roadmap",
//       "AI career planning",
//       "career development",
//       "professional growth",
//       "career guidance",
//       "job planning",
//       "career tracker",
//       "skill development",
//       "career path",
//       "professional roadmap",
//       desiredCareer ? `${desiredCareer} career` : "career planning",
//       "AI-powered careers",
//       "career progress tracking",
//       "personalized career advice",
//     ]
//       .filter(Boolean)
//       .join(", "),
//     url: "https://careeroadmap.com/roadmap",
//     ogImage: "https://careeroadmap.com/og-roadmap.png",
//   };

//   // Structured Data for SEO
//   const structuredData = {
//     "@context": "https://schema.org",
//     "@type": "WebApplication",
//     name: "AI Career Roadmap Generator",
//     applicationCategory: "EducationalApplication",
//     description: seoData.description,
//     url: seoData.url,
//     operatingSystem: "Web Browser",
//     offers: {
//       "@type": "Offer",
//       category: "Career Development",
//       availability: "https://schema.org/InStock",
//     },
//     featureList: [
//       "AI-powered career roadmap generation",
//       "Progress tracking and analytics",
//       "Peer networking and connections",
//       "Personalized career guidance",
//       "Traditional and unorthodox career paths",
//     ],
//     author: {
//       "@type": "Organization",
//       name: "Careeroadmap",
//     },
//   };

//   function cleanJSONString(jsonString: string): string {
//     try {
//       JSON.parse(jsonString);
//       return jsonString;
//     } catch (e) {
//       console.warn("Initial JSON parsing failed, attempting to clean...");
//       try {
//         let cleaned = jsonString
//           .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
//           .replace(/\\n/g, "\\n")
//           .replace(/\\r/g, "\\r")
//           .replace(/\\t/g, "\\t")
//           .replace(/\\b/g, "\\b")
//           .replace(/\\f/g, "\\f")
//           .replace(/\uFEFF/g, "")
//           .replace(/\u200B/g, "")
//           .replace(/[\u2028\u2029]/g, "");
//         cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");
//         JSON.parse(cleaned);
//         console.log("JSON cleaned successfully.");
//         return cleaned;
//       } catch (cleanError) {
//         console.error(
//           "Error during JSON cleaning or parsing cleaned string:",
//           cleanError
//         );
//         console.error(
//           "Problematic JSON string (first 2000 chars):",
//           jsonString.substring(0, 2000)
//         );
//         return jsonString;
//       }
//     }
//   }

//   const handleTaskUpdate = useCallback((updatedRoadmapData: any) => {
//     setParsedRoadmap(updatedRoadmapData);
//     setWeightedOverallProgress(calculateWeightProgress(updatedRoadmapData));
//     setTaskCountPercentageProgress(
//       calculateTaskCountProgress(updatedRoadmapData).percentage
//     );
//   }, []);

//   const fetchRoadmap = useCallback(async () => {
//     setLoading(true);
//     setErrorMessage(null);

//     try {
//       if (user) {
//         const { data: userRecord, error: userError } = await supabase
//           .from("users")
//           .select("id, subscription_status, subscription_end")
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
//           setErrorMessage(
//             "Error fetching roadmap details: " +
//               (careerError?.message || "Not found")
//           );
//           setLoading(false);
//           return;
//         }

//         setUserCountryCode(careerData.residing_country || null);

//         const currentDate = new Date();
//         const subscriptionEndDate = subscription_end
//           ? new Date(subscription_end)
//           : null;

//         if (
//           subscription_status !== true ||
//           !subscriptionEndDate ||
//           subscriptionEndDate < currentDate
//         ) {
//           console.log("Subscription invalid or expired.");
//           setShowPaymentPlan(true);
//           setLoading(false);
//           return;
//         }

//         setShowPaymentPlan(false);

//         if (!careerData.roadmap) {
//           console.log("No roadmap data found for user:", userId);
//           setErrorMessage(
//             "No roadmap found. Please generate your roadmap first from the dashboard."
//           );
//           setLoading(false);
//           return;
//         }

//         setDesiredCareer(careerData.desired_career || "Your Goal");

//         try {
//           const roadmapString =
//             typeof careerData.roadmap === "string"
//               ? careerData.roadmap
//               : JSON.stringify(careerData.roadmap);

//           const cleanedRoadmap = cleanJSONString(roadmapString);
//           const parsed = JSON.parse(cleanedRoadmap);

//           parsed.user_id = userId;

//           if (
//             !parsed ||
//             typeof parsed !== "object" ||
//             !Array.isArray(parsed.yearly_roadmap)
//           ) {
//             console.error("Invalid roadmap structure after parsing:", parsed);
//             throw new Error(
//               "Invalid roadmap structure. Try regenerating from dashboard."
//             );
//           }

//           setParsedRoadmap(parsed);
//           setWeightedOverallProgress(calculateWeightProgress(parsed));
//           setTaskCountPercentageProgress(
//             calculateTaskCountProgress(parsed).percentage
//           );

//           if (
//             parsed.yearly_roadmap.length > 0 &&
//             openYearIndices.length === 0
//           ) {
//             setOpenYearIndices([0]);
//           }
//         } catch (parseError: any) {
//           console.error("Detailed JSON Parsing/Cleaning Error:", parseError);
//           console.error(
//             "Original Roadmap Data (first 2000 chars):",
//             String(careerData.roadmap).substring(0, 2000)
//           );
//           setErrorMessage(
//             `Failed to process roadmap data. Please try regenerating your roadmap from the dashboard. (Error: ${
//               parseError.message || "Unknown parse error"
//             })`
//           );
//         }
//       } else {
//         setErrorMessage("User data not available.");
//       }
//     } catch (err: any) {
//       console.error("Unexpected Error in fetchRoadmap:", err);
//       setErrorMessage(
//         `An unexpected error occurred: ${
//           err.message || "Please try again later."
//         }`
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [user, openYearIndices.length]);

//   const toggleYear = useCallback((index: number) => {
//     setOpenYearIndices((prev) => {
//       const isOpening = !prev.includes(index);
//       const next = isOpening
//         ? [...prev, index]
//         : prev.filter((i) => i !== index);
//       return next;
//     });
//   }, []);

//   const fetchSimilarUsers = useCallback(async () => {
//     if (!user) return;
//     console.log("Fetching similar users...");
//     try {
//       const response = await fetch("/api/get-similar-users");
//       if (!response.ok) {
//         console.error(
//           "API response not OK for similar users:",
//           response.status,
//           response.statusText
//         );
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
//     if (!parsedRoadmap) return;
//     const next = parsedRoadmap.yearly_roadmap.findIndex(
//       (y: any) => !isYearComplete(y)
//     );
//     if (next !== -1 && !openYearIndices.includes(next)) {
//       setOpenYearIndices((prev) => [...prev, next]);
//     }
//   }, [parsedRoadmap, openYearIndices]);

//   useEffect(() => {
//     if (isLoaded && !isSignedIn) {
//       router.push("/");
//     } else if (isLoaded && isSignedIn && user) {
//       if (!parsedRoadmap && !showPaymentPlan) {
//         fetchRoadmap();
//       }
//       if (similarUsers.length === 0) {
//         fetchSimilarUsers();
//       }
//     } else if (!isLoaded) {
//       setLoading(true);
//     }
//   }, [
//     isLoaded,
//     isSignedIn,
//     user,
//     router,
//     fetchRoadmap,
//     fetchSimilarUsers,
//     parsedRoadmap,
//     similarUsers.length,
//     showPaymentPlan,
//   ]);

//   // --- Render Logic ---
//   if (loading && !parsedRoadmap && !errorMessage) {
//     return (
//       <>
//         <Head>
//           <title>Loading Career Roadmap | AI Career Planning</title>
//           <meta
//             name="description"
//             content="Loading your personalized AI-generated career roadmap..."
//           />
//           <meta name="robots" content="noindex, nofollow" />
//         </Head>
        
//         <div className="flex justify-center items-center min-h-screen bg-white" role="status"
//           aria-label="Loading roadmap">
//         <div className="p-4 space-y-2">
//           <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#4fbdb7] animate-spin mx-auto"></div>
//           <span className="sr-only">Loading your career roadmap...</span>
//           <p className="text-slate-500 text-center mt-4">
//             Loading Roadmap...
//           </p>
//         </div>
//       </div>
//       </>
//     );
//   }

//   if (showPaymentPlan && user?.id) {
//     const subcontinentCountryCodes = ["IN", "PK", "BD"];
//     const isSubcontinentUser =
//       userCountryCode &&
//       subcontinentCountryCodes.includes(userCountryCode.toUpperCase());

//     return (
//       <>
//         <Head>
//           <title>
//             Subscribe to Access Your Career Roadmap | AI Career Planning
//           </title>
//           <meta
//             name="description"
//             content="Subscribe to access your personalized AI career roadmap with detailed planning and progress tracking."
//           />
//           <meta name="robots" content="noindex, nofollow" />
//         </Head>
//         {isSubcontinentUser ? (
//           <PaymentPlan
//             clerk_id={user.id}
//             onSuccess={() => window.location.reload()}
//             message="Your subscription has expired or is inactive. Please choose a plan to continue accessing your roadmap."
//           />
//         ) : (
//           <USDPaymentPlan
//             clerk_id={user.id}
//             onSuccess={() => window.location.reload()}
//             message="Your subscription has expired or is inactive. Please choose a plan to continue accessing your roadmap."
//           />
//         )}
//       </>
//     );
//   }

//   const img_ = [
//     {
//       image:
//         "https://res.cloudinary.com/ditn9req1/image/upload/v1744966691/kid1_xkapd9.jpg",
//     },
//     {
//       image:
//         "https://res.cloudinary.com/ditn9req1/image/upload/v1744966689/kid2_imcmyf.jpg",
//     },
//     {
//       image:
//         "https://res.cloudinary.com/ditn9req1/image/upload/v1744966693/kid3_ajkhfl.jpg",
//     },
//   ];

//   return (
//     <>
//       <Head>
//         {/* Primary Meta Tags */}
//         <title>{seoData.title}</title>
//         <meta name="description" content={seoData.description} />
//         <meta name="keywords" content={seoData.keywords} />
//         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//         <meta name="robots" content="index, follow" />
//         <meta name="language" content="English" />
//         <meta name="author" content="Careeroadmap" />

//         {/* Open Graph / Facebook */}
//         <meta property="og:type" content="website" />
//         <meta property="og:url" content={seoData.url} />
//         <meta property="og:title" content={seoData.title} />
//         <meta property="og:description" content={seoData.description} />
//         <meta property="og:image" content={seoData.ogImage} />
//         <meta property="og:site_name" content="AI Career Roadmap" />

//         {/* Twitter */}
//         <meta property="twitter:card" content="summary_large_image" />
//         <meta property="twitter:url" content={seoData.url} />
//         <meta property="twitter:title" content={seoData.title} />
//         <meta property="twitter:description" content={seoData.description} />
//         <meta property="twitter:image" content={seoData.ogImage} />

//         {/* Additional SEO Tags */}
//         <link rel="canonical" href={seoData.url} />
//         <meta name="theme-color" content="#ffffff" />

//         {/* Structured Data */}
//         <script
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{
//             __html: JSON.stringify(structuredData),
//           }}
//         />
//       </Head>

//       <div className="relative min-h-screen bg-white md:bg-white flex flex-col pt-20 md:pt-24">
//         {/* Skip to main content for accessibility */}
//         <a
//           href="#main-content"
//           className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded"
//         >
//           Skip to main content
//         </a>

//         <div className="relative z-10">
//           <FloatingNavbar navLinks={dashboardLinks} />

//           <main
//             id="main-content"
//             className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-48 mt-8 md:mt-12 flex-grow"
//           >
//             {updating && (
//               <div
//                 className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
//                 role="dialog"
//                 aria-labelledby="updating-title"
//                 aria-describedby="updating-desc"
//               >
//                 <div className="bg-white p-6 rounded-lg shadow-xl flex items-center">
//                   <svg
//                     className="animate-spin -ml-1 mr-3 h-6 w-6 text-orange-500"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     aria-hidden="true"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                   <p
//                     id="updating-title"
//                     className="text-lg text-black font-semibold"
//                   >
//                     Updating roadmap with AI...
//                   </p>
//                 </div>
//               </div>
//             )}

//             {parsedRoadmap && (
//               <>
//                 <header className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 md:mb-8 lg:mb-8 px-0 md:px-4 lg:px-8 xl:px-12">
//                   <h1 className="text-3xl sm:text-4xl lg:text-5xl text-black font-bold text-center sm:text-left mb-4 sm:mb-0 sm:mr-4 flex-grow">
//                     Your Career Roadmap
//                   </h1>

//                   <aside className="flex-shrink-0 text-center sm:text-right">
//                     <h2 className="text-base md:text-base mb-4 text-black font-extralight">
//                       Peers on Your Path
//                     </h2>
//                     <div className="flex flex-wrap justify-center sm:justify-end">
//                       {similarUsers.length > 0 && img_.length > 0 ? (
//                         <AnimatedTooltip
//                           items={similarUsers.map((u, index) => ({
//                             id: u?.id ?? index,
//                             name: u?.name ?? "N/A",
//                             designation: u?.designation ?? "Unknown Role",
//                             image: img_[index % img_.length].image,
//                           }))}
//                         />
//                       ) : (
//                         <p className="text-black text-sm md:text-base">
//                           Looking for peers with a similar path...
//                         </p>
//                       )}
//                     </div>
//                   </aside>
//                 </header>

//                 <section
//                   className="mb-8 md:mb-12 px-0 md:px-6 lg:px-10 xl:px-16"
//                   aria-labelledby="progress-title"
//                 >
//                   <h2
//                     id="progress-title"
//                     className="text-lg md:text-lg mb-3 md:mb-4 text-black font-thin"
//                   >
//                     Overall Task Completion
//                   </h2>
//                   <ProgressBar progress={taskCountPercentageProgress} />
//                 </section>

//                 <section
//                   className="text-center mb-8 md:mb-12"
//                   aria-labelledby="career-goal"
//                 >
//                   <h2 id="career-goal" className="sr-only">
//                     Career Goal
//                   </h2>
//                   <span
//                     className="font-extrabold text-black text-2xl md:text-3xl"
//                     role="heading"
//                     aria-level={2}
//                   >
//                     {desiredCareer}
//                   </span>
//                 </section>
//               </>
//             )}

//             {parsedRoadmap ? (
//               <section
//                 className="p-0 md:p-4 lg:p-8 xl:p-12"
//                 aria-labelledby="roadmap-content"
//               >
//                 <h2 id="roadmap-content" className="sr-only">
//                   Career Roadmap Content
//                 </h2>
//                 <RoadmapDisplay
//                   roadmapData={parsedRoadmap}
//                   onTaskUpdate={handleTaskUpdate}
//                   openYearIndices={openYearIndices}
//                   toggleYear={toggleYear}
//                 />
//               </section>
//             ) : !loading && errorMessage ? (
//               <section
//                 className="bg-white p-6 md:p-8 rounded-[4rem] border border-slate-200/60 backdrop-blur-sm text-center max-w-md mx-auto"
//                 role="alert"
//                 aria-labelledby="error-title"
//               >
//                 <div className="mb-6">
//                   <div
//                     className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center"
//                     aria-hidden="true"
//                   >
//                     <svg
//                       className="w-6 h-6 text-white"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
//                       />
//                     </svg>
//                   </div>
//                   <h2 id="error-title" className="sr-only">
//                     Error Message
//                   </h2>
//                   <p className="text-slate-700 font-thin text-sm leading-relaxed">
//                     {errorMessage}
//                   </p>
//                 </div>

//                 <nav className="space-y-3" aria-label="Error recovery actions">
//                   <button
//                     onClick={() => router.push("/dashboard")}
//                     className="w-2/3 px-6 py-3 bg-white text-gray-800 font-medium rounded-3xl border hover:shadow-md hover:bg-black hover:text-white transform hover:scale-[1.02] transition-all duration-200 ease-out"
//                     type="button"
//                   >
//                     Return to Dashboard
//                   </button>

//                   {(errorMessage.includes("generate") ||
//                     errorMessage.includes("regenerating")) && (
//                     <button
//                       onClick={() => router.push("/dashboard")}
//                       className="w-2/3 px-6 py-3 bg-white text-gray-800 font-medium rounded-3xl border hover:shadow-md hover:bg-black hover:text-white transform hover:scale-[1.02] transition-all duration-200 ease-out"
//                       type="button"
//                     >
//                       Try Again
//                     </button>
//                   )}
//                 </nav>
//               </section>
//             ) : null}
//           </main>
//         </div>
//       </div>
//     </>
//   );
// }


"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Head from "next/head";
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

  // ✅ Track which years have been RAG enhanced
  const [enhancedYearIndices, setEnhancedYearIndices] = useState<number[]>([0]);
  const [enhancingYear, setEnhancingYear] = useState<number | null>(null);

  const dashboardLinks = [
    { href: "/dashboard", label: "Renew" },
    { href: "/events", label: "Events" },
    { href: "/analytics", label: "User Analysis" },
  ];

  // SEO Meta Data
  const seoData = {
    title: desiredCareer
      ? `${desiredCareer} Career Roadmap | AI-Powered Career Planning`
      : "AI Career Roadmap Generator | Personalized Career Planning with AI",
    description: desiredCareer
      ? `Get your personalized ${desiredCareer} career roadmap with AI-powered guidance. Track progress, connect with peers, and achieve your career goals with step-by-step planning.`
      : "Generate personalized career roadmaps for any profession using state-of-the-art AI. Traditional and unorthodox career paths with detailed planning, progress tracking, and peer connections.",
    keywords: [
      "career roadmap",
      "AI career planning",
      "career development",
      "professional growth",
      "career guidance",
      "job planning",
      "career tracker",
      "skill development",
      "career path",
      "professional roadmap",
      desiredCareer ? `${desiredCareer} career` : "career planning",
      "AI-powered careers",
      "career progress tracking",
      "personalized career advice",
    ]
      .filter(Boolean)
      .join(", "),
    url: "https://careeroadmap.com/roadmap",
    ogImage: "https://careeroadmap.com/og-roadmap.png",
  };

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "AI Career Roadmap Generator",
    applicationCategory: "EducationalApplication",
    description: seoData.description,
    url: seoData.url,
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      category: "Career Development",
      availability: "https://schema.org/InStock",
    },
    featureList: [
      "AI-powered career roadmap generation",
      "Progress tracking and analytics",
      "Peer networking and connections",
      "Personalized career guidance",
      "Traditional and unorthodox career paths",
    ],
    author: {
      "@type": "Organization",
      name: "Careeroadmap",
    },
  };

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

  // ✅ Function to trigger RAG enhancement for specific year
  const triggerYearRAG = useCallback(async (yearIndex: number) => {
    if (!user?.id || enhancingYear !== null) return;
    
    setEnhancingYear(yearIndex);

    try {
      const response = await fetch("/api/yt-video-rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_id: user.id,
          yearIndex: yearIndex,
          userContext: {
            educational_stage: parsedRoadmap?.educational_stage || "unknown",
            difficulty: parsedRoadmap?.difficulty || "intermediate",
            preferred_learning_style: parsedRoadmap?.preferred_learning_style || "visual",
            desired_career: desiredCareer || "General Career"
          }
        })
      });

      if (response.ok) {
        setEnhancedYearIndices(prev => [...prev, yearIndex]);
        await fetchRoadmap();
      }
    } catch (error) {
      console.error(`Error enhancing Year ${yearIndex + 1}:`, error);
    } finally {
      setEnhancingYear(null);
    }
  }, [user?.id, enhancingYear, parsedRoadmap, desiredCareer]);

  // ✅ MODIFIED: Check if next year should auto-unlock (once open, always open)
  const checkForYearUnlock = useCallback((roadmapData: any) => {
    if (!roadmapData?.yearly_roadmap) return;

    const currentOpenYears = [...openYearIndices].sort((a, b) => a - b);
    const lastOpenYear = currentOpenYears[currentOpenYears.length - 1];
    
    // Check if the last opened year is complete
    if (lastOpenYear !== undefined && lastOpenYear < roadmapData.yearly_roadmap.length - 1) {
      const yearData = roadmapData.yearly_roadmap[lastOpenYear];
      
      if (isYearComplete(yearData)) {
        const nextYearIndex = lastOpenYear + 1;
        
        // Only open if not already open
        if (!openYearIndices.includes(nextYearIndex)) {
          setOpenYearIndices(prev => [...prev, nextYearIndex]);
          
          // Trigger RAG for the new year if not already enhanced
          if (!enhancedYearIndices.includes(nextYearIndex)) {
            setTimeout(() => triggerYearRAG(nextYearIndex), 1000);
          }
        }
      }
    }
  }, [openYearIndices, enhancedYearIndices, triggerYearRAG]);

  // ✅ MODIFIED: Enhanced handleTaskUpdate with auto-progression
  const handleTaskUpdate = useCallback((updatedRoadmapData: any) => {
    setParsedRoadmap(updatedRoadmapData);
    setWeightedOverallProgress(calculateWeightProgress(updatedRoadmapData));
    setTaskCountPercentageProgress(
      calculateTaskCountProgress(updatedRoadmapData).percentage
    );

    // Check if any year should auto-unlock
    checkForYearUnlock(updatedRoadmapData);
  }, [checkForYearUnlock]);

  const fetchRoadmap = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      if (user) {
        const { data: userRecord, error: userError } = await supabase
          .from("users")
          .select("id, subscription_status, subscription_end")
          .eq("clerk_id", user.id)
          .single();

        if (userError || !userRecord) {
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
          setShowPaymentPlan(true);
          setLoading(false);
          return;
        }

        setShowPaymentPlan(false);

        if (!careerData.roadmap) {
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
            throw new Error(
              "Invalid roadmap structure. Try regenerating from dashboard."
            );
          }

          setParsedRoadmap(parsed);
          setWeightedOverallProgress(calculateWeightProgress(parsed));
          setTaskCountPercentageProgress(
            calculateTaskCountProgress(parsed).percentage
          );

          // ✅ Set initial open year to only first year
          if (
            parsed.yearly_roadmap.length > 0 &&
            openYearIndices.length === 0
          ) {
            setOpenYearIndices([0]);
          }
        } catch (parseError: any) {
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
      setErrorMessage(
        `An unexpected error occurred: ${
          err.message || "Please try again later."
        }`
      );
    } finally {
      setLoading(false);
    }
  }, [user, openYearIndices.length]);

  // ✅ Remove manual toggle - keep for compatibility
  const toggleYear = useCallback((index: number) => {
    // Auto-progression handles year opening
  }, []);

  const fetchSimilarUsers = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch("/api/get-similar-users");
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setSimilarUsers(data);
      } else {
        setSimilarUsers([]);
      }
    } catch (error) {
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
      if (!parsedRoadmap && !showPaymentPlan) {
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
    showPaymentPlan,
  ]);

  // --- Render Logic ---
  if (loading && !parsedRoadmap && !errorMessage) {
    return (
      <>
        <Head>
          <title>Loading Career Roadmap | AI Career Planning</title>
          <meta
            name="description"
            content="Loading your personalized AI-generated career roadmap..."
          />
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        
        <div className="flex justify-center items-center min-h-screen bg-white" role="status"
          aria-label="Loading roadmap">
        <div className="p-4 space-y-2">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#4fbdb7] animate-spin mx-auto"></div>
          <span className="sr-only">Loading your career roadmap...</span>
          <p className="text-slate-500 text-center mt-4">
            Loading Roadmap...
          </p>
        </div>
      </div>
      </>
    );
  }

  if (showPaymentPlan && user?.id) {
    const subcontinentCountryCodes = ["IN", "PK", "BD"];
    const isSubcontinentUser =
      userCountryCode &&
      subcontinentCountryCodes.includes(userCountryCode.toUpperCase());

    return (
      <>
        <Head>
          <title>
            Subscribe to Access Your Career Roadmap | AI Career Planning
          </title>
          <meta
            name="description"
            content="Subscribe to access your personalized AI career roadmap with detailed planning and progress tracking."
          />
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        {isSubcontinentUser ? (
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
        )}
      </>
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
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="author" content="Careeroadmap" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={seoData.url} />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:image" content={seoData.ogImage} />
        <meta property="og:site_name" content="AI Career Roadmap" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={seoData.url} />
        <meta property="twitter:title" content={seoData.title} />
        <meta property="twitter:description" content={seoData.description} />
        <meta property="twitter:image" content={seoData.ogImage} />

        {/* Additional SEO Tags */}
        <link rel="canonical" href={seoData.url} />
        <meta name="theme-color" content="#ffffff" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </Head>

      <div className="relative min-h-screen bg-white md:bg-white flex flex-col pt-20 md:pt-24">
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white p-2 rounded"
        >
          Skip to main content
        </a>

        <div className="relative z-10">
          <FloatingNavbar navLinks={dashboardLinks} />

          <main
            id="main-content"
            className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-48 mt-8 md:mt-12 flex-grow"
          >
            {/* ✅ Enhanced updating state for year enhancement */}
            {(updating || enhancingYear !== null) && (
              <div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                role="dialog"
                aria-labelledby="updating-title"
                aria-describedby="updating-desc"
              >
                <div className="bg-white p-6 rounded-lg shadow-xl flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-6 w-6 text-orange-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
                  <p
                    id="updating-title"
                    className="text-lg text-black font-semibold"
                  >
                    {enhancingYear !== null 
                      ? `Updating Roadmap with Current Trends and Skills`
                      : "Updating Roadmap with Current Trends and Skills"
                    }
                  </p>
                </div>
              </div>
            )}

            {parsedRoadmap && (
              <>
                <header className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 md:mb-8 lg:mb-8 px-0 md:px-4 lg:px-8 xl:px-12">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl text-black font-bold text-center sm:text-left mb-4 sm:mb-0 sm:mr-4 flex-grow">
                    Your Career Roadmap
                  </h1>

                  <aside className="flex-shrink-0 text-center sm:text-right">
                    <h2 className="text-base md:text-base mb-4 text-black font-extralight">
                      Peers on Your Path
                    </h2>
                    <div className="flex flex-wrap justify-center sm:justify-end">
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
                  </aside>
                </header>

                <section
                  className="mb-8 md:mb-12 px-0 md:px-6 lg:px-10 xl:px-16"
                  aria-labelledby="progress-title"
                >
                  <h2
                    id="progress-title"
                    className="text-lg md:text-lg mb-3 md:mb-4 text-black font-thin"
                  >
                    Overall Task Completion
                  </h2>
                  <ProgressBar progress={taskCountPercentageProgress} />
                </section>

                <section
                  className="text-center mb-8 md:mb-12"
                  aria-labelledby="career-goal"
                >
                  <h2 id="career-goal" className="sr-only">
                    Career Goal
                  </h2>
                  <span
                    className="font-extrabold text-black text-2xl md:text-3xl"
                    role="heading"
                    aria-level={2}
                  >
                    {desiredCareer}
                  </span>
                </section>
              </>
            )}

            {parsedRoadmap ? (
              <section
                className="p-0 md:p-4 lg:p-8 xl:p-12"
                aria-labelledby="roadmap-content"
              >
                <h2 id="roadmap-content" className="sr-only">
                  Career Roadmap Content
                </h2>
                <RoadmapDisplay
                  roadmapData={parsedRoadmap}
                  onTaskUpdate={handleTaskUpdate}
                  openYearIndices={openYearIndices}
                  toggleYear={toggleYear}
                />
              </section>
            ) : !loading && errorMessage ? (
              <section
                className="bg-white p-6 md:p-8 rounded-[4rem] border border-slate-200/60 backdrop-blur-sm text-center max-w-md mx-auto"
                role="alert"
                aria-labelledby="error-title"
              >
                <div className="mb-6">
                  <div
                    className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h2 id="error-title" className="sr-only">
                    Error Message
                  </h2>
                  <p className="text-slate-700 font-thin text-sm leading-relaxed">
                    {errorMessage}
                  </p>
                </div>

                <nav className="space-y-3" aria-label="Error recovery actions">
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="w-2/3 px-6 py-3 bg-white text-gray-800 font-medium rounded-3xl border hover:shadow-md hover:bg-black hover:text-white transform hover:scale-[1.02] transition-all duration-200 ease-out"
                    type="button"
                  >
                    Return to Dashboard
                  </button>

                  {(errorMessage.includes("generate") ||
                    errorMessage.includes("regenerating")) && (
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="w-2/3 px-6 py-3 bg-white text-gray-800 font-medium rounded-3xl border hover:shadow-md hover:bg-black hover:text-white transform hover:scale-[1.02] transition-all duration-200 ease-out"
                      type="button"
                    >
                      Try Again
                    </button>
                  )}
                </nav>
              </section>
            ) : null}
          </main>
        </div>
      </div>
    </>
  );
}
