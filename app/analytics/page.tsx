'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabaseClient';
import { useSyncUser } from '@/app/hooks/sync-user';
import FloatingNavbar from '@/components/Navbar';
import ProgressBar from '@/components/ProgressBar';
import PaymentPlan from '@/components/PaymentPlan';
import { calculateWeightProgress } from '@/utils/calcWeightProgress';

export default function AnalyticsDashboard() {
  useSyncUser();
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const [roadmap, setRoadmap] = useState<any>(null);
  const [difficulty, setDifficulty] = useState<string>('');
  const [weightProgress, setWeightProgress] = useState<number>(0);
  const [pace, setPace] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showPaymentPlan, setShowPaymentPlan] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Updated navigation: "User Analysis" remains in the same place
  const dashboardLinks = [
    { href: '/roadmap', label: 'Roadmap' },
    { href: '/dashboard', label: 'Edit Info' },
    { href: '/events', label: 'Events' },
    { href: '/analytics', label: 'User Analysis' },
    { href: '/support', label: 'Support' },
  ];

  const fetchAnalytics = async () => {
    try {
      if (user) {
        const { data: userRecord, error: userError } = await supabase
          .from('users')
          .select('id, subscription_status, subscription_end')
          .eq('clerk_id', user.id)
          .single();

        if (userError || !userRecord) {
          setErrorMessage('User record not found in Supabase.');
          return;
        }

        const { subscription_status, subscription_end, id: userId } = userRecord;
        const currentDate = new Date();
        const subscriptionEndDate = new Date(subscription_end);

        if (!subscription_status || subscriptionEndDate < currentDate) {
          setShowPaymentPlan(true);
          return;
        }

        const { data: careerInfoData, error: careerInfoError } = await supabase
          .from('career_info')
          .select('roadmap, difficulty')
          .eq('user_id', userId)
          .single();

        if (careerInfoError || !careerInfoData) {
          setErrorMessage('Error fetching career information.');
          return;
        }

        setDifficulty(careerInfoData.difficulty);

        if (careerInfoData.roadmap) {
          try {
            // Check if roadmap is a string; if so, parse it, otherwise use it directly.
            const parsed =
              typeof careerInfoData.roadmap === 'string'
                ? JSON.parse(careerInfoData.roadmap)
                : careerInfoData.roadmap;
            setRoadmap(parsed);
            const computedWeightProgress = calculateWeightProgress(parsed);
            setWeightProgress(computedWeightProgress);
          } catch (err) {
            console.error('Error parsing roadmap JSON:', err);
          }
        }

        const { data: analyticsData, error: analyticsError } = await supabase
          .from('user_analytics')
          .select('pace, task_completed, overall_task_percentage, events_attended')
          .eq('user_id', userId)
          .single();

        if (!analyticsError && analyticsData) {
          setPace(analyticsData.pace);
        }
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred while fetching analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
      return;
    }
    if (user) {
      fetchAnalytics();
    }
  }, [isSignedIn, router, user]);

  if (loading) {
    return <div>Loading analytics...</div>;
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
          Your <span className="text-[#FF6500]">User</span> Analytics
        </h1>
        {errorMessage ? (
          <div className="bg-white p-6 rounded-md shadow-md">
            <p className="text-gray-800">{errorMessage}</p>
          </div>
        ) : (
          <div className="bg-white p-6 text-black rounded-md shadow-md space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Difficulty & Progress</h2>
              <p className="text-lg mb-2">
                Chosen Difficulty: <span className="font-semibold capitalize text-[#FF6500]">{difficulty}</span>
              </p>
              <p className="text-lg mb-2">
                Overall Goal Achievement Likelihood (by weight): <span className="font-semibold">{weightProgress.toFixed(2)}%</span>
              </p>
              <ProgressBar progress={weightProgress} />
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-2">Pace</h2>
              <p className="text-lg">
                Your current pace is: <span className="font-semibold text-[#FF6500]">{pace}</span>
              </p>
            </div>
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
