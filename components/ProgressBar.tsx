import React from 'react';

interface ProgressBarProps {
  progress: number; // percentage from 0 to 100
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const roundedProgress = Math.round(progress);
  
  return (
    <div className="w-full bg-[#ccffd8] rounded-full h-6 relative">
      <div
        className="bg-green-500 h-6 rounded-full transition-all duration-300 flex items-center"
        style={{ width: `${progress}%` }}
      >
        {/* Empty div to take up space but show no content */}
      </div>
      <span 
        className="absolute top-1/2 text-white transform -translate-y-1/2 text-sm font-semibold"
        style={{ 
          left: `${Math.min(Math.max(progress - 3, 2), 97)}%`,
          transform: `translateY(-50%)`,
          color: progress == 0 ? 'black' : 'white'
        }}
      >
        {roundedProgress}%
      </span>
    </div>
  );
}