// // app/api/skill-verify/route.ts
// import { NextResponse } from "next/server";
// import { supabase } from "@/utils/supabase/supabaseClient";

// export const runtime = "nodejs";

// type GeminiResponse = {
//   candidates?: Array<{ content: { parts: Array<{ text: string }> } }>;
// };

// // Check if URL is an image
// function isImageUrl(url: string): boolean {
//   const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'];
//   const urlLower = url.toLowerCase();
//   return imageExtensions.some(ext => urlLower.includes(ext));
// }

// // Convert image to base64 for Gemini Vision
// async function fetchImageAsBase64(url: string): Promise<{ base64: string; mimeType: string } | null> {
//   try {
//     const response = await fetch(url);
//     if (!response.ok) return null;
    
//     const buffer = await response.arrayBuffer();
//     const base64 = Buffer.from(buffer).toString('base64');
    
//     // Determine MIME type from URL extension
//     let mimeType = 'image/jpeg'; // default
//     if (url.toLowerCase().includes('.png')) mimeType = 'image/png';
//     else if (url.toLowerCase().includes('.gif')) mimeType = 'image/gif';
//     else if (url.toLowerCase().includes('.webp')) mimeType = 'image/webp';
    
//     return { base64, mimeType };
//   } catch (error) {
//     console.error('Error fetching image:', error);
//     return null;
//   }
// }
// async function fetchUrlPreview(url: string, maxChars = 2500, timeoutMs = 8000) {
//   try {
//     let fetchUrl = url;

//     // **START: GOOGLE DOCS FIX**
//     // Check if the URL is a Google Docs link
//     const gdocsMatch = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
//     if (gdocsMatch) {
//       const docId = gdocsMatch[1];
//       // Transform the URL to use the text export format
//       fetchUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
//       console.log(`Transformed Google Docs URL to: ${fetchUrl}`);
//     }
//     // **END: GOOGLE DOCS FIX**

//     // Skip preview for images - they'll be handled separately
//     if (isImageUrl(url)) {
//       return { title: "Certificate/Image", snippet: "Image content will be analyzed directly" };
//     }

//     const controller = new AbortController();
//     const id = setTimeout(() => controller.abort(), timeoutMs);

//     // Use the potentially transformed URL
//     const res = await fetch(fetchUrl, { signal: controller.signal });
//     clearTimeout(id);
//     if (!res.ok) {
//         console.error(`Failed to fetch URL preview for: ${fetchUrl}, Status: ${res.status}`);
//         return null;
//     }

//     // For exported Google Docs, the content is plain text, not HTML
//     if (gdocsMatch) {
//         const text = await res.text();
//         return {
//             title: "Google Document", // Provide a generic title
//             snippet: text.trim().slice(0, maxChars)
//         };
//     }
    
//     // Original logic for all other URLs
//     const html = await res.text();

//     const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
//     const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, " ") : "Untitled";

//     const textOnly = html
//       .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
//       .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
//       .replace(/<\/?[a-z][^>]*>/gi, " ")
//       .replace(/\s+/g, " ")
//       .trim();

//     const snippet = textOnly ? textOnly.slice(0, maxChars) : null;

//     return { title, snippet };
//   } catch (err) {
//     console.error('Error in fetchUrlPreview:', err);
//     return null;
//   }
// }

// // Rest of your existing functions remain the same...
// function extractSkillNameFromRoadmap(roadmap: any, proofRow: any): string | null {
//   try {
//     if (!roadmap || typeof roadmap !== "object") return null;

//     const y = proofRow.roadmap_year_index;
//     const p = proofRow.phase_index;

//     if (y != null && roadmap.yearly_roadmap?.[y]) {
//       const year = roadmap.yearly_roadmap[y];
      
//       if (p != null && year.phases?.[p]) {
//         const phase = year.phases[p];
        
//         // Collect all milestone names from the phase for better skill detection
//         const allSkills = [];
        
//         if (Array.isArray(phase.milestones)) {
//           for (const milestone of phase.milestones) {
//             if (milestone.name) {
//               allSkills.push(convertMilestoneToSkill(milestone.name));
//             }
//           }
//         }
        
//         // Return the most specific skill or combine multiple skills
//         if (allSkills.length > 0) {
//           // You can enhance this logic to combine or prioritize skills
//           return allSkills[0]; // For now, return the first one
//         }
        
//         // Fallback to phase name if no milestones
//         if (phase.phase_name) {
//           console.warn(`No milestones found in phase ${p}, using phase name: ${phase.phase_name}`);
//           return convertMilestoneToSkill(phase.phase_name);
//         }
//       }
//     }

//     return null;
//   } catch (err) {
//     console.error('Error extracting skill name from roadmap:', err);
//     return null;
//   }
// }


// function convertMilestoneToSkill(milestoneName: string): string {
//   const name = milestoneName.toLowerCase().trim();
  
//   if (name.includes('python') && name.includes('introduction')) {
//     return 'Python';
//   }
//   if (name.includes('python') && name.includes('foundational')) {
//     return 'Python';
//   }
//   if (name.includes('data structures') && name.includes('algorithms')) {
//     return 'Data Structures and Algorithms';
//   }
//   if (name.includes('javascript') && name.includes('fundamentals')) {
//     return 'JavaScript';
//   }
//   if (name.includes('react') && (name.includes('basics') || name.includes('fundamentals'))) {
//     return 'React';
//   }
//   if (name.includes('database') && name.includes('sql')) {
//     return 'SQL and Database Management';
//   }
//   if (name.includes('machine learning') && name.includes('basics')) {
//     return 'Machine Learning';
//   }
//   if (name.includes('web development') && name.includes('html')) {
//     return 'HTML/CSS/Web Development';
//   }
  
