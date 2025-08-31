"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";

// Components
import FloatingNavbar from "@/components/Navbar";
import PaymentPlan from "@/components/PaymentPlan";
import USDPaymentPlan from "@/components/USDPaymentPlan";
import Loader from "@/components/Loader";


interface CareerData {
  avgSalaryIndia?: string;
  avgSalaryGlobal?: string;
  hotSpecializations?: string[];
  topHiringCompanies?: string[];
}

interface OverviewData {
  career_overview: string;
  generated_at: string;
  prompt_version: string;
  user_context: {
    educational_stage: string;
    difficulty: string;
    desired_career: string;
    residing_country: string;
  };
}

export default function RoadmapOverview() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();

  // ============ STATE ============
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [parsedOverview, setParsedOverview] = useState<string[]>([]);
  const [careerData, setCareerData] = useState<CareerData>({});
  const [error, setError] = useState<string | null>(null);

  // ============ SUBSCRIPTION & PAYMENT ============
  const [subscriptionStatus, setSubscriptionStatus] = useState<boolean>(false);
  const [showPaymentPlans, setShowPaymentPlans] = useState<boolean>(false);
  const [showUSDPaymentPlans, setShowUSDPaymentPlans] = useState<boolean>(false);

  // ============ ROADMAP GENERATION ============
  const [generating, setGenerating] = useState<boolean>(false);
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // ============ USER DATA ============
  const [residingCountry, setResidingCountry] = useState<string | null>(null);

  // ============ NEW STATE FOR ROADMAP CHECK ============
  const [hasExistingRoadmap, setHasExistingRoadmap] = useState<boolean>(false);

  // ============ HELPER FUNCTIONS ============
  const isSouthAsianCountry = (code: string) => ["IN", "PK", "BD"].includes(code);

