"use client";
import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export function RoadmapFlipWords({
  beforeText = "For every",
  afterText = "",
  words = ["Doctor", "Lawyer", "Engineer", "Video-Editor", "Chef", "Actor", "Cricketer", "Author", "Musician", "Youtuber", "Scientist", "Officer"],
  duration = 300,
  className = "flex justify-center items-center px-4"
}) {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = useCallback(() => {
    const word = words[words.indexOf(currentWord) + 1] || words[0];
    setCurrentWord(word);
    setIsAnimating(true);
  }, [currentWord, words]);

  useEffect(() => {
    if (!isAnimating)
      setTimeout(() => {
        startAnimation();
      }, duration);
  }, [isAnimating, duration, startAnimation]);

  return (
    <div className={className}>
      <div className="text-3xl md:text-4xl lg:text-5xl mx-auto font-semibold text-black flex flex-wrap justify-center">
        <span className="mr-2">{beforeText}</span>
        <div className="relative inline-flex justify-center">
          <div className="invisible whitespace-nowrap">
            {/* This invisible element reserves space for the longest word */}
            <span className="font-black text-[#FF6500]">
              {words.reduce((a, b) => a.length > b.length ? a : b)}
            </span>
          </div>
          <AnimatePresence
            onExitComplete={() => {
              setIsAnimating(false);
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 10,
              }}
              exit={{
                opacity: 0,
                y: -40,
                x: 40,
                filter: "blur(8px)",
                scale: 2,
                position: "absolute",
              }}
              className="absolute top-0 left-0 right-0 font-black text-center text-[#FF6500]"
              key={currentWord}
            >
              {currentWord.split(" ").map((word, wordIndex) => (
                <motion.span
                  key={word + wordIndex}
                  initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    delay: wordIndex * 0.3,
                    duration: 0.3,
                  }}
                  className="inline-block whitespace-nowrap"
                >
                  {word.split("").map((letter, letterIndex) => (
                    <motion.span
                      key={word + letterIndex}
                      initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{
                        delay: wordIndex * 0.3 + letterIndex * 0.05,
                        duration: 0.2,
                      }}
                      className="inline-block"
                    >
                      {letter}
                    </motion.span>
                  ))}
                  <span className="inline-block">&nbsp;</span>
                </motion.span>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
        <span className="ml-2">{afterText}</span>
      </div>
    </div>
  );
}
