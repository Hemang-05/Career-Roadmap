// // app/api/skill-verify/route.ts
// import { NextResponse } from "next/server";
// import { supabase } from "@/utils/supabase/supabaseClient";

// export const runtime = "nodejs";

// type GeminiResponse = {
//   candidates?: Array<{ content: { parts: Array<{ text: string }> } }>;
// };

// // Google Drive API Functions
// const GOOGLE_DRIVE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY;

// function extractGoogleDriveFileId(url: string): string | null {
//   const patterns = [
//     /\/d\/([a-zA-Z0-9_-]+)/,
//     /id=([a-zA-Z0-9_-]+)/,
//     /file\/d\/([a-zA-Z0-9_-]+)/
//   ];
  
//   for (const pattern of patterns) {
//     const match = url.match(pattern);
//     if (match) return match[1];
//   }
  
//   return null;
// }

// async function readGoogleDriveContent(url: string): Promise<string | null> {
//   if (!GOOGLE_DRIVE_API_KEY) {
//     console.error('Google Drive API key not configured');
//     return null;
//   }
  
//   const fileId = extractGoogleDriveFileId(url);
//   if (!fileId) {
//     return null;
//   }
  
//   try {
//     const metadataUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?key=${GOOGLE_DRIVE_API_KEY}`;
//     const metadataResponse = await fetch(metadataUrl);
    
//     if (!metadataResponse.ok) {
//       console.error('Failed to access file metadata:', metadataResponse.status);
//       return null;
//     }
    
//     const metadata = await metadataResponse.json();
    
//     const contentUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${GOOGLE_DRIVE_API_KEY}`;
//     const contentResponse = await fetch(contentUrl);
    
//     if (!contentResponse.ok) {
//       console.error('Failed to access file content:', contentResponse.status);
//       return null;
//     }
    
//     if (metadata.mimeType.includes('text') || metadata.mimeType.includes('json')) {
//       return await contentResponse.text();
//     } else if (metadata.mimeType.includes('pdf')) {
//       return `PDF Document: ${metadata.name}. Content: This is a PDF file that contains information relevant to the proof. The document name suggests it contains educational or project-related content.`;
//     } else if (metadata.mimeType.includes('image')) {
//       return `Image Document: ${metadata.name}. Content: This is an image file that likely contains visual proof such as certificates, screenshots, or diagrams related to the learning objective.`;
//     } else if (metadata.mimeType.includes('google-apps.document')) {
//       const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain&key=${GOOGLE_DRIVE_API_KEY}`;
//       const exportResponse = await fetch(exportUrl);
//       if (exportResponse.ok) {
//         return await exportResponse.text();
//       }
//     }
    
//     return `File type: ${metadata.mimeType}, Name: ${metadata.name}. Size: ${metadata.size || 'unknown'} bytes`;
    
//   } catch (error) {
//     console.error('Google Drive API error:', error);
//     return null;
//   }
// }

// // Extract phase context from roadmap (now includes skill_name and context)
// function extractPhaseFromRoadmap(roadmap: any, proofRow: any) {
//   try {
//     if (!roadmap || typeof roadmap !== "object") {
//       return null;
//     }

//     const y = proofRow.roadmap_year_index;
//     const p = proofRow.phase_index;

//     if (y != null && roadmap.yearly_roadmap?.[y]) {
//       const year = roadmap.yearly_roadmap[y];
      
//       if (p != null && year.phases?.[p]) {
//         const phase = year.phases[p];

//         const phaseContext = {
//           year_label: year.year || null,
//           year_overview: year.overview || null,
//           full_phase: phase,
//           current_task_index: proofRow.task_index || null,
//           // Extract skill_name and context directly from roadmap
//           skill_name: phase.skill_name || 'General Programming',
//           context: phase.context || 'Learning phase context not available'
//         };
        
//         return phaseContext;
//       }
//     }

//     return null;
//   } catch (err) {
//     console.error('Error extracting phase from roadmap:', err);
//     return null;
//   }
// }

// // Build comprehensive analysis prompt (enhanced with roadmap context) - SUGGESTIONS REMOVED
// function buildComprehensiveAnalysisPrompt(proofUrl: string, phaseContext: any, extractedContent?: string | null, skillName?: string): string {
//   const inputs: string[] = [];

//   inputs.push(`COMPREHENSIVE PROOF ANALYSIS REQUEST`);
//   inputs.push(`\nPROOF URL: ${proofUrl}`);
  
//   if (skillName) {
//     inputs.push(`\nSKILL CONTEXT: This proof is for the skill "${skillName}" which is predetermined for this learning phase.`);
//   }
  
//   // Add context from roadmap
//   if (phaseContext?.context) {
//     inputs.push(`\nPHASE CONTEXT: ${phaseContext.context}`);
//   }
  
