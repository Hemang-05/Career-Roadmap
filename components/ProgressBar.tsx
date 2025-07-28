import React from "react";

interface ProgressBarProps {
  progress: number; // percentage from 0 to 100
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const roundedProgress = Math.round(progress);

  return (
    <div className="w-full relative">
      {/* Outer container with glass effect */}
      <div className="w-full h-6 bg-gradient-to-r from-gray-100/20 to-gray-200/30 backdrop-blur-sm rounded-full border border-white/20 shadow-lg relative overflow-hidden">
        {/* Subtle ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-cyan-400/10 to-purple-400/10 rounded-full blur-sm"></div>

        {/* Main progress fill with liquid gradient */}
        <div
          className="h-full relative rounded-full transition-all duration-700 ease-out overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          {/* Primary gradient fill */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-600/80 via-purple-500/70 to-cyan-400/80 rounded-full"></div>

          {/* Liquid shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-pulse"></div>

          {/* Moving liquid highlight */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
              animation: "liquid-flow 2s infinite linear",
            }}
          ></div>
        </div>

        {/* Inner glass reflection */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-full"></div>
      </div>

      {/* Percentage text with smooth positioning */}
      <span
        className="absolute top-1/2 transform -translate-y-1/2 text-sm font-medium transition-all duration-500 pointer-events-none"
        style={{
          left: `${Math.min(Math.max(progress - 3, 2), 97)}%`,
          color: progress < 25 ? "#1f2937" : "#ffffff",
          textShadow: progress < 25 ? "none" : "0 1px 2px rgba(0,0,0,0.3)",
        }}
      >
        {roundedProgress}%
      </span>

      {/* CSS for custom animation */}
      <style jsx>{`
        @keyframes liquid-flow {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }
      `}</style>
    </div>
  );
}
