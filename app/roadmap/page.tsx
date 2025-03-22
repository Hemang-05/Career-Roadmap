'use client';

import { useState, useEffect } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/supabaseClient';
import { useSyncUser } from '@/app/hooks/sync-user';
import PaymentPlan from '@/components/PaymentPlan';
import FloatingNavbar from '@/components/Navbar';

export default function RoadmapPage() {
  useSyncUser();
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPaymentPlan, setShowPaymentPlan] = useState(false);

  const dashboardLinks = [
    { href: '/roadmap', label: 'Roadmap' },
    { href: '/dashboard', label: 'Edit Info' },
    { href: '/events', label: 'Events' },
    { href: '/settings', label: 'Settings' },
    { href: '/support', label: 'Support' },
  ];

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
      return;
    }

    async function fetchRoadmap() {
      try {
        if (user) {
          // Fetch subscription info from users table
          const { data: userRecord, error: userError } = await supabase
            .from('users')
            .select('id, subscription_status, subscription_end')
            .eq('clerk_id', user.id)
            .single();
          if (userError || !userRecord) {
            console.log('Error fetching user record:', userError);
            setErrorMessage('User record not found in Supabase.');
            return;
          }
          const { subscription_status, subscription_end, id: userId } = userRecord;
          const currentDate = new Date();
          const subscriptionEndDate = new Date(subscription_end);
          if (!subscription_status || subscriptionEndDate < currentDate) {
            console.log('Subscription expired or inactive');
            setShowPaymentPlan(true);
            return;
          }
          // If subscription is active, fetch the roadmap from career_info
          const { data, error } = await supabase
            .from('career_info')
            .select('roadmap')
            .eq('user_id', userId)
            .single();
          if (error) {
            console.log('Error fetching roadmap:', error);
            setErrorMessage('Error fetching roadmap: ' + error.message);
          } else if (!data?.roadmap) {
            setErrorMessage('No roadmap found. Please generate your roadmap. Go to edit info and submit your details');
          } else {
            setRoadmap(data.roadmap);
          }
        }
      } catch (err) {
        console.log('Error in fetchRoadmap:', err);
        setErrorMessage('An unexpected error occurred while fetching the roadmap.');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchRoadmap();
    }
  }, [isSignedIn, router, user]);

  if (loading) {
    return ;
  }

  // If payment plan should be shown (subscription expired), display the PaymentPlan component
  if (showPaymentPlan && user?.id) {
    return <PaymentPlan clerk_id={user.id} onSuccess={() => window.location.reload()} message="Your subscription has expired. Please choose a new plan." />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <FloatingNavbar navLinks={dashboardLinks} />

      {/* Roadmap Content */}
      <div className="container mx-auto mt-20 px-4 py-8 flex-grow">
        <h1 className="text-3xl text-black font-bold mb-6">Your <span className="text-[#FF6500]">Career</span>Roadmap</h1>
        {roadmap ? (
          <div className="bg-white p-6 rounded-md shadow-md">
            <pre className="whitespace-pre-wrap text-gray-800">{roadmap}</pre>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-md shadow-md">
            <p className="text-gray-800">{errorMessage || 'Roadmap is not available.'}</p>
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