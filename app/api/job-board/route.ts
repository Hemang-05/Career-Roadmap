// // File Path: app/api/job-board/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Define the structure of a job item we want to return
interface JobItem {
  title: string;
  snippet: string;
  link: string;
  thumbnail?: string | null;
}

// Placeholder type for items returned by Google Custom Search API
interface GoogleSearchItem {
  title?: string;
  snippet?: string;
  link?: string;
  pagemap?: {
    cse_thumbnail?: [{ src?: string }];
    cse_image?: [{ src?: string }];
    metatags?: Record<string, any>[];
  };
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
  jobs: JobItem[];
  error: string;
}

export async function GET(
  request: Request
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    // --- Identify the Logged-In User via Clerk ---
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { jobs: [], error: "User not authenticated." },
        { status: 401 }
      );
    }

    // --- Initialize Supabase Client ---
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Supabase configuration is missing.");
      return NextResponse.json(
        { jobs: [], error: "Server configuration error." },
        { status: 500 }
      );
    }
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // --- Retrieve the System User ID from the "users" table using Clerk ID ---
    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !userRecord) {
      console.error("Error fetching user record:", userError?.message);
      return NextResponse.json(
        { jobs: [], error: "User record not found." },
        { status: 404 }
      );
    }
    const systemUserId = userRecord.id;

    // --- Retrieve the User's Desired Career from the "career_info" table ---
    const { data: careerInfo, error: careerError } = await supabase
      .from("career_info")
      .select("desired_career")
      .eq("user_id", systemUserId)
      .single();

    if (careerError) {
      console.error("Supabase error:", careerError.message);
    }
    // Fallback to a default career if none is provided or on error
    const desiredCareer = careerInfo?.desired_career || "software engineer";

    // --- Retrieve Google API Keys ---
    const googleApiKey = process.env.GOOGLE_API_KEY;
    const googleCSEID = process.env.GOOGLE_CSE_ID;
    if (!googleApiKey || !googleCSEID) {
      console.error(
        "Google API Key or CSE ID missing from environment variables."
      );
      return NextResponse.json(
        { jobs: [], error: "Server configuration error." },
        { status: 500 }
      );
    }

    // --- Construct Google Search API Query using the User's Desired Career ---
    const query = `${desiredCareer} jobs in India`;
    const url = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleCSEID}&q=${encodeURIComponent(
      query
    )}&num=10`;

    // --- Fetch Data from Google API ---
    console.log("Fetching from Google API:", url);
    const response = await fetch(url);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Google API Error: ${response.status} ${response.statusText}`,
        errorBody
      );
      let googleErrorMsg = `Failed to fetch data from Google API: ${response.statusText}`;
      try {
        const parsedError = JSON.parse(errorBody);
        googleErrorMsg = parsedError.error?.message || googleErrorMsg;
      } catch {}
      throw new Error(googleErrorMsg);
    }

    const data: GoogleResponse = await response.json();

    // --- Process the Google API Response ---
    const jobs: JobItem[] = data.items
      ? data.items
          .map((item) => ({
            title: item.title || "No Title Provided",
            snippet: item.snippet || "No Snippet Available",
            link: item.link || "#",
            thumbnail:
              item.pagemap?.cse_thumbnail?.[0]?.src ||
              item.pagemap?.cse_image?.[0]?.src ||
              null,
          }))
          .filter((job) => job.link !== "#")
      : [];

    return NextResponse.json({ jobs });
  } catch (err: any) {
    console.error("Error in API route (/api/job-board):", err.message || err);
    return NextResponse.json(
      {
        jobs: [],
        error:
          err.message || "Failed to fetch job listings due to a server error.",
      },
      { status: 500 }
    );
  }
}
