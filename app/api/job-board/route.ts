// File Path: app/api/job-board/route.ts
// Using Next.js App Router conventions

import { NextResponse } from "next/server"; // Import NextResponse
import type { NextRequest } from "next/server"; // Optional: Import NextRequest for type safety if needed

// Define the structure of a job item we want to return
interface JobItem {
  title: string;
  snippet: string;
  link: string;
}

// Placeholder type for items returned by Google Custom Search API
interface GoogleSearchItem {
  title?: string;
  snippet?: string;
  link?: string;
}

// Define the expected structure of the Google API response
interface GoogleResponse {
  items?: GoogleSearchItem[];
}

// Define the structure of our API route's success response
interface SuccessResponse {
  jobs: JobItem[];
}

// Define the structure of our API route's error response
interface ErrorResponse {
  jobs: JobItem[]; // Keep consistent structure even on error
  error: string;
}

// Export a named function for the GET HTTP method
export async function GET(
  request: Request
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    // --- Get Profession from Query Parameter ---
    // App Router way to get query parameters from the Request URL
    const { searchParams } = new URL(request.url);
    const profession = searchParams.get("profession") || "software engineer";

    // --- Retrieve API Keys ---
    const googleApiKey = process.env.GOOGLE_API_KEY;
    const googleCSEID = process.env.GOOGLE_CSE_ID;

    if (!googleApiKey || !googleCSEID) {
      console.error(
        "Google API Key or CSE ID missing from environment variables."
      );
      // Return 500 Internal Server Error using NextResponse
      return NextResponse.json(
        { jobs: [], error: "Server configuration error." },
        { status: 500 }
      );
    }

    // --- Construct Google Search API Query ---
    const query = `${profession} jobs in India`;
    const url = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleCSEID}&q=${encodeURIComponent(
      query
    )}&num=10`;

    // --- Fetch Data from Google API ---
    // TODO: Implement Caching Check here

    const response = await fetch(url);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Google API Error: ${response.status} ${response.statusText}`,
        errorBody
      );
      throw new Error(
        `Failed to fetch data from Google API: ${response.statusText}`
      );
    }

    const data: GoogleResponse = await response.json();

    // --- Process Results ---
    const jobs: JobItem[] = data.items
      ? data.items
          .map((item) => ({
            title: item.title || "No Title Provided",
            snippet: item.snippet || "No Snippet Available",
            link: item.link || "#",
          }))
          .filter((item) => item.link !== "#")
      : [];

    // TODO: Store results in Cache here

    // Send successful response using NextResponse
    return NextResponse.json({ jobs });
  } catch (err: any) {
    // Catch block for errors
    console.error("Error in API route (/api/job-board):", err.message || err);
    // Send 500 Internal Server Error using NextResponse
    return NextResponse.json(
      {
        jobs: [],
        error: "Failed to fetch job listings due to a server error.",
      },
      { status: 500 }
    );
  }
}

// You can add other methods like POST, PUT, DELETE here as needed
// export async function POST(request: Request) { ... }
