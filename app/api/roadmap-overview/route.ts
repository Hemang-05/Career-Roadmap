// import { NextResponse } from "next/server";
// import { supabase } from "@/utils/supabase/supabaseClient";

// export const runtime = 'nodejs';

// async function generateOverview(prompt: string): Promise<string> {
//   const apiKey = process.env.GEMINI_API_KEY;
//   const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp-1219:generateContent?key=${apiKey}`;

//   const res = await fetch(url, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       contents: [
//         {
//           parts: [
//             {
//               text: `You are Careeroadmap's AI career advisor. Generate a personalized career overview and introduction for a student. 
              
//               Respond in a conversational, encouraging tone as if you're speaking directly to the student. Structure your response as a cohesive overview (not JSON) that includes:
              
//               1. A warm, personalized greeting acknowledging their career choice
//               2. An assessment of their current situation and strengths
//               3. A brief overview of what their chosen career path entails
//               4. Key opportunities and challenges they might face
//               5. Encouragement about their journey ahead
//               6. A transition statement preparing them for the detailed roadmap
              
//               Keep the response to 3-4 paragraphs, motivational yet realistic, and tailored to their specific profile.
              
//               ${prompt}`
//             }
//           ],
//         },
//       ],
//       generationConfig: {
//         temperature: 0.7,
//         topP: 1.0,
//         topK: 0,
//       }
//     }),
//   });

//   const data = await res.json();
//   if (!data.candidates || data.candidates.length === 0) {
//     console.error("Empty response from Gemini API:", data);
//     throw new Error("No candidates returned from Gemini API");
//   }

//   return data.candidates[0].content.parts[0].text as string;
// }

// export async function POST(request: Request) {
//   try {
//     const { clerk_id } = await request.json();
//     if (!clerk_id) {
//       return NextResponse.json({ error: "Missing clerk_id" }, { status: 400 });
//     }

//     // Lookup user_id
//     const { data: userRecord, error: userError } = await supabase
//       .from("users")
//       .select("id")
//       .eq("clerk_id", clerk_id)
//       .single();
    
//     if (userError || !userRecord) {
//       return NextResponse.json({ error: "User record not found" }, { status: 500 });
//     }
    
//     const user_id = userRecord.id;

//     // Fetch career_info
//     const { data: careerInfo, error: careerInfoError } = await supabase
//       .from("career_info")
//       .select(`
//         desired_career,
//         residing_country,
//         spending_capacity,
//         move_abroad,
//         preferred_abroad_country,
//         educational_stage,
//         school_grade,
//         school_stream,
//         college_year,
//         college_degree,
//         practical_experience,
//         academic_strengths,
//         extracurricular_activities,
//         industry_knowledge_level,
//         preferred_learning_style,
//         role_model_influences,
//         cultural_family_expectations,
//         mentorship_and_network_status,
//         preferred_language,
//         preferred_work_environment,
//         long_term_aspirations,
//         difficulty
//       `)
//       .eq("user_id", user_id)
//       .single();
    
//     if (careerInfoError || !careerInfo) {
//       return NextResponse.json({ error: "Career info record not found" }, { status: 500 });
//     }

//     const {
//       desired_career,
//       residing_country,
//       spending_capacity,
//       move_abroad,
//       preferred_abroad_country,
//       educational_stage,
//       school_grade,
//       school_stream,
//       college_year,
//       college_degree,
//       practical_experience,
//       academic_strengths,
//       extracurricular_activities,
//       industry_knowledge_level,
//       preferred_learning_style,
//       role_model_influences,
//       cultural_family_expectations,
//       mentorship_and_network_status,
//       preferred_language,
//       preferred_work_environment,
//       long_term_aspirations,
//       difficulty,
//     } = careerInfo;

//     if (!desired_career) {
//       return NextResponse.json({ error: "Desired career not found" }, { status: 400 });
//     }

//     // Build the overview prompt
//     let overviewPrompt = `Generate a personalized career overview for a student who wants to pursue "${desired_career}". 
    
