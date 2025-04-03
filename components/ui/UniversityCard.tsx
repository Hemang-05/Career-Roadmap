// // components/UniversityCard.tsx

// "use client";
// import React from "react";

// interface UniversityCardProps {
//   ranking: number;
//   name: string;
//   country: string;
//   placementScore: number;
//   tuitionScore: number;
//   culturalScore: number;
//   vibeScore: number;
//   imageUrl: string;
//   onClick: () => void;
// }

// export default function UniversityCard({
//   ranking,
//   name,
//   country,
//   placementScore,
//   tuitionScore,
//   culturalScore,
//   vibeScore,
//   imageUrl,
//   onClick,
// }: UniversityCardProps) {
//   return (
//     <div
//       className="relative group w-48 h-60 rounded-lg overflow-hidden shadow-md cursor-pointer"
//       onClick={onClick}
//     >
//       {/* Background Image */}
//       <img
//         src={imageUrl}
//         alt={name}
//         className="absolute inset-0 w-full h-full object-cover"
//       />

//       {/* Default Overlay: Shows name and ranking */}
//       <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black to-transparent">
//         <div>
//           <h3 className="text-white text-xl font-bold">{name}</h3>
//           <p className="text-white text-sm">Rank: {ranking}</p>
//         </div>
//       </div>

//       {/* Hover Overlay: Shows additional details */}
//       <div className="absolute inset-0 bg-black bg-opacity-75 p-4 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//         <div className="text-white text-center">
//           <p>Placement: {placementScore.toFixed(1)}/10</p>
//           <p>Tuition: {tuitionScore.toFixed(1)}/10</p>
//           <p>Cultural: {culturalScore.toFixed(1)}/10</p>
//           <p>Vibe: {vibeScore.toFixed(1)}/10</p>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import React from "react";

interface UniversityCardProps {
  ranking: number;
  name: string;
  country: string;
  placementScore?: number;
  tuitionScore?: number;
  culturalScore?: number;
  vibeScore?: number;
  imageUrl: string;
  onClick: () => void;
}

export default function UniversityCard({
  ranking,
  name,
  country,
  placementScore = 0,
  tuitionScore = 0,
  culturalScore = 0,
  vibeScore = 0,
  imageUrl,
  onClick,
}: UniversityCardProps) {
  // Rating bar component with null safety
  const RatingBar = ({
    label,
    score,
    color,
  }: {
    label: string;
    score: number;
    color: string;
  }) => {
    const getScoreWidth = (score: number) => `${(score / 10) * 100}%`;

    // Ensure score is a number
    const safeScore = typeof score === "number" ? score : 0;

    return (
      <div className="flex items-center justify-between w-full mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-white font-medium text-xs">{label}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-24 h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${color} rounded-full`}
              style={{ width: getScoreWidth(safeScore) }}
            ></div>
          </div>
          <span className="text-white text-xs">{safeScore.toFixed(1)}</span>
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative group w-56 h-60 rounded-lg overflow-hidden shadow-md cursor-pointer"
      onClick={onClick}
    >
      {/* Background Image */}
      <img
        src={imageUrl || "/api/placeholder/200/300"}
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

      {/* Hover Overlay: Shows additional details with visual ratings */}
      <div className="absolute inset-0 bg-black bg-opacity-80 p-4 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="text-white text-center mb-3">
          <h3 className="text-white text-lg font-bold mb-1">{name}</h3>
          <p className="text-white text-xs mb-3">
            {country} • Rank: {ranking}
          </p>
        </div>

        <div className="w-full">
          <RatingBar
            label="Placement"
            score={placementScore}
            color="bg-green-500"
          />
          <RatingBar label="Tuition" score={tuitionScore} color="bg-blue-500" />
          <RatingBar
            label="Cultural"
            score={culturalScore}
            color="bg-yellow-500"
          />
          <RatingBar label="Vibe" score={vibeScore} color="bg-orange-500" />
        </div>
      </div>
    </div>
  );
}