//   if (name.includes('python')) return 'Python';
//   if (name.includes('javascript') || name.includes('js')) return 'JavaScript';
//   if (name.includes('react')) return 'React';
//   if (name.includes('node')) return 'Node.js';
//   if (name.includes('sql') || name.includes('database')) return 'SQL';
//   if (name.includes('data structures')) return 'Data Structures and Algorithms';
//   if (name.includes('algorithms')) return 'Algorithms';
//   if (name.includes('machine learning') || name.includes('ml')) return 'Machine Learning';
//   if (name.includes('deep learning') || name.includes('neural')) return 'Deep Learning';
//   if (name.includes('data science')) return 'Data Science';
//   if (name.includes('statistics')) return 'Statistics';
//   if (name.includes('calculus')) return 'Calculus';
//   if (name.includes('linear algebra')) return 'Linear Algebra';
  
//   return milestoneName
//     .replace(/\s+(basics|fundamentals|introduction|intro)\s*$/i, '')
//     .replace(/\s*&\s*/g, ' and ')
//     .trim();
// }

// function extractRoadmapContext(roadmap: any, proofRow: any) {
//   try {
//     if (!roadmap || typeof roadmap !== "object") return null;

//     const y = proofRow.roadmap_year_index;
//     const p = proofRow.phase_index;

//     if (y != null && roadmap.yearly_roadmap?.[y]) {
//       const year = roadmap.yearly_roadmap[y];
      
//       if (p != null && year.phases?.[p]) {
//         const phase = year.phases[p];
        
//         // Return the ENTIRE phase context
//         return {
//           year_label: year.year || null,
//           year_overview: year.overview || null,
//           full_phase: phase,  // This contains the complete phase data
//           current_task_index: proofRow.task_index || null  // Keep track of which specific task
//         };
//       }
//     }

//     return null;
//   } catch (err) {
//     console.error('Error extracting roadmap context:', err);
//     return null;
//   }
// }


// // Enhanced prompt builder for both text and image content
// function buildLLMPrompt(proof: any, urlPreview: any, roadmapCtx: any, isImage: boolean = false) {
//   const proofUrl = proof.url;
//   const inputs: string[] = [];

//   inputs.push(`PROOF URL: ${proofUrl}`);
  
//   if (isImage) {
//     inputs.push("CONTENT TYPE: Certificate/Image");
//     inputs.push("NOTE: The image will be provided separately for visual analysis.");
//   } else {
//     if (urlPreview?.title) inputs.push(`PAGE_TITLE: ${urlPreview.title}`);
//     if (urlPreview?.snippet) inputs.push(`PAGE_SNIPPET: ${urlPreview.snippet}`);
//   }

//   // Enhanced roadmap context section
//   inputs.push("\nROADMAP CONTEXT (Full Phase Details):");
//   if (roadmapCtx?.year_label) inputs.push(`Academic Year: ${roadmapCtx.year_label}`);
//   if (roadmapCtx?.year_overview) inputs.push(`Year Overview: ${roadmapCtx.year_overview}`);
  
//   if (roadmapCtx?.full_phase) {
//     inputs.push(`\nPHASE DETAILS:`);
//     inputs.push(`Phase Name: ${roadmapCtx.full_phase.phase_name || 'Unknown'}`);
    
//     // Add the complete phase structure as JSON for better context
//     inputs.push(`\nCOMPLETE PHASE STRUCTURE:`);
//     inputs.push(JSON.stringify(roadmapCtx.full_phase, null, 2));
    
//     if (roadmapCtx.current_task_index !== null) {
//       inputs.push(`\nCURRENT TASK INDEX: ${roadmapCtx.current_task_index} (This specific proof relates to this task)`);
//     }
//   }
//   inputs.push("\nINSTRUCTIONS TO THE MODEL:");
//   inputs.push(
//     `You are an assistant that assesses proof weightage - how valuable and relevant a submitted ${isImage ? 'certificate/image' : 'URL'} is for demonstrating skill mastery.`
//   );
  
//   if (isImage) {
//     inputs.push(
//       `CERTIFICATE/IMAGE ANALYSIS: Examine the provided image for course completions, certifications, achievements, or any skill-related content.`
//     );
//   }
  
//   inputs.push(
//     `WEIGHTAGE SCORING GUIDE (30-100 points):`
//   );
//   inputs.push(
//     `90-100: High-value proofs - Completed projects, deployed applications, comprehensive portfolios, advanced certificates`
//   );
//   inputs.push(
//     `70-89: Good proofs - Course completion certificates, substantial GitHub repos, meaningful contributions`
//   );
//   inputs.push(
//     `50-69: Moderate proofs - Practice problems solved, tutorial completions, basic projects, profiles with some activity`
//   );
//   inputs.push(
//     `30-49: Basic proofs - Profiles with minimal activity, simple exercises, introductory course progress`
//   );
  
//   inputs.push(
//     `ASSESSMENT APPROACH:`
//   );
//   inputs.push(
//     `- Always mark as "verified" unless genuinely unclear what the proof shows`
//   );
//   inputs.push(
//     `- Focus on proof QUALITY and RELEVANCE to the specific skill`
//   );
//   inputs.push(
//     `- Consider depth, completeness, and practical application`
//   );
//   inputs.push(
//     `- Be generous but realistic with scoring`
//   );

