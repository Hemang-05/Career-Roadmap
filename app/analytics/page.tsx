
// app/analytics/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useSyncUser } from "@/app/hooks/sync-user";
import FloatingNavbar from "@/components/Navbar";
import ProgressBar from "@/components/ProgressBar";
import PaymentPlan from "@/components/PaymentPlan";
import { calculateWeightProgress } from "@/utils/calcWeightProgress";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Helper function to get pace styling with more modern colors
const getPaceClass = (pace: string): string => {
  switch (pace?.toLowerCase()) {
    case "on track":
      return "text-emerald-600 bg-emerald-50 border border-emerald-200";
    case "before track":
      return "text-blue-600 bg-blue-50 border border-blue-200";
    case "behind track":
      return "text-rose-600 bg-rose-50 border border-rose-200";
    default:
      return "text-slate-600 bg-slate-50 border border-slate-200";
  }
};

// Helper to calculate total tasks
const calculateTotalTasks = (roadmap: any): number => {
  let total = 0;
  roadmap?.yearly_roadmap?.forEach((year: any) => {
    year.phases.forEach((phase: any) => {
      phase.milestones.forEach((milestone: any) => {
        total += milestone.tasks?.length || 0;
      });
    });
  });
  return total;
};

export default function AnalyticsDashboard() {
  useSyncUser();
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const [roadmap, setRoadmap] = useState<any>(null);
  const [difficulty, setDifficulty] = useState<string>("");
  const [weightProgress, setWeightProgress] = useState<number>(0);
  const [pace, setPace] = useState<string>("N/A");
  const [tasksCompleted, setTasksCompleted] = useState<number | null>(null);
  const [totalTasks, setTotalTasks] = useState<number | null>(null);
  const [taskCompletionPercentage, setTaskCompletionPercentage] = useState<
    number | null
  >(null);
  const [eventsAttended, setEventsAttended] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentPlan, setShowPaymentPlan] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dashboardLinks = [
    { href: "/roadmap", label: "Roadmap" },
    { href: "/jobs", label: "Jobs" },
    { href: "/events", label: "Events" },
    { href: "/blog", label: "Blogs" },
  ];

  const fetchAnalytics = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: userRecord, error: userError } = await supabase
        .from("users")
        .select("id, subscription_status, subscription_end")
        .eq("clerk_id", user.id)
        .single();

      if (userError || !userRecord) {
        setErrorMessage("User record not found.");
        setLoading(false);
        return;
      }

      const { subscription_status, subscription_end, id: userId } = userRecord;
      const currentDate = new Date();
      const subscriptionEndDate = subscription_end
        ? new Date(subscription_end)
        : new Date(0);

      if (
        !subscription_status ||
        subscription_status === "inactive" ||
        subscriptionEndDate < currentDate
      ) {
        setShowPaymentPlan(false);        // make it true
        // setLoading(false);
        // return;
      }

      // Fetch Career Info
      const { data: careerInfoData, error: careerInfoError } = await supabase
        .from("career_info")
        .select("roadmap, difficulty")
        .eq("user_id", userId)
        .single();

      if (careerInfoError || !careerInfoData) {
        setErrorMessage("Could not fetch career information.");
      } else {
        setDifficulty(careerInfoData.difficulty || "Not Set");
        if (careerInfoData.roadmap) {
          try {
            const parsedRoadmap =
              typeof careerInfoData.roadmap === "string"
                ? JSON.parse(careerInfoData.roadmap)
                : careerInfoData.roadmap;
            setRoadmap(parsedRoadmap);
            const computedWeightProgress =
              calculateWeightProgress(parsedRoadmap);
            setWeightProgress(computedWeightProgress);
            const calculatedTotalTasks = calculateTotalTasks(parsedRoadmap);
            setTotalTasks(calculatedTotalTasks);
          } catch (err) {
            console.error("Error processing roadmap data:", err);
            setErrorMessage("Error processing roadmap data.");
            setRoadmap(null);
            setWeightProgress(0);
            setTotalTasks(0);
          }
        } else {
          setRoadmap(null);
          setWeightProgress(0);
          setTotalTasks(0);
        }
      }

      // Fetch Analytics Data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from("user_analytics")
        .select(
          "pace, task_completed, overall_task_percentage, events_attended"
        )
        .eq("user_id", userId)
        .single();

      if (analyticsError || !analyticsData) {
        console.warn(
          "Could not fetch user analytics details:",
          analyticsError?.message
        );
        setPace("N/A");
        setTasksCompleted(0);
        setTaskCompletionPercentage(0);
        setEventsAttended(0);
      } else {
        setPace(analyticsData.pace || "Not Set");
        setTasksCompleted(analyticsData.task_completed ?? 0);
        setEventsAttended(analyticsData.events_attended ?? 0);

        if (
          totalTasks !== null &&
          totalTasks > 0 &&
          analyticsData.task_completed !== null
        ) {
          const percentage = (analyticsData.task_completed / totalTasks) * 100;
          setTaskCompletionPercentage(percentage);
        } else if (analyticsData.overall_task_percentage !== null) {
          setTaskCompletionPercentage(analyticsData.overall_task_percentage);
        } else {
          setTaskCompletionPercentage(0);
        }
      }
    } catch (err: any) {
      console.error("An unexpected error occurred:", err);
      setErrorMessage(`An unexpected error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
      return;
    }
    if (isLoaded && isSignedIn && user) {
      fetchAnalytics();
    }
  }, [isLoaded, isSignedIn, user, router]);

   // listen for any in‐page update and re‐fetch
 useEffect(() => {
   function onAnalyticsUpdated() {
     if (isLoaded && isSignedIn && user) {
       fetchAnalytics();
     }
   }
   window.addEventListener("analyticsUpdated", onAnalyticsUpdated);
   return () => {
     window.removeEventListener("analyticsUpdated", onAnalyticsUpdated);
   };
 }, [isLoaded, isSignedIn, user, fetchAnalytics]);


  // Data for pie chart
  const pieChartData =
    tasksCompleted !== null && totalTasks !== null
      ? [
          {
            name: "Completed",
            value: tasksCompleted,
            color: "#FF6500", // Brand orange
          },
          {
            name: "Remaining",
            value: totalTasks - tasksCompleted,
            color: "#E5E7EB", // Light gray
          },
        ]
      : [];

  // Loading state with minimalist design
  if (loading && !showPaymentPlan) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="p-4 space-y-2">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#FF6500] animate-spin mx-auto"></div>
          <p className="text-slate-500 text-center mt-4">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  if (showPaymentPlan && user?.id) {
    return (
      <PaymentPlan
        clerk_id={user.id}
        onSuccess={() => {
          setShowPaymentPlan(false);
          fetchAnalytics();
        }}
        message="Your subscription has expired or is inactive. Please choose a plan to access analytics."
      />
    );
  }

  // Main Dashboard Content with modern, minimal design
  return (
    <div className="min-h-screen bg-[#fafff9] flex flex-col">
      <FloatingNavbar navLinks={dashboardLinks} />
      <div className="container mx-auto mt-24 px-6 py-12 flex-grow max-w-6xl">
        <h1 className="text-3xl text-slate-800 font-bold mb-2">
          Performance Analysis
        </h1>
        <p className="text-slate-500 mb-10">
          Track your progress and key metrics at a glance
        </p>

        {errorMessage && !showPaymentPlan && (
          <div
            className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-lg mb-8"
            role="alert"
          >
            <strong className="font-medium">Error: </strong>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Analytics Grid - Redesigned for cleaner look */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Stat Card: Pace */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between transition-all hover:shadow-md">
            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-6">
              Current Pace
            </h3>
            <div className="flex items-center justify-between">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getPaceClass(
                  pace
                )}`}
              >
                {pace || "Not Set"}
              </span>
            </div>
          </div>

          {/* Stat Card: Difficulty */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between transition-all hover:shadow-md">
            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-6">
              Selected Difficulty
            </h3>
            <div className="flex items-center justify-between">
            <span className="text-xl font-semibold text-slate-800">
              {difficulty
                ? difficulty
                    .split(" ")
                    .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
                    .join(" ")
                : "Not Set"}
            </span>
              <div className="h-8 w-8 rounded-full bg-[#FF6500] opacity-80"></div>
            </div>
          </div>

          {/* Stat Card: Events Attended */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between transition-all hover:shadow-md">
            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-6">
              Events Attended
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-800">
                {eventsAttended ?? "0"}
              </span>
              <span className="text-sm text-slate-500">Total</span>
            </div>
          </div>
        </div>

        {/* Progress Section - Redesigned with charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Weighted Progress Card */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-slate-800 text-lg font-semibold mb-6">
              Overall Weighted Progress
            </h2>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-500">
                  Based on task importance
                </span>
                <span className="text-xl font-bold text-[#FF6500]">
                  {weightProgress.toFixed(1)}%
                </span>
              </div>
              <ProgressBar progress={weightProgress} />
            </div>
          </div>

          {/* Task Completion Card with Pie Chart */}
          {tasksCompleted !== null &&
            totalTasks !== null &&
            taskCompletionPercentage !== null && (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-slate-800 text-lg font-semibold mb-6">
                  Task Completion
                </h2>
                <div className="flex flex-col lg:flex-row items-center justify-between">
                  <div className="w-full lg:w-1/2 mb-6 lg:mb-0">
                    <div className="flex flex-col items-center">
                      <p className="text-sm text-slate-500 mb-2">
                        {tasksCompleted} of {totalTasks} tasks completed
                      </p>
                      {/* <div className="text-3xl font-bold text-[#FF6500]">
                        {taskCompletionPercentage.toFixed(1)}%
                      </div> */}
                    </div>
                  </div>

                  {/* Pie Chart */}
                  <div className="w-full lg:w-1/2 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={
                            pieChartData as {
                              name: string;
                              value: number;
                              color: string;
                            }[]
                          }
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {pieChartData.map(
                            (
                              entry: {
                                name: string;
                                value: number;
                                color: string;
                              },
                              index: number
                            ) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            )
                          )}
                        </Pie>
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            `${value} tasks`,
                            name,
                          ]}
                          contentStyle={{
                            borderRadius: "6px",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Insights Card */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 mb-10">
          <h2 className="text-slate-800 text-lg font-semibold mb-6">
            Performance Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-100">
              <h3 className="text-slate-700 font-medium mb-2">Pace Analysis</h3>
              <p className="text-slate-600 text-sm">
                {pace === "On Track"
                  ? "You're making steady progress at the expected rate."
                  : pace === "Ahead Of Track"
                  ? "You're ahead of schedule! Keep up the good work."
                  : pace === "Behind Track"
                  ? "You're a bit behind schedule. Consider focusing on high-priority tasks."
                  : "Start completing tasks to establish your pace."}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-100">
              <h3 className="text-slate-700 font-medium mb-2">
                Upcoming Milestones
              </h3>
              <p className="text-slate-600 text-sm">
                {totalTasks && tasksCompleted
                  ? `You have ${
                      totalTasks - tasksCompleted
                    } tasks remaining on your roadmap.`
                  : "No upcoming milestones found."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with subtle info */}
      <div className="py-6 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-6xl">
          <p className="text-slate-400 text-xs text-center">
            Analytics data updated as of {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