// ✅ CORRECTED: Parse simple Overview and CareerData
// ✅ ENHANCED: Parse simple Overview and CareerData with debugging
const parseSimpleOverview = (text: string) => {
  const sections = text.split(/\*\*Part 2: CareerData\*\*|CareerData:/);
  const overviewSection = sections[0]?.replace(/\*\*Part 1: Overview\*\*/g, "").trim() || "";
  const careerDataSection = sections[1]?.trim() || "";

  // Split overview into individual lines and clean them
  const overviewLines = overviewSection
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line.length > 0)
    .slice(0, 10);

  // Parse CareerData
  // const parsedCareerData: CareerData = {};
  
  // if (careerDataSection) {
  //   const salaryIndiaMatch = careerDataSection.match(/AvgSalaryIndia:\s*"([^"]+)"/);
  //   if (salaryIndiaMatch) parsedCareerData.avgSalaryIndia = salaryIndiaMatch[1];

  //   const salaryGlobalMatch = careerDataSection.match(/AvgSalaryGlobal:\s*"([^"]+)"/);
  //   if (salaryGlobalMatch) parsedCareerData.avgSalaryGlobal = salaryGlobalMatch[1];

  //   const specializationsMatch = careerDataSection.match(/HotSpecializations:\s*\[(.*?)\]/s);
  //   if (specializationsMatch) {
  //     const specs = specializationsMatch[1]
  //       .split('", "')
  //       .map(s => s.replace(/^"|"$/g, '').trim())
  //       .filter(Boolean);
  //     parsedCareerData.hotSpecializations = specs;
  //   }

  //   const companiesMatch = careerDataSection.match(/TopHiringCompanies:\s*\[(.*?)\]/s);
  //   if (companiesMatch) {
  //     const companies = companiesMatch[1]
  //       .split('", "')
  //       .map(s => s.replace(/^"|"$/g, '').trim())
  //       .filter(Boolean);
  //     parsedCareerData.topHiringCompanies = companies;
  //   }
  // }

  return { overviewLines };
};



  // ============ AUTH & DATA LOADING ============
  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/");
  }, [isSignedIn, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Get user subscription status
        const { data: userRecord, error: userError } = await supabase
          .from("users")
          .select("id, subscription_status, subscription_plan, subscription_end")
          .eq("clerk_id", user.id)
          .single();

        if (userError || !userRecord) {
          setError("User record not found");
          return;
        }

        setSubscriptionStatus(userRecord.subscription_status);

        // Check if subscription expired
        if (userRecord.subscription_end && new Date(userRecord.subscription_end) < new Date()) {
          await supabase
            .from("users")
            .update({ subscription_status: false })
            .eq("clerk_id", user.id);
          setSubscriptionStatus(false);
        }

        // Fetch career info with overview
        const { data: careerInfo, error: careerError } = await supabase
          .from("career_info")
          .select("overview, residing_country, roadmap")
          .eq("user_id", userRecord.id)
          .single();

        if (careerError || !careerInfo) {
          setError("Career information not found. Please complete the form first.");
          return;
        }

        if (!careerInfo.overview) {
          setError("Overview not generated. Please try submitting the form again.");
          return;
        }

        setOverviewData(careerInfo.overview);
        setResidingCountry(careerInfo.residing_country);
        
        // ============ NEW: Check if roadmap exists ============
        const roadmapExists = !!(careerInfo?.roadmap && Object.keys(careerInfo.roadmap).length);
        setHasExistingRoadmap(roadmapExists);

        // ✅ NEW: Parse simple overview
        const { overviewLines } = parseSimpleOverview(careerInfo.overview.career_overview);
        setParsedOverview(overviewLines);
        

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load overview data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, user?.id]);

  // ============ ROADMAP GENERATION HANDLERS ============
  const handleProceedToRoadmap = () => {
    // If roadmap already exists, navigate directly to roadmap page
    if (hasExistingRoadmap) {
      router.push("/roadmap");
      return;
    }

    if (!subscriptionStatus) {
      if (residingCountry && isSouthAsianCountry(residingCountry)) {
        setShowPaymentPlans(true);
      } else {
        setShowUSDPaymentPlans(true);
      }
    } else {
      setShowGenerateModal(true);
    }
  };

  const handleGenerateRoadmap = async () => {
    setShowGenerateModal(false);
    setGenerating(true);

    try {
      const res = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerk_id: user?.id }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Roadmap generation failed");

      router.push("/roadmap");
    } catch (err) {
      console.error("Roadmap generation failed:", err);
      setApiError("Failed to generate roadmap. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // ============ NAVIGATION LINKS ============
  const dashboardLinks = [
    { href: "/dashboard?from=overview", label: "Dashboard", forceDirect: true },
    { href: "/roadmap", label: "Roadmap" },
    { href: "/blog", label: "Blogs" },
  ];

  // ============ LOADING STATE ============
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="p-4 space-y-2">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#4fbdb7] animate-spin mx-auto"></div>
          <p className="text-slate-500 text-center mt-4">Loading Overview...</p>
        </div>
      </div>
    );
  }

  // ============ ERROR STATE ============
  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <FloatingNavbar navLinks={dashboardLinks} />
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Overview Not Available</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-gray-500/5 backdrop-blur-md text-gray-700 py-3 px-6 rounded-full border border-gray-200 transition-all duration-300 font-light hover:shadow-sm hover:shadow-gray-700/60 hover:-translate-y-0.5 hover:bg-white/25"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden min-h-screen bg-[#ffffff]">
      {/* Navbar */}
      <div style={{ zIndex: 50 }}>
        <FloatingNavbar navLinks={dashboardLinks} />
      </div>

      {/* Main Content */}
      <div className="flex-grow py-8 px-4 sm:px-6 lg:px-16 xl:px-52 relative" style={{ zIndex: 10 }}>
        <div className="max-w-4xl mx-auto mt-24">
          
          {/* Glassmorphism Career Card */}
          <div className="relative bg-gradient-to-br from-[#608fae] via-[#355a72] to-[#003161] text-white rounded-3xl p-8 sm:p-8 mb-8 max-w-3xl mx-auto">
           
            {/* Content */}
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-5xl font-bold mb-2 tracking-tight drop-shadow-lg">
                {overviewData?.user_context?.desired_career || 'Your Career'}
              </h2>
              
              <div className="sm:text-base text-sm sm:font-light font-normal leading-relaxed">
                <p className="text-gray-100 leading-relaxed drop-shadow-sm">
                  {parsedOverview.join(' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center" style={{ zIndex: 10 }}>
            <button
              onClick={handleProceedToRoadmap}
              disabled={generating}
              className="bg-gradient-to-r from-[#608fae] via-[#355a72] to-[#003161] text-white py-4 px-8 rounded-full text-lg font-light transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? "Generating Roadmap..." : hasExistingRoadmap ? "View Roadmap" : "Generate Roadmap"}
            </button>   
          </div>

        </div>
      </div>

      {/* Payment Plan Modals */}
      {showPaymentPlans && user && (
       <div className="fixed inset-0 z-50"> 
       <PaymentPlan
         clerk_id={user.id}
         onSuccess={(plan) => {
           setShowPaymentPlans(false);
           setSubscriptionStatus(true);
           setShowGenerateModal(true);
         }}
         onClose={() => setShowPaymentPlans(false)}
         message="To generate your detailed roadmap, please choose a subscription plan:"
       />
     </div>
      )}

      {showUSDPaymentPlans && user && (
        <div className="fixed inset-0 z-50">
        <USDPaymentPlan
          clerk_id={user.id}
          onSuccess={(plan) => {
            setShowUSDPaymentPlans(false);
            setSubscriptionStatus(true);
            setShowGenerateModal(true);
          }}
          onClose={() => setShowUSDPaymentPlans(false)}
          message="To generate your detailed roadmap, please choose a subscription plan:"
        />
      </div>
      )}

      {/* Generate Confirmation Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md">
            <h2 className="text-2xl text-black font-normal mb-2">
              Generate Career Roadmap
            </h2>
            <p className="mb-6 text-gray-700 text-sm">
              Ready to create your detailed roadmap? This will include specific tasks, resources, and timeline for your journey.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="bg-white text-gray-600 py-2 px-4 rounded-3xl border border-gray-400 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateRoadmap}
                className="bg-gray-800/60 text-white py-2 px-4 rounded-3xl hover:bg-[#355a72]   transition-colors"
              >
                Generate Roadmap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Error Modal */}
      {apiError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md">
            <h2 className="text-2xl text-red-600 font-normal mb-2">
              Generation Failed
            </h2>
            <p className="mb-6 text-gray-700 text-sm">
              {apiError}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setApiError(null)}
                className="bg-gray-800 text-white py-2 px-4 rounded-3xl hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {generating && (
        <div className="fixed inset-0 justify-center items-center z-50">
          <Loader />
        </div>
      )}
    </div>
  );
}