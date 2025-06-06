// File: app/api/cron-roadmap-update/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabaseClient";

// Set maximum duration for serverless function (Vercel's limit)
export const maxDuration = 300; // 5 minutes

// Define an interface for the roadmap record
interface RoadmapRecord {
  user_id: string;
  updated_at: string | null;
  created_at: string | null;
  roadmap: any; // You can be more specific about the roadmap type if known
}

export async function GET(request: Request) {
  console.log("Starting roadmap update cron job");

  // Optional: Add authorization check
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const currentDate = new Date();
    const threeMonthsAgo = new Date(currentDate);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    // First, find all users with non-null roadmaps
    const { data: roadmapsToUpdate, error: fetchError } = await supabase
      .from("career_info")
      .select("user_id, updated_at, created_at, roadmap")
      .is("roadmap", "not.null")
      .order("updated_at", { ascending: true });

    if (fetchError) {
      console.error("Error fetching roadmaps:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch roadmaps" },
        { status: 500 }
      );
    }

    // Filter out roadmaps that need updating (last updated > 3 months ago)
    const roadmapsNeedingUpdate = roadmapsToUpdate?.filter((record: RoadmapRecord) => {
      const lastUpdateDate = record.updated_at 
        ? new Date(record.updated_at) 
        : record.created_at 
          ? new Date(record.created_at) 
          : null;
      
      return lastUpdateDate && lastUpdateDate < threeMonthsAgo;
    }) || [];

    console.log(
      `Found ${roadmapsNeedingUpdate.length} roadmaps that need updating`
    );

    // Process each roadmap that needs updating
    const results = [];
    for (const roadmapData of roadmapsNeedingUpdate) {
      try {
        // Call the update-user-roadmap API for each user
        const updateResponse = await fetch(
          `${process.env.API_BASE_URL}/api/update-user-roadmap`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ user_id: roadmapData.user_id })
          }
        );

        const updateResult = await updateResponse.json();
        
        results.push({
          user_id: roadmapData.user_id,
          status: updateResult.success ? "success" : "error",
          details: updateResult.message || updateResult.error || null
        });

        console.log(
          `${updateResult.success ? "Successfully updated" : "Failed to update"} roadmap for user ${roadmapData.user_id}`
        );
      } catch (err: any) {
        console.error(
          `Error updating roadmap for user ${roadmapData.user_id}:`,
          err
        );
        results.push({
          user_id: roadmapData.user_id,
          status: "error",
          error: err.message || String(err)
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: roadmapsNeedingUpdate.length,
      results
    });
  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message || String(error) },
      { status: 500 }
    );
  }
}