import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/supabaseClient';
import yts from 'yt-search';
import { calculateTaskCountProgress } from '@/utils/calcTaskCountProgress'; // Assuming these utils are correct
import { calculateWeightProgress } from '@/utils/calcWeightProgress'; // Assuming these utils are correct

// --- Helper Functions ---
type YtVideo = {
  url: string;
  title: string;
  thumbnail: string;
  seconds: number;
};

/** Given a query string, return the top YouTube tutorial or null */
async function lookupYouTubeVideo(
  query: string,
  minSeconds?: number    // renamed for clarity
): Promise<{ url: string; title: string; thumbnail: string } | null> {
  const r = await yts(query + " tutorial");
  const vids: YtVideo[] = r.videos || [];

  // 1) Keep only standard watch URLs (no shorts)
  let candidates = vids.filter((v: YtVideo) =>
    v.url.includes("watch?v=") && !v.url.includes("/shorts/")
  );

  // 2) If minSeconds is specified, require it as a floor
  if (minSeconds != null) {
    candidates = candidates.filter((v: YtVideo) =>
      // prefer `seconds`, fallback to parsing `timestamp` if needed
      (v.seconds && v.seconds >= minSeconds)
    );
  }

  // 3) Pick the first candidate ≥ minSeconds, else fall back to the first standard
  const pick: YtVideo | null = candidates.length
    ? candidates[0]
    : vids.find(v => v.url.includes("watch?v=") && !v.url.includes("/shorts/"))
      || null;

  return pick
    ? { url: pick.url, title: pick.title, thumbnail: pick.thumbnail }
    : null;
}

/**
 * Enriches roadmap videos by:
 * 1. Only updating videos for incomplete tasks that already have videos
 * 2. Leaving completed tasks entirely untouched
 * 3. Not adding videos to tasks that don't have them initially
 */
async function enrichRoadmapVideos(roadmap: any): Promise<any> {
  if (!roadmap?.yearly_roadmap || !Array.isArray(roadmap.yearly_roadmap)) {
    return roadmap;
  }

  const enrichedRoadmap = JSON.parse(JSON.stringify(roadmap)); // Deep clone

  for (let yearIndex = 0; yearIndex < enrichedRoadmap.yearly_roadmap.length; yearIndex++) {
    const year = enrichedRoadmap.yearly_roadmap[yearIndex];
    
    for (let phaseIndex = 0; phaseIndex < year.phases.length; phaseIndex++) {
      const phase = year.phases[phaseIndex];
      
      for (let milestoneIndex = 0; milestoneIndex < phase.milestones.length; milestoneIndex++) {
        const milestone = phase.milestones[milestoneIndex];
        
        for (let taskIndex = 0; taskIndex < milestone.tasks.length; taskIndex++) {
          const task = milestone.tasks[taskIndex];
          
          // Skip completed tasks entirely - DO NOT TOUCH THEM
          if (task.completed) {
            continue;
          }
          
          // For incomplete tasks, only update video if task already has a video
          if (!task.video) {
            continue; // Skip incomplete tasks without videos - don't add videos
          }
          
          // Only reach here for incomplete tasks that have existing videos
          const searchQuery = `${task.task_title}: ${task.description}`;
          
          try {
            const freshVideo = await lookupYouTubeVideo(searchQuery, 120); // Require ≥ 2 minutes
            
            if (freshVideo) {
              enrichedRoadmap.yearly_roadmap[yearIndex].phases[phaseIndex]
                .milestones[milestoneIndex].tasks[taskIndex].video = freshVideo;
              
              console.log(`Updated video for incomplete task: "${task.task_title}" with: ${freshVideo.title}`);
            } else {
              console.log(`No better video found for incomplete task: "${task.task_title}", keeping existing video`);
            }
          } catch (error) {
            console.warn(`Failed to update video for incomplete task "${task.task_title}":`, error);
            // Continue with existing video
          }
        }
      }
    }
  }

  return enrichedRoadmap;
}

