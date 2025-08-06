import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/supabaseClient";

export const runtime = 'nodejs';

// Simplified Types
interface UserContext {
  educational_stage: string;
  difficulty: string;
  preferred_learning_style: string;
  desired_career: string;
}

interface TaskContext {
  task_title: string;
  description: string;
  phase_name: string;
  milestone_name: string;
}

interface VideoCandidate {
  url: string;
  title: string;
  thumbnail: string;
  seconds: number;
  timestamp?: string;
  viewCount?: number;
  channelTitle?: string;
}

interface AnalyzedVideo {
  title: string;
  url: string;
  thumbnail: string;
  rag_score: number;
  teaching_style: string;
  duration: string;
}

// ✅ NEW: Rate Limiter Class
class RateLimiter {
  private requestTimes: number[] = [];
  private maxRequests: number;
  private timeWindow: number; // in milliseconds

  constructor(maxRequests: number, timeWindowMinutes: number) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMinutes * 60 * 1000; // convert to ms
  }

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    
    // Remove requests older than time window
    this.requestTimes = this.requestTimes.filter(
      time => now - time < this.timeWindow
    );

    if (this.requestTimes.length >= this.maxRequests) {
      // Calculate how long to wait
      const oldestRequest = this.requestTimes[0];
      const waitTime = this.timeWindow - (now - oldestRequest);
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    this.requestTimes.push(now);
  }
}

// Create rate limiter instance (20 requests per minute for safety margin)
const geminiRateLimiter = new RateLimiter(20, 1);

// Helper function to parse video duration
function parseTimestamp(ts: string): number {
  const [m, s] = ts.split(":").map((n) => parseInt(n, 10) || 0);
  return m * 60 + s;
}

// Get 3 video candidates with updated duration filter
async function getVideoCandidates(taskContext: TaskContext): Promise<VideoCandidate[]> {
  try {
    const { default: yts } = await import('yt-search');
    const query = `${taskContext.task_title} tutorial`;
    const results = await yts(query);
    const videos: VideoCandidate[] = results.videos || [];

    // Filter for videos over 3 minutes with NO upper cap
    const qualityVideos = videos.filter((video) => {
      if (!video.url.includes("watch?v=") || video.url.includes("/shorts/")) return false;
      
      const duration = typeof video.seconds === "number" && video.seconds > 0
        ? video.seconds
        : video.timestamp ? parseTimestamp(video.timestamp) : 0;
      
      return duration >= 180; // Only 3+ minutes minimum, no max limit
    });

    return qualityVideos.slice(0, 3);
  } catch (error) {
    console.error('Error getting video candidates:', error);
    return [];
  }
}