//     Student Profile:
//     - Educational Stage: ${educational_stage}${
//       educational_stage === 'school' 
//         ? ` (Grade: ${school_grade}, Stream: ${school_stream})` 
//         : ` (Year: ${college_year}, Degree: ${college_degree})`
//     }
//     - Location: ${residing_country}
//     - Budget: ${spending_capacity}
//     - Move Abroad: ${move_abroad ? `Yes, prefers ${preferred_abroad_country || 'suggestions'}` : 'No'}
//     - Practical Experience: ${practical_experience}
//     - Academic Strengths: ${academic_strengths}
//     - Extracurricular Activities: ${extracurricular_activities}
//     - Industry Knowledge: ${industry_knowledge_level}
//     - Learning Style: ${preferred_learning_style}
//     - Role Models: ${role_model_influences}
//     - Family Expectations: ${cultural_family_expectations}
//     - Network Status: ${mentorship_and_network_status}
//     - Preferred Language: ${preferred_language}
//     - Work Environment: ${preferred_work_environment}
//     - Long-term Goals: ${long_term_aspirations}
//     - Difficulty Preference: ${difficulty}
    
//     Create an encouraging, personalized overview that makes the student excited about their journey ahead.`;

//     // Generate overview
//     const overviewText = await generateOverview(overviewPrompt);

//     // NEW: Wrap the string in a JSONB object
//     const overviewData = {
//         career_overview: overviewText,
//         generated_at: new Date().toISOString(),
//         prompt_version: "v1.0",
//         user_context: {
//           educational_stage: educational_stage,
//           difficulty: difficulty,
//           desired_career: desired_career,
//           residing_country: residing_country
//         }
//       };

//       const { error: updateError } = await supabase
//       .from("career_info")
//       .update({ 
//         overview: overviewData, // JSONB object, not string
//         updated_at: new Date().toISOString() 
//       })
//       .eq("user_id", user_id);

//     if (updateError) {
//       console.error("Error updating career_info with overview:", updateError);
//       return NextResponse.json({ error: updateError.message }, { status: 500 });
//     }

//     // ✅ UPDATED: Return the full object for frontend use
//     return NextResponse.json({ 
//       success: true, 
//       overview: overviewData // Return the full object
//     });

//   } catch (err: any) {
//     console.error("Error in POST /api/roadmap-overview:", err);
//     return NextResponse.json({ 
//       error: "Internal Server Error", 
//       details: err.message || err 
//     }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabaseClient";

export const runtime = 'nodejs';

