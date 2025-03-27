import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/supabaseClient';
import { calculateTaskCountProgress } from '@/utils/calcTaskCountProgress';
import { calculateWeightProgress } from '@/utils/calcWeightProgress';
import { updateUserPaceFromRoadmap } from '@/utils/calcAndStorePace';

/**
 * Request body should contain:
 * - user_id: string
 * - task_title: string (to uniquely identify the task)
 * - completed: boolean
 * - currentPhaseIdentifier: string (e.g., "Apr-Jun") to help extract planned dates from the roadmap
 */
export async function POST(request: Request) {
  try {
    console.log("Update task endpoint called");
    const { user_id, task_title, completed, currentPhaseIdentifier } = await request.json();
    console.log("Request body:", { user_id, task_title, completed, currentPhaseIdentifier });
    if (!user_id || !task_title) {
      console.error("Missing parameters");
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Fetch the current roadmap from career_info.
    const { data: careerInfoData, error: fetchError } = await supabase
      .from('career_info')
      .select('roadmap')
      .eq('user_id', user_id)
      .single();
    if (fetchError || !careerInfoData) {
      console.error("Error fetching career info:", fetchError);
      return NextResponse.json({ error: 'Could not fetch career info' }, { status: 500 });
    }
    console.log("Fetched career info:", careerInfoData);

    let roadmap = careerInfoData.roadmap;
    // Parse the roadmap JSON.
    let parsedRoadmap = typeof roadmap === 'string' ? JSON.parse(roadmap) : roadmap;
    console.log("Parsed roadmap:", parsedRoadmap);
    let taskFound = false;

    // Find and update the task in the roadmap.
    parsedRoadmap.yearly_roadmap.forEach((year: any) => {
      year.phases.forEach((phase: any) => {
        phase.milestones.forEach((milestone: any) => {
          milestone.tasks.forEach((task: any) => {
            if (task.task_title === task_title) {
              console.log(`Found task "${task_title}" in phase "${phase.phase_name}"`);
              task.completed = completed;
              task.completed_at = new Date().toISOString();
              taskFound = true;
            }
          });
        });
      });
    });

    if (!taskFound) {
      console.error("Task not found:", task_title);
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update the career_info record with the modified roadmap.
    const { error: updateError } = await supabase
      .from('career_info')
      .update({ roadmap: parsedRoadmap, updated_at: new Date().toISOString() })
      .eq('user_id', user_id);
    if (updateError) {
      console.error("Error updating career_info:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    console.log("Updated career_info with modified roadmap");

    // Calculate progress metrics from the updated roadmap.
    const taskCountProgress = calculateTaskCountProgress(parsedRoadmap);
    const weightProgress = calculateWeightProgress(parsedRoadmap);
    console.log("Calculated task count progress:", taskCountProgress);
    console.log("Calculated weight progress:", weightProgress);

    // Update pace by extracting the current phase's planned dates from the roadmap.
    const paceResult = await updateUserPaceFromRoadmap(user_id, parsedRoadmap, currentPhaseIdentifier, new Date());
    console.log("Updated pace result:", paceResult);

    // Upsert the user_analytics record with the calculated metrics.
    const { error: analyticsError } = await supabase
      .from('user_analytics')
      .upsert({
        user_id,
        task_completed: taskCountProgress,          // Count-based progress percentage
        overall_task_percentage: weightProgress,      // Weight-based progress percentage
        updated_at: new Date().toISOString(),
        pace: paceResult?.pace || 'on_track'
      }, { onConflict: 'user_id' });
    if (analyticsError) {
      console.error("Error updating user_analytics:", analyticsError);
      return NextResponse.json({ error: analyticsError.message }, { status: 500 });
    }
    console.log("Upserted analytics successfully");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Internal error in update-task endpoint:", err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message || err }, { status: 500 });
  }
}
