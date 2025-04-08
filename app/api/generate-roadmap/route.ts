// pages/api/generate-roadmap.ts
import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabaseClient";

// 1. Define your JSON schema which represents the expected roadmap structure.
const jsonSchema = {
  type: "object",
  properties: {
    career: { type: "string" },
    roadmap_summary: { type: "string" },
    yearly_roadmap: {
      type: "array",
      items: {
        type: "object",
        properties: {
          year: { type: "string" },
          overview: { type: "string" },
          phases: {
            type: "array",
            items: {
              type: "object",
              properties: {
                phase_name: { type: "string" },
                milestones: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      tasks: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            task_title: { type: "string" },
                            description: { type: "string" },
                            weight: { type: "number" },
                            completed: { type: "boolean" }
                          },
                          required: ["task_title", "description", "weight", "completed"]
                        }
                      }
                    },
                    required: ["name", "description", "tasks"]
                  }
                }
              },
              required: ["phase_name", "milestones"]
            }
          }
        },
        required: ["year", "overview", "phases"]
      }
    },
    final_notes: { type: "string" }
  },
  required: ["career", "roadmap_summary", "yearly_roadmap", "final_notes"]
};

// 2. Modified generateRoadmap helper using structured streaming with json_schema.
//    Note: This function now also receives `user_id` so that after the stream finishes,
//
//    we can update the user's roadmap record in Supabase.
async function generateRoadmap(prompt: string, user_id: string): Promise<ReadableStream> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  // Call the external API with streaming enabled and using our JSON schema.
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-thinking-exp:free",
      messages: [{ role: "user", content: prompt }],
      stream: true, // Enable streaming
      response_format: {
        type: "json_schema",
        schema: jsonSchema,  // Include our defined JSON schema
      },
      top_p: 1,
      temperature: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      repetition_penalty: 1,
      top_k: 0,
    }),
  });

  if (!response.body) {
    throw new Error("No response body from OpenRouter API");
  }

  // Create a new ReadableStream with a controller
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  // Store accumulated JSON content
  let jsonContent = "";
  // For passing through to client
  let fullStreamResponse = "";

  const transformStream = new TransformStream({
    transform: async (chunk, controller) => {
      const text = decoder.decode(chunk, { stream: true });
      fullStreamResponse += text;
      
      // Pass the chunk through to the client
      controller.enqueue(chunk);
      
      // Extract JSON content from SSE data lines
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonData = JSON.parse(line.substring(6)); // Remove 'data: ' prefix
            
            // Extract content from the delta if it exists
            if (jsonData.choices && 
                jsonData.choices[0] && 
                jsonData.choices[0].delta && 
                jsonData.choices[0].delta.content) {
              jsonContent += jsonData.choices[0].delta.content;
            }
          } catch (e) {
            // Ignore parsing errors for non-JSON lines
          }
        }
      }
    },
    flush: async (controller) => {
      const finishMarker = "\n[STREAM_END]";
      const encodedFinishMarker = encoder.encode(finishMarker);
      controller.enqueue(encodedFinishMarker);
      
      // Clean up any JSON formatting issues
      let cleanJsonContent = jsonContent.trim();
      
      // Try to parse the accumulated JSON to make sure it's valid
      try {
        // If it starts with ```json, remove it and closing ```
        if (cleanJsonContent.startsWith('```json')) {
          cleanJsonContent = cleanJsonContent
            .replace(/^```json\s*/, '')
            .replace(/\s*```$/, '');
        }
        
        // Validate by parsing
        const parsedJson = JSON.parse(cleanJsonContent);
        
        // Update the career_info record with the clean JSON
        try {
          const { error } = await supabase
            .from("career_info")
            .update({ 
              roadmap: parsedJson, // Store the parsed object directly
              updated_at: new Date().toISOString() 
            })
            .eq("user_id", user_id);
            
          if (error) {
            console.error("Error updating career_info with roadmap:", error);
          }
        } catch (updateError) {
          console.error("Unexpected error updating DB:", updateError);
        }
      } catch (jsonError) {
        console.error("Failed to parse final JSON content:", jsonError);
        console.error("Content causing error:", cleanJsonContent);
        
        // Fallback: store the raw content for debugging
        try {
          const { error } = await supabase
            .from("career_info")
            .update({ 
              roadmap: { error: "Invalid JSON", content: cleanJsonContent },
              updated_at: new Date().toISOString() 
            })
            .eq("user_id", user_id);
            
          if (error) {
            console.error("Error updating career_info with error data:", error);
          }
        } catch (fallbackError) {
          console.error("Failed even storing error data:", fallbackError);
        }
      }
    }
  });

  const reader = response.body.getReader();
  const processStream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            break;
          }
          controller.enqueue(value);
        }
      } catch (error) {
        controller.error(error);
      }
    }
  });

  return processStream.pipeThrough(transformStream);
}

