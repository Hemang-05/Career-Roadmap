'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabaseClient';
import { useSyncUser } from '@/app/hooks/sync-user';
import PaymentPlan from '@/components/PaymentPlan';
import FloatingNavbar from '@/components/Navbar';
import ProgressBar from '@/components/ProgressBar';
import { calculateTaskCountProgress } from '@/utils/calcTaskCountProgress';
import { AnimatedTooltip } from '@/components/ui/AnimatedTooltip';

function isYearComplete(yearItem: any): boolean {
  for (const phase of yearItem.phases) {
    for (const milestone of phase.milestones) {
      for (const task of milestone.tasks) {
        if (!task.completed) return false;
      }
    }
  }
  return true;
}

function RoadmapDisplay({
  roadmapData,
  onTaskUpdate,
  openYearIndices,
  toggleYear
}: {
  roadmapData: any;
  onTaskUpdate: () => void;
  openYearIndices: number[];
  toggleYear: (index: number) => void;
}) {
  return (
    <div className="space-y-8">
      {roadmapData.yearly_roadmap.map((yearItem: any, yearIndex: number) => {
        const unlocked =
          yearIndex === 0 || isYearComplete(roadmapData.yearly_roadmap[yearIndex - 1]);
        const isOpen = openYearIndices.includes(yearIndex);

        return (
          <div key={yearIndex} className="border p-4 rounded-md shadow-sm">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => {
                if (unlocked) {
                  toggleYear(yearIndex);
                }
              }}
            >
              <h2 className="text-2xl font-bold text-gray-800">
                {yearItem.year} {unlocked ? null : <span className="text-red-500 text-base">(Locked)</span>}
              </h2>
              {unlocked && (
                <button className="text-blue-600">
                  {isOpen ? "Collapse" : "Expand"}
                </button>
              )}
            </div>
            <p className="text-gray-600 mb-4">{yearItem.overview}</p>
            {unlocked && isOpen ? (
              yearItem.phases.map((phase: any, phaseIndex: number) => (
                <div key={phaseIndex} className="mb-4 border-t pt-4">
                  <h3 className="text-xl font-semibold text-[#FF6500]">{phase.phase_name}</h3>
                  {phase.milestones.map((milestone: any, mIndex: number) => (
                    <div key={mIndex} className="ml-4 mb-2">
                      <h4 className="text-lg font-medium text-gray-800">{milestone.name}</h4>
                      <p className="text-gray-600">{milestone.description}</p>
                      <ul className="list-disc list-inside">
                        {milestone.tasks.map((task: any, tIndex: number) => (
                          <li key={tIndex} className="text-gray-700 flex items-center">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={async () => {
                                task.completed = !task.completed;
                                await fetch("/api/update-task", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    user_id: roadmapData.user_id,
                                    task_title: task.task_title,
                                    completed: task.completed,
                                    currentPhaseIdentifier: phase.phase_name,
                                  }),
                                });
                                onTaskUpdate();
                              }}
                              className="mr-2"
                            />
                            <span className="font-semibold">{task.task_title}:</span> {task.description} <span className="italic">(Weight: {task.weight})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div>
                {yearItem.phases.map((phase: any, phaseIndex: number) => (
                  <div key={phaseIndex} className="mb-4 border-t pt-4">
                    <h3 className="text-xl font-semibold text-[#FF6500]">{phase.phase_name}</h3>
                    {phase.milestones.map((milestone: any, mIndex: number) => (
                      <div key={mIndex} className="ml-4 mb-2">
                        <h4 className="text-lg font-medium text-gray-800">{milestone.name}</h4>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {roadmapData.final_notes && (
        <div className="mt-8 p-4 border-t">
          <p className="text-gray-700">{roadmapData.final_notes}</p>
        </div>
      )}
    </div>
  );
}

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

  const dashboardLinks = [
    { href: "/dashboard", label: "Regenerate Roadmap" },
    { href: "/events", label: "Events" },
    { href: "/analytics", label: "User Analysis" },
    { href: "/support", label: "Support" },
  ];

  function cleanJSONString(jsonString: string): string {
    try {
      // Remove control characters and problematic Unicode characters
      return jsonString
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '')  // Remove control characters
        .replace(/[\u2028\u2029]/g, '')        // Remove line/paragraph separators
        .replace(/\\n/g, "\\n")               // Normalize newline escapes
        .replace(/\\r/g, "\\r")               // Normalize carriage return
        .replace(/\\t/g, "\\t")               // Normalize tab
        .replace(/\\b/g, "\\b")               // Normalize backspace
        .replace(/\\f/g, "\\f");              // Normalize form feed
    } catch (error) {
      console.error("Error in JSON cleaning:", error);
      return jsonString;  // Return original if cleaning fails
    }
  }

  const fetchRoadmap = async () => {
    try {
      if (user) {
        const { data: userRecord, error: userError } = await supabase
          .from("users")
          .select("id, subscription_status, subscription_end")
          .eq("clerk_id", user.id)
          .single();
        
        if (userError || !userRecord) {
          setErrorMessage("User record not found in Supabase.");
          return;
        }
        
        const { subscription_status, subscription_end, id: userId } = userRecord;
        const currentDate = new Date();
        const subscriptionEndDate = new Date(subscription_end);
        
        if (!subscription_status || subscriptionEndDate < currentDate) {
          setShowPaymentPlan(true);
          return;
        }
        
        const { data, error } = await supabase
          .from("career_info")
          .select("roadmap, user_id")
          .eq("user_id", userId)
          .single();
        
        if (error) {
          setErrorMessage("Error fetching roadmap: " + error.message);
          return;
        }
        
        if (!data?.roadmap) {
          setErrorMessage("No roadmap found. Please generate your roadmap.");
          return;
        }
        
        setRoadmap(data.roadmap);
        
        try {
          // Enhanced parsing with cleaning
          const cleanedRoadmap = cleanJSONString(
            typeof data.roadmap === 'string' 
              ? data.roadmap 
              : JSON.stringify(data.roadmap)
          );
          
          const parsed = JSON.parse(cleanedRoadmap);
          parsed.user_id = userId;
          
          // Additional structure validation
          if (!parsed.yearly_roadmap || !Array.isArray(parsed.yearly_roadmap)) {
            throw new Error("Invalid roadmap structure");
          }
          
          setParsedRoadmap(parsed);
          setTaskCountProgress(calculateTaskCountProgress(parsed));
        } catch (err) {
          console.error("Detailed JSON Parsing Error:", err);
          
          // Log the problematic JSON string for debugging
          console.log("Original Roadmap String:", data.roadmap);
          
          // More specific error handling
          if (err instanceof SyntaxError) {
            setErrorMessage(`Something occured please regenerate your roadmap.`);
          } else {
            setErrorMessage("Error parsing roadmap. Please regenerate your roadmap.");
          }
        }
      }
    } catch (err) {
      console.error("Unexpected Error:", err);
      setErrorMessage("An unexpected error occurred while fetching the roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const toggleYear = (index: number) => {
    setOpenYearIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  // New button function to refresh future roadmap.
  const refreshFutureRoadmap = async () => {
    setUpdating(true);
    try {
      const res = await fetch("/api/update-user-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: parsedRoadmap.user_id }),
      });
      const json = await res.json();
      console.log("Refresh response:", json);
      // Re-fetch the roadmap after update.
      await fetchRoadmap();
    } catch (err) {
      console.error("Error refreshing future roadmap:", err);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    console.log("useEffect triggered - auth state:", { isLoaded, isSignedIn });
    
    if (isLoaded && !isSignedIn) {
      console.log("Not signed in, redirecting to home");
      router.push("/");
      return;
    }
    
    if (user) {
      
      fetchRoadmap();
      fetchSimilarUsers();
    } 

  }, [isLoaded, isSignedIn, router, user]);

  // In RoadmapPage component, modify fetchSimilarUsers with detailed logging
const fetchSimilarUsers = async () => {
  console.log("Starting to fetch similar users...");
  try {
    console.log("Sending request to /api/get-similar-users");
    const response = await fetch("/api/get-similar-users");
    console.log("Response received:", response.status, response.statusText);
    
    if (!response.ok) {
      console.error("API response not OK:", response.status, response.statusText);
      return;
    }
    
    const text = await response.text(); // Get the raw text first
    console.log("Raw API response:", text);
    
    if (!text) {
      console.log("Empty response from API");
      return;
    }
    
    try {
      const data = JSON.parse(text);
      console.log("Parsed similar users data:", data);
      
      if (Array.isArray(data)) {
        console.log(`Found ${data.length} similar users`);
        setSimilarUsers(data);
      } else {
        console.error("API response is not an array:", data);
      }
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
    }
  } catch (error) {
    console.error("Network error fetching similar users:", error);
  }
  console.log("Finished fetchSimilarUsers function");
};

  if (loading) {
    return <div>Loading...</div>;
  }

  if (showPaymentPlan && user?.id) {
    return (
      <PaymentPlan
        clerk_id={user.id}
        onSuccess={() => window.location.reload()}
        message="Your subscription has expired. Please choose a new plan."
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <FloatingNavbar navLinks={dashboardLinks} />
      <div className="container mx-auto mt-20 px-4 py-8 flex-grow">
        <h1 className="text-3xl text-black font-bold mb-6">
          Your <span className="text-[#FF6500]">Career</span> Roadmap
        </h1>
        {/* Refresh button */}
        <div className="mb-4">
          <button
            onClick={refreshFutureRoadmap}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Future Roadmap
          </button>
        </div>
        {/* Loader overlay when updating future roadmap */}
        {updating && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-4 rounded shadow">
              <p className="text-lg font-semibold">Updating roadmap...</p>
            </div>
          </div>
        )}
        {/* Task count-based progress bar */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Task Completion Progress</h2>
          <ProgressBar progress={taskCountProgress} />
        </div>

        {/* Similar Users Section */}
        
        <div className="mb-6">
          <h2 className="text-xl text-black font-semibold">Peers on Your Path</h2>
          {similarUsers.length > 0 ? (
            <AnimatedTooltip
              items={similarUsers.map((user) => ({
                id: user.id,
                name: user.name,
                designation: user.designation,
                image: user.image,
              }))}
            />
          ) : (
            <p className="text-gray-500">No peers found with the same career path.</p>
          )}
        </div>

        {parsedRoadmap ? (
          <div className="bg-white p-6 rounded-md shadow-md">
            <RoadmapDisplay
              roadmapData={parsedRoadmap}
              onTaskUpdate={fetchRoadmap}
              openYearIndices={openYearIndices}
              toggleYear={toggleYear}
            />
          </div>
        ) : (
          <div className="bg-white p-6 rounded-md shadow-md">
            <p className="text-gray-800">{errorMessage || "Roadmap is not available."}</p>
          </div>
        )}
      </div>
      <footer className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} YourBrand. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
