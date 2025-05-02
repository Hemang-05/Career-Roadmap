"use client";
import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export function RoadmapFlipWords({
  beforeText = "For every",
  afterText = "",
  words = [
    "Doctor",
    "Lawyer",
    "Engineer",
    "Video-Editor",
    "Chef",
    "Actor",
    "Cricketer",
    "Author",
    "Musician",
    "Youtuber",
    "Scientist",
    "Officer",
  ],
  duration = 1000, // Increased duration between word changes
  className = "flex justify-center items-center px-4",
}) {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const longestWord = words.reduce((a, b) => (a.length > b.length ? a : b));

  const startAnimation = useCallback(() => {
    const wordIndex = words.indexOf(currentWord);
    const nextIndex = (wordIndex + 1) % words.length;
    setCurrentWord(words[nextIndex]);
    setIsAnimating(true);
  }, [currentWord, words]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!isAnimating) {
      timer = setTimeout(() => {
        startAnimation();
      }, duration);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAnimating, duration, startAnimation]);

  return (
    <div className={className}>
      <div className="text-3xl md:text-4xl lg:text-5xl mx-auto font-semibold text-black flex flex-col sm:flex-row flex-wrap justify-center items-center">
        {/* Text stacks vertically on mobile, horizontal on larger screens */}
        <span className="sm:mr-2 text-center mb-1 sm:mb-0">{beforeText}</span>

        {/* Container with fixed height to prevent layout shifts */}
        <div
          className="relative inline-flex justify-center h-auto mb-1 sm:mb-0"
          style={{ minHeight: "1.2em" }}
        >
          {/* This invisible spacer element maintains consistent width */}
          <div className="invisible whitespace-nowrap" aria-hidden="true">
            <span className="font-black text-[#FF6500]">{longestWord}</span>
          </div>

          {/* Positioned absolutely to prevent layout shifts */}
          <AnimatePresence
            mode="wait"
            onExitComplete={() => setIsAnimating(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                duration: 0.2,
              }}
              exit={{
                opacity: 0,
                y: -20,
                filter: "blur(4px)",
                transition: { duration: 0.2 },
              }}
              className="absolute top-0 left-0 right-0 bottom-0 font-black text-center text-[#FF6500]"
              key={currentWord}
              style={{
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {currentWord}
            </motion.div>
          </AnimatePresence>
        </div>

        {afterText && <span className="sm:ml-2">{afterText}</span>}
      </div>
    </div>
  );
}