//   inputs.push(
//     `Reply STRICTLY with a single JSON object and NO surrounding text or markdown. The JSON must have these keys:`
//   );
//   inputs.push(
//     `verification_status (use "verified" for relevant proofs, "uncertain" only if truly unclear),`
//   );
//   inputs.push(
//     `proof_weightage (integer 30-100 based on how valuable this proof is for the skill),`
//   );
//   inputs.push(
//     `verification_reason (brief positive acknowledgment explaining the weightage)`
//   );

//   inputs.push(
//     `OUTPUT EXAMPLE:`
//   );
//   inputs.push(
//     `{"verification_status":"verified","proof_weightage":75,"verification_reason":"Strong practical demonstration through problem-solving practice."}`
//   );

//   return inputs.join("\n");
// }

// function generateProofSuggestions(skill_name: string): string[] {
//   const suggestions: string[] = [];
  
//   if (skill_name?.toLowerCase().includes('python')) {
//     suggestions.push("LeetCode/HackerRank profile with Python solutions");
//     suggestions.push("GitHub repository with Python projects");
//     suggestions.push("Python course completion certificate");
//     suggestions.push("Codecademy/DataCamp Python course completion");
//   }
  
//   if (skill_name?.toLowerCase().includes('javascript')) {
//     suggestions.push("Codepen/JSFiddle projects");
//     suggestions.push("FreeCodeCamp JavaScript certificates");
//     suggestions.push("GitHub repository with JavaScript code");
//     suggestions.push("JavaScript course completion certificate");
//   }
  
//   if (skill_name?.toLowerCase().includes('react')) {
//     suggestions.push("Deployed React application");
//     suggestions.push("GitHub repository with React projects");
//     suggestions.push("React course completion certificate");
//     suggestions.push("Portfolio website built with React");
//   }
  
//   if (skill_name?.toLowerCase().includes('data') || skill_name?.toLowerCase().includes('algorithm')) {
//     suggestions.push("LeetCode profile showing algorithm solutions");
//     suggestions.push("HackerRank data structures badges");
//     suggestions.push("GitHub repository with algorithm implementations");
//     suggestions.push("Coursera/edX algorithms course certificate");
//   }
  
//   if (suggestions.length === 0) {
//     suggestions.push("Course completion certificates");
//     suggestions.push("GitHub projects related to the skill");
//     suggestions.push("Online coding platform profiles");
//     suggestions.push("Portfolio or personal website showcasing the skill");
//   }
  
//   return suggestions;
// }

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
//       return NextResponse.json({ error: "Proof not found", details: proofError?.message }, { status: 404 });
//     }

//     if (proofRow.verification_status === "verified") {
//       return NextResponse.json({ success: true, message: "Already verified", proof_id }, { status: 200 });
//     }

//     const { data: careerInfo, error: careerErr } = await supabase
//       .from("career_info")
//       .select("roadmap")
//       .eq("user_id", proofRow.user_id)
//       .single();

//     const roadmap = careerErr || !careerInfo ? null : careerInfo.roadmap;
//     const skill_name = extractSkillNameFromRoadmap(roadmap, proofRow);
//     const roadmapCtx = extractRoadmapContext(roadmap, proofRow);

//     // Check if this is an image URL
//     const isImage = isImageUrl(proofRow.url);
//     let urlPreview = null;
//     let imageData = null;

//     if (isImage) {
//       // Fetch image as base64
//       imageData = await fetchImageAsBase64(proofRow.url);
//       urlPreview = { title: "Certificate/Image", snippet: "Image content analyzed directly" };
//     } else {
//       // Fetch URL preview as before
//       urlPreview = await fetchUrlPreview(proofRow.url);
//     }

//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) {
//       console.error("Missing GEMINI_API_KEY");
//       await supabase.from("proofs").update({
//         verification_status: "uncertain",
//         verification_confidence: 0,
//         verification_reason: "Server missing GEMINI_API_KEY",
//         skill_name: skill_name,
//         updated_at: new Date().toISOString(),
//       }).eq("id", proof_id);
//       return NextResponse.json({ error: "Server missing GEMINI_API_KEY" }, { status: 500 });
//     }

//     const prompt = buildLLMPrompt(proofRow, urlPreview, roadmapCtx, isImage);

//     // Use Gemini Pro Vision for images, regular Gemini for text
//     const modelName = isImage ? "gemini-2.5-flash" : "gemini-2.5-flash";
//     const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

//     // Build request body
//     const requestBody: any = {
//       generationConfig: {
//         temperature: 0.0,
//         topP: 0.8,
//         topK: 40,
//         maxOutputTokens: 3000,
//       },
//     };

//     if (isImage && imageData) {
//       // For images, include both text and image
//       requestBody.contents = [{
//         parts: [
//           { text: prompt },
//           {
//             inlineData: {
//               mimeType: imageData.mimeType,
//               data: imageData.base64
//             }
//           }
//         ]
//       }];
//     } else {
//       // For text-only
//       requestBody.contents = [{ parts: [{ text: prompt }] }];
//     }

//     const res = await fetch(endpoint, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(requestBody),
//     });

//     if (!res.ok) {
//       const text = await res.text().catch(() => "");
//       console.error("LLM error:", res.status, text);
      
//       // Clean any potential problematic characters before saving
//       const cleanReason = `LLM error ${res.status}`.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
      
//       await supabase.from("proofs").update({
//         verification_status: "uncertain",
//         verification_confidence: 0,
//         verification_reason: cleanReason,
//         skill_name: skill_name,
//         updated_at: new Date().toISOString(),
//       }).eq("id", proof_id);

//       return NextResponse.json({ error: "LLM returned non-OK", status: res.status }, { status: 502 });
//     }

