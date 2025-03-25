// components/Footer.tsx
"use client";
export default function Footer() {
  return (
    <footer className="bg-[#ffffff] py-4">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-orange-500">
        {/* Left side */}
        <div className="flex space-x-4 text-sm mb-2 md:mb-0">
          <a href="/terms" className="hover:underline">
            Terms & Conditions
          </a>
          <a href="/privacy" className="hover:underline">
            Privacy Policy
          </a>
        </div>
        {/* Center */}
        <div className="text-sm mb-2 md:mb-0">
          <p>
            &copy; {new Date().getFullYear()} CareerRoadmap. All rights
            reserved.
          </p>
        </div>
        {/* Right side */}
        <div className="flex items-center space-x-2 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 4v6a2 2 0 002 2h14a2 2 0 002-2v-6"
            />
          </svg>
          <a href="mailto:supp3114@gmail.com" className="hover:underline">
            supp3114@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
