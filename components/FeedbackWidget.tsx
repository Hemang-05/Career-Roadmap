"use client";

import { useState, useRef, useEffect } from "react";
import { FiMessageCircle, FiX, FiSend, FiThumbsUp } from "react-icons/fi";
import { usePathname } from "next/navigation";

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackType, setFeedbackType] = useState<
    "Feature-request" | "issue" | "other"
  >("Feature-request");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPopupPrompt, setShowPopupPrompt] = useState(false);
  const [promptShownBefore, setPromptShownBefore] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Check localStorage on mount for prompt
  useEffect(() => {
    const hasShownPrompt = localStorage.getItem("feedbackPromptShown");
    setPromptShownBefore(!!hasShownPrompt);
    if (!hasShownPrompt) {
      const timer = setTimeout(() => setShowPopupPrompt(true), 30000);
      return () => clearTimeout(timer);
    }
  }, []);

  // When popup is shown, mark in localStorage and auto-dismiss
  useEffect(() => {
    if (showPopupPrompt) {
      localStorage.setItem("feedbackPromptShown", "true");
      const dismissTimer = setTimeout(() => setShowPopupPrompt(false), 15000);
      return () => clearTimeout(dismissTimer);
    }
  }, [showPopupPrompt]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Submit feedback
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

  const handleOpenFeedback = () => {
    setShowPopupPrompt(false);
    setIsOpen(true);
  };

  const handleDismissPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPopupPrompt(false);
  };

  if (pathname === "/dashboard") {
    return null;
  }

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50">
      {/* slide-up panel (conditionally rendered) */}
      {isOpen && (
        <div className="fixed bottom-0 right-4 w-full max-w-xs md:max-w-sm rounded-3xl bg-blue-100 shadow-2xl z-40">
          {/* header */}
          <div className="flex items-center justify-between border-b px-4 py-2">
            <h3 className="text-lg text-black font-semibold">
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
                    {["Feature-request", "issue", "other"].map((t) => (
                      <label key={t} className="flex items-center space-x-1">
                        <input
                          type="radio"
                          name="feedbackType"
                          value={t}
                          checked={feedbackType === t}
                          onChange={() => setFeedbackType(t as any)}
                          className="h-4 w-4 accent-blue-600"
                        />
                        <span className="capitalize">{t}</span>
                      </label>
                    ))}
                  </div>
                  <textarea
                    rows={4}
                    className="w-full text-gray-900 resize-none rounded-2xl border p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="This is a one-way communication, we can't reply, talk to us on mail or socials"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={!feedbackText.trim()}
                    className="flex items-center gap-1 rounded-2xl bg-green-400 px-4 py-2 text-sm text-black transition hover:bg-green-600 disabled:opacity-50"
                  >
                    <FiSend size={16} /> Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Popup message cloud */}
      {showPopupPrompt && !isOpen && (
        <div className="absolute bottom-16 right-0 bg-blue-50 rounded-2xl shadow-lg p-3 mb-2 w-48 text-sm">
          <button
            onClick={handleDismissPrompt}
            className="absolute -top-2 -right-2 bg-red-400 rounded-full p-1 hover:bg-red-500"
          >
            <FiX size={14} />
          </button>
          <p className="text-gray-900">
            Got a moment to share your feedback with us?
          </p>
          <button
            onClick={handleOpenFeedback}
            className="mt-2 text-black hover:text-gray-800 font-medium"
          >
            Send feedback
          </button>
        </div>
      )}

      {/* toggle button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={`flex h-12 w-12 items-center justify-center bg-black rounded-full shadow-lg transition-colors
            ${
              isOpen
                ? "bg-gray-800 text-white"
                : "bg-black text-white hover:bg-gray-700"
            }`}
        aria-label="Feedback"
      >
        {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
      </button>
    </div>
  );
}
