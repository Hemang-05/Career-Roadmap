import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/supabaseClient';

// --- Helper Functions ---

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

// Builds a prompt to update only the incomplete tasks in a milestone.
// This prompt instructs the AI to update the tasks only if there's a trending alternative.
function buildMilestoneUpdatePrompt(milestone: any, difficulty: string): string {
  const incompleteTasks = getIncompleteTasks(milestone);
  const tasksText = incompleteTasks.map((task: any) => {
    return `Task Title: ${task.task_title}\nWeight: ${task.weight}`;
  }).join("\n\n");
  
  const prompt = `For the milestone "${milestone.name}" (Description: ${milestone.description}), review the following incomplete tasks:
  ${tasksText}
  
  Based on the ${difficulty} difficulty level, update these tasks only if there is a newer, more trending alternative available and provide explanation or description of that task in atleast 2 to 3 lines. If the existing tasks are still the best option, leave them unchanged.
  Return the updated tasks as a JSON array in the same order and count.`;
  
  return prompt;
}

// Calls the OpenRouter API using the provided prompt and returns the response string.
async function generateRoadmap(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro-exp-03-25:free",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      top_p: 1,
      temperature: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      repetition_penalty: 1,
      top_k: 0,
    }),
  });

  const data = await response.json();
  console.log('OpenRouter API response:', data);

  if (!data.choices || data.choices.length === 0) {
    throw new Error('No choices returned from OpenRouter API');
  }

  const rawContent = data.choices[0].message.content.trim();
  const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/i) || rawContent.match(/{[\s\S]*}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON found in response');
  }
  const cleanContent = jsonMatch[1] || jsonMatch[0];
  return cleanContent.trim();
}

// --- Main Endpoint Handler ---

import { calculateTaskCountProgress } from '@/utils/calcTaskCountProgress';
import { calculateWeightProgress } from '@/utils/calcWeightProgress';


export async function POST(request: Request) {
  try {
    const { user_id } = await request.json();
    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // Fetch stored career info and roadmap.
    const { data: careerInfoData, error: fetchError } = await supabase
      .from('career_info')
      .select(`
        desired_career,
        residing_country,
        spending_capacity,
        current_class,
        move_abroad,
        preferred_abroad_country,
        previous_experience,
        difficulty,
        roadmap
      `)
      .eq('user_id', user_id)
      .single();
    if (fetchError || !careerInfoData) {
      return NextResponse.json({ error: 'Career info record not found' }, { status: 500 });
    }

    const {
      desired_career,
      residing_country,
      spending_capacity,
      current_class,
      move_abroad,
      preferred_abroad_country,
      previous_experience,
      difficulty,
      roadmap: storedRoadmap
    } = careerInfoData;

    if (!desired_career) {
      return NextResponse.json({ error: 'Desired career not found in career_info' }, { status: 400 });
    }

    // Parse stored roadmap.
    let currentRoadmap = typeof storedRoadmap === 'string'
      ? JSON.parse(storedRoadmap)
      : storedRoadmap;

    // Determine active (unlocked) year: first year that is incomplete.
    let activeYearIndex = 0;
    for (let i = 0; i < currentRoadmap.yearly_roadmap.length; i++) {
      if (!isYearComplete(currentRoadmap.yearly_roadmap[i])) {
        activeYearIndex = i;
        break;
      }
    }

    // For the active year, update its milestones' incomplete tasks.
    for (let phaseIndex = 0; phaseIndex < currentRoadmap.yearly_roadmap[activeYearIndex].phases.length; phaseIndex++) {
      const phase = currentRoadmap.yearly_roadmap[activeYearIndex].phases[phaseIndex];
      for (let mIndex = 0; mIndex < phase.milestones.length; mIndex++) {
        const milestone = phase.milestones[mIndex];
        const incompleteTasks = getIncompleteTasks(milestone);
        if (incompleteTasks.length === 0) continue;

        // Build update prompt for this milestone.
        const milestonePrompt = buildMilestoneUpdatePrompt(milestone, difficulty);
        console.log("Milestone update prompt:", milestonePrompt);
        try {
          const updatedTasksStr = await generateRoadmap(milestonePrompt);
          const updatedTasks = JSON.parse(updatedTasksStr);
          // Merge updated tasks into the milestone: preserve completed tasks and maintain task count.
          let newTasks = [];
          let updIndex = 0;
          for (let tIndex = 0; tIndex < milestone.tasks.length; tIndex++) {
            const oldTask = milestone.tasks[tIndex];
            if (oldTask.completed) {
              newTasks.push(oldTask);
            } else {
              if (updIndex < updatedTasks.length) {
                const updatedTask = updatedTasks[updIndex];
                updatedTask.completed = false;
                newTasks.push(updatedTasks[updIndex]);
                updIndex++;
              } else {
                newTasks.push(oldTask);
              }
            }
          }
          currentRoadmap.yearly_roadmap[activeYearIndex].phases[phaseIndex].milestones[mIndex].tasks = newTasks;
        } catch (err) {
          console.error("Error updating milestone tasks:", err);
        }
      }
    }

    // Preserve overall roadmap details.
    currentRoadmap.career = currentRoadmap.career;
    currentRoadmap.roadmap_summary = currentRoadmap.roadmap_summary;

    console.log("updated the map");

    // Recalculate progress metrics.
    const taskCountProgress = calculateTaskCountProgress(currentRoadmap);
    const weightProgress = calculateWeightProgress(currentRoadmap);
    console.log("Task count progress:", taskCountProgress, "Weight progress:", weightProgress);


    // Update the career_info record with the merged roadmap.
    const { error: updateError } = await supabase
      .from('career_info')
      .update({ roadmap: currentRoadmap, updated_at: new Date().toISOString() })
      .eq('user_id', user_id);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Upsert analytics metrics into user_analytics (rounding task_completed to an integer).
    const { error: analyticsError } = await supabase
      .from('user_analytics')
      .upsert({
        user_id,
        task_completed: Math.round(taskCountProgress),
        overall_task_percentage: weightProgress,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    if (analyticsError) {
      return NextResponse.json({ error: analyticsError.message }, { status: 500 });
    }

    console.log(`Successfully updated roadmap and analytics for user ${user_id}`);
    console.log("updated the map");
    return NextResponse.json({ success: true, updatedRoadmap: currentRoadmap });
  } catch (err: any) {
    console.error("Error in update-user-roadmap endpoint:", err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message || err }, { status: 500 });
  }
}
