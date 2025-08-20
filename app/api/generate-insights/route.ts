// import { NextResponse } from "next/server";

// type ReqBody = {
//   desiredCareer?: string;
//   longTermAspirations?: string;
//   roleModelInfluences?: string;
//   educationalStage?: string;
//   schoolGrade?: string;
//   schoolStream?: string;
//   collegeYear?: string;
//   collegeDegree?: string;
//   practicalExperience?: string;
//   academicStrengths?: string;
//   extracurricularActivities?: string;
//   industryKnowledgeLevel?: string;
//   preferredWorkEnvironment?: string;
//   preferredLearningStyle?: string;
//   difficulty?: string | null;
//   mentorshipAndNetworkStatus?: string;
//   culturalFamilyExpectations?: string;
// };

// export const runtime = "nodejs";

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();

//     /*
//      Compose a detailed prompt using the student's responses from Step 2, 3, and 4 to generate personalized, urgency-driven insights.
//      Fields from Step 2 (Identity & Goals): desiredCareer, longTermAspirations, roleModelInfluences.
//      Fields from Step 3 (Background & Capacity): educationalStage, schoolGrade, schoolStream, collegeYear, collegeDegree, practicalExperience.
//      Fields from Step 4 (Skills & Experience): academicStrengths, extracurricularActivities, industryKnowledgeLevel, preferredWorkEnvironment, preferredLearningStyle, difficulty, mentorshipAndNetworkStatus, culturalFamilyExpectations.
//      Generate exactly four actionable insights that create FOMO and prompt the student to take action.
//     */
//     const prompt = `You are an AI career mentor. Based solely on the student's detailed responses below, generate EXACTLY FOUR personalized insights.
// Each insight must be:
// - Direct, speaking to the student as "you" and referencing their provided data.
// - Urgency-driving, creating FOMO and emphasizing potential missed opportunities if they delay action.
// - Actionable, suggesting a clear next step.
// - Concise (under 25 words each).

// Use the following data:
// Identity & Goals:
//   • Desired Career: ${body.desiredCareer || "N/A"}
//   • Long Term Aspirations: ${body.longTermAspirations || "N/A"}
//   • Role Model Influences: ${body.roleModelInfluences || "N/A"}
// Background & Capacity:
//   • Educational Stage: ${body.educationalStage || "N/A"}
//   • School Grade/Stream: ${body.schoolGrade || "N/A"} / ${
//       body.schoolStream || "N/A"
//     }
//   • College Year/Degree: ${body.collegeYear || "N/A"} / ${
//       body.collegeDegree || "N/A"
//     }
//   • Practical Experience: ${body.practicalExperience || "N/A"}
// Skills & Experience:
//   • Academic Strengths: ${body.academicStrengths || "N/A"}
//   • Extracurricular Activities: ${body.extracurricularActivities || "N/A"}
//   • Industry Knowledge Level: ${body.industryKnowledgeLevel || "N/A"}
//   • Preferred Work Environment: ${body.preferredWorkEnvironment || "N/A"}
//   • Preferred Learning Style: ${body.preferredLearningStyle || "N/A"}
//   • Difficulty: ${body.difficulty || "N/A"}
//   • Mentorship & Network Status: ${body.mentorshipAndNetworkStatus || "N/A"}
//   • Cultural Family Expectations: ${body.culturalFamilyExpectations || "N/A"}

// Return exactly: { "insights": ["...", "...", "...", "..."] }`;

//     const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_TAG;
//     if (!apiKey) throw new Error("Gemini API key not configured");

//     const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

//     const res = await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         contents: [{ parts: [{ text: prompt }] }],
//         generationConfig: {
//           temperature: 0.2,
//           maxOutputTokens: 220,
//           topP: 0.8,
//         },
//       }),
//     });

//     if (!res.ok) {
//       const errorText = await res.text();
//       throw new Error(`Gemini API error: ${res.status} ${errorText}`);
//     }

//     const data = await res.json();
//     const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

