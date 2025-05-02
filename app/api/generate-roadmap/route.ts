import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabaseClient";

async function generateRoadmap(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp-1219:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  const data = await res.json();
  if (!data.candidates || data.candidates.length === 0) {
    console.error("Empty response from Gemini API:", data);
    throw new Error("No candidates returned from Gemini API");
  }

  // Extract the generated text
  let raw = data.candidates[0].content.parts[0].text as string;

  // Strip any ```json fences or grab the JSON object
  const match =
    raw.match(/```json\s*([\s\S]*?)\s*```/i) ||
    raw.match(/({[\s\S]*})/);
  if (!match) {
    console.error("No JSON payload found in Gemini reply:", raw);
    throw new Error("Failed to locate JSON in Gemini response");
  }

  return match[1].trim();
}

export async function POST(request: Request) {
  try {
    // 1. Parse incoming payload
    const { clerk_id } = await request.json();
    if (!clerk_id) {
      return NextResponse.json({ error: "Missing clerk_id" }, { status: 400 });
    }

    // 2. Lookup user_id
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

    // 3. Fetch career_info
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
        difficulty,
        college_student
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
      college_student,
    } = careerInfo;

    if (!desired_career) {
      return NextResponse.json(
        { error: "Desired career not found" },
        { status: 400 }
      );
    }

    // 4. Build prompt
    const now = new Date();
    const current_day = now.getDate();
    const current_month = now.toLocaleString("default", { month: "long" });

    let basePrompt = `Generate a year-by-year roadmap in JSON format for a student aiming to pursue a career as a "${desired_career}". The student is currently in "${current_class}" in "${residing_country}", with a spending capacity of "${spending_capacity}". The student ${
      move_abroad
        ? `plans to move abroad to ${preferred_abroad_country}`
        : "does not plan to move abroad"
    }. The student has "${previous_experience}" in the field.

The roadmap should:
- Cover the years from "${current_class}" until the end of secondary education (typically 12th grade or equivalent in "${residing_country}")${
      college_student
        ? ` or if college student in ${current_class}, then until graduation year`
        : ""
    }, divided into four 3-month phases per year.
- Include milestones relevant to "${desired_career}", taking into account the educational system and career pathways of "${residing_country}".
- Provide each milestone with DIFFICULTY_SPECIFIC_TASK_COUNT actionable tasks that include weights (indicating importance) and a completion status (initially set to false). Provide explanation or description of that task in at least 2 to 3 lines.

Tailor the tasks to the student's specific situation:
- Residing Country: Incorporate relevant exams, qualifications, or educational requirements specific to "${residing_country}".
- Spending Capacity: Adjust task recommendations based on "${spending_capacity}" (e.g., suggest free online resources if low, or paid courses/bootcamps if high).
- Move Abroad: If the student plans to move to "${preferred_abroad_country}", include tasks such as language learning, cultural adaptation, visa preparation, or understanding the education system of that country.
- Previous Experience: Use "${previous_experience}" to adjust the starting point—skip beginner tasks or include more advanced ones if the student has prior knowledge.

Also, structure the roadmap year-wise. For example:
- If the student is in India and currently in 9th grade, generate a roadmap until 12th grade (4 years). For students in other countries, generate the roadmap until the end of school (before college).
- If the student is in college, generate the roadmap until graduation.
- Within each year, divide the roadmap into four 3-month phases.
- The roadmap should be sequential, with later years building upon the achievements of previous years.
- Give detailed explanation about the task in at least 2 to 3 lines.
- Use the current day and month ("${current_day} ${current_month}") as the starting point for planning the phases.
- Include the required YouTube tutorials/videos or websites that might be helpful in "${desired_career}".

The response must be strictly in JSON format without any additional text, markdown formatting, or backticks, and must exactly match the following structure:

{
  "career": "Determined Career",
  "roadmap_summary": "A year-by-year plan, each with four 3-month phases, guiding the student from their current class until the end of secondary education.",
  "yearly_roadmap": [
    {
      "year": "Year Label (e.g., 9th Grade, 1st year/2nd year)",
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

    // 5. Replace placeholder based on difficulty
    let prompt: string;
    switch (difficulty) {
      case "easy":
        prompt = basePrompt.replace(
          "each milestone with DIFFICULTY_SPECIFIC_TASK_COUNT actionable tasks",
          "each milestone with 3-4 actionable tasks"
        );
        break;
      case "medium":
        prompt = basePrompt.replace(
          "each milestone with DIFFICULTY_SPECIFIC_TASK_COUNT actionable tasks",
          "each milestone with 4-6 actionable tasks"
        );
        break;
      case "hard":
        prompt = basePrompt.replace(
          "each milestone with DIFFICULTY_SPECIFIC_TASK_COUNT actionable tasks",
          "each milestone with 6-8 actionable tasks"
        );
        break;
      default:
        return NextResponse.json(
          { error: "Invalid difficulty level" },
          { status: 400 }
        );
    }

    // 6. Call Gemini API
    const roadmap = await generateRoadmap(prompt);

    // 7. Save to Supabase
    const { error } = await supabase
      .from("career_info")
      .update({ roadmap, updated_at: new Date().toISOString() })
      .eq("user_id", user_id);

    if (error) {
      console.error("Error updating career_info:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 8. Return success
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in POST /api/generate-roadmap:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message || err },
      { status: 500 }
    );
  }
}