//     const data: GeminiResponse = await res.json();
//     const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
//     if (!rawText) {
//       console.error("LLM returned no content:", data);
//       await supabase.from("proofs").update({
//         verification_status: "uncertain",
//         verification_confidence: 0,
//         verification_reason: "LLM returned empty response",
//         skill_name: skill_name,
//         updated_at: new Date().toISOString(),
//       }).eq("id", proof_id);

//       return NextResponse.json({ error: "Empty LLM response" }, { status: 500 });
//     }

//     // Clean the response text to remove any null bytes or problematic characters
//     const cleanText = rawText.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
    
//     const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) {
//       const reason = cleanText.slice(0, 1000);
//       await supabase.from("proofs").update({
//         verification_status: "uncertain",
//         verification_confidence: 0,
//         verification_reason: `Unable to parse LLM JSON. Raw: ${reason}`,
//         skill_name: skill_name,
//         updated_at: new Date().toISOString(),
//       }).eq("id", proof_id);

//       return NextResponse.json({ error: "Could not parse LLM JSON", raw: cleanText }, { status: 500 });
//     }

//     let parsed: any;
//     try {
//       parsed = JSON.parse(jsonMatch[0]);
//     } catch (err) {
//       console.error("JSON.parse failed on LLM output:", err, jsonMatch[0]);
//       await supabase.from("proofs").update({
//         verification_status: "uncertain",
//         verification_confidence: 0,
//         verification_reason: "LLM JSON parse error",
//         skill_name: skill_name,
//         updated_at: new Date().toISOString(),
//       }).eq("id", proof_id);

//       return NextResponse.json({ error: "LLM JSON parse error" }, { status: 500 });
//     }

//     const verification_status = parsed.verification_status || "verified";
//     let proof_weightage =
//       typeof parsed.proof_weightage === "number"
//         ? Math.round(Math.max(30, Math.min(100, parsed.proof_weightage)))
//         : parsed.proof_weightage && !isNaN(Number(parsed.proof_weightage))
//         ? Math.round(Math.max(30, Math.min(100, Number(parsed.proof_weightage))))
//         : 50;
    
//     // Clean the verification reason to remove any problematic characters
//     const verification_reason = (parsed.verification_reason || "Proof accepted")
//       .replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
    
//     const metadata = urlPreview ? { 
//       title: urlPreview.title || null, 
//       snippet: urlPreview.snippet || null,
//       isImage: isImage
//     } : null;

//     const { error: updateErr } = await supabase
//       .from("proofs")
//       .update({
//         verification_status,
//         verification_confidence: proof_weightage,
//         verification_reason,
//         skill_name: skill_name,
//         metadata,
//         updated_at: new Date().toISOString(),
//       })
//       .eq("id", proof_id);

//     if (updateErr) {
//       console.error("Failed to update proof row:", updateErr);
//       return NextResponse.json({ error: "DB update failed", details: updateErr.message }, { status: 500 });
//     }

//     const suggestions = generateProofSuggestions(skill_name || '');

//     return NextResponse.json({ 
//       success: true, 
//       proof_id, 
//       updated: true,
//       skill_name: skill_name,
//       proof_weightage: proof_weightage,
//       suggestions: suggestions,
//       processed_as_image: isImage
//     });
//   } catch (error: any) {
//     console.error("Error in skill-verify route:", error);
//     return NextResponse.json({ error: "Internal Server Error", details: error?.message || String(error) }, { status: 500 });
//   }
// }



// // app/api/skill-verify/route.ts
// import { NextResponse } from "next/server";
// import { supabase } from "@/utils/supabase/supabaseClient";

// export const runtime = "nodejs";

// type GeminiResponse = {
//   candidates?: Array<{ content: { parts: Array<{ text: string }> } }>;
// };

// // ===== NEW: Google Drive API Functions =====
// const GOOGLE_DRIVE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY;

// function extractGoogleDriveFileId(url: string): string | null {
//   const patterns = [
//     /\/d\/([a-zA-Z0-9_-]+)/, // /d/FILE_ID format
//     /id=([a-zA-Z0-9_-]+)/, // id=FILE_ID format
//     /file\/d\/([a-zA-Z0-9_-]+)/ // file/d/FILE_ID format
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
//     // First, get file metadata to check if it's accessible
//     const metadataUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?key=${GOOGLE_DRIVE_API_KEY}`;
//     const metadataResponse = await fetch(metadataUrl);
    
//     if (!metadataResponse.ok) {
//       console.error('Failed to access file metadata:', metadataResponse.status);
//       return null;
//     }
    
//     const metadata = await metadataResponse.json();
    
//     // Get file content
//     const contentUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${GOOGLE_DRIVE_API_KEY}`;
//     const contentResponse = await fetch(contentUrl);
    
//     if (!contentResponse.ok) {
//       console.error('Failed to access file content:', contentResponse.status);
//       return null;
//     }
    
//     // Handle different file types
//     if (metadata.mimeType.includes('text') || metadata.mimeType.includes('json')) {
//       return await contentResponse.text();
//     } else if (metadata.mimeType.includes('pdf')) {
//       // For PDFs, return metadata info (actual content extraction would need PDF parser)
//       return `PDF Document: ${metadata.name}. Content: This is a PDF file that contains information relevant to the proof. The document name suggests it contains educational or project-related content.`;
//     } else if (metadata.mimeType.includes('image')) {
//       return `Image Document: ${metadata.name}. Content: This is an image file that likely contains visual proof such as certificates, screenshots, or diagrams related to the learning objective.`;
//     } else if (metadata.mimeType.includes('google-apps.document')) {
//       // For Google Docs, convert to plain text
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
// // ===== END: Google Drive API Functions =====

