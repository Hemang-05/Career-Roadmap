"use client";

import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useSyncUser } from "@/app/hooks/sync-user";
import PaymentPlan from "@/components/PaymentPlan";
import FloatingNavbar from "@/components/Navbar";

function RoadmapDisplay({ roadmapData }: { roadmapData: any }) {
  return (
    <div className="space-y-8">
      {roadmapData.yearly_roadmap.map((yearItem: any, yearIndex: number) => (
        <div key={yearIndex} className="border p-4 rounded-md shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800">{yearItem.year}</h2>
          <p className="text-gray-600 mb-4">{yearItem.overview}</p>
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
                  <ul className="list-disc list-inside">
                    {milestone.tasks.map((task: any, tIndex: number) => (
                      <li key={tIndex} className="text-gray-700">
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
          ))}
        </div>
      ))}
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
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPaymentPlan, setShowPaymentPlan] = useState(false);

  const dashboardLinks = [
    { href: "/roadmap", label: "Roadmap" },
    { href: "/dashboard", label: "Edit Info" },
    { href: "/events", label: "Events" },
    { href: "/settings", label: "Settings" },
    { href: "/support", label: "Support" },
  ];

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
      return;
    }

    async function fetchRoadmap() {
      try {
        if (user) {
          // Fetch subscription info from users table
          const { data: userRecord, error: userError } = await supabase
            .from("users")
            .select("id, subscription_status, subscription_end")
            .eq("clerk_id", user.id)
            .single();
          if (userError || !userRecord) {
            console.log("Error fetching user record:", userError);
            setErrorMessage("User record not found in Supabase.");
            return;
          }
          const {
            subscription_status,
            subscription_end,
            id: userId,
          } = userRecord;
          const currentDate = new Date();
          const subscriptionEndDate = new Date(subscription_end);
          if (!subscription_status || subscriptionEndDate < currentDate) {
            console.log("Subscription expired or inactive");
            setShowPaymentPlan(true);
            return;
          }
          // If subscription is active, fetch the roadmap from career_info
          const { data, error } = await supabase
            .from("career_info")
            .select("roadmap")
            .eq("user_id", userId)
            .single();
          if (error) {
            console.log("Error fetching roadmap:", error);
            setErrorMessage("Error fetching roadmap: " + error.message);
          } else if (!data?.roadmap) {
            setErrorMessage(
              "No roadmap found. Please generate your roadmap. Go to edit info and submit your details"
            );
          } else {
            setRoadmap(data.roadmap);
          }
        }
      } catch (err) {
        console.log("Error in fetchRoadmap:", err);
        setErrorMessage(
          "An unexpected error occurred while fetching the roadmap."
        );
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchRoadmap();
    }
  }, [isSignedIn, router, user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // If payment plan should be shown (subscription expired), display the PaymentPlan component
  if (showPaymentPlan && user?.id) {
    return (
      <PaymentPlan
        clerk_id={user.id}
        onSuccess={() => window.location.reload()}
        message="Your subscription has expired. Please choose a new plan."
      />
    );
  }

  let parsedRoadmap: any = null;
  try {
    parsedRoadmap = roadmap ? JSON.parse(roadmap) : null;
  } catch (err) {
    console.error("Error parsing roadmap JSON:", err);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <FloatingNavbar navLinks={dashboardLinks} />

      {/* Roadmap Content */}
      <div className="container mx-auto mt-20 px-4 py-8 flex-grow">
        <h1 className="text-3xl text-black font-bold mb-6">
          Your <span className="text-[#FF6500]">Career</span> Roadmap
        </h1>
        {parsedRoadmap ? (
          <div className="bg-white p-6 rounded-md shadow-md">
            <RoadmapDisplay roadmapData={parsedRoadmap} />
          </div>
        ) : (
          <div className="bg-white p-6 rounded-md shadow-md">
            <p className="text-gray-800">
              {errorMessage || "Roadmap is not available."}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} YourBrand. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
