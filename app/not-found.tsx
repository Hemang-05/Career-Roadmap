// app/not-found.tsx
"use client";

import { useEffect, useState } from "react";

export default function NotFound() {
  const [floatPosition, setFloatPosition] = useState({ x: 0, y: 0 });
  const [stars, setStars] = useState<
    Array<{ x: number; y: number; size: number; opacity: number }>
  >([]);

  useEffect(() => {
    // Create floating animation for astronaut
    let floatTimer = 0;
    const animateFloat = () => {
      floatTimer += 0.01;
      setFloatPosition({
        x: Math.sin(floatTimer) * 10,
        y: Math.cos(floatTimer) * 8,
      });
      requestAnimationFrame(animateFloat);
    };
    animateFloat();

    // Generate random stars
    const randomStars = Array.from({ length: 100 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.8 + 0.2,
    }));
    setStars(randomStars);

    return () => {
      floatTimer = 0;
    };
  }, []);

  return (
    <main className="flex h-screen items-center justify-center bg-gray-900 overflow-hidden relative">
      {/* Stars background */}
      <div className="absolute inset-0">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animation: `twinkle ${
                Math.random() * 3 + 2
              }s infinite ease-in-out`,
            }}
          />
        ))}
      </div>

      <div className="text-center z-10 relative">
        <div
          className="mb-8 relative mx-auto w-32 h-32"
          style={{
            transform: `translate(${floatPosition.x}px, ${floatPosition.y}px)`,
          }}
        >
          {/* Simple SVG astronaut */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="45" r="20" fill="#e0e0e0" /> {/* Helmet */}
            <circle cx="50" cy="45" r="15" fill="#b3e5fc" /> {/* Visor */}
            <rect x="37" y="40" width="6" height="2" fill="#fff" rx="1" />{" "}
            {/* Eye */}
            <rect x="55" y="40" width="6" height="2" fill="#fff" rx="1" />{" "}
            {/* Eye */}
            <rect
              x="30"
              y="45"
              width="40"
              height="30"
              fill="#e0e0e0"
              rx="15"
            />{" "}
            {/* Body */}
            <rect
              x="30"
              y="65"
              width="15"
              height="15"
              fill="#e0e0e0"
              rx="5"
            />{" "}
            {/* Left leg */}
            <rect
              x="55"
              y="65"
              width="15"
              height="15"
              fill="#e0e0e0"
              rx="5"
            />{" "}
            {/* Right leg */}
            <rect
              x="15"
              y="50"
              width="20"
              height="8"
              fill="#e0e0e0"
              rx="4"
            />{" "}
            {/* Left arm */}
            <rect
              x="65"
              y="50"
              width="20"
              height="8"
              fill="#e0e0e0"
              rx="4"
            />{" "}
            {/* Right arm */}
            <circle
              cx="50"
              cy="45"
              r="12"
              fill="transparent"
              stroke="#90caf9"
              strokeWidth="1"
            />{" "}
            {/* Visor detail */}
          </svg>

          {/* Tether line */}
          <div
            className="absolute w-1 h-40 bg-white opacity-50 top-full left-1/2 transform -translate-x-1/2 origin-top"
            style={{
              transform: `translateX(-50%) rotate(${
                Math.sin(Date.now() / 1000) * 10
              }deg)`,
            }}
          />
        </div>

        <h1 className="text-8xl font-bold text-white mb-2 tracking-tighter">
          <span className="text-blue-400">4</span>
          <span className="text-purple-400">0</span>
          <span className="text-blue-400">4</span>
        </h1>

        <p className="mt-2 text-xl text-gray-300 mb-8">
          Houston, we have a problem!
          <br />
          <span className="text-gray-400 text-lg">
            This page has drifted into deep space.
          </span>
        </p>

        <a
          href="/"
          className="mt-6 inline-block rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-white hover:from-blue-600 hover:to-purple-700 transform transition-transform hover:-translate-y-1"
        >
          Return to Earth
        </a>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </main>
  );
}
