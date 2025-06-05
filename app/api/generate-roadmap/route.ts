import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabaseClient";

// Move yt-search import inside a try-catch to handle potential import issues
let yts: any;
try {
  yts = require('yt-search');
} catch (error) {
  console.error('Failed to import yt-search:', error);
  yts = null;
}

type YtVideo = {
  url: string;
  title: string;
  thumbnail: string;
  seconds: number;
  timestamp?: string; // "mm:ss"
};

function parseTimestamp(ts: string): number {
  const [m, s] = ts.split(":").map((n) => parseInt(n, 10) || 0);
  return m * 60 + s;
}

/** Remove any trailing commas before a closing ] or } */
function sanitizeJSON(raw: string): string {
  // 1) strip BOMs / invisible
  let s = raw.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  // 2) remove any commas before } or ]
  s = s.replace(/,\s*(?=[}\]])/g, "");
  return s;
}

async function generateRoadmap(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp-1219:generateContent?key=${apiKey}`;

  // This is the correct format for Gemini API
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({  
      contents: [
        {
          parts: [
            { 
              text: `You are Careeroadmap's AI expert. Always respond strictly in JSON format with no markdown or extra text:
- Provide single tutorial video or channel link, unless you truly can't find one embeddable video that covers the topic of that task.
- Only emit a "video_channel" object if **no** suitable, publicly embeddable video exists; otherwise emit a "video" object with "{ title, url, thumbnail }".  
- Provide a platform, free course or any website relevant to the task.
- Provide an "importance_explanation" field: 1–2 sentences explaining why the task's weight matters.
- Keep existing fields: task_title, description, weight, completed.
Ensure the final JSON matches the structure: { career, roadmap_summary, yearly_roadmap, final_notes }.

${prompt}`
            }
          ],
        },
      ],
      generationConfig: {
        temperature: 1.0,
        topP: 1.0,
        topK: 0,
      }
    }),
  });

  const data = await res.json();
  if (!data.candidates || data.candidates.length === 0) {
    console.error("Empty response from Gemini API:", data);
    throw new Error("No candidates returned from Gemini API");
  }

  // Extract the generated text
  let raw = data.candidates[0].content.parts[0].text as string;
  
  // Grab everything between the first "{" and the last "}"
  const text = raw.trim();
  const first = text.indexOf("{");
  const last  = text.lastIndexOf("}");
  if (first < 0 || last < 0) {
    console.error("Could not locate JSON braces in Gemini reply:", raw);
    throw new Error("Failed to locate JSON in Gemini response");
  }
  return text.slice(first, last + 1);
}

/**
 * Walk the raw roadmap object and replace each task.video.url
 * by looking up the best YouTube tutorial via yt-search,
 * filtering out Shorts (URLs with "/shorts/") and only keeping watch?v= links.
 */
async function enrichRoadmapVideos(rawRoadmap: any) {
  // Check if yt-search is available
  if (!yts) {
    console.warn("yt-search not available, skipping video enrichment");
    return rawRoadmap;
  }

  try {
    // 1) Collect all the queries in order
    const queries: string[] = [];
    rawRoadmap.yearly_roadmap.forEach((year: any) =>
      year.phases.forEach((phase: any) =>
        phase.milestones.forEach((ms: any) =>
          ms.tasks.forEach((task: any) => {
            if (task.video?.url) {
              queries.push(`${task.task_title}: ${task.description}`);
            }
          })
        )
      )
    );

    // 2) Run them in parallel with timeout and error handling
    const results = await Promise.all(
      queries.map(async (q: string) => {
        try {
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Search timeout')), 10000)
          );
          
          const searchPromise = yts(q + " tutorial");
          const r = await Promise.race([searchPromise, timeoutPromise]);
          
          const vids: YtVideo[] = r.videos || [];

          // Filter for watch URLs, no shorts, and duration ≥ 120s
          const longVids = vids.filter((v) => {
            if (!v.url.includes("watch?v=") || v.url.includes("/shorts/")) return false;
            // use v.seconds if valid, else parse v.timestamp
            const lengthSec =
              typeof v.seconds === "number" && v.seconds > 0
                ? v.seconds
                : v.timestamp
                ? parseTimestamp(v.timestamp)
                : 0;
            return lengthSec >= 120;
          });

          // fallback to the first standard video if none ≥ 2 min
          const firstStandard = vids.find(
            (v) =>
              v.url.includes("watch?v=") && !v.url.includes("/shorts/")
          );

          return longVids[0] || firstStandard || null;
        } catch (error) {
          console.error(`Failed to fetch video for query: ${q}`, error);
          return null;
        }
      })
    );

    // 3) Merge back in order
    let idx = 0;
    rawRoadmap.yearly_roadmap.forEach((year: any) =>
      year.phases.forEach((phase: any) =>
        phase.milestones.forEach((ms: any) =>
          ms.tasks.forEach((task: any) => {
            if (task.video?.url) {
              const v = results[idx++];
              if (v) {
                task.video.url = v.url;
                task.video.title = v.title;
                task.video.thumbnail = v.thumbnail;
              }
            }
          })
        )
      )
    );

    return rawRoadmap;
  } catch (error) {
    console.error("Video enrichment failed, continuing without video updates:", error);
    return rawRoadmap; // Return original roadmap if enrichment fails
  }
}

export async function POST(request: Request) {
  try {
    const { clerk_id } = await request.json();
    if (!clerk_id) {
      return NextResponse.json({ error: "Missing clerk_id" }, { status: 400 });
    }

    // Lookup user_id
    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerk_id)
      .single();
    if (userError || !userRecord) {
      return NextResponse.json({ error: "User record not found" }, { status: 500 });
    }
    const user_id = userRecord.id;

    // Fetch career_info
    const { data: careerInfo, error: careerInfoError } = await supabase
      .from("career_info")
      .select(
        `desired_career, residing_country, spending_capacity, current_class, move_abroad, preferred_abroad_country, previous_experience, difficulty, college_student`
      )
      .eq("user_id", user_id)
      .single();
    if (careerInfoError || !careerInfo) {
      return NextResponse.json({ error: "Career info record not found" }, { status: 500 });
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
      return NextResponse.json({ error: "Desired career not found" }, { status: 400 });
    }

    // Build the base prompt with dynamic context
    const now = new Date();
    const current_day = now.getDate();
    const current_month = now.toLocaleString("default", { month: "long" });
    const current_year = now.getFullYear();

    let basePrompt = `Generate a year-by-year roadmap in JSON format for a student aiming to pursue a career as a "${desired_career}". The student is currently in "${current_class}" in "${residing_country}", with a spending capacity of "${spending_capacity}", currency of "${residing_country}" . The student ${
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
- Give detailed explanation about the task in at least 3 to 4 lines. 
- Use the current day and month ("${current_day} ${current_month} ${current_year}") as the starting point for planning the phases.
- Include *working* YouTube watch-URLs only. Each URL must point to a public video that you have verified can be embedded. If you can't find an embeddable video for a task, leave "video" blank and provide a "video_channel" fallback. Provide when needed.
- Add relevant platforms, websites or free courses.
 
The response must be strictly in JSON format without any additional text, markdown formatting, or backticks, and must exactly match the following structure:

{
  "career": "Determined Career",
  "roadmap_summary": "A year-by-year plan, each with four 3-month phases, guiding the student from their current class until the end of secondary education.",
  "yearly_roadmap": [
    {
      "year": "Year Label (e.g., 9th Grade - for school students or 1st year/2nd year for college)",
      "overview": "Overview for the year, describing main focus or goals",
      "phases": [
        {
          "phase_name": "Phase 1 (Month 1 with year - Month 3 with year  MMM YYYY – MMM YYYY)",
          "milestones": [
            {
              "name": "Milestone Name",
              "description": "What needs to be achieved in this milestone",
              "tasks": [
                {
                  "task_title": "Task Name",
                  "description": "Detailed instructions for the task",(at least 3-4 lines)
                  "weight": NumericValue,
                  "completed": false,
                  // optional: embed a single YouTube video
                  "video": {
                    "title": "Video Title",
                    "url": "https://youtu.be/VIDEO_ID",
                    "thumbnail": "https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg"
                  },
                  // OR, if it makes more sense to link a channel instead of one video:
                  "video_channel": {
                    "name": "Channel Name",
                    "url": "https://www.youtube.com/channel/CHANNEL_ID"
                  },
                  // rest of your existing fields (e.g. platform_links, importance_explanation) follow here
                  "platform_links": [
                    { "name": "Coursera", "url": "https://coursera.org/…" }
                  ],
                  "importance_explanation": "A short 1–2-sentence rationale for this task's weight."
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
  "final_notes": "Keep track of each task's progress. Update tasks as they are completed, and use the weight values (in tens) to measure overall progress."
}
`;

    // Difficulty replacement
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

    // Generate roadmap
    const raw = await generateRoadmap(prompt);
    
    // 1) grab braces
    const text = raw.trim();
    const first = text.indexOf("{");
    const last  = text.lastIndexOf("}");
    if (first < 0 || last < 0) {
      console.error("No JSON braces found in Gemini reply:", raw);
      throw new Error("Failed to locate JSON in Gemini response");
    }

    // 2) extract and clean
    const sliced = text.slice(first, last + 1);
    const clean = sanitizeJSON(sliced);

    let obj: any;
    try {
      obj = JSON.parse(clean);
    } catch (parseErr) {
      console.error("⛔︎ JSON.parse failed. Cleaned payload was:", clean);
      console.error("Original raw:", raw);
      throw new Error("Invalid JSON from Gemini, see server log");
    }

    // Try to enrich videos, but don't fail if it doesn't work
    let enriched;
    try {
      enriched = await enrichRoadmapVideos(obj);
    } catch (error) {
      console.error("Video enrichment failed, using original roadmap:", error);
      enriched = obj;
    }

    // Save to Supabase
    const { error: updateError } = await supabase
      .from("career_info")
      .update({ roadmap: enriched, updated_at: new Date().toISOString() })
      .eq("user_id", user_id);

    if (updateError) {
      console.error("Error updating career_info:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in POST /api/generate-roadmap:", err);
    return NextResponse.json({ error: "Internal Server Error", details: err.message || err }, { status: 500 });
  }
}