// // Extract full phase context from roadmap (ONLY hardcoded part)
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
        
//         return {
//           year_label: year.year || null,
//           year_overview: year.overview || null,
//           full_phase: phase,
//           current_task_index: proofRow.task_index || null
//         };
//       }
//     }

//     return null;
//   } catch (err) {
//     console.error('Error extracting phase from roadmap:', err);
//     return null;
//   }
// }

// // MODIFIED: Build comprehensive prompt with optional extracted content
// function buildComprehensiveAnalysisPrompt(proofUrl: string, phaseContext: any, extractedContent?: string | null): string {
//   const inputs: string[] = [];

//   inputs.push(`COMPREHENSIVE PROOF ANALYSIS REQUEST`);
//   inputs.push(`\nPROOF URL: ${proofUrl}`);
  
//   // MODIFIED: Handle both null and undefined
//   if (extractedContent) {
//     inputs.push(`\nEXTRACTED CONTENT FROM DOCUMENT:`);
//     inputs.push(extractedContent.slice(0, 4000)); // Limit content size
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
    
//     if (phaseContext.current_task_index !== null) {
//       inputs.push(`\nCURRENT TASK INDEX: ${phaseContext.current_task_index} (This proof relates to this specific task)`);
//     }
//   } else {
//     inputs.push(`\nNo specific phase context available - analyze content independently.`);
//   }

//   inputs.push(`\nTASK 3 - COMPREHENSIVE ANALYSIS:`);
//   inputs.push(`Perform a complete analysis using both the ${extractedContent ? 'extracted content' : 'URL content'} and phase context:`);
  
//   inputs.push(`\nANALYSIS CRITERIA:`);
//   inputs.push(`1. CONTENT ANALYSIS: What does the ${extractedContent ? 'extracted content' : 'URL'} contain? (project, certificate, profile, etc.)`);
//   inputs.push(`2. SKILL DETECTION: What primary skill does this proof demonstrate?`);
//   inputs.push(`3. QUALITY ASSESSMENT: How strong is this proof for demonstrating skill mastery?`);
//   inputs.push(`4. PHASE RELEVANCE: How well does this align with the current learning phase?`);
//   inputs.push(`5. FUTURE GUIDANCE: What types of proofs would be valuable for upcoming learning?`);

//   inputs.push(`\nSCORING GUIDELINES (30-100 points):`);
//   inputs.push(`90-100: Exceptional - Advanced projects, deployed applications, comprehensive portfolios, professional work`);
//   inputs.push(`70-89: Strong - Course certificates, substantial repositories, meaningful contributions, good depth`);
//   inputs.push(`50-69: Good - Practice problems, tutorial completions, basic projects, demonstrable progress`);
//   inputs.push(`30-49: Basic - Simple exercises, minimal profiles, introductory work, limited depth`);

//   inputs.push(`\nCONTEXT-AWARE CONSIDERATIONS:`);
//   inputs.push(`- Assess proof objectively regardless of type (user has complete freedom)`);
//   inputs.push(`- If phase context available, consider learning progression and current objectives`);
//   inputs.push(`- Evaluate practical application and depth relative to learning stage`);
//   inputs.push(`- If no phase context, analyze independently and detect most relevant skill`);

//   inputs.push(`\nTASK 4 - INTELLIGENT SUGGESTIONS:`);
//   inputs.push(`Based on the phase context and current proof analysis, provide 3-4 contextual suggestions for future proof submissions that would:`);
//   inputs.push(`- Complement the current proof type`);
//   inputs.push(`- Align with upcoming tasks/milestones in their learning phase`);
//   inputs.push(`- Help strengthen their skill demonstration portfolio`);
//   inputs.push(`- Reference specific resources or platforms mentioned in their phase`);

//   inputs.push(`\nOUTPUT REQUIREMENTS:`);
//   inputs.push(`Respond with ONLY a valid JSON object in this exact format:`);
//   inputs.push(`{`);
//   inputs.push(`  "verification_status": "verified" | "uncertain",`);
//   inputs.push(`  "proof_weightage": <integer between 30-100>,`);
//   inputs.push(`  "skill_detected": "<primary skill name demonstrated>",`);
//   inputs.push(`  "content_summary": "<brief summary of what was found in the ${extractedContent ? 'extracted content' : 'URL'}>",`);
//   inputs.push(`  "phase_relevance": "<how this proof relates to current learning phase>",`);
//   inputs.push(`  "verification_reason": "<detailed explanation of assessment and scoring rationale>",`);
//   inputs.push(`  "future_suggestions": [`);
//   inputs.push(`    "<contextual suggestion 1 based on phase progression>",`);
//   inputs.push(`    "<contextual suggestion 2 based on learning objectives>",`);
//   inputs.push(`    "<contextual suggestion 3 based on skill development>"`);
//   inputs.push(`  ]`);
//   inputs.push(`}`);

//   inputs.push(`\nIMPORTANT: Provide ONLY the JSON response, no additional text or markdown formatting.`);

//   const finalPrompt = inputs.join("\n");
//   return finalPrompt;
// }

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
//       console.error('Proof row:', proofRow);
//       return NextResponse.json({ error: "Proof not found" }, { status: 404 });
//     }

//     // console.log('Proof found:', {
//     //   id: proofRow.id,
//     //   url: proofRow.url,
//     //   user_id: proofRow.user_id,
//     //   verification_status: proofRow.verification_status
//     // });

//     if (proofRow.verification_status === "verified") {
//       return NextResponse.json({ 
//         success: true, 
//         message: "Already verified", 
//         proof_id 
//       }, { status: 200 });
//     }

