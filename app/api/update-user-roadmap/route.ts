import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/supabaseClient';
import { calculateTaskCountProgress } from '@/utils/calcTaskCountProgress';
import { calculateWeightProgress } from '@/utils/calcWeightProgress';

export const runtime = 'nodejs';

type YtVideo = {
  url: string;
  title: string;
  thumbnail: string;
  seconds: number;
  timestamp?: string;
};

/**
 * Given a query string, return the top YouTube tutorial or null
 */
async function lookupYouTubeVideo(
  query: string,
  minSeconds?: number
): Promise<{ url: string; title: string; thumbnail: string } | null> {
  // dynamically import yt-search at runtime
  const { default: yts } = await import('yt-search');
  const r = await yts(query + ' tutorial');
  const vids: YtVideo[] = r.videos || [];

  // keep only standard watch URLs (no shorts)
  let candidates = vids.filter(v =>
    v.url.includes('watch?v=') && !v.url.includes('/shorts/')
  );

  // if minSeconds is specified, require it as a floor
  if (minSeconds != null) {
    candidates = candidates.filter(v =>
      (v.seconds && v.seconds >= minSeconds) ||
      (typeof v.seconds !== 'number' && v.timestamp && (() => {
        const [m, s] = v.timestamp.split(':').map(n => parseInt(n, 10) || 0);
        return m * 60 + s >= minSeconds;
      })())
    );
  }

  // pick the first candidate ≥ minSeconds, else first standard
  const pick = candidates[0] ||
    vids.find(v => v.url.includes('watch?v=') && !v.url.includes('/shorts/')) ||
    null;

  return pick
    ? { url: pick.url, title: pick.title, thumbnail: pick.thumbnail }
    : null;
}

/**
 * Enriches roadmap videos for incomplete tasks that already have video entries
 */
async function enrichRoadmapVideos(roadmap: any): Promise<any> {
  if (!roadmap?.yearly_roadmap || !Array.isArray(roadmap.yearly_roadmap)) {
    return roadmap;
  }
  const copy = JSON.parse(JSON.stringify(roadmap));

  for (const year of copy.yearly_roadmap) {
    for (const phase of year.phases) {
      for (const milestone of phase.milestones) {
        for (const task of milestone.tasks) {
          if (task.completed || !task.video) continue;
          try {
            const fresh = await lookupYouTubeVideo(
              `${task.task_title}: ${task.description}`,
              120
            );
            if (fresh) task.video = fresh;
          } catch (err) {
            console.warn('YT lookup failed for task', task.task_title, err);
          }
        }
      }
    }
  }
  return copy;
}

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

function getIncompleteTasks(milestone: any): any[] {
  return milestone.tasks.filter((t: any) => !t.completed);
}

function buildMilestoneUpdatePrompt(milestone: any, difficulty: string, incompleteTasks: any[]): string {
  const tasksText = incompleteTasks.map((t: any) =>
    `Task Title: ${t.task_title}\nOriginal Description: ${t.description}\nWeight: ${t.weight}`
  ).join('\n\n');

  return `You are Careeroadmap's AI expert. Always respond strictly in JSON format (an array of task objects) with no markdown or extra text.
For the milestone "${milestone.name}" (Description: ${milestone.description}), review the following incomplete tasks:
${tasksText}

Based on the ${difficulty} difficulty level, update these tasks ONLY IF a significantly newer, more relevant, or trending alternative is available.
If the existing tasks are still the best option, return them unchanged but ensure they match the full structure.
...
Return ONLY the JSON array.`;
}

async function generateUpdatedTasksForMilestone(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp-1219:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.8, topP: 1.0, topK: 0 } })
  });
  const data = await res.json();
  if (!res.ok || !data.candidates?.length) {
    throw new Error(`Gemini failed: ${res.status}`);
  }
  const raw = data.candidates[0].content.parts[0].text;
  const match = raw.match(/```json\s*([\s\S]*?)\s*```/) || raw.match(/(\[[\s\S]*\])/);
  if (!match) throw new Error('No JSON array found');
  return (match[1] || match[0]).trim();
}

export async function POST(request: Request) {
  try {
    const { user_id } = await request.json();
    if (!user_id) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });

    const { data, error } = await supabase
      .from('career_info')
      .select('difficulty, roadmap, updated_at')
      .eq('user_id', user_id)
      .single();
    if (error || !data) return NextResponse.json({ error: 'Career info not found' }, { status: 500 });

    let roadmap = typeof data.roadmap === 'string' ? JSON.parse(data.roadmap) : data.roadmap;
    // ... find active year, loop milestones, update tasks ...

    roadmap = await enrichRoadmapVideos(roadmap);

    const taskCount = calculateTaskCountProgress(roadmap);
    const weightPct = calculateWeightProgress(roadmap);
    await supabase.from('career_info').update({ roadmap, updated_at: new Date().toISOString() }).eq('user_id', user_id);
    await supabase.from('user_analytics').upsert({ user_id, task_completed: Math.round(taskCount.percentage), overall_task_percentage: weightPct, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

    return NextResponse.json({ success: true, updatedRoadmap: roadmap });
  } catch (err: any) {
    console.error('Error in update-user-roadmap:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