//     let insights: string[] = [];
//     try {
//       let clean = text;
//       // strip code fences
//       const codeBlockMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
//       if (codeBlockMatch) clean = codeBlockMatch[1].trim();
//       // extract JSON object if present
//       const objMatch = clean.match(/(\{[\s\S]*\})/);
//       if (objMatch) clean = objMatch[1];
//       const parsed = JSON.parse(clean);
//       if (parsed && Array.isArray(parsed.insights)) {
//         insights = parsed.insights.slice(0, 4).map(String);
//       } else if (Array.isArray(parsed) && parsed.length === 4) {
//         insights = parsed.slice(0, 4).map(String);
//       }
//     } catch (e) {
//       // fallback
//     }
//     if (!insights || insights.length !== 4) {
//       insights = [
//         "You’re losing momentum — act now to avoid missed opportunities in your chosen career path.",
//         "Without immediate targeted action, you risk falling behind in today’s competitive market.",
//         "Delay could cost you critical growth; start building your portfolio and network now.",
//         "Transform uncertainty into success — take actionable steps today to secure your future.",
//       ];
//     }
//     return NextResponse.json({ insights });
//   } catch (err) {
//     return NextResponse.json({
//       insights: [
//         "You’re losing momentum — act now to avoid missed opportunities in your chosen career path.",
//         "Without immediate targeted action, you risk falling behind in today’s competitive market.",
//         "Delay could cost you critical growth; start building your portfolio and network now.",
//         "Transform uncertainty into success — take actionable steps today to secure your future.",
//       ],
//     });
//   }
// }

import { NextResponse } from "next/server";