//     // Extract phase context from roadmap (ONLY hardcoded part)
//     const { data: careerInfo, error: careerErr } = await supabase
//       .from("career_info")
//       .select("roadmap")
//       .eq("user_id", proofRow.user_id)
//       .single();

//     if (careerErr) {
//       console.error('Career info fetch error:', careerErr);
//     }

//     const roadmap = careerErr || !careerInfo ? null : careerInfo.roadmap;
    
//     const phaseContext = extractPhaseFromRoadmap(roadmap, proofRow);
//     // ==== NEW: Try Google Drive API first =====
//     let extractedContent: string | null = null;
//     if (proofRow.url.includes('drive.google.com')) {
//       extractedContent = await readGoogleDriveContent(proofRow.url);
      
//       if (extractedContent) {
//         console.log('Successfully extracted content from Google Drive');
//       } else {
//         console.log('Google Drive API extraction failed, will use URL context tool');
//       }
//     }
//     // ===== END: Google Drive API =====

   
//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) {
//       console.error('=== MISSING API KEY ERROR ===');
//       console.error('GEMINI_API_KEY is not set');
      
//       await supabase.from("proofs").update({
//         verification_status: "uncertain",
//         verification_confidence: 0,
//         verification_reason: "Server configuration error",
//         skill_name: null,
//         updated_at: new Date().toISOString(),
//       }).eq("id", proof_id);
//       return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
//     }

//     // MODIFIED: Build prompt with extracted content if available
//     const prompt = buildComprehensiveAnalysisPrompt(proofRow.url, phaseContext, extractedContent);

//     // Single API call with URL context tool
//     const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

//     // MODIFIED: Only use URL context tool if we don't have extracted content
//     const requestBody = {
//       contents: [{ 
//         parts: [{ text: prompt }] 
//       }],
//       tools: extractedContent ? [] : [{ urlContext: {} }], // Skip URL context if we have content
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
//       // console.error('=== GEMINI API ERROR ===');
//       // console.error('Status:', res.status);
//       // console.error('Status Text:', res.statusText);
//       // console.error('Error Response:', errorText);
//       // console.error('Request Body Size:', JSON.stringify(requestBody).length);
//       // console.error('Request Body Preview:', JSON.stringify(requestBody).slice(0, 1000));
      
//       // Try to parse error JSON
//       try {
//         const errorJson = JSON.parse(errorText);
//         console.error('Parsed Error:', JSON.stringify(errorJson, null, 2));
//       } catch (parseError) {
//         console.error('Could not parse error as JSON:', parseError);
//       }
//       console.error('=== END GEMINI API ERROR ===');
      
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
//       console.error('=== EMPTY GEMINI RESPONSE ===');
//       console.error('Full response data:', JSON.stringify(data, null, 2));
//       console.error('=== END EMPTY GEMINI RESPONSE ===');
      
//       await supabase.from("proofs").update({
//         verification_status: "uncertain",
//         verification_confidence: 0,
//         verification_reason: "No response from assessment service",
//         skill_name: null,
//         updated_at: new Date().toISOString(),
//       }).eq("id", proof_id);

//       return NextResponse.json({ error: "Empty assessment response" }, { status: 500 });
//     }

//     function extractJsonFromMarkdown(rawText: string): string | null {
//       let cleaned = rawText.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
    
//       // Remove markdown code fences with optional 'json' language tag
//       cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '');
//       cleaned = cleaned.replace(/\s*```$/g, '');
    
//       cleaned = cleaned.trim();
    
//       // Extract JSON object from first { to last }
//       const firstBrace = cleaned.indexOf('{');
//       const lastBrace = cleaned.lastIndexOf('}');
    
//       if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
//         return null;
//       }
    
//       return cleaned.substring(firstBrace, lastBrace + 1);
//     }
    
//     // Use the function to extract JSON
//     const extractedJson = extractJsonFromMarkdown(rawText);
    
//     if (!extractedJson) {
//       console.error('=== JSON EXTRACTION ERROR ===');
//       console.error('Could not extract JSON from response');
//       console.error('Full cleaned text:', rawText.slice(0, 1000));
//       console.error('=== END JSON EXTRACTION ERROR ===');
      
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
//       console.log('Attempting to parse extracted JSON...');
      
      
//       parsed = JSON.parse(extractedJson);
      
//     } catch (parseErr) {
//       console.error('=== JSON PARSING ERROR ===');
//       console.error('Parse Error:', parseErr);
//       console.error('Extracted JSON String:', extractedJson.slice(0, 500));
//       console.error('=== END JSON PARSING ERROR ===');
      
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

//     console.log('Extracting and validating response fields...');
//     // Extract and validate response fields (ALL from LLM)
//     const verification_status = parsed.verification_status || "verified";
//     const proof_weightage = Math.round(Math.max(30, Math.min(100, 
//       typeof parsed.proof_weightage === "number" ? parsed.proof_weightage : 50
//     )));
//     const skill_detected = parsed.skill_detected || 'General Programming';
//     const phase_relevance = parsed.phase_relevance || 'Analyzed independently';
//     const content_summary = parsed.content_summary || 'Content analyzed';
//     const verification_reason = (parsed.verification_reason || "Proof assessed comprehensively")
//       .replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
//     const future_suggestions = parsed.future_suggestions || [
//       "Consider submitting additional proofs to strengthen your portfolio"
//     ];

//     // console.log('Extracted fields:', {
//     //   verification_status,
//     //   proof_weightage,
//     //   skill_detected,
//     //   phase_relevance,
//     //   suggestions_count: future_suggestions.length
//     // });
    
