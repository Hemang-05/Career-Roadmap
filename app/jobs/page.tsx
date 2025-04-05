// // app/jobs/page.tsx

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
    <div className="container mx-auto px-80 my-40">
      <FloatingNavbar navLinks={dashboardLinks} />
      <h1 className="text-4xl font-black text-center mb-16 text-black">
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
        <div className="space-y-10">
          {jobs.length > 0 ? (
            jobs.map((job, index) => (
              <div
                key={job.link + index}
                className="bg-[#ffe1c5] border border-gray-200 rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col sm:flex-row items-start"
              >
                <div className="w-full sm:w-24 md:w-32 h-32 m-4 rounded-3xl sm:h-auto flex-shrink-0 bg-gray-100 flex items-center justify-center relative">
                  {job.thumbnail ? (
                    <Image
                      src={job.thumbnail}
                      alt={`${job.title} logo`}
                      width={128}
                      height={128}
                      className="object-contain w-full h-full rounded-3xl"
                      unoptimized={true}
                      priority={index < 3}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (e.target as HTMLImageElement)
                          .closest("div")
                          ?.classList.add("bg-gray-100");
                      }}
                    />
                  ) : (
                    <Image
                      src="/happy.png"
                      alt="Default job listing placeholder"
                      width={128}
                      height={128}
                      className="object-contain w-full h-full"
                      priority={index < 3}
                    />
                  )}
                </div>

                <div className="p-4 flex flex-col justify-between leading-normal w-full">
                  <div>
                    <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-4">
                      <a
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 transition-colors duration-200"
                      >
                        {job.title}
                      </a>
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">{job.snippet}</p>
                  </div>
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-4 py-2 rounded-2xl border border-[#d7933b] bg-[#ffffff] text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200 self-start"
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