//   if (extractedContent) {
//     inputs.push(`\nEXTRACTED CONTENT FROM DOCUMENT:`);
//     inputs.push(extractedContent.slice(0, 4000));
//     inputs.push(`\nUSE THE ABOVE EXTRACTED CONTENT FOR ANALYSIS (do not try to access the URL)`);
//   } else {
//     inputs.push(`\nTASK 1 - URL CONTENT EXTRACTION:`);
//     inputs.push(`Extract and analyze the complete content from the above URL using your URL context capabilities.`);
//   }
  
//   inputs.push(`\nTASK 2 - LEARNING PHASE CONTEXT:`);
//   if (phaseContext?.year_label) {
//     inputs.push(`Academic Year: ${phaseContext.year_label}`);
//   }
//   if (phaseContext?.year_overview) {
//     inputs.push(`Year Overview: ${phaseContext.year_overview}`);
//   }
  
//   if (phaseContext?.full_phase) {
//     inputs.push(`\nCOMPLETE PHASE STRUCTURE:`);
//     const phaseJson = JSON.stringify(phaseContext.full_phase, null, 2);
//     inputs.push(phaseJson);
//   }

//   inputs.push(`\nTASK 3 - COMPREHENSIVE ANALYSIS:`);
//   inputs.push(`Perform a complete analysis using both the ${extractedContent ? 'extracted content' : 'URL content'} and phase context:`);
  
//   inputs.push(`\nANALYSIS CRITERIA:`);
//   inputs.push(`1. CONTENT ANALYSIS: What does the ${extractedContent ? 'extracted content' : 'URL'} contain?`);
//   inputs.push(`2. SPECIFIC PROOF TYPE DETECTION: Classify this proof with MAXIMUM SPECIFICITY using this format:`);
//   inputs.push(`   
//    PROFILE TYPES:
//    - leetcode_profile: LeetCode user profiles showing solved problems
//    - github_profile: GitHub user profiles or main profile pages
//    - linkedin_profile: LinkedIn professional profiles
//    - hackerrank_profile: HackerRank user profiles
//    - codeforces_profile: Codeforces competitive programming profiles
//    - codechef_profile: CodeChef competitive programming profiles
   
//    CERTIFICATE TYPES (use skill_certificate format):
//    - python_certificate: Python programming certificates
//    - javascript_certificate: JavaScript programming certificates  
//    - react_certificate: React.js certificates
//    - nodejs_certificate: Node.js certificates
//    - sql_certificate: Database/SQL certificates
//    - aws_certificate: AWS cloud certificates
//    - docker_certificate: Docker containerization certificates
//    - machine_learning_certificate: ML/AI certificates
//    - data_science_certificate: Data science certificates
//    - web_development_certificate: General web development certificates
//    - [skill]_certificate: Any other skill-specific certificate
   
//    PROJECT TYPES:
//    - github_repository: Code repositories on GitHub
//    - deployed_website: Live websites/web applications
//    - mobile_app: Mobile application projects
//    - desktop_application: Desktop software projects
//    - portfolio_website: Personal portfolio websites
//    - api_project: REST API or backend projects
//    - machine_learning_project: ML/AI projects
//    - data_analysis_project: Data science/analysis projects
   
//    DOCUMENT TYPES:
//    - research_paper: Academic research papers
//    - technical_documentation: Technical docs, tutorials
//    - assignment_submission: Academic assignments
//    - project_report: Project documentation/reports
   
//    COMPETITION TYPES:
//    - hackathon_submission: Hackathon projects/results
//    - coding_contest_result: Programming contest results
//    - olympiad_certificate: Academic olympiad certificates
//    - competition_ranking: Contest ranking screenshots
   
//    COURSE TYPES:
//    - udemy_completion: Udemy course certificates
//    - coursera_completion: Coursera course certificates
//    - edx_completion: edX course certificates
//    - pluralsight_completion: Pluralsight certificates
//    - online_bootcamp: Coding bootcamp certificates
   
//    OTHER TYPES:
//    - internship_certificate: Internship completion certificates
//    - recommendation_letter: Professional recommendations
//    - screenshot_proof: Screenshots of achievements
//    - other: Anything that doesn't fit above categories`);
   
//   inputs.push(`3. QUALITY ASSESSMENT: How strong is this proof for demonstrating the skill "${skillName || 'the learning objectives'}"?`);
//   inputs.push(`4. PHASE RELEVANCE: How well does this proof relate to the current learning phase objectives?`);

//   inputs.push(`\nSCORING GUIDELINES (30-100 points):`);
//   inputs.push(`90-100: Exceptional - Advanced projects, deployed applications, comprehensive portfolios, professional work`);
//   inputs.push(`70-89: Strong - Course certificates, substantial repositories, meaningful contributions, good depth`);
//   inputs.push(`50-69: Good - Practice problems, tutorial completions, basic projects, demonstrable progress`);
//   inputs.push(`30-49: Basic - Simple exercises, minimal profiles, introductory work, limited depth`);

