"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useSyncUser } from "@/app/hooks/sync-user";
import countryList from "react-select-country-list";
import Select from "react-select";
import { Info } from "lucide-react";

import FloatingNavbar from "@/components/Navbar";

import { supabase } from "@/utils/supabase/supabaseClient";

type OptionType = { label: string; value: string };

function Progress({ step, total }: { step: number; total: number }) {
  const percent = Math.round((step / total) * 100);
  return (
    <div className="w-full mt-4">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{`Step ${step} of ${total}`}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
        <div
          className="h-2 bg-gray-400 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="text-[11px] text-gray-400 mt-1">~90 seconds</div>
    </div>
  );
}

function StatsCard({ stats }: { stats: string[] }) {
  return (
    // <div className="mt-6 p-4  border border-red-200 rounded-3xl">
    //   <h3 className="text-gray-800 font-medium mb-3">
    //     Your Career Reality Check
    //   </h3>
    //   <div className="space-y-3">
    //     {stats.map((item, index) => (
    //       <div key={index} className="flex items-start gap-3">
    //         <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
    //         <div>
    //           <div className="text-red-900 font-medium text-sm">
    //             {item.stat}
    //           </div>
    //           {/* <div className="text-green-800 text-xs">{item.impact}</div> */}
    //         </div>
    //       </div>
    //     ))}
    //   </div>
    // </div>
    <div className="mt-6 p-4 border border-red-200 rounded-3xl">
      <h3 className="text-gray-800 font-medium mb-3">
        Your Career Reality Check
      </h3>
      <div className="space-y-3">
        {stats.map((line, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <div className="text-sm text-red-900 font-medium">{line}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function onboarding() {
  useSyncUser();
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();

  // subscription state
  const [subscriptionStatus, setSubscriptionStatus] = useState<boolean>(false);
  const [showPaymentPlans, setShowPaymentPlans] = useState<boolean>(false);
  const [showUSDPaymentPlans, setShowUSDPaymentPlans] =
    useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // form state (grouped across 5 steps)
  const countryOptions = useMemo(
    () => countryList().getData() as OptionType[],
    []
  );

  // Profiling questions state
  const [missedOpportunities, setMissedOpportunities] = useState<string>("");
  const [hoursWasted, setHoursWasted] = useState<string>("");
  const [followingRoadmap, setFollowingRoadmap] = useState<string>("");
  const [careerConfidence, setCareerConfidence] = useState<string>("");
  const [competitionLevel, setCompetitionLevel] = useState<string>("");
  const [timeToAct, setTimeToAct] = useState<string>("");

  // Stats state
  const [stats, setStats] = useState<string[]>([]);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [isCheckingReality, setIsCheckingReality] = useState<boolean>(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [insightsLoading, setInsightsLoading] = useState<boolean>(false);

  const [desiredCareer, setDesiredCareer] = useState<string>("");
  const [longTermAspirations, setLongTermAspirations] = useState<string>("");
  const [roleModelInfluences, setRoleModelInfluences] = useState<string>("");

  const [residingCountry, setResidingCountry] = useState<OptionType | null>(
    null
  );
  const [spendingCapacity, setSpendingCapacity] = useState<string>("");
  const [willingToMoveAbroad, setWillingToMoveAbroad] = useState<
    boolean | null
  >(false);
  const [moveAbroad, setMoveAbroad] = useState<"yes" | "suggest">("suggest");
  const [preferredAbroadCountry, setPreferredAbroadCountry] =
    useState<OptionType | null>(null);
  const [educationalStage, setEducationalStage] = useState<string>("");
  const [schoolGrade, setSchoolGrade] = useState<string>("");
  const [schoolStream, setSchoolStream] = useState<string>("");
  const [collegeYear, setCollegeYear] = useState<string>("");
  const [collegeDegree, setCollegeDegree] = useState<string>("");

  const [practicalExperience, setPracticalExperience] = useState<string>("");
  const [academicStrengths, setAcademicStrengths] = useState<string>("");
  const [extracurricularActivities, setExtracurricularActivities] =
    useState<string>("");
  const [industryKnowledgeLevel, setIndustryKnowledgeLevel] =
    useState<string>("");

  const [culturalFamilyExpectations, setCulturalFamilyExpectations] =
    useState<string>("");
  const [mentorshipAndNetworkStatus, setMentorshipAndNetworkStatus] =
    useState<string>("");
  const [preferredWorkEnvironment, setPreferredWorkEnvironment] =
    useState<string>("");
  const [preferredLearningStyle, setPreferredLearningStyle] =
    useState<string>("");
  const [difficulty, setDifficulty] = useState<
    "easy" | "medium" | "hard" | null
  >(null);
  const [parentEmail, setParentEmail] = useState<string>("");
  const [preferredLanguage, setPreferredLanguage] = useState<string>("");

  // step state
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  const isSouthAsianCountry = (code: string) =>
    ["IN", "PK", "BD"].includes(code);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/");
  }, [isLoaded, isSignedIn]);

  // Load desired_career from Supabase for this user so demo form auto-fills
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
        if (uErr || !u) return;
        const { data: c, error: cErr } = await supabase
          .from("career_info")
          .select("desired_career")
          .eq("user_id", u.id)
          .maybeSingle();
        if (cErr || !mounted) return;
        if (c && c.desired_career) setDesiredCareer(c.desired_career);
      } catch (err) {
        // noop
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isLoaded, user?.id]);

  // load subscription
  useEffect(() => {
    if (!isLoaded || !user) return;
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("subscription_status, subscription_plan")
          .eq("clerk_id", user.id)
          .single();
        if (!mounted) return;
        if (error) throw error;
        setSubscriptionStatus(Boolean(data?.subscription_status));
      } catch (e) {
        // noop
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isLoaded, user?.id]);

  // educational stage cleanup
  useEffect(() => {
    if (educationalStage === "school") {
      setCollegeYear("");
      setCollegeDegree("");
    } else if (educationalStage === "college") {
      setSchoolGrade("");
      setSchoolStream("");
    } else if (
      educationalStage === "self-taught" ||
      educationalStage === "working"
    ) {
      setSchoolGrade("");
      setSchoolStream("");
      setCollegeYear("");
      setCollegeDegree("");
    }
  }, [educationalStage]);

  // Modified section in onboarding component

  // Generate AI insights automatically when user reaches step 5 - UPDATED TO INCLUDE PROFILING
  useEffect(() => {
    if (step !== 5) return;
    let mounted = true;
    (async () => {
      try {
        setInsightsLoading(true);
        const res = await fetch("/api/generate-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // EXISTING profile fields (Steps 2-5)
            desiredCareer,
            longTermAspirations,
            roleModelInfluences,
            educationalStage,
            schoolGrade,
            schoolStream,
            collegeYear,
            collegeDegree,
            practicalExperience,
            academicStrengths,
            extracurricularActivities,
            industryKnowledgeLevel,
            preferredWorkEnvironment,
            preferredLearningStyle,
            difficulty,
            mentorshipAndNetworkStatus,
            culturalFamilyExpectations,

            // NEW: Profiling data from Step 1
            profiling: {
              missedOpportunities,
              hoursWasted,
              followingRoadmap,
              careerConfidence,
              competitionLevel,
              timeToAct,
            },
          }),
        });
        const data = await res.json();
        if (!mounted) return;
        setInsights(Array.isArray(data?.insights) ? data.insights : []);
      } catch (e) {
        if (!mounted) return;
        setInsights([]);
      } finally {
        if (mounted) setInsightsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [step]);

  // const handleProfilingSubmit = async () => {
  //   setIsCheckingReality(true);
  //   try {
  //     const res = await fetch("/api/onboarding-outcome", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         answers: {
  //           missedOpportunities,
  //           hoursWasted,
  //           followingRoadmap,
  //           careerConfidence,
  //           competitionLevel,
  //           timeToAct,
  //         },
  //       }),
  //     });

  //     const data = await res.json();
  //     setStats(data.stats || []);
  //     setShowStats(true);
  //   } catch (error) {
  //     setStats([
  //       {
  //         stat: "78% of students miss career opportunities",
  //         impact: "due to lack of proper guidance",
  //       },
  //       {
  //         stat: "Average career delay costs $45,000",
  //         impact: "in lost earning potential",
  //       },
  //       {
  //         stat: "Only 23% follow structured roadmaps",
  //         impact: "while 77% struggle with direction",
  //       },
  //       {
  //         stat: "Students waste 15+ hours weekly",
  //         impact: "on ineffective learning methods",
  //       },
  //     ]);
  //     setShowStats(true);
  //   } finally {
  //     setIsCheckingReality(false);
  //   }
  // };

  const handleProfilingSubmit = async () => {
    setIsCheckingReality(true);
    try {
      const res = await fetch("/api/onboarding-outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: {
            missedOpportunities,
            hoursWasted,
            followingRoadmap,
            careerConfidence,
            competitionLevel,
            timeToAct,
          },
        }),
      });

      const data = await res.json();
      // expect { stats: string[] }
      setStats(
        Array.isArray(data.stats) ? data.stats.slice(0, 4).map(String) : []
      );
      setShowStats(true);
    } catch (error) {
      setStats([
        "You’re losing momentum — a clear roadmap now will recover months of progress.",
        "Without targeted guidance, your current approach will keep opportunities out of reach.",
        "Small daily changes now will compound into major career advantage within months.",
        "Sign up today to convert confusion into a step-by-step plan that actually works.",
      ]);
      setShowStats(true);
    } finally {
      setIsCheckingReality(false);
    }
  };

  const canProceed = () => {
    if (step === 1)
      return Boolean(
        missedOpportunities &&
          hoursWasted &&
          followingRoadmap &&
          careerConfidence &&
          competitionLevel &&
          timeToAct
      );
    if (step === 2) return Boolean(desiredCareer && longTermAspirations);
    if (step === 3) return Boolean(residingCountry && spendingCapacity);
    if (step === 4)
      return Boolean(
        practicalExperience &&
          academicStrengths &&
          industryKnowledgeLevel &&
          preferredLanguage
      );
    if (step === 5) return Boolean(difficulty && parentEmail);
    return false;
  };

  const onNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };
  const onBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const payload: any = {
      clerk_id: user?.id,
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
      await fetch("/api/save-career-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // tag for analytics/segmentation, mirrors original dashboard
      fetch("/api/assign-career-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_id: user?.id,
          desired_career: desiredCareer,
        }),
      }).catch(() => {});

      // Redirect to dashboard instead of payment flow
      router.push("/dashboard?from=onboarding");
    } catch (_) {
      // swallow
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="p-4 space-y-2">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#4fbdb7] animate-spin mx-auto"></div>
          <p className="text-slate-500 text-center mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  const dashboardLinks = [
    { href: "/roadmap", label: "Roadmap" },
    { href: "/blog", label: "Blogs" },
  ];

  return (
    <div
      className="min-h-screen bg-white"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (step < totalSteps && canProceed()) onNext();
        }
      }}
    >
      <FloatingNavbar navLinks={dashboardLinks} />

      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-2xl text-gray-800">Career Setup</h1>
        <p className="text-sm text-gray-500 mt-1">
          Answer in 5 quick steps. No fluff. Enter to continue.
        </p>
        <Progress step={step} total={totalSteps} />

        {/* STEP 1: Profiling Questions */}
        {step === 1 && (
          <div className="mt-6 text-gray-500">
            <div className="space-y-4">
              <div>
                <label className="text-gray-700 text-sm">
                  How many career opportunities have you missed in the past
                  year?
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                  {["0-2", "3-5", "6-10", "10+"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setMissedOpportunities(v)}
                      className={`px-3 py-2 rounded-xl border ${
                        missedOpportunities === v ? "bg-gray-100" : ""
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-700 text-sm">
                  How many hours do you waste weekly on ineffective learning?
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                  {["0-5 hours", "6-10 hours", "11-15 hours", "15+ hours"].map(
                    (v) => (
                      <button
                        key={v}
                        onClick={() => setHoursWasted(v)}
                        className={`px-3 py-2 rounded-xl border ${
                          hoursWasted === v ? "bg-gray-100" : ""
                        }`}
                      >
                        {v}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="text-gray-700 text-sm">
                  Are you following a roadmap that's future-proof?
                </label>
                <div className="grid grid-cols-1 gap-2 mt-1 text-xs">
                  {[
                    "No roadmap at all",
                    "Following outdated advice",
                    "Using generic templates",
                    "Have a personalized plan",
                  ].map((v) => (
                    <button
                      key={v}
                      onClick={() => setFollowingRoadmap(v)}
                      className={`px-3 py-2 rounded-xl border text-left ${
                        followingRoadmap === v ? "bg-gray-100" : ""
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-700 text-sm">
                  How confident are you about your career direction?
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                  {[
                    "Very uncertain",
                    "Somewhat unsure",
                    "Moderately confident",
                    "Very confident",
                  ].map((v) => (
                    <button
                      key={v}
                      onClick={() => setCareerConfidence(v)}
                      className={`px-3 py-2 rounded-xl border ${
                        careerConfidence === v ? "bg-gray-100" : ""
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-700 text-sm">
                  How competitive is your target industry?
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                  {[
                    "Low competition",
                    "Moderate",
                    "Highly competitive",
                    "Extremely competitive",
                  ].map((v) => (
                    <button
                      key={v}
                      onClick={() => setCompetitionLevel(v)}
                      className={`px-3 py-2 rounded-xl border ${
                        competitionLevel === v ? "bg-gray-100" : ""
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-700 text-sm">
                  How urgent is it for you to act now?
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                  {[
                    "Not urgent",
                    "Somewhat urgent",
                    "Very urgent",
                    "Critical timing",
                  ].map((v) => (
                    <button
                      key={v}
                      onClick={() => setTimeToAct(v)}
                      className={`px-3 py-2 rounded-xl border ${
                        timeToAct === v ? "bg-gray-100" : ""
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button className="opacity-50 cursor-not-allowed text-sm">
                Back
              </button>
              <button
                disabled={!canProceed() || isCheckingReality}
                onClick={handleProfilingSubmit}
                className="text-sm px-4 py-2 rounded-full border border-gray-300 disabled:opacity-50 text-gray-500 hover:bg-gray-300 hover:text-gray-800 cursor-pointer flex items-center gap-2"
              >
                {isCheckingReality ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  "Check My Reality"
                )}
              </button>
            </div>

            {showStats && (
              <>
                <StatsCard stats={stats} />
                <div className="flex justify-center mt-6">
                  <button
                    onClick={onNext}
                    className="text-sm px-6 py-2 rounded-full border bg-green-50 text-green-700 hover:bg-green-100"
                  >
                    Continue to Setup
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 2: Identity & Goals */}
        {step === 2 && (
          <div className="mt-6">
            <div className="space-y-4 text-gray-500">
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-gray-700 text-sm">
                    What career are you aiming for?
                  </label>
                  <div className="relative ml-2 group">
                    <Info
                      size={14}
                      className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100"
                    />
                    <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-xl w-40 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      Enter the specific career you want to pursue.
                    </div>
                  </div>
                </div>
                <input
                  className="w-full border rounded-xl p-3 mt-1 text-sm "
                  placeholder="e.g., Software Engineer"
                  value={desiredCareer}
                  onChange={(e) => setDesiredCareer(e.target.value)}
                />
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-gray-700 text-sm">
                    Long-term aspiration
                  </label>
                  <div className="relative ml-2 group">
                    <Info
                      size={14}
                      className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100"
                    />
                    <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-xl w-40 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      What's your ultimate career goal or aspiration?
                    </div>
                  </div>
                </div>
                <input
                  className="w-full border rounded-xl p-3 mt-1 text-sm "
                  placeholder="e.g., lead a product team, build something impactful"
                  value={longTermAspirations}
                  onChange={(e) => setLongTermAspirations(e.target.value)}
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm">
                  Who inspires you?
                </label>
                <input
                  className="w-full border rounded-xl p-3 mt-1 text-sm "
                  placeholder="Role models (optional)"
                  value={roleModelInfluences}
                  onChange={(e) => setRoleModelInfluences(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between mt-6 text-gray-500">
              <button
                onClick={onBack}
                className="text-sm px-4 py-2 rounded-full border hover:bg-gray-100  border-gray-300 "
              >
                Back
              </button>
              <button
                disabled={!canProceed()}
                onClick={onNext}
                className="text-sm px-4 py-2 rounded-full border hover:bg-gray-100  border-gray-300 disabled:opacity-50 "
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Background & Capacity */}
        {step === 3 && (
          <div className="mt-6">
            <div className="space-y-4 text-gray-500">
              <div>
                <label className="text-gray-700 text-sm">
                  Residing country
                </label>
                <Select
                  options={countryOptions}
                  value={residingCountry}
                  onChange={(v) => setResidingCountry(v as OptionType)}
                  classNamePrefix="cr"
                />
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-gray-700 text-sm">
                    Spending capacity
                  </label>
                  <div className="relative ml-2 group">
                    <Info
                      size={14}
                      className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100"
                    />
                    <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-xl w-40 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      Enter your education budget, or how much you can spend on
                      your career.
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  className="w-full border rounded-xl p-3 mt-1 text-sm "
                  placeholder="e.g., 50000"
                  value={spendingCapacity}
                  onChange={(e) => setSpendingCapacity(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-700">
                  Willing to move abroad?
                </span>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={Boolean(willingToMoveAbroad)}
                    onChange={(e) => setWillingToMoveAbroad(e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-emerald-200 relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 peer-checked:left-4 transition-all" />
                  </div>
                </label>
              </div>

              {Boolean(willingToMoveAbroad) && (
                <div className="space-y-2">
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => setMoveAbroad("yes")}
                      className={`px-3 py-1 rounded-full border ${
                        moveAbroad === "yes" ? "bg-gray-100" : ""
                      }`}
                    >
                      I'll select
                    </button>
                    <button
                      onClick={() => setMoveAbroad("suggest")}
                      className={`px-3 py-1 rounded-full border ${
                        moveAbroad === "suggest" ? "bg-gray-100" : ""
                      }`}
                    >
                      Suggest
                    </button>
                  </div>
                  {moveAbroad === "yes" && (
                    <Select
                      options={countryOptions}
                      value={preferredAbroadCountry}
                      onChange={(v) =>
                        setPreferredAbroadCountry(v as OptionType)
                      }
                    />
                  )}
                </div>
              )}

              <div>
                <label className="text-gray-700 text-sm">
                  Educational stage
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                  {["School", "College", "Self-taught", "Working"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setEducationalStage(s.toLowerCase())}
                      className={`px-3 py-2 rounded-full border ${
                        educationalStage === s.toLowerCase()
                          ? "bg-gray-100"
                          : ""
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {educationalStage === "school" && (
                <div className="grid grid-cols-1 gap-3">
                  <input
                    className="w-full border rounded-xl p-3 text-sm"
                    placeholder="Current grade"
                    value={schoolGrade}
                    onChange={(e) => setSchoolGrade(e.target.value)}
                  />
                  {(schoolGrade === "11th" || schoolGrade === "12th") && (
                    <input
                      className="w-full border rounded-xl p-3 text-sm "
                      placeholder="Stream (Science/Commerce/Arts)"
                      value={schoolStream}
                      onChange={(e) => setSchoolStream(e.target.value)}
                    />
                  )}
                </div>
              )}

              {educationalStage === "college" && (
                <div className="grid grid-cols-1 gap-3">
                  <input
                    className="w-full border rounded-xl p-3 text-sm"
                    placeholder="College year"
                    value={collegeYear}
                    onChange={(e) => setCollegeYear(e.target.value)}
                  />
                  <input
                    className="w-full border rounded-xl p-3 text-sm"
                    placeholder="Degree/Course"
                    value={collegeDegree}
                    onChange={(e) => setCollegeDegree(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between mt-6 text-gray-500">
              <button
                onClick={onBack}
                className="text-sm px-4 py-2 rounded-full border hover:bg-gray-100  border-gray-300 "
              >
                Back
              </button>
              <button
                disabled={!canProceed()}
                onClick={onNext}
                className="text-sm px-4 py-2 rounded-full border hover:bg-gray-100 border-gray-300 disabled:opacity-50 "
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Skills & Experience */}
        {step === 4 && (
          <div className="mt-6 text-gray-500">
            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-gray-700 text-sm">
                    Practical experience
                  </label>
                  <div className="relative ml-2 group">
                    <Info
                      size={14}
                      className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100"
                    />
                    <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-xl w-40 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      Describe any hands-on experience, projects, internships,
                      or practical work related to your desired career.
                    </div>
                  </div>
                </div>
                <input
                  className="w-full border rounded-xl p-3 mt-1 text-sm"
                  value={practicalExperience}
                  onChange={(e) => setPracticalExperience(e.target.value)}
                  placeholder="Projects, internships, certifications"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm">
                  Academic strengths
                </label>
                <input
                  className="w-full border rounded-xl p-3 mt-1 text-sm"
                  value={academicStrengths}
                  onChange={(e) => setAcademicStrengths(e.target.value)}
                  placeholder="Math, CS, Literature, etc."
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm">Extracurricular</label>
                <input
                  className="w-full border rounded-xl p-3 mt-1 text-sm "
                  value={extracurricularActivities}
                  onChange={(e) => setExtracurricularActivities(e.target.value)}
                  placeholder="Clubs, sports, volunteering"
                />
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-gray-700 text-sm">
                    Industry knowledge level
                  </label>
                  <div className="relative ml-2 group">
                    <Info
                      size={14}
                      className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100"
                    />
                    <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-xl w-40 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      How much do you know about your target career field and
                      industry?
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 mt-1 text-xs">
                  {[
                    {
                      value: "beginner",
                      label: "Beginner",
                      desc: "Just starting to explore this field",
                    },
                    {
                      value: "moderate",
                      label: "Moderate Research",
                      desc: "Done some research and learning",
                    },
                    {
                      value: "well-informed",
                      label: "Well-informed",
                      desc: "Good understanding of the industry",
                    },
                  ].map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setIndustryKnowledgeLevel(level.value)}
                      className={`px-4 py-2 rounded-xl border text-left ${
                        industryKnowledgeLevel === level.value
                          ? "bg-gray-100"
                          : ""
                      }`}
                    >
                      <div className="font-medium text-sm">{level.label}</div>
                      <div className="text-xs text-gray-600">{level.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <label className="text-gray-700 text-sm">
                    Preferred language
                  </label>
                  <div className="relative ml-2 group">
                    <Info
                      size={14}
                      className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100"
                    />
                    <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-xl w-40 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      Select the language you prefer to watch Youtube tutorials
                      in.
                    </div>
                  </div>
                </div>
                <input
                  type="text"
                  className="w-full border rounded-xl p-3 mt-1 text-sm "
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  placeholder="e.g. English, Hindi, Spanish, French..."
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={onBack}
                className="text-sm px-4 py-2 rounded-full border hover:bg-gray-100 border-gray-300 "
              >
                Back
              </button>
              <button
                disabled={!canProceed()}
                onClick={onNext}
                className="text-sm px-4 py-2 rounded-full border hover:bg-gray-100 border-gray-300 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Context & Support */}
        {step === 5 && (
          <div className="mt-6 text-gray-500">
            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-gray-700 text-sm">
                    Family expectations
                  </label>
                  <div className="relative ml-2 group">
                    <Info
                      size={14}
                      className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100"
                    />
                    <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-xl w-40 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      What are your family's expectations regarding your career
                      choices?
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-1 text-xs">
                  {[
                    "Fully supportive",
                    "Prefers stable jobs",
                    "Traditional expectations",
                    "High pressure",
                  ].map((v) => (
                    <button
                      key={v}
                      onClick={() =>
                        setCulturalFamilyExpectations(
                          v.toLowerCase().replace(/\s+/g, "-")
                        )
                      }
                      className={`px-3 py-2 rounded-xl border text-left ${
                        culturalFamilyExpectations ===
                        v.toLowerCase().replace(/\s+/g, "-")
                          ? "bg-gray-100"
                          : ""
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <label className="text-gray-700 text-sm">
                    Mentorship & network
                  </label>
                  <div className="relative ml-2 group">
                    <Info
                      size={14}
                      className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100"
                    />
                    <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-xl w-40 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      What's your current mentorship and networking situation?
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-1 text-xs">
                  {[
                    "No mentor",
                    "Some connections",
                    "Active communities",
                    "Family in field",
                  ].map((v) => (
                    <button
                      key={v}
                      onClick={() =>
                        setMentorshipAndNetworkStatus(
                          v.toLowerCase().replace(/\s+/g, "-")
                        )
                      }
                      className={`px-3 py-2 rounded-xl border text-left ${
                        mentorshipAndNetworkStatus ===
                        v.toLowerCase().replace(/\s+/g, "-")
                          ? "bg-gray-100"
                          : ""
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <label className="text-gray-700 text-sm">
                    Work environment
                  </label>
                  <div className="relative ml-2 group">
                    <Info
                      size={14}
                      className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100"
                    />
                    <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-xl w-40 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      What type of work environment appeals to you most?
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                  {[
                    "Corporate",
                    "Startup",
                    "Freelance",
                    "Remote",
                    "Non-profit",
                    "Academic",
                  ].map((v) => (
                    <button
                      key={v}
                      onClick={() =>
                        setPreferredWorkEnvironment(v.toLowerCase())
                      }
                      className={`px-3 py-2 rounded-xl border ${
                        preferredWorkEnvironment === v.toLowerCase()
                          ? "bg-gray-100"
                          : ""
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-700 text-sm">
                  Preferred learning style
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                  {["Hands-on", "Courses", "Books", "Competitions"].map((v) => (
                    <button
                      key={v}
                      onClick={() =>
                        setPreferredLearningStyle(
                          v.toLowerCase().replace(/\s+/g, "-")
                        )
                      }
                      className={`px-3 py-2 rounded-xl border ${
                        preferredLearningStyle ===
                        v.toLowerCase().replace(/\s+/g, "-")
                          ? "bg-gray-100"
                          : ""
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-700 text-sm">
                  Learning difficulty
                </label>
                <div className="grid grid-cols-3 gap-2 mt-1 text-xs">
                  {(
                    [
                      { v: "easy", l: "Easy" },
                      { v: "medium", l: "Medium" },
                      { v: "hard", l: "Hard" },
                    ] as const
                  ).map(({ v, l }) => (
                    <button
                      key={v}
                      onClick={() => setDifficulty(v)}
                      className={`px-3 py-2 rounded-xl border ${
                        difficulty === v ? "bg-gray-100" : ""
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <label className="text-gray-700 text-sm">
                    Accountability email
                  </label>
                  <div className="relative ml-2 group">
                    <Info
                      size={14}
                      className="text-gray-400 hover:text-orange-200 cursor-pointer transition-colors duration-100"
                    />
                    <div className="absolute right-0 top-6 bg-gray-800 text-white text-xs rounded-xl w-40 p-2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      Enter email of someone who can be accountable for you.
                      Guardian, Friend, Teacher or Sibling.
                    </div>
                  </div>
                </div>
                <input
                  type="email"
                  className="w-full border rounded-xl p-3 mt-1 text-sm "
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="parent@example.com"
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={onBack}
                className="text-sm px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100"
              >
                Back
              </button>
              <button
                disabled={!canProceed() || isSubmitting}
                onClick={handleSubmit}
                className="text-sm px-4 py-2 rounded-full border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
              >
                {isSubmitting ? "Saving..." : "Check"}
              </button>
            </div>

            {/* AI insights: automatically generated, no reveal button */}
            <div className="mt-6">
              <h3 className="text-gray-800 font-medium mb-2">
                Your Career Insights
              </h3>
              {insightsLoading ? (
                <div className="text-sm text-gray-500">
                  Generating insights…
                </div>
              ) : (
                <div className="mt-2 p-4 border rounded-3xl ">
                  {insights.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No insights available.
                    </div>
                  ) : (
                    <ul className="space-y-2 text-sm text-gray-700">
                      {insights.map((ins, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                          <div>{ins}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