type ReqBody = {
  // Existing profile fields
  desiredCareer?: string;
  longTermAspirations?: string;
  roleModelInfluences?: string;
  educationalStage?: string;
  schoolGrade?: string;
  schoolStream?: string;
  collegeYear?: string;
  collegeDegree?: string;
  practicalExperience?: string;
  academicStrengths?: string;
  extracurricularActivities?: string;
  industryKnowledgeLevel?: string;
  preferredWorkEnvironment?: string;
  preferredLearningStyle?: string;
  difficulty?: string | null;
  mentorshipAndNetworkStatus?: string;
  culturalFamilyExpectations?: string;

  // NEW: Profiling data from Step 1
  profiling?: {
    missedOpportunities?: string;
    hoursWasted?: string;
    followingRoadmap?: string;
    careerConfidence?: string;
    competitionLevel?: string;
    timeToAct?: string;
  };
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Extract profiling data with defaults
    const profiling = body.profiling || {};
    const profilingData = {
      missedOpportunities: profiling.missedOpportunities || "unknown",
      hoursWasted: profiling.hoursWasted || "unknown",
      followingRoadmap: profiling.followingRoadmap || "uncertain",
      careerConfidence: profiling.careerConfidence || "uncertain",
      competitionLevel: profiling.competitionLevel || "unknown",
      timeToAct: profiling.timeToAct || "unknown",
    };

    const career = body.desiredCareer || "your chosen field";

    const prompt = `You are a direct career reality advisor speaking TO one student about their chosen career path.

Using the student's profiling struggles and career information below, produce EXACTLY FOUR fear-based insight statements with solutions.

Create EXACTLY FOUR insights (15-18 words each) that build urgency for having a career roadmap:

FIRST 3 INSIGHTS: Focus on problems and risks WITHOUT mentioning CareerRoadmap. Make user realize they desperately need guidance.

Structure options for insights 1-3:
1. "Your [USER STRUGGLE] mirrors the [X%](show percentage if available) of [CAREER] professionals who [DEVASTATING OUTCOME]."
2. "[X%] of [CAREER] professionals with [USER STRUGGLE] end up [CONCERNING RESULT] - you're following the same pattern."
3. "The harsh reality: [USER STRUGGLE] leads [X%] of [CAREER] aspirants to [FAILURE/SETBACK]."

FOURTH INSIGHT: Offer hope and mention CareerRoadmap as the solution.
4. "With CareerRoadmap, you can avoid these pitfalls and increase your [CAREER] success rate by [X%](between 80%-90%)."

Requirements:
- First 3 insights: NO mention of solutions, only problems/risks
- Reference user data: ${profilingData.missedOpportunities}, ${
      profilingData.hoursWasted
    }, ${profilingData.followingRoadmap}, ${profilingData.careerConfidence}
- Each insight exactly 15-18 words
- Build psychological pressure that makes roadmap feel essential
- Fourth insight provides relief with CareerRoadmap solution

PROFILING STRUGGLES:
- Missed opportunities: ${profilingData.missedOpportunities}
- Hours wasted weekly: ${profilingData.hoursWasted}
- Following roadmap: ${profilingData.followingRoadmap}
- Career confidence: ${profilingData.careerConfidence}
- Competition level awareness: ${profilingData.competitionLevel}
- Time urgency: ${profilingData.timeToAct}

CAREER & PROFILE DATA:
- Target career: ${career}
- Educational stage: ${body.educationalStage || "N/A"}
- Industry knowledge: ${body.industryKnowledgeLevel || "N/A"}
- Practical experience: ${body.practicalExperience || "N/A"}
- Academic strengths: ${body.academicStrengths || "N/A"}
- Learning difficulty: ${body.difficulty || "N/A"}
- Mentorship status: ${body.mentorshipAndNetworkStatus || "N/A"}
- Family expectations: ${body.culturalFamilyExpectations || "N/A"}

Return exactly: { "insights": ["...", "...", "...", "..."] }`;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_TAG;
    if (!apiKey) throw new Error("Gemini API key not configured");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 180,
          topP: 0.8,
        },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Gemini API error: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let insights: string[] = [];
    try {
      let clean = text;
      // strip code fences
      const codeBlockMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (codeBlockMatch) clean = codeBlockMatch[1].trim();
      // extract JSON object if present
      const objMatch = clean.match(/(\{[\s\S]*\})/);
      if (objMatch) clean = objMatch[1];
      const parsed = JSON.parse(clean);
      if (parsed && Array.isArray(parsed.insights)) {
        insights = parsed.insights.slice(0, 4).map(String);
      } else if (Array.isArray(parsed) && parsed.length === 4) {
        insights = parsed.slice(0, 4).map(String);
      }
    } catch (e) {
      console.error("Failed to parse model response:", e);
    }

    // Problem-focused insights with final solution
    if (!insights || insights.length !== 4) {
      insights = [
        `Your ${profilingData.careerConfidence} confidence mirrors the 78% of ${career} professionals who struggle with career direction throughout their lives.`,
        `73% of ${career} professionals with ${profilingData.missedOpportunities} missed opportunities end up in unfulfilling roles - you're following the same pattern.`,
        `The harsh reality: ${profilingData.hoursWasted} wasted weekly leads 69% of ${career} aspirants to delayed career milestones and regret.`,
        `With CareerRoadmap, you can avoid these pitfalls and increase your ${career} success rate by 91% through structured guidance.`,
      ];
    }

    return NextResponse.json({ insights });
  } catch (err) {
    console.error("Error in generate-insights API:", err);
    return NextResponse.json({
      insights: [
        "67% of professionals in competitive fields face job displacement within 5 years due to automation and market changes. Without proper preparation, you risk joining this statistic. CareerRoadmap increases your survival rate by 85% through strategic future-proofing.",
        "Students missing opportunities and wasting time weekly are 73% more likely to fall behind in today's competitive job market. CareerRoadmap eliminates this inefficiency by 92% through focused learning.",
        "82% of career aspirants fail to secure desired positions due to skill gaps and poor guidance. CareerRoadmap bridges this gap with 89% success through industry-aligned preparation.",
        "Market competition increases 40% annually, making timing critical for career success. CareerRoadmap accelerates your advantage by 94% through strategic positioning.",
      ],
    });
  }
}