//     // MODIFIED: Add Google Drive API usage info to metadata
//     const metadata = {
//       phase_relevance: phase_relevance,
//       content_summary: content_summary,
//       assessed_with_phase_context: !!phaseContext,
//       url_context_used: !extractedContent,
//       google_drive_api_used: !!extractedContent,
//       analysis_method: extractedContent ? "google_drive_api_extraction" : "url_context_tool",
//       suggestions_generated: true,
//       future_suggestions: future_suggestions
//     };

    
//     // Update database with results
//     const { error: updateErr } = await supabase
//       .from("proofs")
//       .update({
//         verification_status,
//         verification_confidence: proof_weightage,
//         verification_reason,
//         skill_name: skill_detected,
//         metadata,
//         updated_at: new Date().toISOString(),
//       })
//       .eq("id", proof_id);

//     if (updateErr) {
//       console.error('=== DATABASE UPDATE ERROR ===');
//       console.error('Supabase Error:', updateErr);
//       console.error('Update Data:', {
//         verification_status,
//         verification_confidence: proof_weightage,
//         verification_reason,
//         skill_name: skill_detected,
//         proof_id
//       });
//       console.error('=== END DATABASE UPDATE ERROR ===');
      
//       return NextResponse.json({ 
//         error: "Database update failed", 
//         details: updateErr.message 
//       }, { status: 500 });
//     }

//     return NextResponse.json({ 
//       success: true, 
//       proof_id, 
//       skill_name: skill_detected,
//       proof_weightage,
//       phase_relevance,
//       content_summary,
//       verification_reason,
//       future_suggestions,
//       context_enhanced: !!phaseContext,
//       analysis_method: extractedContent ? "google_drive_api_extraction" : "url_context_tool",
//       google_drive_used: !!extractedContent
//     });

//   } catch (error: any) {
//     console.error('=== FATAL ERROR IN POST /api/skill-verify ===');
//     console.error('Error details:', error);
//     console.error('Error stack:', error.stack);
//     console.error('Error message:', error.message);
//     console.error('Error name:', error.name);
//     console.error('=== END FATAL ERROR ===');
    
//     return NextResponse.json({ 
//       error: "Internal server error", 
//       details: error?.message || String(error) 
//     }, { status: 500 });
//   }
// }


// app/api/skill-verify/route.ts
// app/api/skill-verify/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabaseClient";

export const runtime = "nodejs";

type GeminiResponse = {
  candidates?: Array<{ content: { parts: Array<{ text: string }> } }>;
};

// Google Drive API Functions
const GOOGLE_DRIVE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY;

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

// Extract phase context from roadmap
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
        
        return {
          year_label: year.year || null,
          year_overview: year.overview || null,
          full_phase: phase,
          current_task_index: proofRow.task_index || null
        };
      }
    }

    return null;
  } catch (err) {
    console.error('Error extracting phase from roadmap:', err);
    return null;
  }
}

