
"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Select, { GroupBase, StylesConfig } from "react-select";
import countryList from "react-select-country-list";
import { useSyncUser } from "@/app/hooks/sync-user";
import { supabase } from "@/utils/supabase/supabaseClient";
import FloatingNavbar from "@/components/Navbar";
import PaymentPlan from "@/components/PaymentPlan";
import Loader from "@/components/Loader";
import DifficultySelector from "@/components/DifficultySelector";
import RoadmapNotification from "@/components/RoadmapNotification";
import USDPaymentPlan from "@/components/USDPaymentPlan";

type OptionType = {
  label: string;
  value: string;
};

interface University {
  id: number;
  name: string;
}

export default function Dashboard() {
  useSyncUser();

  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPaymentPlans, setShowPaymentPlans] = useState(false);
  const [showUSDPaymentPlans, setShowUSDPaymentPlans] = useState(false);
  const [dbUserId, setDbUserId] = useState<string | null>(null);
  // New state for the college form modal
  const [showCollegeForm, setShowCollegeForm] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [formData, setFormData] = useState({
    universityId: null as number | null,
    tuitionFees: "",
    culturalRating: 0,
    infraRating: 0,
    vibeRating: 0,
    companiesCount: "",
    highestCTC: "",
    avgCTC: "",
  });

  useEffect(() => {
    if (showCollegeForm) {
      const fetchUniversities = async () => {
        try {
          const { data, error } = await supabase
            .from("universities")
            .select("id, name");
          if (error) throw error;
          setUniversities(data || []);
        } catch (error) {
          console.error("Error fetching universities:", error);
        }
      };
      fetchUniversities();
    }
  }, [showCollegeForm]);
  // New state to store the form_filled value from career_info
  const [formFilled, setFormFilled] = useState<boolean | null>(null);

  // Common form states
  const [residingCountry, setResidingCountry] = useState<OptionType | null>(
    null
  );
  const [spendingCapacity, setSpendingCapacity] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [currentClass, setCurrentClass] = useState("");
  const [moveAbroad, setMoveAbroad] = useState<"yes" | "suggest">("suggest");
  const [preferredAbroadCountry, setPreferredAbroadCountry] =
    useState<OptionType | null>(null);
  const [willingToMoveAbroad, setWillingToMoveAbroad] = useState<
    boolean | null
  >(false);
  const [isCollegeStudent, setIsCollegeStudent] = useState<boolean | null>(
    null
  );
  const [apiCallCompleted, setApiCallCompleted] = useState(false);
  const [difficulty, setDifficulty] = useState<
    "easy" | "medium" | "hard" | null
  >(null);

  // Branch-specific form states
  const [careerOption, setCareerOption] = useState<"known" | "unknown">(
    "known"
  );
  const [desiredCareer, setDesiredCareer] = useState("");
  const [previousExperience, setPreviousExperience] = useState("");
  const [interestParagraph, setInterestParagraph] = useState("");

  // Subscription states
  const [subscriptionStatus, setSubscriptionStatus] = useState<boolean>(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>("");

  // Roadmap state
  const [hasRoadmap, setHasRoadmap] = useState<boolean>(false);

  // New state: tracking when roadmap generation is in progress
  const [generating, setGenerating] = useState<boolean>(false);

  const countryOptions = countryList().getData() as OptionType[];

  const customStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "#FF6500" : base.borderColor,
      boxShadow: state.isFocused ? "0 0 0  #FF6500" : base.boxShadow,
      borderRadius: "1rem",
      "&:hover": {
        borderColor: state.isFocused ? "#FF6500" : base.borderColor,
      },
    }),
  };

  const [selectedUniversityId, setSelectedUniversityId] = useState<
    number | null
  >(null);
  const [inputValue, setInputValue] = useState("");
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/");
  }, [isSignedIn, router, isLoaded]);

  const isSouthAsianCountry = (countryCode: string) => {
    const southAsianCountries = ['IN', 'PK', 'BD']; // India, Pakistan, Bangladesh
    return southAsianCountries.includes(countryCode);
  };

  // Fetch subscription status, roadmap, and form_filled from career_info
  useEffect(() => {
    if (!isLoaded || !user) return;
    let isMounted = true;

    async function fetchUserData() {
      try {
        // 1️ fetch subscription & user id
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select(
            "id, subscription_status, subscription_plan, subscription_start, subscription_end"
          )
          .eq("clerk_id", user!.id)
          .single();

        if (userError || !userData)
          throw userError || new Error("User not found");
        if (!isMounted) return;

        setDbUserId(userData.id);
        setSubscriptionStatus(userData.subscription_status);
        setSubscriptionPlan(userData.subscription_plan);

        // auto‑expire if past end date
        if (
          userData.subscription_end &&
          new Date(userData.subscription_end) < new Date()
        ) {
          await supabase
            .from("users")
            .update({ subscription_status: false })
            .eq("clerk_id", user!.id);
          if (isMounted) setSubscriptionStatus(false);
        }

        // 2️ fetch full career_info row
        const { data: careerData, error: careerError } = await supabase
          .from("career_info")
          .select(
            `user_id,
             roadmap,
             residing_country,
             spending_capacity,
             parent_email,
             current_class,
             move_abroad,
             preferred_abroad_country,
             college_student,
             difficulty,
             desired_career,
             previous_experience`
          )
          .eq("user_id", userData.id)
          .maybeSingle();

        if (careerError) throw careerError;
        if (!isMounted) return;

        // roadmap & formFilled flags
        const roadmapExists = !!(
          careerData?.roadmap &&
          typeof careerData.roadmap === "object" &&
          Object.keys(careerData.roadmap).length > 0
        );
        setHasRoadmap(roadmapExists);
        setFormFilled(careerData?.form_filled ?? false);

        if (careerData) {
          // helper to map a string to OptionType
          const findOpt = (val?: string) =>
            countryOptions.find((o) => o.value === val) || null;

          // Common fields
          setResidingCountry(findOpt(careerData.residing_country));
          setSpendingCapacity(careerData.spending_capacity?.toString() ?? "");
          setParentEmail(careerData.parent_email || "");
          setCurrentClass(careerData.current_class || "");
          setWillingToMoveAbroad(careerData.move_abroad ?? false);
          setMoveAbroad(careerData.move_abroad ? "yes" : "suggest");
          setPreferredAbroadCountry(
            findOpt(careerData.preferred_abroad_country)
          );
          setIsCollegeStudent(careerData.college_student ?? null);
          setDifficulty(
            (careerData.difficulty as "easy" | "medium" | "hard") ?? null
          );

          // Branch‑specific fields
          const hasPrevExp = !!careerData.previous_experience;
          const hasDesired = !!careerData.desired_career;

          if (hasDesired && !hasPrevExp) {
            setCareerOption("unknown");
            setInterestParagraph(careerData.desired_career || "");
            setDesiredCareer("");
            setPreviousExperience("");
          } else {
            setCareerOption("known");
            setDesiredCareer(careerData.desired_career || "");
            setPreviousExperience(careerData.previous_experience || "");
            setInterestParagraph("");
          }
        }

        // // mark that initial API call is done
        // setApiCallCompleted(true);
      } catch (err) {
        console.error("Error fetching user/career data:", err);
      }
    }

    fetchUserData();
    return () => {
      isMounted = false;
    };
  }, [isLoaded, user]);

  const dashboardLinks = [
    { href: "/roadmap", label: "Roadmap" },
    { href: "/blog", label: "Blogs" },
  ];

  // Updated Generate Roadmap Handler with new logic
  const handleGenerateRoadmap = async () => {
    console.log("handleGenerateRoadmap called:", {
      isCollegeStudent,
      formFilled,
    });
    setGenerating(true);

    (async () => {
      try {
        const res = await fetch("/api/generate-roadmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerk_id: user?.id }),
        });

        const result = await res.json();
        console.log("Generated roadmap:");
        setApiCallCompleted(true);
      } catch (error) {
        console.log("Error generating roadmap:", error);
        setGenerating(false);
      }
    })();

    if (isCollegeStudent && !formFilled) {
      if (residingCountry && residingCountry.value === 'IN') {
        console.log("Showing college form modal for Indian college student.");
        setShowCollegeForm(true);
      } else {
        console.log("College student but not from India - skipping college form.");
      }
    }
  };

  // Handler for college form submission: update form_filled to true in the DB.
  const handleCollegeFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      if (!dbUserId) {
        console.error("Database user ID not found");
        return;
      }

      if (!selectedUniversityId) {
        alert("Please select a university.");
        return;
      }

      // Step 1: Insert data into university_ratings
      const { error: ratingsError } = await supabase
        .from("university_ratings")
        .insert({
          user_id: dbUserId,
          university_id: selectedUniversityId,
          tuition_fees: parseFloat(formData.tuitionFees) || null,
          cultural_rating: formData.culturalRating || null,
          infra_rating: formData.infraRating || null,
          vibe_rating: formData.vibeRating || null,
          companies_count: parseInt(formData.companiesCount) || null,
          highestCTC: parseInt(formData.highestCTC) || null,
          avgCTC: parseInt(formData.avgCTC) || null,
        });

      if (ratingsError) {
        console.error("Error inserting into university_ratings:", ratingsError);
        alert("There was an error submitting the university rating.");
        return;
      }

      // Step 2: Update career_info to set form_filled to true
      const { data, error } = await supabase
        .from("career_info")
        .update({ form_filled: true })
        .eq("user_id", dbUserId);

      if (error) {
        console.error("Error updating form_filled:", ratingsError.message, ratingsError.details);
        alert("There was an error updating your career information.");
        return;
      } else {
        console.log("Form updated to filled:", data);
        setFormFilled(true);
        setShowCollegeForm(false);
        if (apiCallCompleted) {
          console.log("API call completed and form submitted; redirecting.");
          router.push("/roadmap");
        } else {
          console.log("Form submitted, waiting for API response.");
        }
      }
    } catch (err) {
      console.error("Error in handleCollegeFormSubmit:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  useEffect(() => {
    if (apiCallCompleted && (
      !isCollegeStudent || 
      formFilled || 
      (isCollegeStudent && residingCountry && residingCountry.value !== 'IN')
    )) {
      console.log("Conditions met; redirecting to /roadmap.");
      setGenerating(false);
      router.push("/roadmap");
    }
  }, [apiCallCompleted, formFilled, isCollegeStudent, residingCountry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: any = {
      clerk_id: user?.id,
      residing_country: residingCountry ? residingCountry.value : null,
      spending_capacity: spendingCapacity ? parseFloat(spendingCapacity) : null,
      current_class: currentClass,
      move_abroad: willingToMoveAbroad === true,
      preferred_abroad_country:
        willingToMoveAbroad === true
          ? moveAbroad === "yes"
            ? preferredAbroadCountry
              ? preferredAbroadCountry.value
              : null
            : "Suggest"
          : false,
      parent_email: parentEmail,
      college_student: isCollegeStudent,
      difficulty: difficulty,
      roadmap: null,
    };

    if (careerOption === "known") {
      payload.desired_career = desiredCareer;
      payload.previous_experience = previousExperience;
    } else {
      payload.desired_career = interestParagraph;
      payload.previous_experience = "";
    }

    try {
      const res = await fetch("/api/save-career-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      console.log("Career info saved:", result);

      if (!subscriptionStatus) {
        // Check user's country to determine which payment plan to show
        if (residingCountry && isSouthAsianCountry(residingCountry.value)) {
          // Show INR pricing for users from India, Pakistan, Bangladesh
          setShowPaymentPlans(true);
          setShowUSDPaymentPlans(false);
        } else {
          // Show USD pricing for users from other countries
          setShowPaymentPlans(false);
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <FloatingNavbar navLinks={dashboardLinks} />

      <div className="container mx-auto my-20 px-4 lg:px-48 py-8 flex-grow mt-36">
        <h1 className="text-3xl text-black font-bold mb-6">
          Welcome, <span className="text-[#FF6500]">{user?.firstName}</span>
        </h1>

        {hasRoadmap ? (
          <RoadmapNotification />
        ) : (
          <div className="mb-6 p-3 bg-orange-50 text-orange-700 rounded-md">
            <p>
              Fill in the fields below to get your personalized career roadmap.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* The rest of your form remains unchanged */}
          {/* Career Option Selector */}
          <div className="flex justify-center  items-center mb-16 mt-16">
            <div
              className={`transition-opacity duration-300 mr-4 ${
                careerOption === "known" ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src="/happy.png"
                alt="Known career"
                className="w-36 h-36  object-contain "
              />
            </div>
            <div className="relative w-48 h-24">
              <input
                id="known"
                type="radio"
                value="known"
                checked={careerOption === "known"}
                onChange={() => setCareerOption("known")}
                className="opacity-0 absolute top-0 left-0 h-full w-full m-0 cursor-pointer peer"
                required
              />
              <div className="flex flex-col items-center justify-center w-full h-full border-2 border-black rounded-md p-4 bg-white transition-all duration-300 ease-in-out peer-checked:bg-orange-400 peer-checked:border-orange-400 peer-checked:scale-105">
                <label
                  htmlFor="known"
                  className="text-center text-sm font-semibold uppercase tracking-wider text-black peer-checked:text-white transition-colors duration-300"
                >
                  I know what career I want
                </label>
              </div>
            </div>
            <div className="relative w-48 h-24 ml-4">
              <input
                id="unknown"
                type="radio"
                value="unknown"
                checked={careerOption === "unknown"}
                onChange={() => setCareerOption("unknown")}
                className="opacity-0 absolute top-0 left-0 h-full w-full m-0 cursor-pointer peer"
                required
              />
              <div className="flex flex-col items-center justify-center w-full h-full border-2 border-black rounded-md p-4 bg-white transition-all duration-300 ease-in-out peer-checked:bg-orange-400 peer-checked:border-orange-400 peer-checked:scale-105">
                <label
                  htmlFor="unknown"
                  className="text-center text-sm font-semibold uppercase tracking-wider text-black peer-checked:text-white transition-colors duration-300"
                >
                  I'm not sure what to do
                </label>
              </div>
            </div>
            <div
              className={`transition-opacity duration-300 ml-0 ${
                careerOption === "unknown" ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src="/sad.png"
                alt="Exploring careers"
                className="w-36 h-36 object-contain"
              />
            </div>
          </div>

          <div className="mt-8 ">
            {careerOption === "known" && (
              <div className="p-2 rounded-lg">
                <h3 className="text-xl text-black font-bold mb-3">
                  Great! You know your career path
                </h3>
                <p className="text-[#FF6500]">
                  We'll help you achieve your specific career goals with a
                  focused approach.
                </p>
              </div>
            )}
            {careerOption === "unknown" && (
              <div className="p-2 rounded-lg">
                <h3 className="text-xl text-black font-bold mb-3">
                  Let's explore your options
                </h3>
                <p className="text-[#FF6500]">
                  We'll help you discover potential career paths based on your
                  interests and skills.
                </p>
              </div>
            )}
          </div>

          <p className="text-black font-semibold">
            Please answer the following common questions:
          </p>
          <div className="space-y-12">
            <div>
              <label className="block text-gray-800 mb-4">
                Residing Country:
              </label>
              <Select<OptionType, false, GroupBase<OptionType>>
                options={countryOptions}
                value={residingCountry}
                onChange={(selected) => setResidingCountry(selected)}
                placeholder="Select your country..."
                required
                styles={customStyles}
                className="text-black mb-16 focus:outline-none focus:ring-0  cursor-pointer"
              />
            </div>
            <div>
               <label className="block text-gray-800 mb-4">
                Spending Capacity:{" "}
                <label className="font-style: italic text-sm text-gray-400">
                  (How much can you spend on your education to pursue this
                  career?)
                </label>
              </label>
              <input
                type="number"
                value={spendingCapacity}
                onChange={(e) => setSpendingCapacity(e.target.value)}
                placeholder="eg. 500000"
                className="mt-2 block w-full text-black border border-gray-300 p-2 rounded-[1rem] mb-16 focus:outline-none focus:ring-0 focus:border-[#FF6500]"
                required
              />
            </div>
            <div>
              <label className="block text-gray-800 mb-4">
                I am a college student:
              </label>
              <div className="flex space-x-8 mb-16 mt-2">
                <label className="text-black mr-8">
                <input
                    type="radio"
                    name="collegeStudent"
                    value="yes"
                    checked={isCollegeStudent === true}
                    onChange={() => setIsCollegeStudent(true)}
                    required
                    // Hide native radio and apply custom styles
                    className="
                      appearance-none 
                      h-4 w-4 
                      border border-gray-400 
                      rounded-full 
                      checked:bg-[#FF6500] 
                      checked:border-[#FF6500] 
                      focus:outline-none
                      cursor-pointer
                      mr-4
                    "
                  />
                  Yes
                </label>
                <label className="text-black">
                <input
                  type="radio"
                  name="collegeStudent"
                  value="no"
                  checked={isCollegeStudent === false}
                  onChange={() => setIsCollegeStudent(false)}
                  required
                  // Same styling for the other option
                  className="
                    appearance-none 
                    h-4 w-4 
                    border border-gray-400 
                    rounded-full 
                    checked:bg-[#FF6500] 
                    checked:border-[#FF6500] 
                    focus:outline-none
                    cursor-pointer
                    mr-4
                  "
                />
                  No
                </label>
              </div>
            </div>
            <div>
              <label className="block text-gray-800 mb-4">
                Which class/standard do you study in?
              </label>
              <input
                type="text"
                value={currentClass}
                onChange={(e) => setCurrentClass(e.target.value)}
                placeholder="e.g., 10th, 12th, or college year (If in college, also mention the course opted.)"
                className="mt-2 block w-full text-black border border-gray-300 p-2 rounded-[1rem] mb-16 focus:outline-none focus:ring-0 focus:border-[#FF6500]"
                required
              />
            </div>
            <div>
              <label className="block text-gray-800 mb-4">
                Share your parent's email id.
                <label className="font-style: italic text-sm text-gray-400">
                  (Parent, Guardian, Teacher)
                </label>
              </label>
              <input
                type="text"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="e.g., parentemail@gmail.com"
                className="mt-2 block w-full text-black border border-gray-300 p-2 rounded-[1rem] mb-16 focus:outline-none focus:ring-0 focus:border-[#FF6500]"
                required
              />
            </div>
            <div>
              <label className="block text-gray-800 mb-4">
                Are you willing to move abroad for study/work?
              </label>
              <input
                type="radio"
                name="willing"
                id="willing-yes"
                value="true"
                checked={willingToMoveAbroad === true}
                onChange={() => {
                  setWillingToMoveAbroad(true);
                  setMoveAbroad("suggest");
                  setPreferredAbroadCountry(null);
                }}
                style={{ display: "none" }}
                required
              />
              <input
                type="radio"
                name="willing"
                id="willing-no"
                value="false"
                checked={willingToMoveAbroad === false}
                onChange={() => {
                  setWillingToMoveAbroad(false);
                  setMoveAbroad("suggest");
                  setPreferredAbroadCountry(null);
                }}
                style={{ display: "none" }}
                required
              />
              <div
                className={`relative w-36 h-10 rounded-full cursor-pointer mb-16 transition-all duration-200 ease-in-out ${
                  willingToMoveAbroad ? "bg-green-500" : "bg-red-500"
                }`}
                onClick={() => {
                  setWillingToMoveAbroad(!willingToMoveAbroad);
                  setMoveAbroad("suggest");
                  setPreferredAbroadCountry(null);
                }}
              >
                <span
                  className={`absolute left-0 w-16 h-10 leading-10 text-center font-semibold ${
                    willingToMoveAbroad ? "text-white" : "text-red-500"
                  }`}
                >
                  Yes
                </span>
                <span
                  className={`absolute right-0 w-16 h-10 leading-10 text-center font-semibold ${
                    !willingToMoveAbroad ? "text-white" : "text-green-500"
                  }`}
                >
                  No
                </span>
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-lg">
                  {willingToMoveAbroad ? "✓" : "✕"}
                </span>

              </div>
              {willingToMoveAbroad === true && (
                <div className="mt-4">
                  <label className="block text-gray-800 mb-4">
                    Please choose an option:
                  </label>
                  <div className="flex space-x-6 mt-2">
                    <label className="text-black">
                      <input
                        type="radio"
                        name="moveAbroad"
                        value="yes"
                        checked={moveAbroad === "yes"}
                        onChange={() => {
                          setMoveAbroad("yes");
                          setPreferredAbroadCountry(null);
                        }}
                        className="
                          appearance-none 
                          h-4 w-4 
                          border border-gray-400 
                          rounded-full 
                          checked:bg-[#FF6500] 
                          checked:border-[#FF6500] 
                          focus:outline-none
                          cursor-pointer
                          mr-4"
                        required
                      />
                      I'll select my preferred country
                    </label>
                    <label className="text-black">
                      <input
                        type="radio"
                        name="moveAbroad"
                        value="suggest"
                        checked={moveAbroad === "suggest"}
                        onChange={() => {
                          setMoveAbroad("suggest");
                          setPreferredAbroadCountry({
                            label: "Suggest by yourself",
                            value: "Suggest by yourself",
                          });
                        }}
                        className="
                            appearance-none 
                            h-4 w-4 
                            border border-gray-400 
                            rounded-full 
                            checked:bg-[#FF6500] 
                            checked:border-[#FF6500] 
                            focus:outline-none
                            cursor-pointer
                            mr-4"
                        required
                      />
                      Suggest best for me
                    </label>
                  </div>
                  {moveAbroad === "yes" && (
                    <div className="mt-4">
                      <label className="block text-gray-800 mt-16 mb-2">
                        Preferred Country Abroad:
                      </label>
                      <Select<OptionType, false, GroupBase<OptionType>>
                        options={countryOptions}
                        value={preferredAbroadCountry}
                        onChange={(selected) =>
                          setPreferredAbroadCountry(selected)
                        }
                        placeholder="Select a country..."
                        required
                        className="text-black"
                        styles={customStyles}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {careerOption === "known" ? (
            <div className="space-y-12 ">
              <div>
                <label className="block text-gray-800 mb-4 mt-8">
                  What career do you want to pursue?
                </label>
                <input
                  type="text"
                  value={desiredCareer}
                  onChange={(e) => setDesiredCareer(e.target.value)}
                  placeholder="e.g., Astronaut"
                  className="mt-2 block w-full text-black border border-gray-300 p-2 rounded-[1rem] mb-16 focus:outline-none focus:ring-0 focus:border-[#FF6500]"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-800 mb-4">
                  Previous experience or work done in this career (e.g., a home
                  project):
                </label>
                <input
                  type="text"
                  value={previousExperience}
                  onChange={(e) => setPreviousExperience(e.target.value)}
                  placeholder="Describe your experience..."
                  className="mt-2 block w-full text-black border border-gray-300 p-2 rounded-[1rem] mb-20  focus:outline-none focus:ring-0 focus:border-[#FF6500]"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-800 mt-16">
                  Tell us what you like doing the most:
                </label>
                <textarea
                  value={interestParagraph}
                  onChange={(e) => setInterestParagraph(e.target.value)}
                  placeholder="Write about your interests, hobbies, or activities you enjoy (e.g., 'I love solving puzzles, building things with my hands, and helping my friends with their problems...')"
                  className="mt-2 block w-full px-2 py-4 text-black border border-gray-300 rounded-[1rem] focus:outline-none focus:ring-0 focus:border-[#FF6500]"
                  rows={4}
                  minLength={300}
                  maxLength={1200}
                  required
                />
                <p className="text-sm text-gray-500 mt-2 mb-20">
                  300 &lt;{" "}
                  <span
                    className={
                      interestParagraph.length >= 300 &&
                      interestParagraph.length <= 1200
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {interestParagraph.length}
                  </span>{" "}
                  &lt; 1200
                </p>
              </div>
            </div>
          )}
          <DifficultySelector
            difficulty={difficulty}
            setDifficulty={setDifficulty}
          />

          <div className="flex justify-center w-full">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-white text-black py-5 px-12 rounded-full border-2 border-black hover:border-transparent transition-all duration-500 hover:bg-orange-400 mt-8"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
      
      {/* INR Payment Plan */}
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

      {/* USD Payment Plan */}
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

      {/* Existing Generate Modal for non-college students */}
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
                className="bg-white text-black py-5 px-8 rounded-full border-2 border-black hover:border-transparent transition-all duration-500 hover:bg-red-500 mb-2"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateRoadmap}
                className="bg-white text-black py-5 px-8 rounded-full border-2 border-black hover:border-transparent transition-all duration-500 hover:bg-green-400 mb-2"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New modal for college students to fill the form */}
      {showCollegeForm && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex  justify-center items-center z-50 transition-all duration-300">
    <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-auto border border-gray-100">
      <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
        University Rating
      </h2>
      <form onSubmit={handleCollegeFormSubmit} className="space-y-8">
        {/* University Dropdown */}
        <div className="transition-all duration-200">
          <label
            htmlFor="universityInput"
            className="text-sm font-medium text-gray-700 mb-2 block"
          >
            University
          </label>
          <div className="relative">
            <input
              id="universityInput"
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setIsSuggestionsOpen(true);
              }}
              onFocus={() => setIsSuggestionsOpen(true)}
              className="w-full p-3 rounded-xl border text-gray-700 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
              placeholder="Search universities..."
              required
              autoComplete="off"
            />
            {isSuggestionsOpen && inputValue && (
              <div className="absolute z-10 w-full mt-1 bg-white text-gray-700 rounded-xl shadow-xl max-h-60 overflow-auto border border-gray-100">
                {universities
                  .filter((uni) =>
                    uni.name.toLowerCase().includes(inputValue.toLowerCase())
                  )
                  .map((uni) => (
                    <div
                      key={uni.id}
                      className="p-3 hover:bg-blue-50 text-gray-700 cursor-pointer transition-colors duration-150"
                      onClick={() => {
                        setSelectedUniversityId(uni.id);
                        setInputValue(uni.name);
                        setIsSuggestionsOpen(false);
                      }}
                    >
                      {uni.name}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Tuition Fees */}
        <div className="transition-all duration-200">
          <label htmlFor="tuitionFees" className="text-sm font-medium text-gray-700 mb-2 block">
            Tuition Fees (per semester)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              id="tuitionFees"
              min="0"
              step="1000"
              value={formData.tuitionFees}
              onChange={(e) =>
                setFormData({ ...formData, tuitionFees: e.target.value })
              }
              className="w-full p-3 pl-8 rounded-xl text-gray-700 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
              required
            />
          </div>
        </div>

        {/* Rating Sections */}
        <div className="space-y-6">
          {/* Cultural Rating */}
          <div className="transition-all duration-200">
            <label className="text-sm font-medium text-gray-700 mb-4 block">
              Cultural Events Rating
            </label>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Low</span>
              <div className="flex gap-1 flex-1 mx-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <div
                    key={num}
                    onClick={() =>
                      setFormData({ ...formData, culturalRating: num })
                    }
                    className={`cursor-pointer h-2 flex-1 rounded-full transition-all duration-200 ${
                      formData.culturalRating >= num
                        ? "bg-gradient-to-r from-orange-200 to-orange-500"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">High</span>
            </div>
            <div className="text-center mt-2 font-medium text-green-600">
              {formData.culturalRating || "-"}/10
            </div>
          </div>

          {/* Infrastructure Rating */}
          <div className="transition-all duration-200">
            <label className="text-sm font-medium text-gray-700 mb-4 block">
              Infrastructure Rating
            </label>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Low</span>
              <div className="flex gap-1 flex-1 mx-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <div
                    key={num}
                    onClick={() =>
                      setFormData({ ...formData, infraRating: num })
                    }
                    className={`cursor-pointer h-2 flex-1 rounded-full transition-all duration-200 ${
                      formData.infraRating >= num
                        ? "bg-gradient-to-r from-orange-200 to-orange-500"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">High</span>
            </div>
            <div className="text-center mt-2 font-medium text-green-600">
              {formData.infraRating || "-"}/10
            </div>
          </div>

          {/* Vibe Rating */}
          <div className="transition-all duration-200">
            <label className="text-sm font-medium text-gray-700 mb-4 block">
              Vibe Check Rating
            </label>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Low</span>
              <div className="flex gap-1 flex-1 mx-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <div
                    key={num}
                    onClick={() =>
                      setFormData({ ...formData, vibeRating: num })
                    }
                    className={`cursor-pointer h-2 flex-1 rounded-full transition-all duration-200 ${
                      formData.vibeRating >= num
                        ? "bg-gradient-to-r from-orange-200 to-orange-500"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">High</span>
            </div>
            <div className="text-center mt-2 font-medium text-green-600">
              {formData.vibeRating || "-"}/10
            </div>
          </div>
        </div>

        {/* Placement Details */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Placement Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="companiesCount"
                className="text-xs text-gray-500 mb-1 block"
              >
                Companies Count
              </label>
              <input
                type="number"
                id="companiesCount"
                min="0"
                step="1"
                value={formData.companiesCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    companiesCount: e.target.value,
                  })
                }
                className="w-full p-2 text-gray-700 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-200 outline-none"
                required
              />
            </div>
            <div>
              <label
                htmlFor="highestCTC"
                className="text-xs text-gray-500 mb-1 block"
              >
                Highest CTC (LPA)
              </label>
              <input
                type="number"
                id="highestCTC"
                min="0"
                step="1"
                value={formData.highestCTC}
                onChange={(e) =>
                  setFormData({ ...formData, highestCTC: e.target.value })
                }
                className="w-full p-2 text-gray-700 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-200 outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="avgCTC" className="text-xs text-gray-500 mb-1 block">
                Average CTC (LPA)
              </label>
              <input
                type="number"
                id="avgCTC"
                min="0"
                step="1"
                value={formData.avgCTC}
                onChange={(e) =>
                  setFormData({ ...formData, avgCTC: e.target.value })
                }
                className="w-full p-2 text-gray-700 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-200 outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => setShowCollegeForm(false)}
            className="px-6 py-2.5 rounded-full bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-100 transition-all duration-200 font-medium text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-200 transition-all duration-200 font-medium text-sm"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Loader overlay during roadmap generation  */}
      {generating && !showCollegeForm && (
        <div className="fixed inset-0  justify-center items-center z-50 ">
          
          <Loader />
        </div>
      )}
    </div>
  );
}
