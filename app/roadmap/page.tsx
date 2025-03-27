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

function isYearComplete(yearItem: any): boolean {
  // Check if every task in every milestone of every phase is completed.
  for (const phase of yearItem.phases) {
    for (const milestone of phase.milestones) {
      for (const task of milestone.tasks) {
        if (!task.completed) {
          return false;
        }
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
        // A year is unlocked if it is the first year or if the previous year is complete.
        const unlocked =
          yearIndex === 0 ||
          isYearComplete(roadmapData.yearly_roadmap[yearIndex - 1]);

        const isOpen = openYearIndices.includes(yearIndex);

        return (
          <div key={yearIndex} className="border p-4 rounded-md shadow-sm">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => {
                // Allow toggle only if unlocked.
                if (unlocked) {
                  toggleYear(yearIndex);
                }
              }}
            >
              <h2 className="text-2xl font-bold text-gray-800">
                {yearItem.year}{" "}
                {unlocked ? null : (
                  <span className="text-red-500 text-base">(Locked)</span>
                )}
              </h2>
              {unlocked && (
                <button className="text-blue-600">
                  {isOpen ? "Collapse" : "Expand"}
                </button>
              )}
            </div>
            <p className="text-gray-600 mb-4">{yearItem.overview}</p>
            {/* If the year is unlocked and expanded, show phases, milestones, and tasks */}
            {unlocked && isOpen ? (
              yearItem.phases.map((phase: any, phaseIndex: number) => (
                <div key={phaseIndex} className="mb-4 border-t pt-4">
                  <h3 className="text-xl font-semibold text-[#FF6500]">
                    {phase.phase_name}
                  </h3>
                  {phase.milestones.map((milestone: any, mIndex: number) => (
                    <div key={mIndex} className="ml-4 mb-2">
                      <h4 className="text-lg font-medium text-gray-800">
                        {milestone.name}
                      </h4>
                      <p className="text-gray-600">{milestone.description}</p>
                      <ul className="list-disc list-inside">
                        {milestone.tasks.map((task: any, tIndex: number) => (
                          <li key={tIndex} className="text-gray-700 flex items-center">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={async () => {
                                // Toggle the task status.
                                task.completed = !task.completed;
                                // Update the task via the API endpoint.
                                await fetch("/api/update-task", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    user_id: roadmapData.user_id,
                                    task_title: task.task_title,
                                    completed: task.completed,
                                    // Pass current phase identifier for pace calculation.
                                    currentPhaseIdentifier: phase.phase_name,
                                  }),
                                });
                                onTaskUpdate(); // Refresh data after update.
                              }}
                              className="mr-2"
                            />
                            <span className="font-semibold">
                              {task.task_title}:
                            </span>{" "}
                            {task.description}{" "}
                            <span className="italic">(Weight: {task.weight})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              // If the year is locked or not expanded, show only milestone titles and descriptions without tasks.
              <div>
                {yearItem.phases.map((phase: any, phaseIndex: number) => (
                  <div key={phaseIndex} className="mb-4 border-t pt-4">
                    <h3 className="text-xl font-semibold text-[#FF6500]">
                      {phase.phase_name}
                    </h3>
                    {phase.milestones.map((milestone: any, mIndex: number) => (
                      <div key={mIndex} className="ml-4 mb-2">
                        <h4 className="text-lg font-medium text-gray-800">
                          {milestone.name}
                        </h4>
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
  // State to hold which year indices are open (expanded)
  const [openYearIndices, setOpenYearIndices] = useState<number[]>([]);

  // Updated navigation: "User Analysis" replaces "Settings"
  const dashboardLinks = [
    { href: "/roadmap", label: "Roadmap" },
    { href: "/dashboard", label: "Edit Info" },
    { href: "/events", label: "Events" },
    { href: "/analytics", label: "User Analysis" },
    { href: "/support", label: "Support" },
  ];

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
        } else if (!data?.roadmap) {
          setErrorMessage("No roadmap found. Please generate your roadmap.");
        } else {
          setRoadmap(data.roadmap);
          try {
            const parsed =
              typeof data.roadmap === "string"
                ? JSON.parse(data.roadmap)
                : data.roadmap;
            // Attach the userId for further updates.
            parsed.user_id = userId;
            setParsedRoadmap(parsed);
            setTaskCountProgress(calculateTaskCountProgress(parsed));
          } catch (err) {
            console.error("Error parsing roadmap JSON:", err);
          }
        }
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred while fetching the roadmap.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle the open state for a specific year.
  const toggleYear = (index: number) => {
    setOpenYearIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
      return;
    }
    if (user) {
      fetchRoadmap();
    }
  }, [isSignedIn, router, user]);

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
        {/* Display the task count-based progress bar */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Task Completion Progress</h2>
          <ProgressBar progress={taskCountProgress} />
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
            <p className="text-gray-800">
              {errorMessage || "Roadmap is not available."}
            </p>
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