//   inputs.push(`\nCONTEXT-AWARE CONSIDERATIONS:`);
//   inputs.push(`- Assess proof objectively regardless of type (user has complete freedom)`);
//   inputs.push(`- Use the MOST SPECIFIC type possible - avoid generic categories`);
//   inputs.push(`- For certificates, always use [skill]_certificate format`);
//   inputs.push(`- For profiles, specify the platform (leetcode_profile, github_profile, etc.)`);
//   inputs.push(`- Analyze actual content to determine the specific skill/platform involved`);

//   inputs.push(`\nOUTPUT REQUIREMENTS:`);
//   inputs.push(`Respond with ONLY a valid JSON object in this exact format:`);
//   inputs.push(`{`);
//   inputs.push(`  "verification_status": "verified" | "uncertain",`);
//   inputs.push(`  "proof_weightage": <integer between 30-100>,`);
//   inputs.push(`  "proof_type": "<use the MOST SPECIFIC type from the categories above>",`);
//   inputs.push(`  "content_summary": "<brief summary of what was found>",`);
//   inputs.push(`  "phase_relevance": "<how this proof relates to current learning phase>",`);
//   inputs.push(`  "verification_reason": "<detailed explanation of assessment and scoring rationale>"`);
//   inputs.push(`}`);

//   inputs.push(`\nIMPORTANT: Provide ONLY the JSON response, no additional text or markdown formatting.`);

//   return inputs.join("\n");
// }

// // Extract JSON from markdown response
// function extractJsonFromMarkdown(rawText: string): string | null {
//   let cleaned = rawText.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();

//   // Remove markdown code fences with optional 'json' language tag
//       cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '');
//       cleaned = cleaned.replace(/\s*```$/g, '');
  
//   const firstBrace = cleaned.indexOf('{');
//   const lastBrace = cleaned.lastIndexOf('}');
  
//   if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
//     return null;
//   }
  
//   return cleaned.substring(firstBrace, lastBrace + 1);
// }

// // Main POST function - SUGGESTIONS REMOVED
// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const proof_id = body?.proof_id;

//     if (!proof_id) {
//       return NextResponse.json({ error: "Missing proof_id" }, { status: 400 });
//     }

//     const { data: proofRow, error: proofError } = await supabase
//       .from("proofs")
//       .select("*")
//       .eq("id", proof_id)
//       .single();

//     if (proofError || !proofRow) {
//       console.error('Proof fetch error:', proofError);
//       return NextResponse.json({ error: "Proof not found" }, { status: 404 });
//     }

//     if (proofRow.verification_status === "verified") {
//       return NextResponse.json({ 
//         success: true, 
//         message: "Already verified", 
//         proof_id 
//       }, { status: 200 });
//     }

//     // Extract phase context from roadmap
//     const { data: careerInfo, error: careerErr } = await supabase
//       .from("career_info")
//       .select("roadmap")
//       .eq("user_id", proofRow.user_id)
//       .single();

//     const roadmap = careerErr || !careerInfo ? null : careerInfo.roadmap;
//     const phaseContextData = extractPhaseFromRoadmap(roadmap, proofRow);
    
//     // Get skill name and context directly from roadmap
//     let skillName = 'General Programming';
//     let phaseContext = phaseContextData?.context || 'Learning phase context not available';

//     if (proofRow.phase_index !== null && proofRow.phase_index !== undefined) {
//       if (phaseContextData && phaseContextData.skill_name) {
//         skillName = phaseContextData.skill_name;
//         console.log('Using skill name from roadmap:', skillName);
//         console.log('Phase context:', phaseContext);
//       } else {
//         console.log('No skill_name found in roadmap phase, using default');
//       }
//     } else {
//       console.log('No phase_index found, using default skill name');
//     }

//     console.log('Final skill name for this proof:', skillName);
    
//     // Try Google Drive API first
//     let extractedContent: string | null = null;
//     if (proofRow.url.includes('drive.google.com')) {
//       extractedContent = await readGoogleDriveContent(proofRow.url);
//       if (extractedContent) {
//         console.log('Successfully extracted content from Google Drive');
//       }
//     }

//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) {
//       await supabase.from("proofs").update({
//         verification_status: "uncertain",
//         verification_confidence: 0,
//         verification_reason: "Server configuration error",
//         skill_name: null,
//         updated_at: new Date().toISOString(),
//       }).eq("id", proof_id);
//       return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
//     }

//     // Build prompt with predetermined skill name and context from roadmap
//     const prompt = buildComprehensiveAnalysisPrompt(
//       proofRow.url, 
//       phaseContextData, 
//       extractedContent, 
//       skillName
//     );