// Get or generate skill name for phase (LLM decides from phase context)
async function getOrGeneratePhaseSkill(userId: string, phaseIndex: number, phaseContext: any): Promise<string> {
  try {
    // Check if we already have proofs for this phase with a skill name
    const { data: existingProofs, error } = await supabase
      .from("proofs")
      .select("skill_name")
      .eq("user_id", userId)
      .eq("phase_index", phaseIndex)
      .not("skill_name", "is", null)
      .limit(1);

    if (error) {
      console.error('Error checking existing proofs:', error);
    }

    // If we found an existing proof with skill_name for this phase, reuse it
    if (existingProofs && existingProofs.length > 0 && existingProofs[0].skill_name) {
      console.log('Reusing existing skill name for phase:', existingProofs[0].skill_name);
      return existingProofs[0].skill_name;
    }

    // No existing skill for this phase - generate one using LLM
    console.log('No existing skill found for phase, generating new skill name via LLM...');
    
    if (!phaseContext?.full_phase) {
      return 'General Programming';
    }

    const skillGenerationPrompt = buildSkillGenerationPrompt(phaseContext);
    
    const apiKey = process.env.GEMINI_API_KEY;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [{ parts: [{ text: skillGenerationPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 200
      }
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      console.error('Failed to generate skill name via LLM');
      return 'General Programming';
    }

    const data = await res.json();
    const skillText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (skillText) {
      console.log('Generated new skill name for phase:', skillText);
      return skillText;
    }

    return 'General Programming';
    
  } catch (error) {
    console.error('Error in getOrGeneratePhaseSkill:', error);
    return 'General Programming';
  }
}

// Build skill generation prompt (LLM analyzes phase context)
function buildSkillGenerationPrompt(phaseContext: any): string {
  const inputs: string[] = [];

  inputs.push(`SKILL NAME GENERATION FROM LEARNING PHASE`);
  inputs.push(`\nTASK: Analyze the following learning phase and generate a concise, descriptive skill name that represents what students learn in this phase.`);
  
  if (phaseContext.year_label) {
    inputs.push(`\nAcademic Year: ${phaseContext.year_label}`);
  }
  
  if (phaseContext.year_overview) {
    inputs.push(`Year Overview: ${phaseContext.year_overview}`);
  }

  inputs.push(`\nPHASE DETAILS:`);
  const phaseJson = JSON.stringify(phaseContext.full_phase, null, 2);
  inputs.push(phaseJson);

  inputs.push(`\nGUIDELINES:`);
  inputs.push(`- Generate a skill name that captures the MAIN learning objective of this phase`);
  inputs.push(`- Keep it concise (2-6 words max)`);
  inputs.push(`- Focus on the primary skills/technologies being learned`);
  inputs.push(`- Make it professional and descriptive`);
  inputs.push(`- Examples: "Python Programming Fundamentals", "Data Structures & Algorithms", "Web Development Basics"`);

  inputs.push(`\nOUTPUT:`);
  inputs.push(`Respond with ONLY the skill name, no additional text or explanation.`);

  return inputs.join("\n");
}

// Build comprehensive analysis prompt (without skill detection)
function buildComprehensiveAnalysisPrompt(proofUrl: string, phaseContext: any, extractedContent?: string | null, skillName?: string): string {
  const inputs: string[] = [];

  inputs.push(`COMPREHENSIVE PROOF ANALYSIS REQUEST`);
  inputs.push(`\nPROOF URL: ${proofUrl}`);
  
  if (skillName) {
    inputs.push(`\nSKILL CONTEXT: This proof is for the skill "${skillName}" which is predetermined for this learning phase.`);
  }
  
  if (extractedContent) {
    inputs.push(`\nEXTRACTED CONTENT FROM DOCUMENT:`);
    inputs.push(extractedContent.slice(0, 4000));
    inputs.push(`\nUSE THE ABOVE EXTRACTED CONTENT FOR ANALYSIS (do not try to access the URL)`);
  } else {
    inputs.push(`\nTASK 1 - URL CONTENT EXTRACTION:`);
    inputs.push(`Extract and analyze the complete content from the above URL using your URL context capabilities.`);
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
  inputs.push(`Perform a complete analysis using both the ${extractedContent ? 'extracted content' : 'URL content'} and phase context:`);
  
  inputs.push(`\nANALYSIS CRITERIA:`);
  inputs.push(`1. CONTENT ANALYSIS: What does the ${extractedContent ? 'extracted content' : 'URL'} contain?`);
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
  inputs.push(`5. FUTURE GUIDANCE: What types of proofs would be valuable for upcoming learning?`);

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
  inputs.push(`- Analyze actual content to determine the specific skill/platform involved`);

  inputs.push(`\nTASK 4 - INTELLIGENT SUGGESTIONS:`);
  inputs.push(`Based on the phase context and current proof analysis, provide 3-4 contextual suggestions for future proof submissions.`);

  inputs.push(`\nOUTPUT REQUIREMENTS:`);
  inputs.push(`Respond with ONLY a valid JSON object in this exact format:`);
  inputs.push(`{`);
  inputs.push(`  "verification_status": "verified" | "uncertain",`);
  inputs.push(`  "proof_weightage": <integer between 30-100>,`);
  inputs.push(`  "proof_type": "<use the MOST SPECIFIC type from the categories above>",`);
  inputs.push(`  "content_summary": "<brief summary of what was found>",`);
  inputs.push(`  "phase_relevance": "<how this proof relates to current learning phase>",`);
  inputs.push(`  "verification_reason": "<detailed explanation of assessment and scoring rationale>",`);
  inputs.push(`  "future_suggestions": [`);
  inputs.push(`    "<contextual suggestion 1>",`);
  inputs.push(`    "<contextual suggestion 2>",`);
  inputs.push(`    "<contextual suggestion 3>"`);
  inputs.push(`  ]`);
  inputs.push(`}`);

  inputs.push(`\nIMPORTANT: Provide ONLY the JSON response, no additional text or markdown formatting.`);

  return inputs.join("\n");
}

// Extract JSON from markdown response
function extractJsonFromMarkdown(rawText: string): string | null {
  let cleaned = rawText.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '');
  cleaned = cleaned.replace(/\s*```$/g, '');
  cleaned = cleaned.trim();
  
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    return null;
  }
  
  return cleaned.substring(firstBrace, lastBrace + 1);
}

// Main POST function
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
    const phaseContext = extractPhaseFromRoadmap(roadmap, proofRow);
    
    // Get or generate skill name for this phase
    let skillName = 'General Programming';
    
    if (proofRow.phase_index !== null && proofRow.phase_index !== undefined) {
      skillName = await getOrGeneratePhaseSkill(proofRow.user_id, proofRow.phase_index, phaseContext);
    } else {
      console.log('No phase_index found, using default skill name');
    }

    console.log('Using skill name for this proof:', skillName);
    
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

    // Build prompt with predetermined skill name
    const prompt = buildComprehensiveAnalysisPrompt(proofRow.url, phaseContext, extractedContent, skillName);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      tools: extractedContent ? [] : [{ urlContext: {} }],
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
    const skill_detected = skillName; // Use predetermined skill name
    const proof_type = parsed.proof_type || 'other';
    const phase_relevance = parsed.phase_relevance || 'Analyzed independently';
    const content_summary = parsed.content_summary || 'Content analyzed';
    const verification_reason = (parsed.verification_reason || "Proof assessed comprehensively")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
    const future_suggestions = parsed.future_suggestions || [
      "Consider submitting additional proofs to strengthen your portfolio"
    ];
    
    const metadata = {
      phase_relevance: phase_relevance,
      content_summary: content_summary,
      assessed_with_phase_context: !!phaseContext,
      url_context_used: !extractedContent,
      google_drive_api_used: !!extractedContent,
      analysis_method: extractedContent ? "google_drive_api_extraction" : "url_context_tool",
      suggestions_generated: true,
      future_suggestions: future_suggestions,
      ai_detected_type: proof_type,
      skill_source: proofRow.phase_index !== null ? "phase_context" : "default"
    };
    
    // Update database with predetermined skill name
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
      future_suggestions,
      context_enhanced: !!phaseContext,
      analysis_method: extractedContent ? "google_drive_api_extraction" : "url_context_tool",
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
