// import { NextResponse } from "next/server";

// export const runtime = "nodejs";

// export async function POST(request: Request) {
//   try {
//     const { answers } = await request.json();

//     const prompt = `You are a caring career mentor having a direct conversation with a student. Based on their answers, provide 3-4 personalized insights that create urgency and FOMO while being encouraging.

// Tone: Direct, personal, caring but honest. Talk TO them, not ABOUT them.

// Guidelines:
// - If they made good choices, appreciate them first, then highlight what they're missing
// - If they made concerning choices, be direct about the drawbacks but offer hope
// - Focus on their specific situation, not generic stats
// - Create urgency without being overwhelming
// - Keep each insight under 20 words for the stat, 25 words for the impact

// Format as JSON array with "stat" and "impact" fields.

// Student answers: ${JSON.stringify(answers)}

// Return only valid JSON array, no other text.`;

//     // Use the same API key as other working routes
//     const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_TAG;
//     if (!apiKey) {
//       console.error("No Gemini API key found");
//       throw new Error("Gemini API key not configured");
//     }

//     const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

//     const res = await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         contents: [{ parts: [{ text: prompt }] }],
//         generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
//       }),
//     });

//     if (!res.ok) {
//       const errorText = await res.text();
//       console.error("Gemini API error:", res.status, errorText);
//       throw new Error(`Gemini API error: ${res.status}`);
//     }

//     const data = await res.json();
//     const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

//     let stats;
//     try {
//       // Clean the response text to handle markdown code blocks
//       let cleanText = text || "[]";

//       // Remove markdown code blocks if present
//       const codeBlockMatch = cleanText.match(/```json\s*([\s\S]*?)\s*```/);
//       if (codeBlockMatch) {
//         cleanText = codeBlockMatch[1].trim();
//       }

//       // Also try to extract JSON array if it's not in code blocks
//       const arrayMatch = cleanText.match(/(\[[\s\S]*\])/);
//       if (arrayMatch) {
//         cleanText = arrayMatch[1].trim();
//       }

//       stats = JSON.parse(cleanText);
//     } catch (parseError) {
//       console.error("Failed to parse Gemini response:", parseError);
//       console.error("Raw response was:", text);
//       // Fallback stats if parsing fails
//       stats = [
//         {
//           stat: "78% of students miss career opportunities",
//           impact: "due to lack of proper guidance",
//         },
//         {
//           stat: "Average career delay costs $45,000",
//           impact: "in lost earning potential",
//         },
//         {
//           stat: "Only 23% follow structured roadmaps",
//           impact: "while 77% struggle with direction",
//         },
//         {
//           stat: "Students waste 15+ hours weekly",
//           impact: "on ineffective learning methods",
//         },
//       ];
//     }

//     return NextResponse.json({ stats });
//   } catch (err) {
//     console.error("Error in dashboarddemo-outcome API:", err);
//     return NextResponse.json({
//       stats: [
//         {
//           stat: "78% of students miss career opportunities",
//           impact: "due to lack of proper guidance",
//         },
//         {
//           stat: "Average career delay costs $45,000",
//           impact: "in lost earning potential",
//         },
//         {
//           stat: "Only 23% follow structured roadmaps",
//           impact: "while 77% struggle with direction",
//         },
//         {
//           stat: "Students waste 15+ hours weekly",
//           impact: "on ineffective learning methods",
//         },
//       ],
//     });
//   }
// }

// app/api/dashboarddemo-outcome/route.ts (or page.ts depending on setup)

// app/api/dashboarddemo-outcome/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { answers } = await request.json();

    const prompt = `You are a direct career mentor talking TO one student with future data insights.
Using ONLY the student's answers below, produce EXACTLY FOUR insight statements (strings).
Each statement must:
- Speak directly to the student ("you" / "your") with their data and how students like them are missing out with data.
- Be urgency-driving and actionable (create FOMO or a clear next-step nudge) .
- Use their data and figure out where they lack or need to improve with what current world or future holds.
Do NOT output keys, explanations, or commentary—RETURN A JSON OBJECT with a single key "stats" whose value is an array of four strings.

Return exactly: { "stats": ["...", "...", "...", "..."] }

Student answers: ${JSON.stringify(answers)}`;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_TAG;
    if (!apiKey) throw new Error("Gemini API key not configured");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 220,
          topP: 0.8,
        },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Gemini API error:", res.status, errorText);
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let stats: string[] = [];

    try {
      let clean = text;

      // strip code fences
      const codeBlockMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (codeBlockMatch) clean = codeBlockMatch[1].trim();

      // extract JSON object if present
      const objMatch = clean.match(/(\{[\s\S]*\})/);
      if (objMatch) clean = objMatch[1];

      const parsed = JSON.parse(clean);

      if (parsed && Array.isArray(parsed.stats)) {
        stats = parsed.stats.slice(0, 4).map(String);
      } else if (Array.isArray(parsed) && parsed.length === 4) {
        // model accidentally returned raw array
        stats = parsed.slice(0, 4).map(String);
      }
    } catch (e) {
      console.error("Failed to parse model response:", e, "raw:", text);
    }

    // fallback copy (guarantee exactly 4)
    if (!stats || stats.length !== 4) {
      stats = [
        "You’re losing momentum — a clear roadmap now will recover months of progress.",
        "Without targeted guidance, your current approach will keep opportunities out of reach.",
        "Small daily changes now will compound into major career advantage within months.",
        "Sign up today to convert confusion into a step-by-step plan that actually works.",
      ];
    }

    return NextResponse.json({ stats });
  } catch (err) {
    console.error("Error in dashboarddemo-outcome API:", err);
    return NextResponse.json({
      stats: [
        "You’re losing momentum — a clear roadmap now will recover months of progress.",
        "Without targeted guidance, your current approach will keep opportunities out of reach.",
        "Small daily changes now will compound into major career advantage within months.",
        "Sign up today to convert confusion into a step-by-step plan that actually works.",
      ],
    });
  }
}
