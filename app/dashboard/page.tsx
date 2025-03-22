'use client';
import { useState, useEffect } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Select, { GroupBase, StylesConfig } from 'react-select';
import countryList from 'react-select-country-list';
import { useSyncUser } from '@/app/hooks/sync-user';
import { supabase } from '@/utils/supabase/supabaseClient';
import FloatingNavbar from '@/components/Navbar';
import PaymentPlan from '@/components/PaymentPlan';
import Loader from '@/components/Loader'; // Import the Loader component

type OptionType = {
  label: string;
  value: string;
};

export default function Dashboard() {
  useSyncUser();

  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPaymentPlans, setShowPaymentPlans] = useState(false);

  // Common form states
  const [residingCountry, setResidingCountry] = useState<OptionType | null>(null);
  const [spendingCapacity, setSpendingCapacity] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [currentClass, setCurrentClass] = useState('');
  const [moveAbroad, setMoveAbroad] = useState<'yes' | 'suggest'>('suggest');
  const [preferredAbroadCountry, setPreferredAbroadCountry] = useState<OptionType | null>(null);
  const [willingToMoveAbroad, setWillingToMoveAbroad] = useState<boolean | null>(null);

  // Branch-specific form states
  const [careerOption, setCareerOption] = useState<'known' | 'unknown'>('known');
  const [desiredCareer, setDesiredCareer] = useState('');
  const [previousExperience, setPreviousExperience] = useState('');
  const [interestParagraph, setInterestParagraph] = useState('');

  // Subscription states
  const [subscriptionStatus, setSubscriptionStatus] = useState<boolean>(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('');
  
  // Roadmap state
  const [hasRoadmap, setHasRoadmap] = useState<boolean>(false);

  // New state: tracking when roadmap generation is in progress
  const [generating, setGenerating] = useState<boolean>(false);

  const countryOptions = countryList().getData() as OptionType[];

  const customStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? '#FF6500' : base.borderColor,
      boxShadow: state.isFocused ? '0 0 0  #FF6500' : base.boxShadow,
      '&:hover': {
        borderColor: state.isFocused ? '#FF6500' : base.borderColor,
      },
    }),
  };

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push('/');
  }, [isSignedIn, router, isLoaded]);

  // Fetch subscription status and roadmap
  useEffect(() => {
    if (!isLoaded || !user) return;
    async function fetchUserData() {
      // Fetch subscription info
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, subscription_status, subscription_plan, subscription_start, subscription_end')
        .eq('clerk_id', user!.id)
        .single();
      
      if (userError || !userData) {
        console.log('Error fetching user data:', userError);
        return;
      }
      
      setSubscriptionStatus(userData.subscription_status);
      setSubscriptionPlan(userData.subscription_plan);
      
      // Check if subscription has expired
      if (userData.subscription_end && new Date(userData.subscription_end) < new Date()) {
        await supabase
          .from('users')
          .update({ subscription_status: false })
          .eq('clerk_id', user!.id);
        setSubscriptionStatus(false);
      }
      
      // Check if roadmap exists in career_info table
      const { data: careerData, error: careerError } = await supabase
        .from('career_info')
        .select('user_id, roadmap')
        .eq('user_id', userData.id)
        .maybeSingle();

      setHasRoadmap(!!(careerData && careerData.roadmap && careerData.roadmap.trim().length > 0));
    }
    fetchUserData();
  }, [isLoaded, user]);

  const dashboardLinks = [
    { href: '/roadmap', label: 'Roadmap' },
    { href: '/edit-info', label: 'Edit Info' },
    { href: '/settings', label: 'Settings' },
    { href: '/support', label: 'Support' },
  ];

  const handleGenerateRoadmap = async () => {
    setGenerating(true); // Show loader immediately
    try {
      const res = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerk_id: user?.id }),
      });
      const result = await res.json();
      console.log('Generated roadmap:', result);
      router.push('/roadmap');
    } catch (error) {
      console.log('Error generating roadmap:', error);
    }
    // We don't set generating to false because router.push will unload this page.
  };

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
          ? moveAbroad === 'yes'
            ? preferredAbroadCountry
              ? preferredAbroadCountry.value
              : null
            : 'Suggest'
          : false,
      parent_email: parentEmail,
      roadmap: null,
    };

    if (careerOption === 'known') {
      payload.desired_career = desiredCareer;
      payload.previous_experience = previousExperience;
    } else {
      payload.desired_career = interestParagraph;
      payload.previous_experience = '';
    }

    try {
      const res = await fetch('/api/save-career-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      console.log('Career info saved:', result);
      if (!subscriptionStatus) {
        setShowPaymentPlans(true);
      } else {
        setShowGenerateModal(true);
      }
    } catch (error) {
      console.log('Error saving career info:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <FloatingNavbar navLinks={dashboardLinks} />
      
      <div className="container mx-auto my-20 px-4 py-8 flex-grow mt-28">
        <h1 className="text-3xl text-black font-bold mb-6">
          Welcome, <span className="text-[#FF6500]">{user?.firstName}</span>
        </h1>

        {hasRoadmap ? (
          <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-md flex justify-between items-center">
            <p>
              You already have a roadmap. <span className="font-bold cursor-pointer hover:underline" onClick={() => router.push('/roadmap')}>Click to see</span>.
              If you want to update the existing roadmap, fill in the fields below.
            </p>
          </div>
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
          <div className="flex justify-center items-center mt-16">
            <div className={`transition-opacity duration-300 mr-20 ${careerOption === 'known' ? 'opacity-100' : 'opacity-0'}`}>
              <img src="/happy.png" alt="Known career" className="w-36 h-36 object-cover " />
            </div>
            <div className="relative w-48 h-24">
              <input
                id="known"
                type="radio"
                value="known"
                checked={careerOption === 'known'}
                onChange={() => setCareerOption('known')}
                className="opacity-0 absolute top-0 left-0 h-full w-full m-0 cursor-pointer peer"
                required
              />
              <div className="flex flex-col items-center justify-center w-full h-full border-2 border-black rounded-md p-4 bg-white transition-all duration-300 ease-in-out peer-checked:bg-orange-400 peer-checked:border-orange-400 peer-checked:scale-105">
                <label htmlFor="known" className="text-center text-sm font-semibold uppercase tracking-wider text-black peer-checked:text-white transition-colors duration-300">
                  I know what career I want
                </label>
              </div>
            </div>
            <div className="relative w-48 h-24 mx-6">
              <input
                id="unknown"
                type="radio"
                value="unknown"
                checked={careerOption === 'unknown'}
                onChange={() => setCareerOption('unknown')}
                className="opacity-0 absolute top-0 left-0 h-full w-full m-0 cursor-pointer peer"
                required
              />
              <div className="flex flex-col items-center justify-center w-full h-full border-2 border-black rounded-md p-4 bg-white transition-all duration-300 ease-in-out peer-checked:bg-orange-400 peer-checked:border-orange-400 peer-checked:scale-105">
                <label htmlFor="unknown" className="text-center text-sm font-semibold uppercase tracking-wider text-black peer-checked:text-white transition-colors duration-300">
                  I'm not sure what to do
                </label>
              </div>
            </div>
            <div className={`transition-opacity duration-300 ml-4 ${careerOption === 'unknown' ? 'opacity-100' : 'opacity-0'}`}>
              <img src="/sad.png" alt="Exploring careers" className="w-36 h-36 object-cover" />
            </div>
          </div>

          <div className="mt-8">
            {careerOption === 'known' && (
              <div className="p-2 rounded-lg">
                <h3 className="text-xl text-black font-bold mb-3">Great! You know your career path</h3>
                <p className="text-[#FF6500]">We'll help you achieve your specific career goals with a focused approach.</p>
              </div>
            )}
            {careerOption === 'unknown' && (
              <div className="p-2 rounded-lg">
                <h3 className="text-xl text-black font-bold mb-3">Let's explore your options</h3>
                <p className="text-[#FF6500]">We'll help you discover potential career paths based on your interests and skills.</p>
              </div>
            )}
          </div>

          <p className="text-black font-semibold">Please answer the following common questions:</p>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-800 mb-4">Residing Country:</label>
              <Select<OptionType, false, GroupBase<OptionType>>
                options={countryOptions}
                value={residingCountry}
                onChange={(selected) => setResidingCountry(selected)}
                placeholder="Select your country..."
                required
                styles={customStyles}
                className="text-black mb-16 border border-gray-100 focus:outline-none focus:ring-0 focus:border-[#FF6500]"
              />
            </div>
            <div>
              <label className="block text-gray-800 mb-4">
                Spending Capacity: <label className="font-style: italic text-sm text-gray-400">(How much can you spend on your education to pursue this career?)</label>
              </label>
              <input
                type="number"
                value={spendingCapacity}
                onChange={(e) => setSpendingCapacity(e.target.value)}
                placeholder="e.g., 50000"
                className="mt-2 block w-full text-black border border-gray-100 p-2 rounded-md mb-16 focus:outline-none focus:ring-0 focus:border-[#FF6500]"
                required
              />
            </div>
            <div>
              <label className="block text-gray-800 mb-4">Which class/standard do you study in?</label>
              <input
                type="text"
                value={currentClass}
                onChange={(e) => setCurrentClass(e.target.value)}
                placeholder="e.g., 10th, 12th, or college year"
                className="mt-2 block w-full text-black border border-gray-100 p-2 rounded-md mb-16 focus:outline-none focus:ring-0 focus:border-[#FF6500]"
                required
              />
            </div>
            <div>
              <label className="block text-gray-800 mb-4">
                Share your parent's email id.
                <label className="font-style: italic text-sm text-gray-400">(Parent, Guardian, Teacher)</label>
              </label>
              <input
                type="text"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="e.g., parentemail@gmail.com"
                className="mt-2 block w-full text-black border border-gray-100 p-2 rounded-md mb-16 focus:outline-none focus:ring-0 focus:border-[#FF6500]"
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
                  setMoveAbroad('suggest');
                  setPreferredAbroadCountry(null);
                }}
                style={{ display: 'none' }}
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
                  setMoveAbroad('suggest');
                  setPreferredAbroadCountry(null);
                }}
                style={{ display: 'none' }}
                required
              />
              <div
                className={`relative w-36 h-10 rounded-full cursor-pointer mb-6 transition-all duration-200 ease-in-out ${willingToMoveAbroad ? 'bg-green-500' : 'bg-red-500'}`}
                onClick={() => {
                  setWillingToMoveAbroad(!willingToMoveAbroad);
                  if (!willingToMoveAbroad) {
                    setMoveAbroad('suggest');
                    setPreferredAbroadCountry(null);
                  } else {
                    setMoveAbroad('suggest');
                    setPreferredAbroadCountry(null);
                  }
                }}
              >
                <span className={`absolute left-0 w-16 h-10 leading-10 text-center font-semibold ${willingToMoveAbroad ? 'text-white' : 'text-gray-700'}`}>
                  Yes
                </span>
                <span className={`absolute right-0 w-16 h-10 leading-10 text-center font-semibold ${!willingToMoveAbroad ? 'text-white' : 'text-gray-700'}`}>
                  No
                </span>
                <span className="absolute top-1/2 left-1/2 w-5 h-1 bg-white rounded-sm transform -translate-x-1/2 -translate-y-1/2 rotate-45">
                  {!willingToMoveAbroad && (
                    <span className="absolute w-1 h-5 bg-white rounded-sm -mt-2 ml-2" />
                  )}
                </span>
              </div>
              {willingToMoveAbroad === true && (
                <div className="mt-4">
                  <label className="block text-gray-800 mb-4">Please choose an option:</label>
                  <div className="flex space-x-6 mt-2">
                    <label className="text-black">
                      <input
                        type="radio"
                        name="moveAbroad"
                        value="yes"
                        checked={moveAbroad === 'yes'}
                        onChange={() => {
                          setMoveAbroad('yes');
                          setPreferredAbroadCountry(null);
                        }}
                        className="mr-3"
                        required
                      />
                      I'll select my preferred country
                    </label>
                    <label className="text-black">
                      <input
                        type="radio"
                        name="moveAbroad"
                        value="suggest"
                        checked={moveAbroad === 'suggest'}
                        onChange={() => {
                          setMoveAbroad('suggest');
                          setPreferredAbroadCountry({ label: 'Suggest by yourself', value: 'Suggest by yourself' });
                        }}
                        className="mr-3"
                        required
                      />
                      Suggest best for me
                    </label>
                  </div>
                  {moveAbroad === 'yes' && (
                    <div className="mt-4">
                      <label className="block text-gray-800 mb-2">Preferred Country Abroad:</label>
                      <Select<OptionType, false, GroupBase<OptionType>>
                        options={countryOptions}
                        value={preferredAbroadCountry}
                        onChange={(selected) => setPreferredAbroadCountry(selected)}
                        placeholder="Select a country..."
                        required
                        className="text-black mb-16"
                        styles={customStyles}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {careerOption === 'known' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-800 mb-4 mt-16">What career do you want to pursue?</label>
                <input
                  type="text"
                  value={desiredCareer}
                  onChange={(e) => setDesiredCareer(e.target.value)}
                  placeholder="e.g., Astronaut"
                  className="mt-2 block w-full text-black border border-gray-100 p-2 rounded-md mb-16 focus:outline-none focus:ring-0 focus:border-[#FF6500]"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-800 mb-4">
                  Previous experience or work done in this career (e.g., a home project):
                </label>
                <input
                  type="text"
                  value={previousExperience}
                  onChange={(e) => setPreviousExperience(e.target.value)}
                  placeholder="Describe your experience..."
                  className="mt-2 block w-full text-black border border-gray-100 p-2 rounded-md mb-16 focus:outline-none focus:ring-0 focus:border-[#FF6500]"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-800 mt-16">Tell us what you like doing the most:</label>
                <textarea
                  value={interestParagraph}
                  onChange={(e) => setInterestParagraph(e.target.value)}
                  placeholder="Write about your interests, hobbies, or activities you enjoy (e.g., 'I love solving puzzles, building things with my hands, and helping my friends with their problems...')"
                  className="mt-2 block w-full px-2 py-4 text-black border border-gray-100 rounded-md focus:outline-none focus:ring-0 focus:border-[#FF6500]"
                  rows={4}
                  minLength={300}
                  maxLength={1200}
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  300 &lt;{' '}

                  <span
                    className={
                      interestParagraph.length > 300 && interestParagraph.length < 1200
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {interestParagraph.length}
                  </span>{' '}
                  &lt; 1200
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-center w-full">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-white text-black py-5 px-12 rounded-full border-2 border-black hover:border-transparent transition-all duration-500 hover:bg-orange-400 mt-8"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
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

      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-12 rounded-xl shadow-lg">
            <h2 className="text-2xl text-black font-bold mb-4">Generate <span className="text-[#FF6500]">Career</span> Roadmap</h2>
            <p className="mb-4 text-gray-700">Would you like to generate your career roadmap now?</p>
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

      {/* Loader overlay during roadmap generation */}
      {generating && (
        <div className="fixed inset-0 bg-black flex flex-col justify-center items-center z-50">
          <Loader />
          <p className="text-white mt-6 text-xl font-semibold">Generating Roadmap...</p>
        </div>
      )}

      <footer className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} CareerRoadmap. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
