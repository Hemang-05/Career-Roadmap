"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useSyncUser } from "@/app/hooks/sync-user";
import countryList from "react-select-country-list";
import { supabase } from "@/utils/supabase/supabaseClient";

import FloatingNavbar from "@/components/Navbar";
import PaymentPlan from "@/components/PaymentPlan";
import USDPaymentPlan from "@/components/USDPaymentPlan";
import Loader from "@/components/Loader";
import RoadmapNotification from "@/components/RoadmapNotification";
import DashboardForm, { OptionType } from "@/components/DashboardForm";
import CollegeForm from "@/components/CollegeForm";

interface University {
  id: number;
  name: string;
}

export default function Dashboard() {
  useSyncUser();
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();

  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
  const [showPaymentPlans, setShowPaymentPlans] = useState<boolean>(false);
  const [showUSDPaymentPlans, setShowUSDPaymentPlans] =
    useState<boolean>(false);
  const [showCollegeForm, setShowCollegeForm] = useState<boolean>(false);

  // User & subscription
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<boolean>(true);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>("");

  // Career & roadmap
  const [hasRoadmap, setHasRoadmap] = useState<boolean>(false);
  const [formFilled, setFormFilled] = useState<boolean>(false);
  const [apiDone, setApiDone] = useState<boolean>(false);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  // Main form state
  const [residingCountry, setResidingCountry] = useState<OptionType | null>(
    null
  );
  const [spendingCapacity, setSpendingCapacity] = useState<string>("");
  const [parentEmail, setParentEmail] = useState<string>("");
  const [currentClass, setCurrentClass] = useState<string>("");
  const [isCollegeStudent, setIsCollegeStudent] = useState<boolean | null>(
    null
  );
  const [willingToMoveAbroad, setWillingToMoveAbroad] = useState<
    boolean | null
  >(false);
  const [moveAbroad, setMoveAbroad] = useState<"yes" | "suggest">("suggest");
  const [preferredAbroadCountry, setPreferredAbroadCountry] =
    useState<OptionType | null>(null);
  const [difficulty, setDifficulty] = useState<
    "easy" | "medium" | "hard" | null
  >(null);
  const [careerOption, setCareerOption] = useState<"known" | "unknown">(
    "known"
  );
  const [desiredCareer, setDesiredCareer] = useState<string>("");
  const [previousExperience, setPreviousExperience] = useState<string>("");
  const [interestParagraph, setInterestParagraph] = useState<string>("");

  // College form data
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
  const [selectedUniversityId, setSelectedUniversityId] = useState<
    number | null
  >(null);
  const [uniInputValue, setUniInputValue] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/");
  }, [isSignedIn, isLoaded, router]);

  // Helper for INR vs USD
  const isSouthAsianCountry = (code: string) =>
    ["IN", "PK", "BD"].includes(code);

  // Get country option from code
  const getCountryOption = (countryCode: string): OptionType | null => {
    const countryOptions = countryList().getData() as OptionType[];
    return (
      countryOptions.find((option) => option.value === countryCode) || null
    );
  };

  // Fetch user & career info with data persistence
  useEffect(() => {
    if (!isLoaded || !user) return;
    let mounted = true;
    (async () => {
      try {
        const { data: u, error: uErr } = await supabase
          .from("users")
          .select(
            "id, subscription_status, subscription_plan, subscription_end"
          )
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

        // DATA PERSISTENCE: Load existing career info into form fields
        if (c) {
          if (c.residing_country) {
            setResidingCountry(getCountryOption(c.residing_country));
          }
          if (c.spending_capacity) {
            setSpendingCapacity(c.spending_capacity.toString());
          }
          if (c.parent_email) {
            setParentEmail(c.parent_email);
          }
          if (c.current_class) {
            setCurrentClass(c.current_class);
          }
          if (c.college_student !== null) {
            setIsCollegeStudent(c.college_student);
          }
          if (c.move_abroad !== null) {
            setWillingToMoveAbroad(c.move_abroad);
          }
          if (c.preferred_abroad_country) {
            if (c.preferred_abroad_country === "Suggest") {
              setMoveAbroad("suggest");
            } else {
              setMoveAbroad("yes");
              setPreferredAbroadCountry(
                getCountryOption(c.preferred_abroad_country)
              );
            }
          }
          if (c.difficulty) {
            setDifficulty(c.difficulty);
          }
          if (c.desired_career) {
            setDesiredCareer(c.desired_career);
            // Determine if it's a known career or interest paragraph based on length
            if (c.desired_career.length > 100) {
              setCareerOption("unknown");
              setInterestParagraph(c.desired_career);
            } else {
              setCareerOption("known");
              setDesiredCareer(c.desired_career);
            }
          }
          if (c.previous_experience) {
            setPreviousExperience(c.previous_experience);
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
  }, [isLoaded, user]);

  // Load universities when showing college form
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

  // Main form submit
  const handleMainFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload: any = {
      clerk_id: user?.id,
      residing_country: residingCountry?.value,
      spending_capacity: spendingCapacity ? parseFloat(spendingCapacity) : null,
      current_class: currentClass,
      move_abroad: willingToMoveAbroad,
      preferred_abroad_country:
        willingToMoveAbroad && moveAbroad === "yes"
          ? preferredAbroadCountry?.value
          : willingToMoveAbroad
          ? "Suggest"
          : null,
      parent_email: parentEmail,
      college_student: isCollegeStudent,
      difficulty,
      desired_career:
        careerOption === "known" ? desiredCareer : interestParagraph,
      previous_experience: careerOption === "known" ? previousExperience : "",
      roadmap: null,
    };

    try {
      const res = await fetch("/api/save-career-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      // const result = await res.json();
      // console.log("Career info saved:", result);

      if (!subscriptionStatus) {
        // Check user's country to determine which payment plan to show
        if (residingCountry && isSouthAsianCountry(residingCountry.value)) {
          // Show INR pricing for users from India, Pakistan, Bangladesh
          setShowPaymentPlans(true);
          // setShowUSDPaymentPlans(false);
        } else {
          // Show USD pricing for users from other countries
          // setShowPaymentPlans(false);
          setShowUSDPaymentPlans(true);
        }
      } else {
        setShowGenerateModal(true);
      }

      // Trigger career tag assignment in parallel (fire-and-forget).
      fetch("/api/assign-career-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_id: user?.id,
          desired_career: payload.desired_career,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Career tag assigned:", data);
        })
        .catch((error) => {
          console.error("Error assigning career tag:", error);
        });
    } catch (error) {
      console.log("Error saving career info:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate roadmap
  const handleGenerateRoadmap = async () => {
    setGenerating(true);

    // FIXED: Show college form immediately when generation starts (if conditions are met)
    if (isCollegeStudent && !formFilled && residingCountry?.value === "IN") {
      setShowCollegeForm(true);
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
    if (isCollegeStudent && !formFilled && residingCountry?.value === "IN") {
      setShowCollegeForm(true);
    }
  };

  // College form submit
  const handleCollegeFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUserId || !selectedUniversityId) return;
    try {
      await supabase.from("university_ratings").insert({
        user_id: dbUserId,
        university_id: selectedUniversityId,
        tuition_fees: parseFloat(collegeFormData.tuitionFees) || null,
        cultural_rating: collegeFormData.culturalRating || null,
        infra_rating: collegeFormData.infraRating || null,
        vibe_rating: collegeFormData.vibeRating || null,
        companies_count: parseInt(collegeFormData.companiesCount) || null,
        highestCTC: parseInt(collegeFormData.highestCTC) || null,
        avgCTC: parseInt(collegeFormData.avgCTC) || null,
      });
      await supabase
        .from("career_info")
        .update({ form_filled: true })
        .eq("user_id", dbUserId);
      setFormFilled(true);
      setShowCollegeForm(false);

      // No redirection logic needed here - the useEffect will handle it automatically
    } catch (err) {
      console.error(err);
    }
  };

  // Redirect after generation
  useEffect(() => {
    if (
      apiDone &&
      (!isCollegeStudent ||
        formFilled ||
        (isCollegeStudent && residingCountry?.value !== "IN"))
    ) {
      setGenerating(false);
      router.push("/roadmap");
    }
  }, [apiDone, formFilled]);

  const dashboardLinks = [
    { href: "/roadmap", label: "Roadmap" },
    { href: "/blog", label: "Blogs" },
  ];

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed flex flex-col"
      style={{
        backgroundImage:
          "url('https://cdn.rareblocks.xyz/collection/clarity/images/hero/1/background-pattern.png')",
        
    }}
    >
      <FloatingNavbar navLinks={dashboardLinks} />
      <div className="container mx-auto my-20 px-4 lg:px-48 py-8 flex-grow mt-20">
        <h1 className="text-3xl text-black font-bold mb-6">
          Welcome, <span className="text-[#FF6500]">{user?.firstName}</span>
        </h1>
        {hasRoadmap ? (
          <RoadmapNotification />
        ) : (
          <div className="mb-6 p-3 bg-orange-50 text-orange-600 rounded-3xl">
            <p>
              Fill in the fields below to get your personalized career roadmap.
            </p>
          </div>
        )}
        <DashboardForm
          onSubmit={handleMainFormSubmit}
          isSubmitting={isSubmitting}
          careerOption={careerOption}
          setCareerOption={setCareerOption}
          residingCountry={residingCountry}
          setResidingCountry={setResidingCountry}
          spendingCapacity={spendingCapacity}
          setSpendingCapacity={setSpendingCapacity}
          isCollegeStudent={isCollegeStudent}
          setIsCollegeStudent={setIsCollegeStudent}
          currentClass={currentClass}
          setCurrentClass={setCurrentClass}
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
          previousExperience={previousExperience}
          setPreviousExperience={setPreviousExperience}
          interestParagraph={interestParagraph}
          setInterestParagraph={setInterestParagraph}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
        />
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
          <div className="bg-white p-12 rounded-xl shadow-lg">
            <h2 className="text-2xl text-black font-bold mb-4">
              Generate <span className="text-[#FF6500]">Career</span> Roadmap
            </h2>
            <p className="mb-4 text-gray-700">
              Would you like to generate your career roadmap now?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="bg-white text-black py-5 px-8 rounded-full border-2 border-black hover:bg-red-500"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateRoadmap}
                className="bg-white text-black py-5 px-8 rounded-full border-2 border-black hover:bg-green-400"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      <CollegeForm
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
      />

      {/* FIXED: Loader appears behind college form when both are active */}
      {generating && (
        <div className="fixed inset-0 justify-center items-center z-50">
          <Loader />
        </div>
      )}
    </div>
  );
}
