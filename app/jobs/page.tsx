// app/jobs/page.tsx

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import FloatingNavbar from "@/components/Navbar";

interface JobItem {
  title: string;
  snippet: string;
  link: string;
  thumbnail?: string | null;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dashboardLinks = [
    { href: "/roadmap", label: "Roadmap" },
    { href: "/events", label: "Events" },
    { href: "/analytics", label: "User Analysis" },
  ];

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Fetch from the API route (it now uses the logged-in user's desired career)
    fetch("/api/job-board")
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res
            .json()
            .catch(() => ({ error: `HTTP error! status: ${res.status}` }));
          throw new Error(
            errorData.error || `HTTP error! status: ${res.status}`
          );
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        setJobs(data.jobs || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching jobs:", err);
        setError(err.message || "Failed to load jobs. Please try again later.");
        setLoading(false);
        setJobs([]);
      });
  }, []);

  return (
    // Responsive container padding and margin:
    // - Small screens (default): px-4, my-16
    // - Medium screens (md): px-8, my-20
    // - Large screens (lg): px-16, my-24
    // - Extra large screens (xl): px-60 (closer to original px-80), my-32
    // - 2x Extra large screens (2xl): px-80 (original), my-40 (original)
    <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-60 2xl:px-80 my-16 md:my-20 lg:my-24 xl:my-32 2xl:my-40">
      <FloatingNavbar navLinks={dashboardLinks} />

      {/* Responsive heading size and margin:
          - Small screens: text-2xl, mb-8
          - Medium screens: text-3xl, mb-12
          - Large screens: text-4xl (original), mb-16 (original)
      */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center mb-16 mt-28 sm:mb-12 lg:mb-16 text-black">
        Portals to <span className="text-[#FF6500]">YOUR</span> Professional
        Growth
      </h1>

      {loading && (
        <div className="text-center text-gray-500">
          <p>Loading jobs...</p>
        </div>
      )}

      {error && (
        <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">
          <p>Error: {error}</p>
        </div>
      )}

      {!loading && !error && (
        // Consistent spacing between job items
        <div className="space-y-6 md:space-y-8 lg:space-y-10">
          {jobs.length > 0 ? (
            jobs.map((job, index) => (
              <div
                key={job.link + index}
                // Core responsive layout: stack vertically by default, row on small screens and up
                className="bg-[#ffe1c5] border border-gray-200 rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col sm:flex-row items-center sm:items-start"
              >
                {/* Image container: Adjust size and margin responsively */}
                <div className="w-full p-4 sm:p-0 sm:w-24 md:w-32 h-40 sm:h-24 md:h-32 sm:m-4 rounded-3xl flex-shrink-0 bg-white flex items-center justify-center relative">
                  {job.thumbnail ? (
                    <Image
                      src={job.thumbnail}
                      alt={`${job.title} logo`}
                      // Use layout="fill" and objectFit="contain" for better responsiveness within the container
                      // Or keep width/height but ensure container size is well-defined
                      width={128} // These act more like max-width/max-height with object-contain
                      height={128}
                      className="object-contain w-auto h-auto max-w-full max-h-full rounded-3xl" // Adjusted classes for better containment
                      unoptimized={true} // Keep if external images cause issues
                      priority={index < 3}
                      onError={(e) => {
                         // Fallback logic remains the same
                         const imgElement = e.target as HTMLImageElement;
                         imgElement.style.display = "none"; // Hide broken image icon
                         const parentDiv = imgElement.closest("div");
                         if (parentDiv) {
                           // Optionally add a class or style to show a placeholder state
                           parentDiv.classList.add("bg-gray-100", "flex", "items-center", "justify-center");
                           // You could add placeholder text or an icon here if desired
                           // parentDiv.innerHTML = '<span class="text-gray-400 text-xs">No Image</span>';
                         }
                       }}
                    />
                  ) : (
                    <Image
                      src="/happy.png" // Ensure this path is correct in your public folder
                      alt="Default job listing placeholder"
                      width={128}
                      height={128}
                      className="object-contain w-auto h-auto max-w-full max-h-full" // Adjusted classes
                      priority={index < 3}
                    />
                  )}
                </div>

                {/* Text content container */}
                <div className="p-4 flex flex-col justify-between leading-normal w-full">
                  <div>
                    {/* Responsive title size */}
                    <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-800 mb-2 md:mb-3">
                      <a
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 transition-colors duration-200"
                      >
                        {job.title}
                      </a>
                    </h3>
                    {/* Snippet styling */}
                    <p className="text-gray-600 text-sm mb-3">{job.snippet}</p>
                  </div>
                  {/* Apply button */}
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    // Added self-center for mobile view, sm:self-start for larger
                    className="inline-block mt-4 px-4 py-2 rounded-2xl border border-[#d7933b] bg-[#ffffff] text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200 self-center sm:self-start"
                  >
                    View & Apply
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              No jobs found matching your criteria.
            </p>
          )}
        </div>
      )}
    </div>
  );
}