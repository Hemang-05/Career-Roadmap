
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/supabaseClient';

/**
 * Helper: Use the AI API to generate a career tag.
 * In this example, the AI call is made using model "deepseek/deepseek-r1:free".
 */
async function generateCareerTag(desired_career: string): Promise<string> {
  // const prompt = `Determine the common career category for the desired career: "${desired_career}". Options include "Doctor", "Entertainment", "Engineer", or "General". Return only the category name.`;
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
  const apiKey = process.env.OPENROUTER_API_KEY_TAG;
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-r1:free",
      messages: [{ role: "user", content: prompt }],
      top_p: 1,
      temperature: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      repetition_penalty: 1,
      top_k: 0,
    }),
  });
  
  const data = await response.json();
  console.log('AI response for career tag:', data);
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error('No choices returned from AI API');
  }
  
  const tag = data.choices[0].message.content.trim();
  console.log(`Generated tag for desired career "${desired_career}":`, tag);
  return tag || "General";
}

export async function POST(request: Request) {
  try {
    // Parse incoming JSON payload.
    const { clerk_id, desired_career } = await request.json();
    console.log("Received payload:", { clerk_id, desired_career });
    if (!clerk_id || !desired_career) {
      return NextResponse.json({ error: 'Missing clerk_id or desired_career' }, { status: 400 });
    }

    // Query the users table by clerk_id to get the user_id (UUID)
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('id, clerk_id')
      .eq('clerk_id', clerk_id)
      .single();
    
    if (userError || !userRecord) {
      console.error("User not found:", userError);
      return NextResponse.json({ error: 'User not found by clerk_id' }, { status: 404 });
    }
    
    // Extract the user's UUID from the record
    const user_id = userRecord.id;
    console.log("Found user record:", userRecord, "User UUID:", user_id);

    // Generate the career tag for the desired career
    let assignedTag = "";
    try {
        assignedTag = await generateCareerTag(desired_career);
        console.log(`Determined tag for "${desired_career}": ${assignedTag}`);
    } catch (aiError: any) {
        console.error("Error generating career tag:", aiError);
        assignedTag = "General"; // Fallback
    }

    // Check if a record with this career_tag already exists
    const { data: existingTagRecord, error: tagCheckError } = await supabase
        .from('career_tag')
        .select('*')
        .eq('career_tag', assignedTag)
        .maybeSingle();

    if (tagCheckError) {
        console.error("Error checking for existing career tag:", tagCheckError);
        return NextResponse.json({ error: tagCheckError.message }, { status: 500 });
    }

    if (existingTagRecord) {
        // TAG EXISTS: Update its desired_careers array and user_ids array if needed
        console.log(`Tag "${assignedTag}" found. Record ID: ${existingTagRecord.id}`);
        
        // Get current values or initialize if undefined
        const currentDesiredCareers: string[] = existingTagRecord.desired_careers || [];
        const currentUserIds: string[] = existingTagRecord.user_ids || [];
        
        // Check if desired_career needs to be added
        const careerNeedsUpdate = !currentDesiredCareers.includes(desired_career);
        // Check if user_id needs to be added
        const userIdNeedsUpdate = !currentUserIds.includes(user_id);
        
        // Only update if something needs to change
        if (careerNeedsUpdate || userIdNeedsUpdate) {
            const updatedData: any = {};
            
            if (careerNeedsUpdate) {
                updatedData.desired_careers = [...currentDesiredCareers, desired_career];
            }
            
            if (userIdNeedsUpdate) {
                updatedData.user_ids = [...currentUserIds, user_id];
            }
            
            updatedData.updated_at = new Date().toISOString();
            
            const { error: updateTagError } = await supabase
                .from('career_tag')
                .update(updatedData)
                .eq('id', existingTagRecord.id);

            if (updateTagError) {
                console.error("Error updating career_tag record:", updateTagError);
                // Continue with user update even if this fails
            } else {
                console.log(`Updated career_tag "${assignedTag}" with new data:`, updatedData);
            }
        } else {
            console.log(`"${desired_career}" and user_id "${user_id}" already exist in tag "${assignedTag}". No update needed.`);
        }
    } else {
        // TAG DOES NOT EXIST: Insert a new record with both desired_career and user_id
        console.log(`Tag "${assignedTag}" not found. Inserting new record.`);
        const { error: insertError } = await supabase
            .from('career_tag')
            .insert([{
                career_tag: assignedTag,
                desired_careers: [desired_career], // Start with the current desired career
                user_ids: [user_id] // Start with the current user's UUID
                // created_at and updated_at should be handled by DB defaults if configured
            }]);

        if (insertError) {
            console.error("Error inserting new career tag record:", insertError);
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        } else {
            console.log(`Successfully inserted new tag "${assignedTag}" with career "${desired_career}" and user_id "${user_id}"`);
        }
    }

    // Update the user's career_tag column in the users table
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ career_tag: assignedTag })
      .eq('clerk_id', clerk_id);
    
    if (updateUserError) {
      console.error("Error updating user's career_tag:", updateUserError);
      return NextResponse.json({ error: updateUserError.message }, { status: 500 });
    }
    
    console.log("Successfully updated user's career_tag to:", assignedTag);
    return NextResponse.json({ success: true, career_tag: assignedTag });
  } catch (err: any) {
    console.error("Error in assign-career-tag endpoint:", err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message || err }, { status: 500 });
  }
}