// ✅ NEW: Batch analysis function (replaces individual video analysis)
async function analyzeBatchOfVideos(
  videos: VideoCandidate[],
  taskContext: TaskContext, 
  userContext: UserContext
): Promise<AnalyzedVideo[]> {
  try {
    const apiKey = process.env.GEMINI_API_KEY_TAG;
    if (!apiKey) {
      console.error('Missing KEY');
      return [];
    }

    // ✅ WAIT FOR RATE LIMIT BEFORE MAKING REQUEST
    await geminiRateLimiter.waitIfNeeded();

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    // ✅ BATCH ANALYSIS: Analyze all 3 videos in one prompt
    const batchPrompt = `You are an educational content evaluator. Analyze and rank these ${videos.length} videos for learning "${taskContext.task_title}":

${videos.map((video, index) => `
VIDEO ${index + 1}:
- Title: ${video.title}
- Channel: ${video.channelTitle || 'Unknown'}
- Duration: ${video.timestamp || 'Unknown'}
- Views: ${video.viewCount || 'Unknown'}
- URL: ${video.url}
`).join('')}

LEARNER CONTEXT:
- Educational Level: ${userContext.educational_stage}
- Difficulty: ${userContext.difficulty}
- Learning Style: ${userContext.preferred_learning_style}
- Career Goal: ${userContext.desired_career}

EVALUATION CRITERIA:
1. Concept coverage for "${taskContext.task_title}"
2. Video quality indicators (title professionalism, channel credibility, view count)
3. Educational appropriateness for ${userContext.difficulty} difficulty level
4. Alignment with ${userContext.preferred_learning_style} learning style

Respond with a JSON array containing analysis for each video in the same order:
[
  {
    "rag_score": number (0-100),
    "teaching_style": "methodical" | "hands-on" | "comprehensive" | "visual" | "theoretical",
    "reasoning": "brief explanation of score and style"
  },
  {
    "rag_score": number (0-100),
    "teaching_style": "methodical" | "hands-on" | "comprehensive" | "visual" | "theoretical", 
    "reasoning": "brief explanation of score and style"
  },
  {
    "rag_score": number (0-100),
    "teaching_style": "methodical" | "hands-on" | "comprehensive" | "visual" | "theoretical",
    "reasoning": "brief explanation of score and style"
  }
]

Focus on educational effectiveness, not entertainment value.`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: batchPrompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
        }
      })
    });

    // ✅ IMPROVED: Handle 429 errors with exponential backoff
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Retry once
      return await analyzeBatchOfVideos(videos, taskContext, userContext);
    }

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      return [];
    }

    const rawResponse = data.candidates[0].content.parts[0].text;
    const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
      return [];
    }

    const analyses = JSON.parse(jsonMatch[0]);

    // ✅ COMBINE: Merge video data with LLM analysis
    const analyzedVideos: AnalyzedVideo[] = videos.map((video, index) => {
      const analysis = analyses[index] || {};
      return {
        title: video.title,
        url: video.url,
        thumbnail: video.thumbnail,
        rag_score: Math.max(0, Math.min(100, analysis.rag_score || 50)),
        teaching_style: analysis.teaching_style || 'general',
        duration: video.timestamp || 'Unknown'
      };
    });

    return analyzedVideos;

  } catch (error) {
    console.error('Error in batch video analysis:', error);
    return [];
  }
}

// ✅ UPDATED: Enhanced task processing with batch analysis
async function enhanceTaskVideos(
  task: any,
  taskContext: TaskContext,
  userContext: UserContext
): Promise<AnalyzedVideo[]> {
  try {
    const candidates = await getVideoCandidates(taskContext);
    if (candidates.length === 0) {
      // FALLBACK: Return original video as single option
      if (task.video?.url) {
        return [{
          title: task.video.title || taskContext.task_title,
          url: task.video.url,
          thumbnail: task.video.thumbnail || '',
          rag_score: 70,
          teaching_style: 'original',
          duration: 'Unknown'
        }];
      }
      return [];
    }

    // ✅ NEW: Use batch analysis instead of individual calls
    const analyzedVideos = await analyzeBatchOfVideos(candidates, taskContext, userContext);

    // FALLBACK: If batch analysis fails, use basic scoring
    if (analyzedVideos.length === 0) {
      // Use basic scoring based on metadata
      const basicAnalysis = candidates.map((video, index) => ({
        title: video.title,
        url: video.url,
        thumbnail: video.thumbnail,
        rag_score: 80 - (index * 5), // Descending scores
        teaching_style: 'general',
        duration: video.timestamp || 'Unknown'
      }));
      
      analyzedVideos.push(...basicAnalysis);
    }

    // ENHANCED: Always include original video as fallback option
    if (task.video?.url) {
      analyzedVideos.push({
        title: `${task.video.title || taskContext.task_title} (Original)`,
        url: task.video.url,
        thumbnail: task.video.thumbnail || '',
        rag_score: 70,
        teaching_style: 'original',
        duration: 'Unknown'
      });
    }

    // Sort by RAG score (DESCENDING: highest to lowest) and return top 3
    return analyzedVideos
      .sort((a, b) => b.rag_score - a.rag_score)
      .slice(0, 3);

  } catch (error) {
    console.error('Error enhancing task videos:', error);
    // FINAL FALLBACK: Return original video on any error
    if (task.video?.url) {
      return [{
        title: task.video.title || taskContext.task_title,
        url: task.video.url,
        thumbnail: task.video.thumbnail || '',
        rag_score: 70,
        teaching_style: 'original',
        duration: 'Unknown'
      }];
    }
    return [];
  }
}

