//app\dashboard\page.tsx
"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useSyncUser } from "@/app/hooks/sync-user";
import countryList from "react-select-country-list";
import { supabase } from "@/utils/supabase/supabaseClient";

// Components
import FloatingNavbar from "@/components/Navbar";
import PaymentPlan from "@/components/PaymentPlan";
import USDPaymentPlan from "@/components/USDPaymentPlan";
import Loader from "@/components/Loader";
import CollegeForm from "@/components/CollegeForm";

// New Dashboard Components
import AwareUnawareButton from "@/components/AwareUnawareButton";
import ChatbotComponent from "@/components/ChatbotComponent";
import FormComponent from "@/components/FormComponent";

import { OptionType } from "@/components/FormComponent";

interface University {
  id: number;
  name: string;
}

export default function Dashboard() {
  useSyncUser();
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();

  // ============ NAVIGATION STATE ============
  const [currentComponent, setCurrentComponent] = useState<0 | 1 | 2>(0);
  const [userPath, setUserPath] = useState<'aware' | 'confused' | null>(null);
  const [chatbotComplete, setChatbotComplete] = useState<boolean>(false);
  const [determinedCareer, setDeterminedCareer] = useState<string>("");

  // ============ UI STATE ============
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
  const [showPaymentPlans, setShowPaymentPlans] = useState<boolean>(false);
  const [showUSDPaymentPlans, setShowUSDPaymentPlans] = useState<boolean>(false);
  const [showCollegeForm, setShowCollegeForm] = useState<boolean>(false);

  // ============ USER & SUBSCRIPTION ============
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<boolean>(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>("");

  // ============ CAREER & ROADMAP ============
  const [hasRoadmap, setHasRoadmap] = useState<boolean>(false);
  const [formFilled, setFormFilled] = useState<boolean>(false);
  const [apiDone, setApiDone] = useState<boolean>(false);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  // ============ ACTIVE FORM STATE (SIMPLIFIED) ============
  const [residingCountry, setResidingCountry] = useState<OptionType | null>(null);
  const [spendingCapacity, setSpendingCapacity] = useState<string>("");
  const [parentEmail, setParentEmail] = useState<string>("");
  const [willingToMoveAbroad, setWillingToMoveAbroad] = useState<boolean | null>(false);
  const [moveAbroad, setMoveAbroad] = useState<"yes" | "suggest">("suggest");
  const [preferredAbroadCountry, setPreferredAbroadCountry] = useState<OptionType | null>(null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | null>(null);
  
  // ✅ CAREER FIELD - Simple like other fields
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

  // ============ COLLEGE FORM ============
  const [universities, setUniversities] = useState<University[]>([]);
  const [collegeFormData, setCollegeFormData] = useState({
    tuitionFees: "",
    culturalRating: 0,
    infraRating: 0,
    vibeRating: 0,
    companiesCount: "",
    highestCTC: "",
    avgCTC: "",
  });
  const [selectedUniversityId, setSelectedUniversityId] = useState<number | null>(null);
  const [uniInputValue, setUniInputValue] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // ============ HELPER FUNCTIONS ============
  const isSouthAsianCountry = (code: string) => ["IN", "PK", "BD"].includes(code);
  
  const getCountryOption = (countryCode: string): OptionType | null => {
    const countryOptions = countryList().getData() as OptionType[];
    return countryOptions.find((option) => option.value === countryCode) || null;
  };

  // ============ NAVIGATION HANDLERS ============
  const handleAwareClick = () => {
    setUserPath('aware');
    setCurrentComponent(2);
  };

  const handleConfusedClick = () => {
    setUserPath('confused');
    setCurrentComponent(1);
  };

  const handleChatbotComplete = (career: string) => {
    setDeterminedCareer(career);
    setDesiredCareer(career);
    setChatbotComplete(true);
    setCurrentComponent(2);
  };

  // ============ EDUCATIONAL STAGE CLEANUP ============
  useEffect(() => {
    if (educationalStage === 'school') {
      setCollegeYear('');
      setCollegeDegree('');
    } else if (educationalStage === 'college') {
      setSchoolGrade('');
      setSchoolStream('');
    } else if (educationalStage === 'self-taught' || educationalStage === 'working') {
      setSchoolGrade('');
      setSchoolStream('');
      setCollegeYear('');
      setCollegeDegree('');
    }
  }, [educationalStage]);

  // ============ AUTH & DATA LOADING ============
  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/");
  }, [isSignedIn, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !user) return;
    let mounted = true;
    
    (async () => {
      try {
        const { data: u, error: uErr } = await supabase
          .from("users")
          .select("id, subscription_status, subscription_plan, subscription_end")
          .eq("clerk_id", user.id)
          .single();
          
        if (uErr || !u) throw uErr || new Error("User not found");
        if (!mounted) return;
        
        setDbUserId(u.id);
        setSubscriptionStatus(u.subscription_status);
        setSubscriptionPlan(u.subscription_plan);
        
        if (u.subscription_end && new Date(u.subscription_end) < new Date()) {
          await supabase
            .from("users")
            .update({ subscription_status: false })
            .eq("clerk_id", user.id);
          if (mounted) setSubscriptionStatus(false);
        }

        const { data: c, error: cErr } = await supabase
          .from("career_info")
          .select("*")
          .eq("user_id", u.id)
          .maybeSingle();
          
        if (cErr) throw cErr;
        if (!mounted) return;

        setHasRoadmap(!!(c?.roadmap && Object.keys(c.roadmap).length));
        setFormFilled(c?.form_filled ?? false);

        // ✅ SIMPLIFIED DATA LOADING
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
    
    return () => { mounted = false; };
  }, [isLoaded, user?.id]);

  // ============ ADDITIONAL EFFECTS ============
  useEffect(() => {
    if (!showCollegeForm) return;
    supabase
      .from("universities")
      .select("id,name")
      .then((r: { data: University[] | null; error: any }) => {
        if (r.data) setUniversities(r.data);
      })
      .catch(console.error);
  }, [showCollegeForm]);


  // ============ SIMPLIFIED FORM HANDLER ============
  const handleMainFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload: any = {
      clerk_id: user?.id,
      desired_career: desiredCareer, // ✅ Direct field
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
      const res = await fetch("/api/save-career-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!subscriptionStatus) {
        if (residingCountry && isSouthAsianCountry(residingCountry.value)) {
          setShowPaymentPlans(true);
        } else {
          setShowUSDPaymentPlans(true);
        }
      } else {
        setShowGenerateModal(true);
      }

      fetch("/api/assign-career-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_id: user?.id,
          desired_career: payload.desired_career,
        }),
      }).catch(console.error);
      
    } catch (error) {
      console.log("Error saving career info:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    setGenerating(true);
    
    if (educationalStage === 'college' && !formFilled && residingCountry?.value === "IN") {
      setShowCollegeForm(false);
    }

    try {
      const res = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerk_id: user?.id }),
      });
      await res.json();
      setApiDone(true);
    } catch (err) {
      console.error(err);
      setGenerating(false);
    }
  };

  // const handleCollegeFormSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!dbUserId || !selectedUniversityId) return;
    
  //   try {
  //     await supabase.from("university_ratings").insert({
  //       user_id: dbUserId,
  //       university_id: selectedUniversityId,
  //       tuition_fees: parseFloat(collegeFormData.tuitionFees) || null,
  //       cultural_rating: collegeFormData.culturalRating || null,
  //       infra_rating: collegeFormData.infraRating || null,
  //       vibe_rating: collegeFormData.vibeRating || null,
  //       companies_count: parseInt(collegeFormData.companiesCount) || null,
  //       highestCTC: parseInt(collegeFormData.highestCTC) || null,
  //       avgCTC: parseInt(collegeFormData.avgCTC) || null,
  //     });
      
  //     await supabase
  //       .from("career_info")
  //       .update({ form_filled: true })
  //       .eq("user_id", dbUserId);
        
  //     setFormFilled(true);
  //     setShowCollegeForm(false);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  useEffect(() => {
    if (apiDone) {
      setGenerating(false);
      router.push("/roadmap");   // add form_filled
    }
  }, [apiDone]);


  const dashboardLinks = [
    { href: "/roadmap", label: "Roadmap" },
    { href: "/blog", label: "Blogs" },
  ];

  if (!dataLoaded) {
    return <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-200 font-extralight">Loading</div>
    </div>;
  }

  return (
    <div className="relative w-full overflow-x-hidden min-h-screen flex flex-col bg-[#f8f8f8]">
      <div
        className="absolute inset-0 -z-50"
        style={{
          backgroundSize: '30px 30px',
          backgroundImage:
            'linear-gradient(to right, #e4e4e7 1px, transparent 1px),' +
            'linear-gradient(to bottom, #e4e4e7 1px, transparent 1px)',
        }}
      />

      <div className="pointer-events-none absolute inset-0 -z-50 bg-[#f8f8f8] [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black)]" />

      <FloatingNavbar navLinks={dashboardLinks} />

      <div className="flex-grow">
        {currentComponent === 0 && (
          <AwareUnawareButton
            user={user}
            onAwareClick={handleAwareClick}
            onConfusedClick={handleConfusedClick}
          />
        )}

        {currentComponent === 1 && (
          <ChatbotComponent
            user={user}
            onComplete={handleChatbotComplete}
          />
        )}

        {currentComponent === 2 && (
          <FormComponent
            user={user}
            hasRoadmap={hasRoadmap}
            onSubmit={handleMainFormSubmit}
            isSubmitting={isSubmitting}
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

      {showPaymentPlans && user && (
        <PaymentPlan
          clerk_id={user.id}
          onSuccess={(plan) => {
            setShowPaymentPlans(false);
            setSubscriptionStatus(true);
            setSubscriptionPlan(plan);
            setShowGenerateModal(true);
          }}
          onClose={() => setShowPaymentPlans(false)}
          message="To generate your career roadmap, please choose a subscription plan:"
        />
      )}

      {showUSDPaymentPlans && user && (
        <USDPaymentPlan
          clerk_id={user.id}
          onSuccess={(plan) => {
            setShowUSDPaymentPlans(false);
            setSubscriptionStatus(true);
            setSubscriptionPlan(plan);
            setShowGenerateModal(true);
          }}
          onClose={() => setShowUSDPaymentPlans(false)}
          message="To generate your career roadmap, please choose a subscription plan:"
        />
      )}


      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-lg">
            <h2 className="text-2xl text-black font-normal">
              Generate Career Roadmap
            </h2>
            <p className="mb-4 text-gray-700 text-sm">
              Would you like to generate your career roadmap now?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="bg-white text-gray-600 p-2 rounded-3xl border border-gray-400 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateRoadmap}
                className="bg-white text-gray-600 p-2 rounded-3xl border border-gray-400 hover:bg-slate-200"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}


      {/* <CollegeForm
        show={showCollegeForm}
        onSubmit={handleCollegeFormSubmit}
        universities={universities}
        formData={collegeFormData}
        setFormData={setCollegeFormData}
        inputValue={uniInputValue}
        setInputValue={setUniInputValue}
        isSuggestionsOpen={showSuggestions}
        setIsSuggestionsOpen={setShowSuggestions}
        setSelectedUniversityId={setSelectedUniversityId}
      /> */}

      {generating && (
        <div className="fixed inset-0 justify-center items-center z-50">
          <Loader />
        </div>
      )}
    </div>
  );
}
