"use client";

import { useState, useRef, useEffect } from "react";
import { FiMessageCircle, FiX, FiSend, FiThumbsUp } from "react-icons/fi";

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackType, setFeedbackType] = useState<
    "suggestion" | "issue" | "other"
  >("suggestion");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPopupPrompt, setShowPopupPrompt] = useState(false);

  // Track if the prompt has been shown before using localStorage
  const [promptShownBefore, setPromptShownBefore] = useState(false);

  // Ref for the whole widget (button + panel)
  const containerRef = useRef<HTMLDivElement>(null);

  // Check localStorage on component mount and set timer for popup
  useEffect(() => {
    // Check if we've shown the prompt before
    const hasShownPrompt = localStorage.getItem("feedbackPromptShown");
    setPromptShownBefore(!!hasShownPrompt);

    // If we haven't shown the prompt before, set a timer to show it
    if (!hasShownPrompt) {
      const timer = setTimeout(() => {
        setShowPopupPrompt(true);
      }, 30000); // 30 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  // When popup prompt is shown, mark it as shown in localStorage and set auto-dismiss timer
  useEffect(() => {
    if (showPopupPrompt) {
      // Mark as shown in localStorage
      localStorage.setItem("feedbackPromptShown", "true");

      // Set timer to auto-dismiss after 10 seconds
      const dismissTimer = setTimeout(() => {
        setShowPopupPrompt(false);
      }, 15000); // 10 seconds

      // Clean up timer when component unmounts or popup is dismissed early
      return () => clearTimeout(dismissTimer);
    }
  }, [showPopupPrompt]);

  // Click-outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackType, feedbackText }),
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFeedbackText("");
        setIsOpen(false);
      }, 3000);
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  // Hide the popup prompt when user opens the feedback form
  const handleOpenFeedback = () => {
    setShowPopupPrompt(false);
    setIsOpen(true);
  };

  // Hide the popup prompt when dismissed
  const handleDismissPrompt = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click from opening the feedback form
    setShowPopupPrompt(false);
  };

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50">
      {/* slide-up panel */}
      <div
        className={`fixed bottom-0 right-4 w-full max-w-xs md:max-w-sm transform
         rounded-2xl bg-orange-100 shadow-2xl transition-transform duration-300
         ${isOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* header */}
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h3 className="text-lg text-orange-600 font-semibold">
            Share your feedback
          </h3>
          <button onClick={() => setIsOpen(false)}>
            <FiX className="text-red-500" size={20} />
          </button>
        </div>
        <div className="p-4">
          {isSubmitted ? (
            <div className="flex flex-col items-center py-6 text-center">
              <FiThumbsUp className="mb-2 text-green-500" size={32} />
              <p className="text-gray-700">Thanks for your feedback!</p>
            </div>
          ) : (
            <>
              <div className="mb-3 space-y-2">
                <div className="flex flex-wrap text-black gap-3 text-sm">
                  {["suggestion", "issue", "other"].map((t) => (
                    <label key={t} className="flex items-center space-x-1">
                      <input
                        type="radio"
                        name="feedbackType"
                        value={t}
                        checked={feedbackType === t}
                        onChange={() => setFeedbackType(t as any)}
                        className="h-4 w-4 accent-orange-600"
                      />
                      <span className="capitalize">{t}</span>
                    </label>
                  ))}
                </div>
                <textarea
                  rows={4}
                  className="w-full text-gray-500 resize-none rounded-2xl border p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Tell us what you think..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={!feedbackText.trim()}
                  className="flex items-center gap-1 rounded-2xl bg-green-600 px-4 py-2 text-sm text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  <FiSend size={16} /> Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Popup message cloud */}
      {showPopupPrompt && !isOpen && (
        <div className="absolute bottom-16 right-0 bg-orange-50 rounded-2xl shadow-lg p-3 mb-2 w-48 text-sm">
          <button
            onClick={handleDismissPrompt}
            className="absolute -top-2 -right-2 bg-red-400 rounded-full p-1 hover:bg-red-500"
          >
            <FiX size={14} />
          </button>
          <p className="text-gray-600">
            Got a moment to share your feedback with us?
          </p>
          <button
            onClick={handleOpenFeedback}
            className="mt-2 text-orange-600 hover:text-orange-800 font-medium"
          >
            Send feedback
          </button>
        </div>
      )}

      {/* toggle button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={`flex h-12 w-12 items-center justify-center bg-orange-500 rounded-full shadow-lg transition-colors
          ${
            isOpen
              ? "bg-gray-800 text-white"
              : "bg-blue-600 text-white hover:bg-orange-700"
          }`}
        aria-label="Feedback"
      >
        {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
      </button>
    </div>
  );
}
