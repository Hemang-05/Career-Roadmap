// export default Loader
"use client";
import React, { useEffect, useState } from "react"; // Import React and hooks for state and effect
import "../app/globals.css"; // Import global CSS styles

const Loader = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "This can take up to 3 to 5 minutes in generating roadmap",
    "Take a walk, this could take a moment...",
    "Have a coffee break while we prepare your roadmap...",
    "Brewing your career path, almost ready...",
    "Flipping through possibilities for your future...",
    "Mapping the journey to your dream career...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000); // Cycle message every 3 seconds

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, [messages.length]); // Dependency array includes messages.length

  return (
    // This outer div uses Tailwind for centering the content vertically and horizontally
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      {/* The CSS spinner */}
      <span className="loader"></span>

      {/* The cycling message displayed below the spinner */}
      <p className="loader-message">{messages[messageIndex]}</p>
    </div>
  );
};

export default Loader;