//     const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
//     const requestBody = {
//       contents: [{ parts: [{ text: prompt }] }],
//       tools: extractedContent ? [] : [{ urlContext: {} }],
//       generationConfig: {
//         temperature: 0.2,
//         topP: 0.8,
//         topK: 40,
//         maxOutputTokens: 8000
//       }
//     };
    
//     const res = await fetch(endpoint, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(requestBody),
//     });

//     if (!res.ok) {
//       const errorText = await res.text();
//       await supabase.from("proofs").update({
//         verification_status: "uncertain",
//         verification_confidence: 0,
//         verification_reason: `Assessment service error: ${res.status}`,
//         skill_name: null,
//         updated_at: new Date().toISOString(),
//       }).eq("id", proof_id);

//       return NextResponse.json({ 
//         error: "Assessment service unavailable", 
//         status: res.status,
//         details: errorText 
//       }, { status: 502 });
//     }
    
//     const data: GeminiResponse = await res.json();
//     const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
//     if (!rawText) {
//       await supabase.from("proofs").update({
//         verification_status: "uncertain",
//         verification_confidence: 0,
//         verification_reason: "No response from assessment service",
//         skill_name: null,
//         updated_at: new Date().toISOString(),
//       }).eq("id", proof_id);
//       return NextResponse.json({ error: "Empty assessment response" }, { status: 500 });
//     }

//     const extractedJson = extractJsonFromMarkdown(rawText);
    
//     if (!extractedJson) {
//       await supabase.from("proofs").update({
//         verification_status: "uncertain",
//         verification_confidence: 0,
//         verification_reason: "Could not parse assessment response",
//         skill_name: null,
//         updated_at: new Date().toISOString(),
//       }).eq("id", proof_id);
//       return NextResponse.json({ 
//         error: "Assessment format error", 
//         raw_response: rawText.slice(0, 500) 
//       }, { status: 500 });
//     }

//     let parsed: any;
//     try {
//       parsed = JSON.parse(extractedJson);
//     } catch (parseErr) {
//       await supabase.from("proofs").update({
//         verification_status: "uncertain",
//         verification_confidence: 0,
//         verification_reason: "Assessment parsing failed",
//         skill_name: null,
//         updated_at: new Date().toISOString(),
//       }).eq("id", proof_id);
//       return NextResponse.json({ 
//         error: "JSON parsing error", 
//         raw_json: extractedJson.slice(0, 500) 
//       }, { status: 500 });
//     }

//     // Extract response fields using predetermined skill name - SUGGESTIONS REMOVED
//     const verification_status = parsed.verification_status || "verified";
//     const proof_weightage = Math.round(Math.max(30, Math.min(100, 
//       typeof parsed.proof_weightage === "number" ? parsed.proof_weightage : 50
//     )));
//     const skill_detected = skillName; // Use skill name from roadmap
//     const proof_type = parsed.proof_type || 'other';
//     const phase_relevance = parsed.phase_relevance || 'Analyzed independently';
//     const content_summary = parsed.content_summary || 'Content analyzed';
//     const verification_reason = (parsed.verification_reason || "Proof assessed comprehensively")
//       .replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
    
//     const metadata = {
//       phase_relevance: phase_relevance,
//       content_summary: content_summary,
//       assessed_with_phase_context: !!phaseContextData,
//       phase_context: phaseContextData?.context || null,
//       url_context_used: !extractedContent,
//       google_drive_api_used: !!extractedContent,
//       analysis_method: extractedContent ? "google_drive_api_extraction" : "url_context_tool",
//       ai_detected_type: proof_type,
//       skill_source: "roadmap_phase"
//     };
    
//     // Update database with skill name from roadmap - NO SUGGESTIONS
//     const { error: updateErr } = await supabase
//       .from("proofs")
//       .update({
//         verification_status,
//         verification_confidence: proof_weightage,
//         verification_reason,
//         skill_name: skill_detected,
//         type: proof_type,
//         metadata,
//         updated_at: new Date().toISOString(),
//       })
//       .eq("id", proof_id);

//     if (updateErr) {
//       return NextResponse.json({ 
//         error: "Database update failed", 
//         details: updateErr.message 
//       }, { status: 500 });
//     }

//     return NextResponse.json({ 
//       success: true, 
//       proof_id, 
//       skill_name: skill_detected,
//       proof_type: proof_type,
//       proof_weightage,
//       phase_relevance,
//       content_summary,
//       verification_reason,
//       context_enhanced: !!phaseContextData,
//       analysis_method: extractedContent ? "google_drive_api_extraction" : "url_context_tool",
//       google_drive_used: !!extractedContent
//     });

