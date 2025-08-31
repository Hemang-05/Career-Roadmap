"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useSyncUser } from "@/app/hooks/sync-user";
import countryList from "react-select-country-list";
import { supabase } from "@/utils/supabase/supabaseClient";

// Components
import Navbar from "@/components/Navbar";
import RoadmapNotification from "@/components/RoadmapNotification";

// New Dashboard Components
import AwareUnawareButton from "@/components/AwareUnawareButton";
import ChatbotComponent from "@/components/ChatbotComponent";
import FormComponent from "@/components/FormComponent";

import { OptionType } from "@/components/FormComponent";

export default function Dashboard() {
  useSyncUser();
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();

  // ============ NAVIGATION STATE ============
  const [currentComponent, setCurrentComponent] = useState<0 | 1 | 2>(0);
  const [userPath, setUserPath] = useState<"aware" | "confused" | null>(null);
  const [chatbotComplete, setChatbotComplete] = useState<boolean>(false);
  const [determinedCareer, setDeterminedCareer] = useState<string>("");

  // ============ UI STATE ============
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittingOverview, setSubmittingOverview] = useState<boolean>(false); // ✅ NEW
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [showOverviewPopup, setShowOverviewPopup] = useState<boolean>(false); // NEW: For overview popup

  // ============ USER & SUBSCRIPTION ============
  const [dbUserId, setDbUserId] = useState<string | null>(null);

  // ============ CAREER & ROADMAP ============
  const [hasRoadmap, setHasRoadmap] = useState<boolean>(false);
  const [hasOverview, setHasOverview] = useState<boolean>(false); // NEW: Added for overview tracking
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [isDirectNavigation, setIsDirectNavigation] = useState<boolean>(false); // NEW: Track if user came directly

  // ============ ACTIVE FORM STATE ============
  const [residingCountry, setResidingCountry] = useState<OptionType | null>(null);
  const [spendingCapacity, setSpendingCapacity] = useState<string>("");
  const [parentEmail, setParentEmail] = useState<string>("");
  const [willingToMoveAbroad, setWillingToMoveAbroad] = useState<boolean | null>(false);
  const [moveAbroad, setMoveAbroad] = useState<"yes" | "suggest">("suggest");
  const [preferredAbroadCountry, setPreferredAbroadCountry] = useState<OptionType | null>(null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | null>(null);

  // ✅ CAREER FIELD
  const [desiredCareer, setDesiredCareer] = useState<string>("");

  // ============ NEW FORM STATE (16 FIELDS) ============
  const [educationalStage, setEducationalStage] = useState<string>("");
  const [schoolGrade, setSchoolGrade] = useState<string>("");
  const [schoolStream, setSchoolStream] = useState<string>("");
  const [collegeYear, setCollegeYear] = useState<string>("");
  const [collegeDegree, setCollegeDegree] = useState<string>("");
  const [practicalExperience, setPracticalExperience] = useState<string>("");
  const [academicStrengths, setAcademicStrengths] = useState<string>("");
  const [extracurricularActivities, setExtracurricularActivities] = useState<string>("");
  const [industryKnowledgeLevel, setIndustryKnowledgeLevel] = useState<string>("");
  const [preferredLearningStyle, setPreferredLearningStyle] = useState<string>("");
  const [roleModelInfluences, setRoleModelInfluences] = useState<string>("");
  const [culturalFamilyExpectations, setCulturalFamilyExpectations] = useState<string>("");
  const [mentorshipAndNetworkStatus, setMentorshipAndNetworkStatus] = useState<string>("");
  const [preferredLanguage, setPreferredLanguage] = useState<string>("");
  const [preferredWorkEnvironment, setPreferredWorkEnvironment] = useState<string>("");
  const [longTermAspirations, setLongTermAspirations] = useState<string>("");

  // ============ HELPER FUNCTIONS ============
  const getCountryOption = (countryCode: string): OptionType | null => {
    const countryOptions = countryList().getData() as OptionType[];
    return countryOptions.find((option) => option.value === countryCode) || null;
  };

  // ============ NAVIGATION HANDLERS ============
  const handleAwareClick = () => {
    setUserPath("aware");
    router.push("/onboarding");
  };

  const handleConfusedClick = () => {
    setUserPath("confused");
    setCurrentComponent(1);
  };

  // NEW: Handle overview navigation with validation
  const handleOverviewClick = () => {
    console.log("Clicked Overview. Current value of hasOverview:", hasOverview);
    if (hasOverview) {
      router.push("/overview");
    } else {
      setShowOverviewPopup(true);
    }
  };

  const handleChatbotComplete = async (career: string) => {
    setDeterminedCareer(career);
    setDesiredCareer(career);
    setChatbotComplete(true);

    if (!user || !user.id) {
      router.push("/");
      return;
    }

    try {
      const clerkId = user.id;

      // Get internal user id from users table
      let userId = dbUserId;
      if (!userId) {
        const { data: u, error: uErr } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", clerkId)
          .maybeSingle();
        if (!uErr && u) {
          userId = u.id;
          setDbUserId(userId);
        }
      }

      // Only proceed if we have the internal user ID
      if (userId) {
        const { data: existing, error: existingErr } = await supabase
          .from("career_info")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (existingErr) throw existingErr;

        if (existing) {
          await supabase
            .from("career_info")
            .update({
              desired_career: career,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
        } else {
          await supabase.from("career_info").insert({
            user_id: userId,
            desired_career: career,
          });
        }
      }

      fetch("/api/assign-career-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerk_id: clerkId, desired_career: career }),
      }).catch(() => {});
    } catch (err) {
    } finally {
      router.push("/onboarding");
    }
  };

  // ============ EDUCATIONAL STAGE CLEANUP ============
  useEffect(() => {
    if (educationalStage === "school") {
      setCollegeYear("");
      setCollegeDegree("");
    } else if (educationalStage === "college") {
      setSchoolGrade("");
      setSchoolStream("");
    } else if (educationalStage === "self-taught" || educationalStage === "working") {
      setSchoolGrade("");
      setSchoolStream("");
      setCollegeYear("");
      setCollegeDegree("");
    }
  }, [educationalStage]);

  // ============ AUTH & DATA LOADING ============
  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/");
  }, [isSignedIn, isLoaded]);

  // NEW: Check if this is a direct navigation to prevent infinite redirects
  useEffect(() => {
    // Check URL parameters to see if user came from overview or roadmap pages
    const urlParams = new URLSearchParams(window.location.search);
    const fromParam = urlParams.get('from');
    
    if (fromParam === 'overview' || fromParam === 'roadmap') {
      setIsDirectNavigation(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !user) return;
    let mounted = true;

    (async () => {
      try {
        const { data: u, error: uErr } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", user.id)
          .single();

        if (uErr || !u) throw uErr || new Error("User not found");
        if (!mounted) return;

        setDbUserId(u.id);

        const { data: c, error: cErr } = await supabase
          .from("career_info")
          .select("*")
          .eq("user_id", u.id)
          .maybeSingle();

        if (cErr) throw cErr;
        if (!mounted) return;

        // Check roadmap existence
        const roadmapExists = !!(c?.roadmap && Object.keys(c.roadmap).length);
        setHasRoadmap(roadmapExists);
        
        // Check overview existence
        const overviewExists = !!(
          c?.overview &&
          typeof c.overview === "object" &&
          Object.keys(c.overview).length > 0
        );
        setHasOverview(overviewExists);

        // MODIFIED: Only redirect if this is NOT a direct navigation
        if (!isDirectNavigation) {
          if (roadmapExists) {
            router.push("/roadmap");
            return;
          } else if (overviewExists) {
            router.push("/overview");
            return;
          }
        }

        if (roadmapExists) {
          setShowNotification(true);
        }

        // ✅ DATA LOADING
        if (c) {
          if (c.residing_country) setResidingCountry(getCountryOption(c.residing_country));
          if (c.spending_capacity) setSpendingCapacity(c.spending_capacity.toString());
          if (c.parent_email) setParentEmail(c.parent_email);
          if (c.move_abroad !== null) setWillingToMoveAbroad(c.move_abroad);
          if (c.preferred_abroad_country) {
            if (c.preferred_abroad_country === "Suggest") {
              setMoveAbroad("suggest");
            } else {
              setMoveAbroad("yes");
              setPreferredAbroadCountry(getCountryOption(c.preferred_abroad_country));
            }
          }
          if (c.difficulty) setDifficulty(c.difficulty);
          if (c.desired_career) setDesiredCareer(c.desired_career);

          // NEW FIELDS
          if (c.educational_stage) setEducationalStage(c.educational_stage);
          if (c.school_grade) setSchoolGrade(c.school_grade);
          if (c.school_stream) setSchoolStream(c.school_stream);
          if (c.college_year) setCollegeYear(c.college_year);
          if (c.college_degree) setCollegeDegree(c.college_degree);
          if (c.practical_experience) setPracticalExperience(c.practical_experience);
          if (c.academic_strengths) setAcademicStrengths(c.academic_strengths);
          if (c.extracurricular_activities) setExtracurricularActivities(c.extracurricular_activities);
          if (c.industry_knowledge_level) setIndustryKnowledgeLevel(c.industry_knowledge_level);
          if (c.preferred_learning_style) setPreferredLearningStyle(c.preferred_learning_style);
          if (c.role_model_influences) setRoleModelInfluences(c.role_model_influences);
          if (c.cultural_family_expectations) setCulturalFamilyExpectations(c.cultural_family_expectations);
          if (c.mentorship_and_network_status) setMentorshipAndNetworkStatus(c.mentorship_and_network_status);
          if (c.preferred_language) setPreferredLanguage(c.preferred_language);
          if (c.preferred_work_environment) setPreferredWorkEnvironment(c.preferred_work_environment);
          if (c.long_term_aspirations) setLongTermAspirations(c.long_term_aspirations);

          // If user has existing data, skip to form component
          if (c.desired_career || c.residing_country || c.educational_stage) {
            setCurrentComponent(2);
          }
        }

        setDataLoaded(true);
      } catch (err) {
        console.error(err);
        setDataLoaded(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isLoaded, user?.id, isDirectNavigation]); // Added isDirectNavigation dependency

  const handleRewindToStart = () => {
    setShowNotification(false);
    setCurrentComponent(0);
  };

  // ============ ✅ NEW SIMPLIFIED FORM HANDLER ============
  const handleMainFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingOverview(true);

    if (!user?.id) {
      setSubmittingOverview(false);
      return;
    }

    // Prepare form payload
    const payload: any = {
      clerk_id: user.id,
      desired_career: desiredCareer,
      residing_country: residingCountry?.value,
      spending_capacity: spendingCapacity ? parseFloat(spendingCapacity) : null,
      move_abroad: willingToMoveAbroad,
      preferred_abroad_country:
        willingToMoveAbroad && moveAbroad === "yes"
          ? preferredAbroadCountry?.value
          : willingToMoveAbroad
          ? "Suggest"
          : null,
      parent_email: parentEmail,
      difficulty,
      educational_stage: educationalStage,
      school_grade: schoolGrade,
      school_stream: schoolStream,
      college_year: collegeYear,
      college_degree: collegeDegree,
      practical_experience: practicalExperience,
      academic_strengths: academicStrengths,
      extracurricular_activities: extracurricularActivities,
      industry_knowledge_level: industryKnowledgeLevel,
      preferred_learning_style: preferredLearningStyle,
      role_model_influences: roleModelInfluences,
      cultural_family_expectations: culturalFamilyExpectations,
      mentorship_and_network_status: mentorshipAndNetworkStatus,
      preferred_language: preferredLanguage,
      preferred_work_environment: preferredWorkEnvironment,
      long_term_aspirations: longTermAspirations,
      roadmap: null,
    };

    try {
      // ✅ STEP 1: Save form data (existing logic)
      const saveRes = await fetch("/api/save-career-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!saveRes.ok) {
        throw new Error("Failed to save career information");
      }

      // ✅ STEP 2: Generate overview (NEW)
      const overviewRes = await fetch("/api/roadmap-overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerk_id: user.id }),
      });

      // Note: We don't throw error if overview fails - user can still proceed
      if (!overviewRes.ok) {
        console.warn("Overview generation failed, but continuing...");
      }

      // ✅ STEP 3: Assign career tag (existing background task)
      fetch("/api/assign-career-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_id: user.id,
          desired_career: payload.desired_career,
        }),
      }).catch(console.error);

      // ✅ STEP 4: Redirect to overview page (CHANGED)
      router.push("/overview");
    } catch (error) {
      console.error("Error in form submission:", error);
      // Show user-friendly error
      alert("There was an error saving your information. Please try again.");
    } finally {
      setSubmittingOverview(false);
    }
  };

  const dashboardLinks = [
    { href: "#", label: "Overview", onClick: handleOverviewClick },
    { href: "/blog", label: "Blogs" },
  ];

  if (!dataLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="p-4 space-y-2">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#4fbdb7] animate-spin mx-auto"></div>
          <p className="text-slate-500 text-center mt-4">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-x-hidden min-h-screen flex flex-col bg-[#ffffff]">
      <div className="pointer-events-none absolute inset-0 -z-50 bg-[#f8f8f8] [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black)]" />

      <Navbar navLinks={dashboardLinks} />

      {showNotification && (
        <RoadmapNotification
          onCreateNew={handleRewindToStart}
          onViewExisting={() => router.push("/roadmap")}
        />
      )}

      {/* Overview Popup */}
      {showOverviewPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#608fae] via-[#355a72] to-[#003161] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Overview Not Available</h2>
              <p className="text-gray-600 mb-6">You need to submit the form first to generate your career overview.</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowOverviewPopup(false)}
                  className="bg-gray-200 text-gray-700 py-3 px-6 rounded-full hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowOverviewPopup(false);
                    setCurrentComponent(2); // Go to form component
                  }}
                  className="bg-gradient-to-r from-[#608fae] via-[#355a72] to-[#003161] text-white py-3 px-6 rounded-full hover:shadow-lg transition-all duration-300"
                >
                  Fill Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-grow">
        {currentComponent === 0 && (
          <AwareUnawareButton
            user={user}
            onAwareClick={handleAwareClick}
            onConfusedClick={handleConfusedClick}
          />
        )}

        {currentComponent === 1 && (
          <ChatbotComponent user={user} onComplete={handleChatbotComplete} />
        )}

        {currentComponent === 2 && (
          <FormComponent
            user={user}
            hasRoadmap={hasRoadmap}
            onSubmit={handleMainFormSubmit}
            isSubmitting={submittingOverview} // ✅ CHANGED: Use overview loading state
            determinedCareer={determinedCareer}
            userPath={userPath}
            residingCountry={residingCountry}
            setResidingCountry={setResidingCountry}
            spendingCapacity={spendingCapacity}
            setSpendingCapacity={setSpendingCapacity}
            parentEmail={parentEmail}
            setParentEmail={setParentEmail}
            willingToMoveAbroad={willingToMoveAbroad}
            setWillingToMoveAbroad={setWillingToMoveAbroad}
            moveAbroad={moveAbroad}
            setMoveAbroad={setMoveAbroad}
            preferredAbroadCountry={preferredAbroadCountry}
            setPreferredAbroadCountry={setPreferredAbroadCountry}
            desiredCareer={desiredCareer}
            setDesiredCareer={setDesiredCareer}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            educationalStage={educationalStage}
            setEducationalStage={setEducationalStage}
            schoolGrade={schoolGrade}
            setSchoolGrade={setSchoolGrade}
            schoolStream={schoolStream}
            setSchoolStream={setSchoolStream}
            collegeYear={collegeYear}
            setCollegeYear={setCollegeYear}
            collegeDegree={collegeDegree}
            setCollegeDegree={setCollegeDegree}
            practicalExperience={practicalExperience}
            setPracticalExperience={setPracticalExperience}
            academicStrengths={academicStrengths}
            setAcademicStrengths={setAcademicStrengths}
            extracurricularActivities={extracurricularActivities}
            setExtracurricularActivities={setExtracurricularActivities}
            industryKnowledgeLevel={industryKnowledgeLevel}
            setIndustryKnowledgeLevel={setIndustryKnowledgeLevel}
            preferredLearningStyle={preferredLearningStyle}
            setPreferredLearningStyle={setPreferredLearningStyle}
            roleModelInfluences={roleModelInfluences}
            setRoleModelInfluences={setRoleModelInfluences}
            culturalFamilyExpectations={culturalFamilyExpectations}
            setCulturalFamilyExpectations={setCulturalFamilyExpectations}
            mentorshipAndNetworkStatus={mentorshipAndNetworkStatus}
            setMentorshipAndNetworkStatus={setMentorshipAndNetworkStatus}
            preferredLanguage={preferredLanguage}
            setPreferredLanguage={setPreferredLanguage}
            preferredWorkEnvironment={preferredWorkEnvironment}
            setPreferredWorkEnvironment={setPreferredWorkEnvironment}
            longTermAspirations={longTermAspirations}
            setLongTermAspirations={setLongTermAspirations}
          />
        )}
      </div>

      {/* ✅ REMOVED: All payment plan modals, generate modal, and loader components */}
    </div>
  );
}