// Checks if every task in all phases and milestones of a year is complete.
function isYearComplete(yearItem: any): boolean {
  for (const phase of yearItem.phases) {
    for (const milestone of phase.milestones) {
      for (const task of milestone.tasks) {
        if (!task.completed) return false;
      }
    }
  }
  return true;
}

// Returns an array of tasks from a milestone that are not completed.
function getIncompleteTasks(milestone: any): any[] {
  return milestone.tasks.filter((task: any) => !task.completed);
}

// Builds the prompt for updating a milestone's incomplete tasks using Gemini
function buildMilestoneUpdatePrompt(milestone: any, difficulty: string, incompleteTasks: any[]): string {
  const tasksText = incompleteTasks.map((task: any) => {
    return `Task Title: ${task.task_title}\nOriginal Description: ${task.description}\nWeight: ${task.weight}`;
  }).join("\n\n");

  // Instruction for Gemini to return a JSON array of tasks
  const prompt = `You are Careeroadmap's AI expert. Always respond strictly in JSON format (an array of task objects) with no markdown or extra text.
For the milestone "${milestone.name}" (Description: ${milestone.description}), review the following incomplete tasks:
${tasksText}

Based on the ${difficulty} difficulty level, update these tasks ONLY IF a significantly newer, more relevant, or trending alternative is available.
If the existing tasks are still the best option, return them unchanged but ensure they match the full task structure.
For each task (whether updated or unchanged), provide:
- task_title: string
- description: string (at least 2-3 lines)
- weight: number (same as original if unchanged)
- completed: boolean (should be false as these are incomplete tasks being reviewed)
- importance_explanation: string (1-2 sentences explaining why the task's weight matters for this career goal)
- For required tasks:
  - video: { title: string, url: string, thumbnail: string } (if a specific video is highly relevant)
  - video_channel: { name: string, url: string } (if a channel is more appropriate)
  - platform_links: array of { name: string, url: string } (e.g., Coursera, Kaggle)

Return ONLY the JSON array of these task objects, ensuring the count of tasks in the returned array matches the count of incomplete tasks provided above.
The structure for each task in the array should be:
{
  "task_title": "Task Name",
  "description": "Detailed instructions for the task (2-3 lines)",
  "weight": NumericValue,
  "completed": false,
  "importance_explanation": "A short 1–2-sentence rationale for this task's weight.",
  "video"?: { "title": "Video Title", "url": "https://youtu.be/VIDEO_ID", "thumbnail": "https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg" },
  "video_channel"?: { "name": "Channel Name", "url": "https://www.youtube.com/channel/CHANNEL_ID" },
  "platform_links"?: [ { "name": "Coursera", "url": "https://coursera.org/…" } ]
}`;
  return prompt;
}

// Calls the Gemini API to get updated tasks for a milestone
async function generateUpdatedTasksForMilestone(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp-1219:generateContent?key=${apiKey}`; // Ensure this model is appropriate for your use case

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ],
        },
      ],
      generationConfig: { // You might want to adjust these if needed
        temperature: 0.8, // Slightly lower for more deterministic updates
        topP: 1.0,
        topK: 0,
      }
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Error from Gemini API:", data);
    throw new Error(`Gemini API request failed with status ${res.status}: ${JSON.stringify(data.error?.message || data)}`);
  }

  if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content?.parts || data.candidates[0].content.parts.length === 0) {
    console.error("Empty or malformed response from Gemini API:", data);
    throw new Error("No candidates or content parts returned from Gemini API");
  }

  let raw = data.candidates[0].content.parts[0].text as string;

  // Strip any ```json fences or capture the JSON array
  const match = raw.match(/```json\s*([\s\S]*?)\s*```/i) || raw.match(/(\[[\s\S]*\])/); // Look for an array [...]
  if (!match) {
    console.error("No JSON array payload found in Gemini reply:", raw);
    throw new Error("Failed to locate JSON array in Gemini response");
  }

  return match[1] ? match[1].trim() : match[0].trim(); // match[1] for fenced, match[0] for direct
}

