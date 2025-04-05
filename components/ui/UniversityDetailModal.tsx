// // components/ui/UniversityDetailModal.tsx

"use client";
import React from "react";

interface UniversityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  university: {
    name: string;
    country: string;
    placement_score: number;
    tuition_fees: number;
    cultural_score: number;
    vibe_check: number;
    image_url?: string;
  };
}

export default function UniversityDetailModal({
  isOpen,
  onClose,
  university,
}: UniversityDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 text-black flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white rounded-3xl m-8 shadow-lg p-6 max-w-2xl w-full relative">
        {/* Close Button */}
        <button
          className="absolute top-2 right-6 text-red-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>

        {/* University Header */}
        <div className="flex flex-col md:flex-row items-center md:space-x-4">
          <img
            src={university.image_url || "/happy.png"}
            alt={university.name}
            className="w-32 h-32 object-cover rounded-md mb-4 md:mb-0"
          />
          <div>
            <h2 className="text-2xl font-bold">{university.name}</h2>
            <p className="text-gray-600">{university.country}</p>
          </div>
        </div>

        {/* Scores */}
        <div className="mt-6 grid bg-orange-200 rounded-2xl p-4  grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Placement:</p>
            <p className="font-normal">
              {university.placement_score.toFixed(1)}/10
            </p>
          </div>
          <div>
            <p className="font-medium">Tuition Fees per Semester:</p>
            <p className="font-normal">
              {university.tuition_fees.toFixed(1)}/semester
            </p>
          </div>

          <div>
            <p className="font-medium">Cultural:</p>
            <p className="font-normal">
              {university.cultural_score.toFixed(1)}/10
            </p>
          </div>
          <div>
            <p className="font-medium">Vibe:</p>
            <p className="font-normal">{university.vibe_check.toFixed(1)}/10</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6">
          <p className="text-sm text-gray-400">
            Other details are not available yet. Please check back later.
          </p>
        </div>
      </div>
    </div>
  );
}
