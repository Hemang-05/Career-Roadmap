"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useSyncUser } from "@/app/hooks/sync-user";
import PaymentPlan from "@/components/PaymentPlan";
import FloatingNavbar from "@/components/Navbar";
import ProgressBar from "@/components/ProgressBar";
import { calculateTaskCountProgress } from "@/utils/calcTaskCountProgress";
import { AnimatedTooltip } from "@/components/ui/AnimatedTooltip";

function isYearComplete(yearItem: any): boolean {
  // Ensure phases, milestones, and tasks exist before iterating
  if (!yearItem?.phases) return true; // Or false depending on logic if structure is incomplete

  for (const phase of yearItem.phases) {
    if (!phase?.milestones) continue;
    for (const milestone of phase.milestones) {
      if (!milestone?.tasks) continue;
      for (const task of milestone.tasks) {
        if (!task?.completed) return false;
      }
    }
  }
  return true;
}


// --- RoadmapDisplay Component ---
function RoadmapDisplay({
  roadmapData,
  onTaskUpdate,
  openYearIndices,
  toggleYear,
}: {
  roadmapData: any;
  onTaskUpdate: () => void;
  openYearIndices: number[];
  toggleYear: (index: number) => void;
}) {
  return (
    // Adjusted spacing for overall roadmap list
    <div className="space-y-6 md:space-y-8">
      {roadmapData.yearly_roadmap.map((yearItem: any, yearIndex: number) => {
        // Calculate unlocked status safely
        const isFirstYear = yearIndex === 0;
        const previousYearData = roadmapData.yearly_roadmap[yearIndex - 1];
        const isPreviousYearComplete = !isFirstYear && previousYearData ? isYearComplete(previousYearData) : false;
        const unlocked = isFirstYear || isPreviousYearComplete;

        const isOpen = openYearIndices.includes(yearIndex);

        return (
          // Adjusted padding and margin for year cards
          <div key={yearIndex} className="p-4 md:p-6 lg:p-8 rounded-[1.5rem] md:rounded-[2rem] mb-10 md:mb-16 lg:mb-20 bg-white shadow-[0_0_15px_rgba(0,0,0,0.08)] md:shadow-[0_0_25px_rgba(0,0,0,0.1)]">
            <div
              className="flex justify-between items-center mb-4 md:mb-6 lg:mb-8 cursor-pointer"
              onClick={() => {
                if (unlocked) {
                  toggleYear(yearIndex);
                }
              }}
            >
              {/* Adjusted heading size */}
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                {yearItem.year}{" "}
                {!unlocked && (
                  <span className="text-red-500 text-sm md:text-base">(Locked)</span>
                )}
              </h2>
              {unlocked && (
                <button className="text-[#FF6500] flex items-center transition-all duration-300 hover:opacity-80">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    // Use md prefix for larger screen rotation if desired, but current looks fine
                    className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  {/* Hide text on small screens if needed, but current might be okay */}
                  <span className="ml-1 text-xs sm:text-sm font-medium">
                    {isOpen ? "" : "Show Tasks"}
                  </span>
                </button>
              )}
            </div>
            {/* Adjusted margin for overview */}
            <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6 lg:mb-8">{yearItem.overview}</p>

            {/* --- Collapsible Content --- */}
            {unlocked && isOpen ? (
              // Open State Content
              yearItem.phases.map((phase: any, phaseIndex: number) => (
                // Adjusted padding/margin for phase container
                <div key={phaseIndex} className="mx-0 md:mx-2 lg:mx-4 border-t py-4 md:py-6 lg:py-8">
                  {/* Adjusted heading size and margin */}
                  <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 lg:mb-8 text-[#FF6500]">
                    {phase.phase_name}
                  </h3>
                  {phase.milestones.map((milestone: any, mIndex: number) => (
                    // Adjusted margin for milestone container
                    <div key={mIndex} className="mx-0 md:mx-2 lg:mx-4 mb-4 md:mb-6 ">
                      {/* Adjusted heading size */}
                      <h4 className="text-base md:text-lg font-semibold text-gray-800">
                        {milestone.name}
                      </h4>
                      {/* Adjusted text size and margin */}
                      <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">{milestone.description}</p>
                      {/* Adjusted task list spacing */}
                      <ul className="space-y-4 md:space-y-6">
                        {milestone.tasks.map((task: any, tIndex: number) => (
                          <li
                            key={tIndex}
                            // Adjusted padding for task item
                            className="flex items-start pl-2 md:pl-4 relative" // mb-4 removed, handled by space-y on ul
                          >
                            {/* Bullet Point - Size might be okay */}
                            <div className="absolute left-0 top-1 text-lg">•</div>

                            {/* Custom Checkbox */}
                            <div
                              onClick={async () => {
                                // Ensure roadmapData and user_id are valid before proceeding
                                if (!roadmapData?.user_id || !phase?.phase_name || !task?.task_title) {
                                    console.error("Missing data for task update:", { roadmapData, phase, task });
                                    // Optionally show an error to the user
                                    return;
                                }
                                task.completed = !task.completed;
                                const phaseIdentifier = phase.phase_name;

                                try {
                                    await fetch("/api/update-task", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        user_id: roadmapData.user_id,
                                        task_title: task.task_title,
                                        completed: task.completed,
                                        currentPhaseIdentifier: phaseIdentifier,
                                    }),
                                    });
                                    onTaskUpdate(); // Trigger data refresh
                                } catch (error) {
                                    console.error("Failed to update task:", error);
                                    // Revert optimistic UI update if needed
                                    task.completed = !task.completed;
                                    // Optionally show an error message to the user
                                }
                              }}
                              // Adjusted checkbox margin
                              className={`
                                w-5 h-5 rounded-full flex items-center justify-center cursor-pointer mr-2 md:mr-3 flex-shrink-0 mt-1
                                border-2 transition-colors duration-200
                                ${task.completed
                                  ? "bg-green-500 border-green-500"
                                  : "bg-gray-200 border-gray-300 hover:border-gray-400" // Added hover state for unchecked
                                }
                              `}
                            >
                              {task.completed && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>

                            {/* Hidden native checkbox for accessibility */}
                            <input
                              type="checkbox"
                              checked={task.completed ?? false}
                              onChange={() => {}} // Handler is on the div
                              className="sr-only"
                              aria-labelledby={`task-title-${yearIndex}-${phaseIndex}-${mIndex}-${tIndex}`}
                            />

                            {/* Task Content */}
                            {/* Adjusted text sizes */}
                            <div className="flex-grow">
                              <div className="flex justify-between items-start flex-wrap"> {/* Allow wrapping */}
                                <span id={`task-title-${yearIndex}-${phaseIndex}-${mIndex}-${tIndex}`} className="font-medium text-sm md:text-base text-black mr-2"> {/* Added mr-2 */}
                                  {task.task_title}
                                </span>
                                <span className="text-xs md:text-sm font-thin text-gray-600 ml-auto whitespace-nowrap"> {/* Keep weight on the right */}
                                  Weight: {task.weight}
                                </span>
                              </div>
                              <p className="text-gray-600 font-extralight text-xs md:text-sm mt-1">{task.description}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              // Closed State Content (Summary)
              <div>
                 {/* Added check for phases before mapping */}
                 {yearItem.phases && yearItem.phases.map((phase: any, phaseIndex: number) => (
                  // Adjust spacing for summary view
                  <div key={phaseIndex} className="mb-4 md:mb-6 border-t pt-3 md:pt-4">
                      {/* Adjust heading size */}
                    <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-[#FF6500]">
                      {phase.phase_name}
                    </h3>
                    {/* Added check for milestones before mapping */}
                    {phase.milestones && phase.milestones.map((milestone: any, mIndex: number) => (
                       // Adjust spacing and text size
                      <div key={mIndex} className="ml-2 md:ml-4 mb-1 md:mb-2">
                        <h4 className="text-sm md:text-base font-medium text-gray-800">
                          {milestone.name}
                        </h4>
                        {/* Optionally hide description in closed state on small screens if too cluttered */}
                        {/* <p className="text-gray-600 text-xs md:text-sm hidden sm:block">{milestone.description}</p> */}
                         <p className="text-gray-600 text-xs md:text-sm">{milestone.description}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {/* Final Notes - Adjusted margin */}
      {roadmapData.final_notes && (
        <div className="mt-6 md:mt-8 p-4 border-t">
          <p className="text-gray-700 text-sm md:text-base">{roadmapData.final_notes}</p>
        </div>
      )}
    </div>
  );
}


// --- RoadmapPage Component ---
export default function RoadmapPage() {
  useSyncUser();
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [parsedRoadmap, setParsedRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPaymentPlan, setShowPaymentPlan] = useState(false);
  const [taskCountProgress, setTaskCountProgress] = useState<number>(0);
  const [openYearIndices, setOpenYearIndices] = useState<number[]>([]);
  const [updating, setUpdating] = useState<boolean>(false);
  const [similarUsers, setSimilarUsers] = useState<any[]>([]);
  const [desiredCareer, setDesiredCareer] = useState<string>("");

  const dashboardLinks = [
    { href: "/dashboard", label: "Renew" },
    { href: "/events", label: "Events" },
    { href: "/analytics", label: "User Analysis" },
    { href: "/jobs", label: "Jobs" },
  ];

  // cleanJSONString function remains the same
  function cleanJSONString(jsonString: string): string {
    try {
        // First, try to parse directly to catch well-formed JSON quickly
        JSON.parse(jsonString);
        return jsonString; // If it parses, return original (likely clean)
    } catch (e) {
        // If parsing fails, attempt cleaning
        console.warn("Initial JSON parsing failed, attempting to clean...");
        try {
            // Remove control characters, invisible spaces, BOM
            let cleaned = jsonString
                .replace(/[\x00-\x1F\x7F-\x9F]/g, "") // Control characters
                .replace(/\\n/g, "\\n") // Normalize newline escapes
                .replace(/\\r/g, "\\r") // Normalize carriage return
                .replace(/\\t/g, "\\t") // Normalize tab
                .replace(/\\b/g, "\\b") // Normalize backspace
                .replace(/\\f/g, "\\f") // Normalize form feed
                .replace(/\uFEFF/g, '') // Remove BOM (Byte Order Mark)
                .replace(/\u200B/g, '') // Remove Zero Width Space
                .replace(/[\u2028\u2029]/g, ""); // Remove Line/Paragraph separators

             // Attempt to fix common issues like trailing commas (basic regex)
             // Note: This is a simplified approach and might not cover all cases.
             // A more robust JSON cleaner library might be needed for complex issues.
             cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');


            // Test if cleaned string is parsable
            JSON.parse(cleaned);
            console.log("JSON cleaned successfully.");
            return cleaned;

        } catch (cleanError) {
            console.error("Error during JSON cleaning or parsing cleaned string:", cleanError);
            console.error("Problematic JSON string:", jsonString); // Log the original faulty string
            return jsonString; // Return original if cleaning fails or results in invalid JSON
        }
    }
  }


  // fetchRoadmap function remains largely the same, just ensure error handling is robust
  const fetchRoadmap = async () => {
      setLoading(true); // Ensure loading state is set at the start
      setErrorMessage(null); // Clear previous errors
      setParsedRoadmap(null); // Clear previous data
      setShowPaymentPlan(false); // Reset payment plan view

    try {
      if (user) {
        // Fetch user record... (keep existing logic)
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
         const currentDate = new Date();
         const subscriptionEndDate = subscription_end ? new Date(subscription_end) : null;


        // Check subscription... (keep existing logic)
         if (!subscription_status || !subscriptionEndDate || subscriptionEndDate < currentDate) {
           console.log("Subscription invalid or expired.");
           setShowPaymentPlan(true);
           setLoading(false);
           return;
         }


        // Fetch career info... (keep existing logic)
        const { data: careerData, error: careerError } = await supabase
          .from("career_info")
          .select("roadmap, user_id, desired_career") // Ensure user_id is selected if needed later
          .eq("user_id", userId)
          .single();

         if (careerError) {
           console.error("Supabase career_info fetch error:", careerError);
           setErrorMessage("Error fetching roadmap: " + careerError.message);
           setLoading(false);
           return;
         }


        if (!careerData?.roadmap) {
           console.log("No roadmap data found for user:", userId);
           setErrorMessage("No roadmap found. Please generate your roadmap first.");
           setLoading(false);
           // Optionally redirect to generation page: router.push('/generate-roadmap');
           return;
         }


        setRoadmap(typeof careerData.roadmap === 'string' ? careerData.roadmap : JSON.stringify(careerData.roadmap)); // Store original potentially
        setDesiredCareer(careerData.desired_career || "Your Goal"); // Set desired career


        try {
            // Use the cleaning function
            const roadmapString = typeof careerData.roadmap === 'string'
              ? careerData.roadmap
              : JSON.stringify(careerData.roadmap);

             const cleanedRoadmap = cleanJSONString(roadmapString);
             const parsed = JSON.parse(cleanedRoadmap); // Parse the cleaned string

            // Add user_id to the parsed object if needed by RoadmapDisplay or other parts
            parsed.user_id = userId; // Make sure userId is correctly obtained earlier

             // Basic structure validation (can be more detailed)
             if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.yearly_roadmap)) {
                console.error("Invalid roadmap structure after parsing:", parsed);
                throw new Error("Invalid roadmap structure.");
             }

            setParsedRoadmap(parsed);
            // Initial calculation of progress
            setTaskCountProgress(calculateTaskCountProgress(parsed));

            // Set initially open year (e.g., the first one)
            if (parsed.yearly_roadmap.length > 0) {
                setOpenYearIndices([0]); // Open the first year by default
            }


        } catch (parseError) {
           console.error("Detailed JSON Parsing/Cleaning Error:", parseError);
           console.error("Original Roadmap Data causing error:", careerData.roadmap);
           // Provide a user-friendly error and potentially log the specific error
            setErrorMessage(
               `Failed to process roadmap data. Please try regenerating your roadmap. (Error: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'})`
            );

        }
      } else {
        // Handle case where user object is not available yet (should be covered by isLoaded/isSignedIn check)
        setErrorMessage("User data not available.");
      }
    } catch (err) {
      console.error("Unexpected Error in fetchRoadmap:", err);
      setErrorMessage(
        "An unexpected error occurred. Please try again later."
      );
    } finally {
      setLoading(false); // Ensure loading state is turned off
    }
  };


  // toggleYear function remains the same
  const toggleYear = (index: number) => {
    setOpenYearIndices((prev) => {
      const newOpenIndices = prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index];
      console.log("Toggling year, new open indices:", newOpenIndices); // Debug log
      return newOpenIndices;
    });
  };


  // refreshFutureRoadmap function remains the same
   const refreshFutureRoadmap = async () => {
     if (!parsedRoadmap?.user_id) {
        console.error("Cannot refresh roadmap, user_id not available.");
        setErrorMessage("User information is missing, cannot refresh.");
        return;
     }
     setUpdating(true); // Show loader
     try {
       const res = await fetch("/api/update-user-roadmap", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ user_id: parsedRoadmap.user_id }), // Pass the correct user ID
       });

       if (!res.ok) {
         // Handle HTTP errors
         const errorData = await res.json().catch(() => ({ message: 'Failed to parse error response' }));
         throw new Error(`Failed to refresh roadmap: ${res.status} ${res.statusText}. ${errorData.message || ''}`);
       }


       const json = await res.json();
       console.log("Refresh response:", json);


       // Re-fetch the roadmap to display the updated data
       await fetchRoadmap(); // This will reset loading state via its own finally block


     } catch (err) {
       console.error("Error refreshing future roadmap:", err);
        setErrorMessage(`Error refreshing roadmap: ${err instanceof Error ? err.message : 'Unknown error'}`);

     } finally {
       setUpdating(false); // Hide loader
     }
   };


   // fetchSimilarUsers remains the same
   const fetchSimilarUsers = async () => {
       console.log("Fetching similar users...");
       try {
           const response = await fetch("/api/get-similar-users"); // Assuming this endpoint requires authentication implicitly

           if (!response.ok) {
               console.error(
                   "API response not OK for similar users:",
                   response.status,
                   response.statusText
               );
               // Optionally set an error state here
               return;
           }


           const data = await response.json(); // Expecting JSON directly


           if (Array.isArray(data)) {
               console.log("Similar users fetched:", data);
               setSimilarUsers(data);
           } else {
               console.warn("API response for similar users is not an array:", data);
               setSimilarUsers([]); // Reset or handle as appropriate
           }
       } catch (error) {
           console.error("Network or parsing error fetching similar users:", error);
           // Optionally set an error state here
           setSimilarUsers([]); // Reset on error
       }
   };


  // useEffect remains largely the same, ensures fetch calls happen correctly
   useEffect(() => {
     console.log("RoadmapPage useEffect: Auth state change detected", { isLoaded, isSignedIn });
     if (isLoaded && !isSignedIn) {
       console.log("User not signed in, redirecting to /");
       router.push("/"); // Redirect to home if not signed in
     } else if (isLoaded && isSignedIn && user) {
        console.log("User signed in, fetching data...");
        fetchRoadmap(); // Fetch roadmap data for the logged-in user
        fetchSimilarUsers(); // Fetch similar users
     } else if (!isLoaded) {
        console.log("Auth state still loading...");
        setLoading(true); // Keep loading indicator while auth is resolving
     }
   }, [isLoaded, isSignedIn, user, router]); // Dependencies


  // --- Render Logic ---

  if (loading && !parsedRoadmap) { // Show loading only if data isn't already displayed
    return <div className="flex justify-center items-center min-h-screen">Loading Roadmap...</div>; // Improved loading state
  }

  if (showPaymentPlan && user?.id) {
    return (
      <PaymentPlan
        clerk_id={user.id} // Pass clerk_id correctly
        onSuccess={() => {
          console.log("Payment successful, reloading page...");
          window.location.reload(); // Reload to re-check subscription
        }}
        message="Your subscription seems to have expired. Please choose a plan to continue." // Clearer message
      />
    );
  }


  // Main Page Content
  return (
    // Adjusted background, added padding for small screens
    <div className="min-h-screen bg-[#f8fcf7] md:bg-[#fafff9] flex flex-col pt-20 md:pt-24"> {/* Adjusted top padding */}
      {/* Navbar remains fixed */}
      <FloatingNavbar navLinks={dashboardLinks} />

      {/* Main content container with responsive padding */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-48 mt-8 md:mt-12 flex-grow"> {/* Responsive horizontal padding and top margin */}

        {/* Main Heading with responsive text size and margin */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl text-black font-bold mb-8 md:mb-12 lg:mb-16 text-center sm:text-left">
          Your <span className="text-[#FF6500]">Career</span> Roadmap
        </h1>

        {/* Refresh Button - uncomment if needed
         <div className="mb-4 text-center sm:text-left">
           <button
             onClick={refreshFutureRoadmap}
             disabled={updating} // Disable button while updating
             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
           >
             {updating ? "Refreshing..." : "Refresh Future Roadmap"}
           </button>
         </div> */}

        {/* Loader overlay */}
        {updating && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-4 rounded shadow flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
              <p className="text-lg text-black font-semibold">Updating roadmap...</p>
            </div>
          </div>
        )}

         {/* Progress Bar Section - Adjusted margins */}
         <div className="mb-8 md:mb-10">
           <h2 className="text-lg md:text-xl mb-3 md:mb-4 text-black font-semibold">Overall Progress</h2>
            {/* Ensure progress calculation is safe */}
           <ProgressBar progress={taskCountProgress ?? 0} />
         </div>

         {/* Similar Users Section - Adjusted margins */}
        <div className="mb-10 md:mb-12 mt-8 md:mt-16">
          <h2 className="text-lg md:text-xl mb-4 text-black font-semibold">
            Peers on Your Path
          </h2>
           {/* Center tooltip items on smaller screens if needed */}
          <div className="flex flex-wrap justify-center sm:justify-start">
            {similarUsers.length > 0 ? (
                <AnimatedTooltip
                    items={similarUsers.map((u) => ({ // Ensure mapping is safe
                    id: u?.id ?? Math.random(), // Use unique ID or fallback
                    name: u?.name ?? 'N/A',
                    designation: u?.designation ?? 'Unknown Role',
                    image: u?.image ?? '/default-avatar.png', // Provide a fallback image
                    }))}
                />
            ) : (
              <p className="text-gray-500 text-sm md:text-base">
                Looking for peers with a similar path...
              </p>
            )}
          </div>
        </div>

        {/* Desired Career Title - Adjusted text size and margin */}
        <div className="text-center mb-8 md:mb-12">
            <span className="font-extrabold text-[#FF6500] text-2xl md:text-3xl">{desiredCareer}</span>
        </div>


        {/* Roadmap Display Area or Error Message */}
        {parsedRoadmap ? (
            // Adjusted padding around the roadmap display
          <div className="p-0 md:p-4 lg:p-8 xl:p-12">
            <RoadmapDisplay
              roadmapData={parsedRoadmap}
              onTaskUpdate={() => {
                  console.log("Task updated, re-fetching roadmap...");
                  fetchRoadmap(); // Re-fetch data on task update
              }}
              openYearIndices={openYearIndices}
              toggleYear={toggleYear}
            />
          </div>
        ) : (
          <div className="bg-white p-4 md:p-6 rounded-md shadow-md text-center">
            <p className="text-red-600">
              {errorMessage || "Roadmap data could not be loaded or is unavailable."}
            </p>
             {/* Add a button to regenerate if applicable */}
             {errorMessage?.includes("generate") && (
               <button
                 onClick={() => router.push('/dashboard')} // Or your generation page route
                 className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
               >
                 Go to Dashboard to Regenerate
               </button>
             )}
          </div>
        )}
      </div>
        {/* Footer placeholder if needed */}
        {/* <footer className="py-4 text-center text-gray-500 text-sm">
            My App Footer
        </footer> */}
    </div>
  );
}