// --- Main Endpoint Handler ---
export async function POST(request: Request) {
  try {
    const { user_id } = await request.json();
    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const { data: careerInfoData, error: fetchError } = await supabase
      .from('career_info')
      .select('desired_career, residing_country, spending_capacity, current_class, move_abroad, preferred_abroad_country, previous_experience, difficulty, roadmap, updated_at')
      .eq('user_id', user_id)
      .single();

    if (fetchError || !careerInfoData) {
      return NextResponse.json({ error: 'Career info record not found or user_id invalid.' }, { status: 500 });
    }

    const { difficulty, roadmap: storedRoadmap, updated_at } = careerInfoData;

    // Check if updated_at is null (never generated) or if it's time to update
    // For manual testing via button, we might bypass the 3-month check for now,
    // but the cron job would strictly enforce it.
    // const lastUpdated = new Date(updated_at);
    // const threeMonthsAgo = new Date();
    // threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    // if (lastUpdated > threeMonthsAgo) {
    //   // Not yet time for an automatic update
    //   return NextResponse.json({ success: true, message: "Roadmap is not yet due for an update.", updatedRoadmap: storedRoadmap });
    // }

    if (!storedRoadmap) {
        return NextResponse.json({ error: 'Roadmap not found for this user.' }, { status: 404 });
    }
    if (!difficulty) {
        return NextResponse.json({ error: 'Difficulty level not set for this user.' }, { status: 400 });
    }

    let currentRoadmap = typeof storedRoadmap === 'string'
      ? JSON.parse(storedRoadmap)
      : storedRoadmap;

    if (!currentRoadmap.yearly_roadmap || !Array.isArray(currentRoadmap.yearly_roadmap)) {
        console.error("Invalid roadmap structure:", currentRoadmap);
        return NextResponse.json({ error: 'Invalid roadmap structure.' }, { status: 500 });
    }

    let activeYearIndex = -1;
    for (let i = 0; i < currentRoadmap.yearly_roadmap.length; i++) {
      if (!isYearComplete(currentRoadmap.yearly_roadmap[i])) {
        activeYearIndex = i;
        break;
      }
    }

    if (activeYearIndex === -1) {
        // All years are complete, or no years found.
        // Check if all years are complete
        if (currentRoadmap.yearly_roadmap.length > 0 && currentRoadmap.yearly_roadmap.every(isYearComplete)) {
             console.log(`Roadmap for user ${user_id} is already fully complete. No updates needed for incomplete tasks.`);
             return NextResponse.json({ success: true, message: "Roadmap is already fully complete.", updatedRoadmap: currentRoadmap });
        }
        // If here, roadmap might be empty or malformed in a way that isYearComplete passed.
        console.log(`No active (incomplete) year found for user ${user_id}. Roadmap might be complete or empty.`);
        // Decide if we should still proceed to update if it's been >3 months, perhaps to refresh content generally.
        // For now, let's assume if no active year, no task-specific update is done.
        // The cron job might have logic to regenerate a new year if applicable or simply refresh content.
        // For this manual button press, let's assume we only update incomplete tasks in an active year.
        // If you want to refresh the entire roadmap or the latest active year even if complete, that logic would be different.
         activeYearIndex = currentRoadmap.yearly_roadmap.length - 1; // Target the last year for potential refresh
         if (activeYearIndex < 0) {
            return NextResponse.json({ success: true, message: "No years in roadmap to update.", updatedRoadmap: currentRoadmap });
         }
    }
    
    console.log(`Updating roadmap for user ${user_id}. Active year index: ${activeYearIndex}`);

    const yearToUpdate = currentRoadmap.yearly_roadmap[activeYearIndex];

    for (let phaseIndex = 0; phaseIndex < yearToUpdate.phases.length; phaseIndex++) {
      const phase = yearToUpdate.phases[phaseIndex];
      for (let mIndex = 0; mIndex < phase.milestones.length; mIndex++) {
        const milestone = phase.milestones[mIndex];
        const incompleteTasks = getIncompleteTasks(milestone);

        if (incompleteTasks.length === 0) {
          console.log(`Milestone "${milestone.name}" has no incomplete tasks. Skipping.`);
          continue;
        }

        const milestonePrompt = buildMilestoneUpdatePrompt(milestone, difficulty, incompleteTasks);
        console.log(`Attempting to update milestone: "${milestone.name}" with ${incompleteTasks.length} incomplete tasks. Prompt: ${milestonePrompt.substring(0, 200)}...`);

        try {
          const updatedTasksStr = await generateUpdatedTasksForMilestone(milestonePrompt);
          let updatedTasksFromAI;
          try {
            updatedTasksFromAI = JSON.parse(updatedTasksStr);
            if (!Array.isArray(updatedTasksFromAI)) {
                throw new Error("Gemini response was not a JSON array of tasks.");
            }
          } catch (parseError: any) {
            console.error("Failed to parse JSON array from Gemini for milestone:", milestone.name, "Raw response:", updatedTasksStr, "Error:", parseError.message);
            // Potentially skip this milestone update or retry with different parsing
            continue; // Skip this milestone
          }

          // Smart merging: ONLY update incomplete tasks, leave completed tasks untouched
          let newTaskListForMilestone: any[] = [];
          let aiTaskIndex = 0;
          
          for (const originalTask of milestone.tasks) {
            // CRITICAL: If task is completed, keep it exactly as is - DO NOT MODIFY
            if (originalTask.completed) {
              newTaskListForMilestone.push(originalTask); // Keep completed task unchanged
              continue;
            }
            
            // Only process incomplete tasks
            const aiTask = updatedTasksFromAI[aiTaskIndex++] || null;
            const baseTask = aiTask
              ? {
                  ...aiTask,
                  completed: false,
                }
              : { ...originalTask };

            // Note: Individual video lookup removed here since enrichRoadmapVideos will handle video updates
            newTaskListForMilestone.push(baseTask);
          }
          currentRoadmap.yearly_roadmap[activeYearIndex].phases[phaseIndex].milestones[mIndex].tasks = newTaskListForMilestone;
          console.log(`Successfully updated tasks for milestone: "${milestone.name}"`);

        } catch (err: any) {
          console.error(`Error updating tasks for milestone "${milestone.name}":`, err.message, "Skipping this milestone.");
          // Continue to the next milestone even if one fails
        }
      }
    }
    
    console.log(`Roadmap update process completed for user ${user_id}. Enriching videos...`);

    // NEW: Enrich videos for all incomplete tasks after AI updates are merged
    currentRoadmap = await enrichRoadmapVideos(currentRoadmap);
    
    console.log(`Video enrichment completed for user ${user_id}. Recalculating progress.`);

    const taskCountProgress = calculateTaskCountProgress(currentRoadmap);
    const weightProgress = calculateWeightProgress(currentRoadmap);
    console.log("Task count progress:", taskCountProgress, "Weight progress:", weightProgress);

    const { error: updateError } = await supabase
      .from('career_info')
      .update({ roadmap: currentRoadmap, updated_at: new Date().toISOString() })
      .eq('user_id', user_id);

    if (updateError) {
      console.error("Error saving updated roadmap to Supabase:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { error: analyticsError } = await supabase
      .from('user_analytics')
      .upsert({
        user_id,
        task_completed: Math.round(taskCountProgress.percentage),
        overall_task_percentage: weightProgress,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (analyticsError) {
      // Log but don't fail the whole request if analytics update fails
      console.warn("Error updating user_analytics:", analyticsError.message);
    }

    console.log(`Successfully updated roadmap and analytics for user ${user_id}`);
    return NextResponse.json({ success: true, message: "Roadmap updated successfully.", updatedRoadmap: currentRoadmap });

  } catch (err: any) {
    console.error("Unhandled error in POST /api/update-user-roadmap:", err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message || err.toString() }, { status: 500 });
  }
}