async function generateOverview(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY_OVERVIEW;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `You are Careeroadmap's AI career advisor. Generate a personalized career overview for a student in exactly two parts: "Overview" and "CareerData".

**Response Format Required:**

**Part 1: Overview**
- Write exactly 8-10 lines (no more, no less)
- Each line should be a complete sentence about what it takes to succeed in their desired career
- Focus on concepts, mindset, and general skills (DO NOT mention specific technologies, courses, or tools)
- Make it personal and motivational
- Cover: foundation needed, core concepts, practical skills, mindset, and success factors
- Write in a conversational, encouraging tone

**Part 2: CareerData** 
- **AvgSalaryIndia**: "₹X - ₹Y LPA"
- **AvgSalaryGlobal**: "$A - $B per year" 
- **HotSpecializations**: ["Spec1", "Spec2", "Spec3"]
- **TopHiringCompanies**: ["Company1", "Company2", "Company3", "Company4"]

**Example Output Structure:**
Overview:
Being an AI engineer means building systems that learn from data to solve real problems.
You need a strong computer-science foundation and logical problem-solving skills.
A deep understanding of mathematical reasoning underpins model design and behavior.
Know how different model families work and when to apply them effectively.
Working well with messy real-world data — cleaning, exploring, and shaping it — is essential.
Evaluation, experimentation, and clear metrics guide progress and build trust.
Good engineering practices ensure models are reliable and reproducible in production.
Consider ethical, fairness, and privacy implications throughout the development process.
Curiosity, continuous learning, and clear communication tie everything together.

CareerData:
AvgSalaryIndia: "₹10 - ₹35 LPA"
AvgSalaryGlobal: "$120,000 - $200,000 per year"
HotSpecializations: ["Machine Learning", "Deep Learning", "NLP"]
TopHiringCompanies: ["Google", "Microsoft", "OpenAI", "NVIDIA"]

${prompt}`
            }
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
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

  return data.candidates[0].content.parts[0].text as string;
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
      .select("id, full_name")
      .eq("clerk_id", clerk_id)
      .single();
    
    if (userError || !userRecord) {
      return NextResponse.json({ error: "User record not found" }, { status: 500 });
    }
    
    const user_id = userRecord.id;

    // Fetch career_info with all relevant fields
    const { data: careerInfo, error: careerInfoError } = await supabase
      .from("career_info")
      .select(`
        desired_career,
        residing_country,
        spending_capacity,
        move_abroad,
        preferred_abroad_country,
        educational_stage,
        school_grade,
        school_stream,
        college_year,
        college_degree,
        practical_experience,
        academic_strengths,
        extracurricular_activities,
        industry_knowledge_level,
        preferred_learning_style,
        role_model_influences,
        cultural_family_expectations,
        mentorship_and_network_status,
        preferred_language,
        preferred_work_environment,
        long_term_aspirations,
        difficulty,
        parent_email,
        current_class,
        college_student,
        previous_experience
      `)
      .eq("user_id", user_id)
      .single();
    
    if (careerInfoError || !careerInfo) {
      return NextResponse.json({ error: "Career info record not found" }, { status: 500 });
    }

    const {
      desired_career,
      residing_country,
      educational_stage,
      school_grade,
      school_stream,
      college_year,
      college_degree,
      practical_experience,
      academic_strengths,
      industry_knowledge_level,
      long_term_aspirations,
      difficulty,
    } = careerInfo;

    if (!desired_career) {
      return NextResponse.json({ error: "Desired career not found" }, { status: 400 });
    }

    // ✅ SIMPLIFIED PROMPT for overview generation
    const overviewPrompt = `**Student Profile:**
- **Name:** ${userRecord.full_name || 'Student'}
- **Desired Career:** ${desired_career}
- **Current Status:** ${educational_stage}${
  educational_stage === 'school' 
    ? ` - Grade ${school_grade}${school_stream ? ` (${school_stream} stream)` : ''}` 
    : educational_stage === 'college'
    ? ` - ${college_year} studying ${college_degree}`
    : ` - ${educational_stage} learner`
}
- **Location:** ${residing_country}
- **Academic Strengths:** ${academic_strengths}
- **Practical Experience:** ${practical_experience}
- **Industry Knowledge:** ${industry_knowledge_level}
- **Long-term Goals:** ${long_term_aspirations}
- **Learning Intensity:** ${difficulty}

Create a personalized career overview that gives them the gist of what it takes to become a ${desired_career}, focusing on concepts and mindset rather than specific technologies.`;

    // Generate overview
    const overviewText = await generateOverview(overviewPrompt);

    // Wrap in JSONB object
    const overviewData = {
      career_overview: overviewText,
      generated_at: new Date().toISOString(),
      prompt_version: "v4.0", // Updated for simple overview format
      user_context: {
        educational_stage: educational_stage,
        current_level: educational_stage === 'school' ? school_grade : college_year,
        difficulty: difficulty,
        desired_career: desired_career,
        residing_country: residing_country,
        format_type: "simple_overview"
      }
    };

    const { error: updateError } = await supabase
      .from("career_info")
      .update({ 
        overview: overviewData,
        updated_at: new Date().toISOString() 
      })
      .eq("user_id", user_id);

    if (updateError) {
      console.error("Error updating career_info with overview:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      overview: overviewData
    });

  } catch (err: any) {
    console.error("Error in POST /api/roadmap-overview:", err);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: err.message || err 
    }, { status: 500 });
  }
}

  