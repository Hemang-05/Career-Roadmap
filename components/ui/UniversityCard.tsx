// // components/UniversityCard.tsx

"use client";
import React from "react";

interface UniversityCardProps {
  ranking: number;
  name: string;
  country: string;
  placementScore: number;
  tuitionScore: number;
  culturalScore: number;
  vibeScore: number;
  imageUrl: string;
  onClick: () => void;
}

export default function UniversityCard({
  ranking,
  name,
  country,
  placementScore,
  tuitionScore,
  culturalScore,
  vibeScore,
  imageUrl,
  onClick,
}: UniversityCardProps) {
  return (
    <div
      className="relative group w-48 h-60 rounded-lg overflow-hidden shadow-md cursor-pointer"
      onClick={onClick}
    >
      {/* Background Image */}
      <img
        src={imageUrl}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Default Overlay: Shows name and ranking */}
      <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black to-transparent">
        <div>
          <h3 className="text-white text-xl font-bold">{name}</h3>
          <p className="text-white text-sm">Rank: {ranking}</p>
        </div>
      </div>

      {/* Hover Overlay: Shows additional details */}
      <div className="absolute inset-0 bg-black bg-opacity-75 p-4 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="text-white text-center">
          <p>Placement: {placementScore.toFixed(1)}/10</p>
          <p>Tuition: {tuitionScore.toFixed(1)}/10</p>
          <p>Cultural: {culturalScore.toFixed(1)}/10</p>
          <p>Vibe: {vibeScore.toFixed(1)}/10</p>
        </div>
      </div>
    </div>
  );
}
