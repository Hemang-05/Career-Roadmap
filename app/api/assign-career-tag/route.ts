// app\api\assign-career-tag\route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabaseClient";

async function generateCareerTag(desired_career: string): Promise<string> {
  const prompt = `
For a desired career "${desired_career}", determine the most appropriate career category from the following options:

1. Medical/Healthcare – for doctors, nurses, therapists, and other health-related professionals
2. Entertainment & Media – for actors, musicians, directors, and other creative performers
3. Engineering & Technology – for engineers, developers, IT specialists, and technical professionals
4. Business & Finance – for entrepreneurs, bankers, accountants, and corporate professionals
5. Law & Public Service – for lawyers, policy makers, and government or public administrators
6. Education & Research – for teachers, professors, researchers, and academic professionals
7. Arts & Design – for visual artists, designers, architects, and creative specialists
8. Science & Environment – for scientists, researchers, environmentalists, and lab professionals
9. Sports & Fitness – for athletes, coaches, trainers, and sports managers
10. Culinary & Hospitality – for chefs, restaurant managers, travel experts, and hospitality professionals
11. Others – for any other entry or niche or emerging professions that do not fit into the above categories

Return only the category name without numbering or explanation.
`;

  const apiKey = process.env.GEMINI_API_KEY_TAG;
  if (!apiKey) {
      return "Not Assigned";
  }
  
  const modelName = "gemini-2.0-flash-lite"; // Using a stable and current model
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  try {
    const apiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }],
        }],
        // Configuration for a more deterministic, classification-style response
        generationConfig: {
          temperature: 0.2,
          topK: 1,
          topP: 1,
          maxOutputTokens: 50, 
        }
      }),
    });

    if (!apiResponse.ok) {
        const errorBody = await apiResponse.text();
        console.error(`Error from Gemini API: ${apiResponse.status}`, errorBody);
        return "Not Assigned";
    }

    const data = await apiResponse.json();

    // Safely parse the response according to the Gemini REST API structure
    const tag = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!tag) {
      console.warn('No valid text returned from Gemini API, defaulting to "Not Assigned"');
      return "Not Assigned";
    }

    console.log(`Generated tag for desired career "${desired_career}":`, tag);
    
    // Validate that the AI returned one of the expected categories
    const validCategories = [
      "Medical/Healthcare", "Entertainment & Media", "Engineering & Technology",
      "Business & Finance", "Law & Public Service", "Education & Research",
      "Arts & Design", "Science & Environment", "Sports & Fitness",
      "Culinary & Hospitality", "Others"
    ];

    return validCategories.includes(tag) ? tag : "Not Assigned";

  } catch (error) {
    console.error("Error during fetch call to Gemini API:", error);
    return "Not Assigned";
  }
}