//   } catch (error: any) {
//     console.error('Fatal error in POST /api/skill-verify:', error);
//     return NextResponse.json({ 
//       error: "Internal server error", 
//       details: error?.message || String(error) 
//     }, { status: 500 });
//   }
// }

// app/api/skill-verify/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabaseClient";

export const runtime = "nodejs";

type GeminiResponse = {
  candidates?: Array<{ content: { parts: Array<{ text: string }> } }>;
};

// Google Drive API Functions
const GOOGLE_DRIVE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY;

// YouTube video detection function
function isYouTubeVideo(url: string): boolean {
  const youtubePatterns = [
    /youtube\.com\/watch\?v=/,
    /youtu\.be\//,
    /youtube\.com\/embed\//,
    /youtube\.com\/v\//,
    /youtube\.com\/shorts\//
  ];
  return youtubePatterns.some(pattern => pattern.test(url));
}

// Generate random score between 50-80 for YouTube videos
function getRandomYouTubeScore(): number {
  return Math.floor(Math.random() * (80 - 50 + 1)) + 50;
}

function extractGoogleDriveFileId(url: string): string | null {
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /file\/d\/([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

async function readGoogleDriveContent(url: string): Promise<string | null> {
  if (!GOOGLE_DRIVE_API_KEY) {
    console.error('Google Drive API key not configured');
    return null;
  }
  
  const fileId = extractGoogleDriveFileId(url);
  if (!fileId) {
    return null;
  }
  
  try {
    const metadataUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?key=${GOOGLE_DRIVE_API_KEY}`;
    const metadataResponse = await fetch(metadataUrl);
    
    if (!metadataResponse.ok) {
      console.error('Failed to access file metadata:', metadataResponse.status);
      return null;
    }
    
    const metadata = await metadataResponse.json();
    
    const contentUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${GOOGLE_DRIVE_API_KEY}`;
    const contentResponse = await fetch(contentUrl);
    
    if (!contentResponse.ok) {
      console.error('Failed to access file content:', contentResponse.status);
      return null;
    }
    
    if (metadata.mimeType.includes('text') || metadata.mimeType.includes('json')) {
      return await contentResponse.text();
    } else if (metadata.mimeType.includes('pdf')) {
      return `PDF Document: ${metadata.name}. Content: This is a PDF file that contains information relevant to the proof. The document name suggests it contains educational or project-related content.`;
    } else if (metadata.mimeType.includes('image')) {
      return `Image Document: ${metadata.name}. Content: This is an image file that likely contains visual proof such as certificates, screenshots, or diagrams related to the learning objective.`;
    } else if (metadata.mimeType.includes('google-apps.document')) {
      const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain&key=${GOOGLE_DRIVE_API_KEY}`;
      const exportResponse = await fetch(exportUrl);
      if (exportResponse.ok) {
        return await exportResponse.text();
      }
    }
    
    return `File type: ${metadata.mimeType}, Name: ${metadata.name}. Size: ${metadata.size || 'unknown'} bytes`;
    
  } catch (error) {
    console.error('Google Drive API error:', error);
    return null;
  }
}

// Extract phase context from roadmap (now includes skill_name and context)
function extractPhaseFromRoadmap(roadmap: any, proofRow: any) {
  try {
    if (!roadmap || typeof roadmap !== "object") {
      return null;
    }

    const y = proofRow.roadmap_year_index;
    const p = proofRow.phase_index;

    if (y != null && roadmap.yearly_roadmap?.[y]) {
      const year = roadmap.yearly_roadmap[y];
      
      if (p != null && year.phases?.[p]) {
        const phase = year.phases[p];

        const phaseContext = {
          year_label: year.year || null,
          year_overview: year.overview || null,
          full_phase: phase,
          current_task_index: proofRow.task_index || null,
          // Extract skill_name and context directly from roadmap
          skill_name: phase.skill_name || 'General Programming',
          context: phase.context || 'Learning phase context not available'
        };
        
        return phaseContext;
      }
    }

    return null;
  } catch (err) {
    console.error('Error extracting phase from roadmap:', err);
    return null;
  }
}

// Build comprehensive analysis prompt (without URL context tool)
function buildComprehensiveAnalysisPrompt(proofUrl: string, phaseContext: any, extractedContent?: string | null, skillName?: string): string {
  const inputs: string[] = [];

  inputs.push(`COMPREHENSIVE PROOF ANALYSIS REQUEST`);
  inputs.push(`\nPROOF URL: ${proofUrl}`);
  
  if (skillName) {
    inputs.push(`\nSKILL CONTEXT: This proof is for the skill "${skillName}" which is predetermined for this learning phase.`);
  }
  
  // Add context from roadmap
  if (phaseContext?.context) {
    inputs.push(`\nPHASE CONTEXT: ${phaseContext.context}`);
  }
  
  if (extractedContent) {
    inputs.push(`\nEXTRACTED CONTENT FROM DOCUMENT:`);
    inputs.push(extractedContent.slice(0, 4000));
    inputs.push(`\nUSE THE ABOVE EXTRACTED CONTENT FOR ANALYSIS`);
  } else {
    inputs.push(`\nTASK 1 - URL ANALYSIS:`);
    inputs.push(`Analyze the provided URL directly using your knowledge of common platforms, websites, and content patterns. Identify what type of proof this URL represents based on the domain, URL structure, and your understanding of various platforms (GitHub, LinkedIn, certificate providers, etc.).`);
  }
  
  inputs.push(`\nTASK 2 - LEARNING PHASE CONTEXT:`);
  if (phaseContext?.year_label) {
    inputs.push(`Academic Year: ${phaseContext.year_label}`);
  }
  if (phaseContext?.year_overview) {
    inputs.push(`Year Overview: ${phaseContext.year_overview}`);
  }
  
  if (phaseContext?.full_phase) {
    inputs.push(`\nCOMPLETE PHASE STRUCTURE:`);
    const phaseJson = JSON.stringify(phaseContext.full_phase, null, 2);
    inputs.push(phaseJson);
  }

  inputs.push(`\nTASK 3 - COMPREHENSIVE ANALYSIS:`);
  inputs.push(`Perform a complete analysis using both the ${extractedContent ? 'extracted content' : 'URL analysis'} and phase context:`);
  
  inputs.push(`\nANALYSIS CRITERIA:`);
  inputs.push(`1. CONTENT ANALYSIS: What does the ${extractedContent ? 'extracted content' : 'URL'} represent and contain?`);
  inputs.push(`2. SPECIFIC PROOF TYPE DETECTION: Classify this proof with MAXIMUM SPECIFICITY using this format:`);
  inputs.push(`   
   PROFILE TYPES:
   - leetcode_profile: LeetCode user profiles showing solved problems
   - github_profile: GitHub user profiles or main profile pages
   - linkedin_profile: LinkedIn professional profiles
   - hackerrank_profile: HackerRank user profiles
   - codeforces_profile: Codeforces competitive programming profiles
   - codechef_profile: CodeChef competitive programming profiles
   
   CERTIFICATE TYPES (use skill_certificate format):
   - python_certificate: Python programming certificates
   - javascript_certificate: JavaScript programming certificates  
   - react_certificate: React.js certificates
   - nodejs_certificate: Node.js certificates
   - sql_certificate: Database/SQL certificates
   - aws_certificate: AWS cloud certificates
   - docker_certificate: Docker containerization certificates
   - machine_learning_certificate: ML/AI certificates
   - data_science_certificate: Data science certificates
   - web_development_certificate: General web development certificates
   - [skill]_certificate: Any other skill-specific certificate
   
   PROJECT TYPES:
   - github_repository: Code repositories on GitHub
   - deployed_website: Live websites/web applications
   - mobile_app: Mobile application projects
   - desktop_application: Desktop software projects
   - portfolio_website: Personal portfolio websites
   - api_project: REST API or backend projects
   - machine_learning_project: ML/AI projects
   - data_analysis_project: Data science/analysis projects
   
   DOCUMENT TYPES:
   - research_paper: Academic research papers
   - technical_documentation: Technical docs, tutorials
   - assignment_submission: Academic assignments
   - project_report: Project documentation/reports
   
   COMPETITION TYPES:
   - hackathon_submission: Hackathon projects/results
   - coding_contest_result: Programming contest results
   - olympiad_certificate: Academic olympiad certificates
   - competition_ranking: Contest ranking screenshots
   
   COURSE TYPES:
   - udemy_completion: Udemy course certificates
   - coursera_completion: Coursera course certificates
   - edx_completion: edX course certificates
   - pluralsight_completion: Pluralsight certificates
   - online_bootcamp: Coding bootcamp certificates
   
   OTHER TYPES:
   - internship_certificate: Internship completion certificates
   - recommendation_letter: Professional recommendations
   - screenshot_proof: Screenshots of achievements
   - other: Anything that doesn't fit above categories`);
   
  inputs.push(`3. QUALITY ASSESSMENT: How strong is this proof for demonstrating the skill "${skillName || 'the learning objectives'}"?`);
  inputs.push(`4. PHASE RELEVANCE: How well does this proof relate to the current learning phase objectives?`);

  inputs.push(`\nSCORING GUIDELINES (30-100 points):`);
  inputs.push(`90-100: Exceptional - Advanced projects, deployed applications, comprehensive portfolios, professional work`);
  inputs.push(`70-89: Strong - Course certificates, substantial repositories, meaningful contributions, good depth`);
  inputs.push(`50-69: Good - Practice problems, tutorial completions, basic projects, demonstrable progress`);
  inputs.push(`30-49: Basic - Simple exercises, minimal profiles, introductory work, limited depth`);

  inputs.push(`\nCONTEXT-AWARE CONSIDERATIONS:`);
  inputs.push(`- Assess proof objectively regardless of type (user has complete freedom)`);
  inputs.push(`- Use the MOST SPECIFIC type possible - avoid generic categories`);
  inputs.push(`- For certificates, always use [skill]_certificate format`);
  inputs.push(`- For profiles, specify the platform (leetcode_profile, github_profile, etc.)`);
  inputs.push(`- Analyze the URL structure and domain to determine the specific skill/platform involved`);

  inputs.push(`\nOUTPUT REQUIREMENTS:`);
  inputs.push(`Respond with ONLY a valid JSON object in this exact format:`);
  inputs.push(`{`);
  inputs.push(`  "verification_status": "verified" | "uncertain",`);
  inputs.push(`  "proof_weightage": <integer between 30-100>,`);
  inputs.push(`  "proof_type": "<use the MOST SPECIFIC type from the categories above>",`);
  inputs.push(`  "content_summary": "<brief summary of what was found/analyzed>",`);
  inputs.push(`  "phase_relevance": "<how this proof relates to current learning phase>",`);
  inputs.push(`  "verification_reason": "<detailed explanation of assessment and scoring rationale>"`);
  inputs.push(`}`);

  inputs.push(`\nIMPORTANT: Provide ONLY the JSON response, no additional text or markdown formatting.`);

  return inputs.join("\n");
}

// Extract JSON from markdown response
function extractJsonFromMarkdown(rawText: string): string | null {
  let cleaned = rawText.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();

  // Remove markdown code fences with optional 'json' language tag
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '');
  cleaned = cleaned.replace(/\s*```$/g, '');
  
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    return null;
  }
  
  return cleaned.substring(firstBrace, lastBrace + 1);
}

// Main POST function - YouTube bypass added
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const proof_id = body?.proof_id;

    if (!proof_id) {
      return NextResponse.json({ error: "Missing proof_id" }, { status: 400 });
    }

    const { data: proofRow, error: proofError } = await supabase
      .from("proofs")
      .select("*")
      .eq("id", proof_id)
      .single();

    if (proofError || !proofRow) {
      console.error('Proof fetch error:', proofError);
      return NextResponse.json({ error: "Proof not found" }, { status: 404 });
    }

    if (proofRow.verification_status === "verified") {
      return NextResponse.json({ 
        success: true, 
        message: "Already verified", 
        proof_id 
      }, { status: 200 });
    }

    // Extract phase context from roadmap
    const { data: careerInfo, error: careerErr } = await supabase
      .from("career_info")
      .select("roadmap")
      .eq("user_id", proofRow.user_id)
      .single();

    const roadmap = careerErr || !careerInfo ? null : careerInfo.roadmap;
    const phaseContextData = extractPhaseFromRoadmap(roadmap, proofRow);
    
    // Get skill name and context directly from roadmap
    let skillName = 'General Programming';

    if (proofRow.phase_index !== null && proofRow.phase_index !== undefined) {
      if (phaseContextData && phaseContextData.skill_name) {
        skillName = phaseContextData.skill_name;
        console.log('Using skill name from roadmap:', skillName);
      } else {
        console.log('No skill_name found in roadmap phase, using default');
      }
    } else {
      console.log('No phase_index found, using default skill name');
    }

    // **YOUTUBE VIDEO BYPASS - NO AI ANALYSIS**
    if (isYouTubeVideo(proofRow.url)) {
      console.log('YouTube video detected - bypassing AI analysis');
      
      const randomScore = getRandomYouTubeScore();
      const metadata = {
        phase_relevance: "YouTube video submitted for learning phase",
        content_summary: "YouTube video content",
        assessed_with_phase_context: !!phaseContextData,
        phase_context: phaseContextData?.context || null,
        google_drive_api_used: false,
        analysis_method: "youtube_bypass",
        ai_detected_type: "youtube_video",
        skill_source: "roadmap_phase"
      };

      // Update database directly without AI analysis
      const { error: updateErr } = await supabase
        .from("proofs")
        .update({
          verification_status: "verified",
          verification_confidence: randomScore,
          verification_reason: "YouTube video automatically verified",
          skill_name: skillName,
          type: "youtube_video",
          metadata,
          updated_at: new Date().toISOString(),
        })
        .eq("id", proof_id);

      if (updateErr) {
        return NextResponse.json({ 
          error: "Database update failed", 
          details: updateErr.message 
        }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        proof_id, 
        skill_name: skillName,
        proof_type: "youtube_video",
        proof_weightage: randomScore,
        phase_relevance: "YouTube video submitted for learning phase",
        content_summary: "YouTube video content",
        verification_reason: "YouTube video automatically verified",
        context_enhanced: !!phaseContextData,
        analysis_method: "youtube_bypass",
        google_drive_used: false
      });
    }

    // **CONTINUE WITH NORMAL AI ANALYSIS FOR NON-YOUTUBE URLs**
    console.log('Final skill name for this proof:', skillName);
    
    // Try Google Drive API first
    let extractedContent: string | null = null;
    if (proofRow.url.includes('drive.google.com')) {
      extractedContent = await readGoogleDriveContent(proofRow.url);
      if (extractedContent) {
        console.log('Successfully extracted content from Google Drive');
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      await supabase.from("proofs").update({
        verification_status: "uncertain",
        verification_confidence: 0,
        verification_reason: "Server configuration error",
        skill_name: null,
        updated_at: new Date().toISOString(),
      }).eq("id", proof_id);
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Build prompt with predetermined skill name and context from roadmap
    const prompt = buildComprehensiveAnalysisPrompt(
      proofRow.url, 
      phaseContextData, 
      extractedContent, 
      skillName
    );

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8000
      }
    };
    
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errorText = await res.text();
      await supabase.from("proofs").update({
        verification_status: "uncertain",
        verification_confidence: 0,
        verification_reason: `Assessment service error: ${res.status}`,
        skill_name: null,
        updated_at: new Date().toISOString(),
      }).eq("id", proof_id);

      return NextResponse.json({ 
        error: "Assessment service unavailable", 
        status: res.status,
        details: errorText 
      }, { status: 502 });
    }
    
    const data: GeminiResponse = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!rawText) {
      await supabase.from("proofs").update({
        verification_status: "uncertain",
        verification_confidence: 0,
        verification_reason: "No response from assessment service",
        skill_name: null,
        updated_at: new Date().toISOString(),
      }).eq("id", proof_id);
      return NextResponse.json({ error: "Empty assessment response" }, { status: 500 });
    }

    const extractedJson = extractJsonFromMarkdown(rawText);
    
    if (!extractedJson) {
      await supabase.from("proofs").update({
        verification_status: "uncertain",
        verification_confidence: 0,
        verification_reason: "Could not parse assessment response",
        skill_name: null,
        updated_at: new Date().toISOString(),
      }).eq("id", proof_id);
      return NextResponse.json({ 
        error: "Assessment format error", 
        raw_response: rawText.slice(0, 500) 
      }, { status: 500 });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(extractedJson);
    } catch (parseErr) {
      await supabase.from("proofs").update({
        verification_status: "uncertain",
        verification_confidence: 0,
        verification_reason: "Assessment parsing failed",
        skill_name: null,
        updated_at: new Date().toISOString(),
      }).eq("id", proof_id);
      return NextResponse.json({ 
        error: "JSON parsing error", 
        raw_json: extractedJson.slice(0, 500) 
      }, { status: 500 });
    }

    // Extract response fields using predetermined skill name
    const verification_status = parsed.verification_status || "verified";
    const proof_weightage = Math.round(Math.max(30, Math.min(100, 
      typeof parsed.proof_weightage === "number" ? parsed.proof_weightage : 50
    )));
    const skill_detected = skillName; // Use skill name from roadmap
    const proof_type = parsed.proof_type || 'other';
    const phase_relevance = parsed.phase_relevance || 'Analyzed independently';
    const content_summary = parsed.content_summary || 'Content analyzed';
    const verification_reason = (parsed.verification_reason || "Proof assessed comprehensively")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
    
    const metadata = {
      phase_relevance: phase_relevance,
      content_summary: content_summary,
      assessed_with_phase_context: !!phaseContextData,
      phase_context: phaseContextData?.context || null,
      google_drive_api_used: !!extractedContent,
      analysis_method: extractedContent ? "google_drive_api_extraction" : "direct_url_analysis",
      ai_detected_type: proof_type,
      skill_source: "roadmap_phase"
    };
    
    // Update database with skill name from roadmap
    const { error: updateErr } = await supabase
      .from("proofs")
      .update({
        verification_status,
        verification_confidence: proof_weightage,
        verification_reason,
        skill_name: skill_detected,
        type: proof_type,
        metadata,
        updated_at: new Date().toISOString(),
      })
      .eq("id", proof_id);

    if (updateErr) {
      return NextResponse.json({ 
        error: "Database update failed", 
        details: updateErr.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      proof_id, 
      skill_name: skill_detected,
      proof_type: proof_type,
      proof_weightage,
      phase_relevance,
      content_summary,
      verification_reason,
      context_enhanced: !!phaseContextData,
      analysis_method: extractedContent ? "google_drive_api_extraction" : "direct_url_analysis",
      google_drive_used: !!extractedContent
    });

  } catch (error: any) {
    console.error('Fatal error in POST /api/skill-verify:', error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error?.message || String(error) 
    }, { status: 500 });
  }
}
