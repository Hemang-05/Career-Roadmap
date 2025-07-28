// component/RoadmapNotification.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// Import the desired icons from react-icons
import { HiBell, HiChevronRight } from "react-icons/hi2"; // Using Heroicons v2 as an example

// Props to handle create new and view existing actions
interface RoadmapNotificationProps {
  onCreateNew: () => void;
  onViewExisting: () => void;
}

export default function RoadmapNotification({ onCreateNew, onViewExisting }: RoadmapNotificationProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animation effect when component mounts
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateNew = () => {
    onCreateNew();
    setIsVisible(false);
  };

  const handleViewExisting = () => {
    onViewExisting();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-3xl shadow-xl max-w-md w-full transform transition-transform duration-300 ${
          isAnimating ? "scale-105" : "scale-100"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            {/* Container for the Bell Icon */}
            <div className="bg-slate-200 p-2 rounded-lg flex items-center justify-center">
              {/* Replace HTML/CSS bell with React Icon */}
              <HiBell className="h-5 w-5 text-slate-500" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-normal text-gray-900">
              Roadmap Already Exists
            </h3>
          </div>
          <p className="text-gray-500 font-light mt-6 mb-4">
            Creating new one deletes the existing roadmap and any progress
            analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 border border-gray-300 rounded-2xl text-sm text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Create New
            </button>
            <button
              onClick={handleViewExisting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-2xl text-sm hover:bg-gray-300 hover:text-black transition-colors flex items-center justify-center gap-1"
            >
              View Existing
              <HiChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
