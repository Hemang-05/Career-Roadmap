// File: app/api/events-api-gemini/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabaseClient";
import { EVENT_SEARCH_SITES } from "@/utils/eventSearchSites";

export const runtime = "nodejs";

interface CareerInfo {
  desired_career: string;
  current_class: string;
  residing_country: string;
  move_abroad: boolean;
  preferred_abroad_country: string | null;
  previous_experience: string | null;
  college_student: boolean | null;
}

function buildPrompt(info: CareerInfo, searchSites: string[]): string {
  const academic_status = info.college_student
    ? `${info.current_class || "College"} Undergraduate`
    : `${info.current_class || "High School"} Student`;
  const move_abroad_status = info.move_abroad ? "true" : "false";
  const preferred_country = info.preferred_abroad_country || "null";
  const experience = info.previous_experience || "none";
  const today = new Date().toISOString().split("T")[0];

  const sitesListText = searchSites.map((url) => `  • ${url}`).join("\n");

  return `You are an expert career event finder and summarizer for students. Your task is to find highly relevant and upcoming opportunities based on a specific user's profile. You MUST use the Google Search tool to find up-to-date and specific information.

  Search these platforms:
  ${sitesListText}

User Profile:
  - Career Goal: {${info.desired_career}}
  - Academic Status: {${academic_status}}
  - Previous Experience: {${experience}}
  - Location Information:
      • Currently Residing In: {${info.residing_country}}
      • Interested in International Opportunities: {${move_abroad_status}}
      • Preferred International Destination: {${preferred_country}}

Instructions for Event Selection and Filtering:
1.  Strict Academic Relevance: Filter events specifically for the user's Academic Status.
2.  Temporal Relevance: Only include events starting from today (${today}).
3.  Location Filtering:
    • If NOT interested in international, prioritize “Online” or in residing country.
    • If YES, include preferred abroad country and Online.
4.  Content Relevance: Must relate to the Career Goal and Previous Experience.
5.  Output Format: Return an array of objects with:
    • title
    • url
    • description (one-sentence)
    • date (YYYY-MM-DD or "TBD")
    • location (City, Country, or "Online")
6. Return **at least 10** events.
Respond with ONLY the JSON array, no extra text.`;
}

// Helper to probe URL availability with HEAD request and timeout
async function isAlive(url: string, timeoutMs = 3000): Promise<boolean> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: "HEAD", signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(id);
  }
}

// Validate and filter events to up to maxResults valid URLs
async function filterValidEvents(
  items: { url: string }[],
  maxResults = 5
): Promise<typeof items> {
  const valid: typeof items = [];
  const overProvision = maxResults * 2; // e.g., check up to 10 candidates
  const candidates = items.slice(0, overProvision);
  const batchSize = 5;

  for (let i = 0; i < candidates.length && valid.length < maxResults; i += batchSize) {
    const batch = candidates.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (item) => ({
        item,
        ok: await isAlive(item.url),
      }))
    );
    for (const { item, ok } of results) {
      if (ok && valid.length < maxResults) {
        valid.push(item);
      }
    }
  }
  return valid;
}

export async function POST(request: Request) {
  try {
    const { user_id } = await request.json();
    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "Missing user_id" },
        { status: 400 }
      );
    }

    // Fetch the user’s career_tag
    const { data: userRec, error: userErr } = await supabase
      .from("users")
      .select("career_tag")
      .eq("id", user_id)
      .single();
    if (userErr || !userRec) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    const tag: string = userRec.career_tag;

    // 1) Fetch career_info
    const { data, error: infoErr } = await supabase
      .from("career_info")
      .select(
        "desired_career, current_class, residing_country, move_abroad, preferred_abroad_country, previous_experience, college_student"
      )
      .eq("user_id", user_id)
      .single();

    if (infoErr || !data) {
      return NextResponse.json(
        { success: false, error: "Career info not found" },
        { status: 404 }
      );
    }
    const careerInfo = data as CareerInfo;

    const sites = EVENT_SEARCH_SITES[tag] || EVENT_SEARCH_SITES["default"];

    // 2) Build and send Gemini request
    const promptText = buildPrompt(careerInfo, sites);
    const payload = {
      tools: [{ googleSearch: {} }],
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: { temperature: 0.5, topP: 0.9, maxOutputTokens: 8192 },
    };
    const apiKey = process.env.GEMINI_API_KEY!;
    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!apiRes.ok) {
      const errText = await apiRes.text();
      throw new Error(`Gemini API error: ${errText}`);
    }
    const apiJson = await apiRes.json();

    // 3) Extract and parse JSON array
    const raw = apiJson.candidates?.[0]?.content?.parts?.[0]?.text as string;
    if (!raw) throw new Error("No response text from Gemini");

    const fenceMatch = raw.match(/```json\s*([\s\S]*?)\s*```/);
    const arrayMatch = raw.match(/(\[[\s\S]*\])/);
    let jsonString = (fenceMatch?.[1] || arrayMatch?.[1] || raw).trim();

    let events: any[];
    try {
      events = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error("JSON parse failed:", { raw, jsonString, parseErr });
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse JSON from Gemini",
          raw,
          jsonString,
        },
        { status: 500 }
      );
    }

    // 4) Validate URLs and enforce max of 5 events
    events = await filterValidEvents(events, 5);

    // 5) Insert a fresh row
    const eventMonth = new Date().toLocaleString("default", { month: "long" });
    const { data: inserted, error: insertErr } = await supabase
      .from("events")
      .insert({
        user_id,
        event_month: eventMonth,
        event_json: events,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (insertErr) throw insertErr;

    // 6) Return success and inserted data
    return NextResponse.json({
      success: true,
      events_found: Array.isArray(events) ? events.length : 0,
      inserted,
    });
  } catch (err: any) {
    console.error("events-api-gemini error:", err);
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}
