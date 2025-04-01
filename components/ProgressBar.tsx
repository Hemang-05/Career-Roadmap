import React from 'react';

interface ProgressBarProps {
  progress: number; // percentage from 0 to 100
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full bg-gray-300 rounded-full h-6">
      <div
        className="bg-green-500 h-6 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      >
        <span className="text-white text-sm font-semibold pl-2">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
