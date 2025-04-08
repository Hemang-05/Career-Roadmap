import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabaseClient";

async function generateRoadmap(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-thinking-exp-1219:free" ,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      top_p: 1,
      temperature: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      repetition_penalty: 1,
      top_k: 0,
    }),
  });


  const data = await response.json();
  // console.log('OpenRouter API response:', data);

  if (!data.choices || data.choices.length === 0) {
    throw new Error("No choices returned from OpenRouter API");
  }

  const rawContent = data.choices[0].message.content.trim();

  // Attempt to extract just the JSON part using regex
  const jsonMatch =
    rawContent.match(/```json\s*([\s\S]*?)\s*```/i) ||
    rawContent.match(/{[\s\S]*}/);
  if (!jsonMatch) {
    throw new Error("No valid JSON found in response");
  }

  const cleanContent = jsonMatch[1] || jsonMatch[0]; // Depending on which pattern matched
  return cleanContent.trim();
}

export async function POST(request: Request) {
  try {
    // Parse the JSON payload sent by the client
    const { clerk_id } = await request.json();
    if (!clerk_id) {
      return NextResponse.json({ error: "Missing clerk_id" }, { status: 400 });
    }

    // Look up the user record in the users table using clerk_id
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

    // Fetch the career_info record for that user, including difficulty
    const { data: careerInfo, error: careerInfoError } = await supabase
      .from("career_info")
      .select(
        `
        desired_career,
        residing_country,
        spending_capacity,
        current_class,
        move_abroad,
        preferred_abroad_country,
        previous_experience,
        difficulty
      `
      )
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

    // Get current day and month
    const now = new Date();
    const current_day = now.getDate();
    const current_month = now.toLocaleString("default", { month: "long" });

    // Define the base prompt
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

    // Select the prompt based on difficulty
    let prompt: string;
    switch (difficulty) {
      case "easy":
        prompt = basePrompt.replace(
          "each milestone with DIFFICULTY_SPECIFIC_TASK_COUNT actionable tasks",
          "each milestone with 3-4 actionable tasks"
        );
        // console.log('Prompt sent for EASY difficulty:', prompt);
        break;
      case "medium":
        prompt = basePrompt.replace(
          "each milestone with DIFFICULTY_SPECIFIC_TASK_COUNT actionable tasks",
          "each milestone with 4-6 actionable tasks"
        );
        // console.log('Prompt sent for MEDIUM difficulty:', prompt);
        break;
      case "hard":
        prompt = basePrompt.replace(
          "each milestone with DIFFICULTY_SPECIFIC_TASK_COUNT actionable tasks",
          "each milestone with 6-8 actionable tasks"
        );
        console.log('Prompt sent for HARD difficulty:', prompt);
        break;
      default:
        console.error("Invalid difficulty level:", difficulty);
        return NextResponse.json(
          { error: "Invalid difficulty level" },
          { status: 400 }
        );
    }

    // Call the OpenRouter API to generate the roadmap
    const roadmap = await generateRoadmap(prompt);

    // Update the career_info record with the generated roadmap
    const { data, error } = await supabase
      .from("career_info")
      .update({ roadmap, updated_at: new Date().toISOString() })
      .eq("user_id", user_id);

    if (error) {
      console.error("Error updating career_info:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return a success response
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in POST /api/generate-roadmap:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message || err },
      { status: 500 }
    );
  }
}