export async function POST(request: Request) {
  try {
    // Parse incoming JSON payload.
    const { clerk_id, desired_career } = await request.json();
    console.log("Received payload:", { desired_career });
    if (!clerk_id || !desired_career) {
      return NextResponse.json(
        { error: "Missing clerk_id or desired_career" },
        { status: 400 }
      );
    }

    // STEP 1: Query the users table by clerk_id to get the user_id (UUID) and OLD career_tag
    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("id, clerk_id, career_tag") // <-- IMPORTANT: Select the old career_tag
      .eq("clerk_id", clerk_id)
      .single();

    if (userError || !userRecord) {
      console.error("User not found:", userError);
      return NextResponse.json(
        { error: "User not found by clerk_id" },
        { status: 404 }
      );
    }

    const user_id = userRecord.id;
    const oldTag = userRecord.career_tag; // <-- Store the user's old tag
    

    // Generate the career tag for the desired career
    const assignedTag = await generateCareerTag(desired_career);
    console.log(`Determined tag for "${desired_career}": ${assignedTag}`);

    // STEP 2 (NEW): Clean up the user's ID from the OLD tag record if it has changed
    if (oldTag && oldTag !== assignedTag) {
      console.log(`Career changed from "${oldTag}" to "${assignedTag}". Cleaning up old record.`);
      
      // Handle cleanup for both "Not Assigned" and specific career tags
      if (oldTag === "Not Assigned") {
        console.log(`User was previously "Not Assigned", now moving to "${assignedTag}". No cleanup needed from career_tag table.`);
      } else {
        // Find the old career tag record for specific career tags
        const { data: oldTagRecord, error: oldTagError } = await supabase
          .from("career_tag")
          .select("user_ids")
          .eq("career_tag", oldTag)
          .single();
        
        if (oldTagRecord && !oldTagError) {
          // Filter out the current user's ID
          const updatedUserIds = oldTagRecord.user_ids.filter((id: string) => id !== user_id);
          
          // Update the old record with the filtered array
          const { error: updateOldTagError } = await supabase
            .from("career_tag")
            .update({ user_ids: updatedUserIds, updated_at: new Date().toISOString() })
            .eq("career_tag", oldTag);

          if (updateOldTagError) {
            console.error("Error updating old career tag record:", updateOldTagError);
          } else {
            console.log(`Successfully removed from old tag "${oldTag}"`);
          }
        } else if (oldTagError) {
          console.error("Error fetching old career tag record:", oldTagError);
        }
      }
    }

    // If the tag is "Not Assigned", skip domain grouping to avoid mixing with other domains
    if (assignedTag === "Not Assigned") {
      // Update the user's career_tag column and return
      const { error: updateUserError } = await supabase
        .from("users")
        .update({ career_tag: assignedTag })
        .eq("clerk_id", clerk_id);

      if (updateUserError) {
        console.error(
          "Error updating user's career_tag to Not Assigned:",
          updateUserError
        );
        return NextResponse.json(
          { error: updateUserError.message },
          { status: 500 }
        );
      }

      console.log(
        'User career_tag set to "Not Assigned", no further domain operations.'
      );
      return NextResponse.json({ success: true, career_tag: assignedTag });
    }

    // Proceed with grouping into career_tag table
    const { data: existingTagRecord, error: tagCheckError } = await supabase
      .from("career_tag")
      .select("*")
      .eq("career_tag", assignedTag)
      .maybeSingle();

    if (tagCheckError) {
      console.error("Error checking for existing career tag:", tagCheckError);
      return NextResponse.json(
        { error: tagCheckError.message },
        { status: 500 }
      );
    }

    if (existingTagRecord) {
      console.log(
        `Tag "${assignedTag}" found.`
      );

      const currentDesiredCareers: string[] =
        existingTagRecord.desired_careers || [];
      const currentUserIds: string[] = existingTagRecord.user_ids || [];

      const careerNeedsUpdate = !currentDesiredCareers.includes(desired_career);
      const userIdNeedsUpdate = !currentUserIds.includes(user_id);

      if (careerNeedsUpdate || userIdNeedsUpdate) {
        const updatedData: any = {};
        if (careerNeedsUpdate)
          updatedData.desired_careers = [
            ...currentDesiredCareers,
            desired_career,
          ];
        if (userIdNeedsUpdate)
          updatedData.user_ids = [...currentUserIds, user_id];
        updatedData.updated_at = new Date().toISOString();

        const { error: updateTagError } = await supabase
          .from("career_tag")
          .update(updatedData)
          .eq("id", existingTagRecord.id);

        if (updateTagError)
          console.error("Error updating career_tag record:");
        else
          console.log(
            `Updated career_tag "${assignedTag}" with new data:`,
          );
      } else {
        console.log(
          `"${desired_career}" and user_id "${user_id}" already exist in tag "${assignedTag}". No update needed.`
        );
      }
    } else {
      console.log(`Tag "${assignedTag}" not found. Inserting new record.`);
      const { error: insertError } = await supabase
        .from("career_tag")
        .insert([
          {
            career_tag: assignedTag,
            desired_careers: [desired_career],
            user_ids: [user_id],
          },
        ]);

      if (insertError) {
        console.error("Error inserting new career tag record:", insertError);
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      } else {
        console.log(
          `Successfully inserted new tag "${assignedTag}" with career "${desired_career}" and user_id "${user_id}"`
        );
      }
    }

    // Update the user's career_tag column in the users table
    const { error: updateUserError } = await supabase
      .from("users")
      .update({ career_tag: assignedTag })
      .eq("clerk_id", clerk_id);

    if (updateUserError) {
      console.error("Error updating user's career_tag:", updateUserError);
      return NextResponse.json(
        { error: updateUserError.message },
        { status: 500 }
      );
    }

    console.log("Successfully updated user's career_tag to:", assignedTag);
    return NextResponse.json({ success: true, career_tag: assignedTag });
  } catch (err: any) {
    console.error("Error in assign-career-tag endpoint:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message || err },
      { status: 500 }
    );
  }
}