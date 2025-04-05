'use client'
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { supabase } from "@/utils/supabase/supabaseClient";

interface UserAnalyticsDialogProps {
  user: {
    id: number;
    name: string;
    designation: string;
    image: string;
  };
  onClose: () => void;
}

interface AnalyticsData {
  difficulty: string;
  taskCompleted: number;
  overallTaskPercentage: number;
  eventsAttended: number;
  pace: string;
}

const UserAnalyticsDialog: React.FC<UserAnalyticsDialogProps> = ({ user, onClose }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data from career_info table
        const { data: careerInfo, error: careerInfoError } = await supabase
          .from('career_info')
          .select('difficulty')
          .eq('user_id', user!.id)
          .single();
          
        if (careerInfoError) {
          console.error('Error fetching career info:', careerInfoError);
          throw new Error('Failed to fetch career information');
        }
        
        // Fetch data from user_analytics table
        const { data: userAnalytics, error: userAnalyticsError } = await supabase
          .from('user_analytics')
          .select('task_completed, overall_task_percentage, events_attended, pace')
          .eq('user_id', user!.id)
          .single();
          
        if (userAnalyticsError) {
          console.error('Error fetching user analytics:', userAnalyticsError);
          throw new Error('Failed to fetch user analytics');
        }
        
        // Combine the data
        const combinedData: AnalyticsData = {
          difficulty: careerInfo?.difficulty || 'Not specified',
          taskCompleted: userAnalytics?.task_completed || 0,
          overallTaskPercentage: userAnalytics?.overall_task_percentage || 0,
          eventsAttended: userAnalytics?.events_attended || 0,
          pace: userAnalytics?.pace || 0,
        };
        
        setAnalyticsData(combinedData);
      } catch (err) {
        console.error('Error in fetchUserAnalytics:', err);
        setError(err instanceof Error ? err.message : 'Could not load analytics data');
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id) {
      fetchUserAnalytics();
    }
  }, [user?.id]);

  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    if (dateString === 'Not available') return dateString;
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">User Analytics</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* User profile section */}
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-gray-200">
            <Image
              src={user.image}
              alt={user.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">{user.name}</h3>
            {/* <p className="text-gray-600">{user.designation}</p> */}
          </div>
        </div>

        {/* Metrics section */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6500]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : analyticsData ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Completion</h4>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${analyticsData.overallTaskPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{analyticsData.overallTaskPercentage.toFixed(1)}% completed</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Difficulty Level</h4>
              <p className="text-gray-800">{analyticsData.difficulty}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Completion Rate</h4>
              <p className="text-gray-800">
                    {analyticsData.pace}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Events Attended</h4>
              <p className="text-gray-800">{analyticsData.eventsAttended}</p>
            </div>
        
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            No analytics data available
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-6 text-center">
        
        </div>
      </motion.div>
    </div>
  );
};

export default UserAnalyticsDialog;