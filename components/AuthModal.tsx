// components/AuthModal.tsx
"use client";
import { useState } from "react";
import { SignUp, SignIn } from "@clerk/nextjs";
import { X } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
  // Add afterSignUpUrl prop
  afterSignUpUrl?: string; 
  // Add afterSignInUrl prop
  afterSignInUrl?: string; 
}

export default function AuthModal({ 
  onClose,
  afterSignUpUrl = "/dashboard", // Default redirect URL
  afterSignInUrl = "/dashboard", // Default redirect URL
}: AuthModalProps) {
  const [mode, setMode] = useState<"signUp" | "signIn">("signUp");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 relative">
        {/* We move the close button and tabs inside a header div for better padding control */}
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
          >
            <X size={24} />
          </button>

          <div className="flex border-b mb-6">
            <button
              onClick={() => setMode("signUp")}
              className={`flex-1 pb-2 text-center text-lg transition-all duration-300 ${
                mode === "signUp"
                  ? "border-b-2 border-[#FF6500] font-bold text-[#FF6500]"
                  // Use the styles from your image for a perfect match
                  : "text-gray-400 font-medium" 
              }`}
            >
              Sign up
            </button>
            <button
              onClick={() => setMode("signIn")}
              className={`flex-1 pb-2 text-center text-lg transition-all duration-300 ${
                mode === "signIn"
                  ? "border-b-2 border-[#FF6500] font-bold text-[#FF6500]"
                  // Use the styles from your image for a perfect match
                  : "text-gray-400 font-medium"
              }`}
            >
              Log in
            </button>
          </div>
        </div>

        {/* Clerk forms with padding applied here */}
        <div className="px-6 pb-6">
          {mode === "signUp" ? (
            <SignUp
              // Key changes: Use "virtual" routing and pass the redirect URL
              routing="virtual"
              afterSignUpUrl={afterSignUpUrl}
              // This prop removes the default Clerk card styling
              appearance={{
                elements: {
                  card: { boxShadow: "none", border: "none" },
                },
              }}
            />
          ) : (
            <SignIn
              // Key changes: Use "virtual" routing and pass the redirect URL
              routing="virtual"
              afterSignInUrl={afterSignInUrl}
              // This prop removes the default Clerk card styling
              appearance={{
                elements: {
                  card: { boxShadow: "none", border: "none" },
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}