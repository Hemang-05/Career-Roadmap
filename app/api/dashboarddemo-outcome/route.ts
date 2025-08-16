import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { answers } = await request.json();

    const prompt = `You are a caring career mentor having a direct conversation with a student. Based on their answers, provide 3-4 personalized insights that create urgency and FOMO while being encouraging.

Tone: Direct, personal, caring but honest. Talk TO them, not ABOUT them.

Guidelines:
- If they made good choices, appreciate them first, then highlight what they're missing
- If they made concerning choices, be direct about the drawbacks but offer hope
- Focus on their specific situation, not generic stats
- Create urgency without being overwhelming
- Keep each insight under 20 words for the stat, 25 words for the impact

Format as JSON array with "stat" and "impact" fields.

Student answers: ${JSON.stringify(answers)}

Return only valid JSON array, no other text.`;

    // Use the same API key as other working routes
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_TAG;
    if (!apiKey) {
      console.error("No Gemini API key found");
      throw new Error("Gemini API key not configured");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Gemini API error:", res.status, errorText);
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    let stats;
    try {
      // Clean the response text to handle markdown code blocks
      let cleanText = text || "[]";

      // Remove markdown code blocks if present
      const codeBlockMatch = cleanText.match(/```json\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        cleanText = codeBlockMatch[1].trim();
      }

      // Also try to extract JSON array if it's not in code blocks
      const arrayMatch = cleanText.match(/(\[[\s\S]*\])/);
      if (arrayMatch) {
        cleanText = arrayMatch[1].trim();
      }

      stats = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      console.error("Raw response was:", text);
      // Fallback stats if parsing fails
      stats = [
        {
          stat: "78% of students miss career opportunities",
          impact: "due to lack of proper guidance",
        },
        {
          stat: "Average career delay costs $45,000",
          impact: "in lost earning potential",
        },
        {
          stat: "Only 23% follow structured roadmaps",
          impact: "while 77% struggle with direction",
        },
        {
          stat: "Students waste 15+ hours weekly",
          impact: "on ineffective learning methods",
        },
      ];
    }

    return NextResponse.json({ stats });
  } catch (err) {
    console.error("Error in dashboarddemo-outcome API:", err);
    return NextResponse.json({
      stats: [
        {
          stat: "78% of students miss career opportunities",
          impact: "due to lack of proper guidance",
        },
        {
          stat: "Average career delay costs $45,000",
          impact: "in lost earning potential",
        },
        {
          stat: "Only 23% follow structured roadmaps",
          impact: "while 77% struggle with direction",
        },
        {
          stat: "Students waste 15+ hours weekly",
          impact: "on ineffective learning methods",
        },
      ],
    });
  }
}
