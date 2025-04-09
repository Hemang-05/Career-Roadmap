// component/RoadmapNotification.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// Import the desired icons from react-icons
import { HiBell, HiChevronRight } from "react-icons/hi2"; // Using Heroicons v2 as an example

export default function RoadmapNotification() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animation effect when component mounts
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
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
            <div className="bg-green-100 p-2 rounded-lg flex items-center justify-center">
              {/* Replace HTML/CSS bell with React Icon */}
              <HiBell className="h-5 w-5 text-green-600" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Roadmap Already Exists
            </h3>
          </div>

          <p className="text-green-800 font-semibold mt-6 mb-4">
            You already have a roadmap created.
          </p>
          <p className="text-red-400 font-thin mb-6">
            Creating new one deletes the existing roadmap and any progress
            analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-400 transition-colors"
            >
              Create New
            </button>
            <button
              onClick={() => router.push("/roadmap")}
              className="px-4 py-2 bg-green-700 text-white rounded-2xl hover:bg-green-600 hover:text-black transition-colors flex items-center justify-center gap-1" // Adjusted gap slightly
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
