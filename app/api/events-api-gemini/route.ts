// File: app/api/events-api-gemini/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabaseClient";
import { EVENT_SITES_BY_TYPE } from "@/utils/eventSitesByType";
import { EVENT_TYPES } from "@/utils/eventTypesByCareer";

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

function buildPrompt(info: CareerInfo, tag: string): string {
  const now       = new Date();
  const today     = now.toISOString().split("T")[0];       // e.g. "2025-07-11"
  const year      = now.getFullYear();                     // e.g. 2025
  const monthName = now.toLocaleString("default", { month: "long" }); // e.g. "July"
  const career    = info.desired_career;
  const types     = EVENT_TYPES[tag] || EVENT_TYPES.default;

  const blocks = types.map((type) => {
    // grab up to 5 sites for this type
    const sites = (EVENT_SITES_BY_TYPE[type] || [])
      .slice(0, 2) 
      .filter((u, i, arr) => arr.indexOf(u) === i);

    if (sites.length === 0) {
      return `=== ${type.toUpperCase()} ===\n// No platforms configured for ${type}`;
    }

    // for each site, ask for 2 events
    const lines = sites
      .map(
        (site) =>
          `- search for "${type} of ${career} from ${today} onward" on site:${site} and return the top upcoming event with URL, title, date, location, description.`
      )
      .join("\n");

    return `=== ${type.toUpperCase()} ===\n${lines}`;
  }).join("\n\n");

  return `You are an expert career‑events assistant. Today is ${today}.
User wants to become a ${career}.

${blocks}

After collecting **all** of those event‑page URLs, use the URL‑Context tool to fetch each page’s content.
Then output **only** the JSON array of objects with keys:
  • title
  • url
  • date     (YYYY‑MM‑DD)
  • location (City, Country, or "Online")
  • description
  • image url (image of the corresponding event)
Return exactly the JSON—no extra text.`;
}

// HEAD‑check helper (unchanged)
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

// Now *no cap*—just filter out dead URLs
async function filterValidEvents(items: { url: string }[]): Promise<typeof items> {
  const valid: typeof items = [];
  for (const item of items) {
    if (await isAlive(item.url)) {
      valid.push(item);
    }
  }
  return valid;
}

export async function POST(request: Request) {
  try {
    const { user_id } = await request.json();
    if (!user_id) {
      return NextResponse.json({ success: false, error: "Missing user_id" }, { status: 400 });
    }

    // 1) Get the user’s career_tag
    const { data: userRec, error: userErr } = await supabase
      .from("users")
      .select("career_tag")
      .eq("id", user_id)
      .single();
    if (userErr || !userRec) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }
    const tag = userRec.career_tag;

    // 2) Fetch career_info
    const { data, error: infoErr } = await supabase
      .from("career_info")
      .select(
        "desired_career, current_class, residing_country, move_abroad, " +
        "preferred_abroad_country, previous_experience, college_student"
      )
      .eq("user_id", user_id)
      .single();
    if (infoErr || !data) {
      return NextResponse.json({ success: false, error: "Career info not found" }, { status: 404 });
    }
    const careerInfo = data as CareerInfo;

    // 3) Build the RAG prompt
    const promptText = buildPrompt(careerInfo, tag);
  

    // 4) Gather exactly the same sites for URL‑Context
    const types       = EVENT_TYPES[tag] || EVENT_TYPES.default;
    const flatSites   = types.flatMap(type => (EVENT_SITES_BY_TYPE[type] || []).slice(0, 2));
    const allSites    = flatSites.filter((u, i, a) => a.indexOf(u) === i);

    // 5) Call Gemini (generateContent) with Google Search + URL Context
    const payload = {
      tools: [
        { googleSearch: {} },
        { urlContext: {} }    // automatically fetches all URLs discovered in the search
      ],
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: { temperature: 0.5, topP: 0.9, maxOutputTokens: 32768 },
    };
    const apiKey = process.env.GEMINI_API_KEY_EVENTS;
    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      }
    );
    if (!apiRes.ok) {
      const errText = await apiRes.text();
      throw new Error(`Gemini API error: ${errText}`);
    }
    const apiJson = await apiRes.json();

 
    // 6) Extract the raw JSON
    const candidate = apiJson.candidates?.[0];
    const parts = candidate?.content?.parts;
    if (!candidate) {
      throw new Error("No candidates array in Gemini response");
    }
    if (!Array.isArray(parts) || parts.length === 0) {
      throw new Error("No content.parts returned by Gemini");
    }
    const raw = parts[0].text as string;
    if (!raw?.trim()) {
      throw new Error("content.parts[0].text is empty");
    }
    // // 6) Extract the raw JSON
    // const raw = apiJson.candidates?.[0]?.content?.parts?.[0]?.text as string;
    // if (!raw?.trim()) throw new Error("No response text from Gemini");

// ─── Strip off any ```json … ``` fences ───────────────────────────────
    let body = raw.trim();
    const fenceMatch = body.match(/```json\s*([\s\S]*?)\s*```/);
    if (fenceMatch) {
      body = fenceMatch[1].trim();
    } else {
      // if it wasn’t fenced, try to extract the first [...] block
      const arrayMatch = body.match(/(\[[\s\S]*\])/);
      if (arrayMatch) {
        body = arrayMatch[1].trim();
      }
   }
    let events: any[];
    try {
      events = JSON.parse(body);
    } catch (parseErr) {
      console.error("JSON parse failed:", { parseErr });
      return NextResponse.json(
        { success: false, error: "Failed to parse JSON", raw, parseErr },
        { status: 500 }
      );
    }

    // 7) Filter out any dead URLs (no cap)
    const validEvents = await filterValidEvents(events);

    // 8) Insert into Supabase
    const eventMonth = new Date().toLocaleString("default", { month: "long" });
    const { data: inserted, error: insertErr } = await supabase
      .from("events")
      .insert({
        user_id,
        event_month: eventMonth,
        event_json: validEvents,
        updated_at: new Date().toISOString(),
      })
      .select();
    if (insertErr) throw insertErr;

    // 9) Return all of them (should be 10+)
    return NextResponse.json({ success: true, events_found: validEvents.length, inserted });
  } catch (err: any) {
    console.error("events-api-gemini error:", err);
    return NextResponse.json({ success: false, error: err.message || String(err) }, { status: 500 });
  }
}
