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
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
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
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Placement:</p>
            <p>{university.placement_score.toFixed(1)}/10</p>
          </div>
          <div>
            <p className="font-medium">Tuition Fees:</p>
            <p>{university.tuition_fees.toFixed(1)}/10</p>
          </div>
          <div>
            <p className="font-medium">Cultural:</p>
            <p>{university.cultural_score.toFixed(1)}/10</p>
          </div>
          <div>
            <p className="font-medium">Vibe:</p>
            <p>{university.vibe_check.toFixed(1)}/10</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6">
          <p className="text-sm text-gray-700">
            Additional information about the university can be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
}