// ✅ UPDATED: Sequential processing to avoid rate limits
export async function POST(request: Request) {
  try {
    const { clerk_id, userContext, yearIndex } = await request.json();
    
    if (!clerk_id || !userContext) {
      return NextResponse.json({ 
        error: "Missing clerk_id or userContext" 
      }, { status: 400 });
    }

    // Lookup user_id from clerk_id
    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerk_id)
      .single();
      
    if (userError || !userRecord) {
      return NextResponse.json({ 
        error: "User record not found" 
      }, { status: 500 });
    }
    
    const user_id = userRecord.id;

    // Step 1: Fetch existing roadmap
    const { data: careerInfo, error: fetchError } = await supabase
      .from("career_info")
      .select("roadmap")
      .eq("user_id", user_id)
      .single();

    if (fetchError || !careerInfo?.roadmap) {
      return NextResponse.json({ 
        error: "Roadmap not found" 
      }, { status: 404 });
    }

    const roadmap = careerInfo.roadmap;

// Step 2: Collect ONLY tasks from the specified year
const tasksWithVideos: Array<{
    task: any;
    context: TaskContext;
    yearIndex: number;
    phaseIndex: number;
    milestoneIndex: number;
    taskIndex: number;
  }> = [];
  
  // ✅ FIXED: Get the specific year and iterate over its phases
  const selectedYear = roadmap.yearly_roadmap[yearIndex];
  if (!selectedYear) {
    return NextResponse.json({ 
      error: `Year ${yearIndex} not found in roadmap` 
    }, { status: 404 });
  }
  
  selectedYear.phases?.forEach((phase: any, phaseIndex: number) => {
    phase.milestones?.forEach((milestone: any, milestoneIndex: number) => {
      milestone.tasks?.forEach((task: any, taskIndex: number) => {
        if (task.video?.url) {
          tasksWithVideos.push({
            task,
            context: {
              task_title: task.task_title,
              description: task.description,
              phase_name: phase.phase_name,
              milestone_name: milestone.name
            },
            yearIndex, // Use the original yearIndex parameter
            phaseIndex,
            milestoneIndex,
            taskIndex
          });
        }
      });
    });
  });
  



    // ✅ UPDATED: Process tasks sequentially to avoid rate limits
    let processedCount = 0;

    for (let i = 0; i < tasksWithVideos.length; i++) {
      const { task, context, yearIndex, phaseIndex, milestoneIndex, taskIndex } = tasksWithVideos[i];
      
      try {
        
        const enhancedVideos = await enhanceTaskVideos(task, context, userContext);
        
        if (enhancedVideos.length > 0) {
          // Replace single video with videos array
          delete roadmap.yearly_roadmap[yearIndex].phases[phaseIndex]
            .milestones[milestoneIndex].tasks[taskIndex].video;
          
          roadmap.yearly_roadmap[yearIndex].phases[phaseIndex]
            .milestones[milestoneIndex].tasks[taskIndex].videos = enhancedVideos;
          
          roadmap.yearly_roadmap[yearIndex].phases[phaseIndex]
            .milestones[milestoneIndex].tasks[taskIndex].current_video_index = 0;
        }
        
        processedCount++;
        
        
      } catch (error) {
        console.error(` Failed:`, error);
      }
    }

    // Step 3: Save enhanced roadmap
    const { error: updateError } = await supabase
      .from("career_info")
      .update({
        roadmap,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user_id);

    if (updateError) {
      console.error('Error updating enhanced roadmap:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }


    return NextResponse.json({ 
      success: true,
      enhanced_tasks: processedCount,
      total_tasks: tasksWithVideos.length
    });

  } catch (error: any) {
    console.error('Error in RAG video enhancement:', error);
    
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}
