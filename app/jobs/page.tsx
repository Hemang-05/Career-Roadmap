// pages/jobs.tsx
"use client";

import { useEffect, useState } from "react";

interface JobItem {
  title: string;
  snippet: string;
  link: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the jobs from the API route; you can also add a query param if needed.
    fetch("/api/job-board?profession=software%20engineer")
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.jobs);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching jobs:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading jobs...</div>;
  }

  return (
    <div className="text-black" style={{ padding: "2rem" }}>
      <h1>Job Listings</h1>
      {jobs.length > 0 ? (
        jobs.map((job, index) => (
          <div
            key={index}
            // style={{
            //   border: "1px solid #ccc",
            //   margin: "1rem 0",
            //   padding: "1rem",
            // }}
            className="bg-white shadow-md rounded-lg p-4 my-4 mx-56 hover:shadow-lg transition-shadow duration-300"
          >
            <h3 className="text-xl font-bold text-blue-800 mb-2">
              {job.title}
            </h3>
            <p>{job.snippet}</p>
            <a href={job.link} target="_blank" rel="noopener noreferrer">
              <button className="text-blue-800">Apply Now</button>
            </a>
          </div>
        ))
      ) : (
        <p>No jobs found.</p>
      )}
    </div>
  );
}