// 3. Main API handler.
export async function POST(request: Request) {
  try {
    // Parse the JSON payload sent by the client.
    const { clerk_id } = await request.json();
    if (!clerk_id) {
      return NextResponse.json({ error: "Missing clerk_id" }, { status: 400 });
    }

    // Look up the user record from the "users" table in Supabase.
    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerk_id)
      .single();
    if (userError || !userRecord) {
      return NextResponse.json(
        { error: "User record not found" },
        { status: 500 }
      );
    }
    const user_id = userRecord.id;

    // Fetch the career_info record for that user.
    const { data: careerInfo, error: careerInfoError } = await supabase
      .from("career_info")
      .select(`
        desired_career,
        residing_country,
        spending_capacity,
        current_class,
        move_abroad,
        preferred_abroad_country,
        previous_experience,
        difficulty
      `)
      .eq("user_id", user_id)
      .single();
    if (careerInfoError || !careerInfo) {
      return NextResponse.json(
        { error: "Career info record not found" },
        { status: 500 }
      );
    }

    const {
      desired_career,
      residing_country,
      spending_capacity,
      current_class,
      move_abroad,
      preferred_abroad_country,
      previous_experience,
      difficulty,
    } = careerInfo;

    if (!desired_career) {
      return NextResponse.json(
        { error: "Desired career not found in career_info" },
        { status: 400 }
      );
    }

    // Get current day and month.
    const now = new Date();
    const current_day = now.getDate();
    const current_month = now.toLocaleString("default", { month: "long" });

    // Define the base prompt.
    const basePrompt = `Generate a year-by-year roadmap in JSON format for a student aiming to pursue a career as a "${desired_career}". The student is currently in "${current_class}" in "${residing_country}", with a spending capacity of "${spending_capacity}". The student ${
      move_abroad
        ? "plans to move abroad to " + preferred_abroad_country
        : "does not plan to move abroad"
    }. The student has "${previous_experience}" in the field.

The roadmap should:
- Cover the years from "${current_class}" until the end of secondary education (typically 12th grade or equivalent in "${residing_country}"), divided into four 3-month phases per year.
- Include milestones relevant to "${desired_career}", taking into account the educational system and career pathways of "${residing_country}".
- Provide each milestone with DIFFICULTY_SPECIFIC_TASK_COUNT actionable tasks that include weights (indicating importance) and a completion status (initially set to false). Provide explanation or description of that task in atleast 2 to 3 lines.

Tailor the tasks to the student's specific situation:
- Residing Country: Incorporate relevant exams, qualifications, or educational requirements specific to "${residing_country}".
- Spending Capacity: Adjust task recommendations based on "${spending_capacity}" (e.g., suggest free online resources if low, or paid courses/bootcamps if high).
- Move Abroad: If the student plans to move to "${preferred_abroad_country}", include tasks such as language learning, cultural adaptation, visa preparation, or understanding the education system of that country.
- Previous Experience: Use "${previous_experience}" to adjust the starting point—skip beginner tasks or include more advanced ones if the student has prior knowledge.

Also, structure the roadmap year-wise. For example:
- If the student is in India and currently in 9th grade, generate a roadmap until 12th grade (4 years). For students in other countries, generate the roadmap until the end of school (before college).
- Within each year, divide the roadmap into four 3-month phases.
- The roadmap should be sequential, with later years building upon the achievements of previous years.
- Give detailed explanation about the task in atleast 2 to 3 lines.
- Use the current day and month ("${current_day} ${current_month}") as the starting point for planning the phases.
- Include the required Youtube tutorials/video if suggesting to start a course and learning or websites which might be helpful in "${desired_career}".
The response must be strictly in JSON format without any additional text, markdown formatting, or backticks, and must exactly match the following structure:

{
  "career": "Determined Career",
  "roadmap_summary": "A year-by-year plan, each with four 3-month phases, guiding the student from their current class until the end of secondary education.",
  "yearly_roadmap": [
    {
      "year": "Year Label (e.g., 9th Grade)",
      "overview": "Overview for the year, describing main focus or goals",
      "phases": [
        {
          "phase_name": "Phase 1 (Month 1 - Month 3)",
          "milestones": [
            {
              "name": "Milestone Name",
              "description": "What needs to be achieved in this milestone",
              "tasks": [
                {
                  "task_title": "Task Name",
                  "description": "Detailed instructions for the task",
                  "weight": NumericValue,
                  "completed": false
                }
              ]
            }
          ]
        }
        // Additional phases (Phase 2, Phase 3, Phase 4) for the year
      ]
    }
    // Additional years until the end of secondary education
  ],
  "final_notes": "Keep track of each task's progress. Update tasks as they are completed, and use the weight values to measure overall progress."
}`;

    // Select the prompt based on difficulty.
    let promptToSend: string;
    switch (difficulty) {
      case "easy":
        promptToSend = basePrompt.replace(
          "each milestone with DIFFICULTY_SPECIFIC_TASK_COUNT actionable tasks",
          "each milestone with 3-4 actionable tasks"
        );
        break;
      case "medium":
        promptToSend = basePrompt.replace(
          "each milestone with DIFFICULTY_SPECIFIC_TASK_COUNT actionable tasks",
          "each milestone with 4-6 actionable tasks"
        );
        break;
      case "hard":
        promptToSend = basePrompt.replace(
          "each milestone with DIFFICULTY_SPECIFIC_TASK_COUNT actionable tasks",
          "each milestone with 6-8 actionable tasks"
        );
        break;
      default:
        console.error("Invalid difficulty level:", difficulty);
        return NextResponse.json(
          { error: "Invalid difficulty level" },
          { status: 400 }
        );
    }

    // Generate the roadmap using structured streaming.
    // The returned stream both sends output to the client and accumulates the complete text
    // to later update the career_info record in Supabase.
    const roadmapStream = await generateRoadmap(promptToSend, user_id);

    // Return the streaming response to the client.
    return new NextResponse(roadmapStream, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err: any) {
    console.error("Error in POST /api/generate-roadmap:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message || err },
      { status: 500 }
    );
  }
}
