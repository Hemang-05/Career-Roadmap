// app/api/update-task/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/supabaseClient';
import { calculateTaskCountProgress } from '@/utils/calcTaskCountProgress';
import { calculateWeightProgress } from '@/utils/calcWeightProgress';
import { getPaceFromPhaseName } from '@/utils/getPaceFromPhaseName';

export async function POST(request: Request) {
  try {
    const { user_id, task_title, completed, currentPhaseIdentifier } = await request.json();
    if (!user_id || !task_title) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Fetch and update roadmap
    const { data: careerInfoData, error: fetchError } = await supabase
      .from('career_info')
      .select('roadmap')
      .eq('user_id', user_id)
      .single();
      
    if (fetchError || !careerInfoData) {
      return NextResponse.json({ error: 'Could not fetch career info' }, { status: 500 });
    }
    
    let roadmap = careerInfoData.roadmap;
    let parsedRoadmap = typeof roadmap === 'string' ? JSON.parse(roadmap) : roadmap;
    
    let taskFound = false;
    parsedRoadmap.yearly_roadmap.forEach((year: any) => {
      if (!year?.phases) return;
      year.phases.forEach((phase: any) => {
        if (!phase?.milestones) return;
        phase.milestones.forEach((milestone: any) => {
          if (!milestone?.tasks) return;
          milestone.tasks.forEach((task: any) => {
            if (task.task_title === task_title) {
              task.completed = completed;
              task.completed_at = new Date().toISOString();
              taskFound = true;
            }
          });
        });
      });
    });

    if (!taskFound) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update the roadmap in the database.
    const { error: updateError } = await supabase
      .from('career_info')
      .update({ roadmap: parsedRoadmap, updated_at: new Date().toISOString() })
      .eq('user_id', user_id);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Calculate progress metrics.
    const taskProgressData = calculateTaskCountProgress(parsedRoadmap); // This returns a TaskProgress object
    const completedTasksCount = taskProgressData.completedTasks;        // Extract just the count
    const weightProgress = calculateWeightProgress(parsedRoadmap);      // float percentage

    // Determine pace directly from the phase name, passing the completed tasks count
    console.log("Using phase name for pace:", currentPhaseIdentifier);
    console.log("Completed tasks count:", completedTasksCount);
    const pace = getPaceFromPhaseName(currentPhaseIdentifier, completedTasksCount);
    console.log("Determined pace:", pace);

    // Upsert analytics.
    const { error: analyticsError } = await supabase
      .from('user_analytics')
      .upsert({
        user_id,
        task_completed: completedTasksCount,            // integer count
        overall_task_percentage: weightProgress,        // float percentage
        updated_at: new Date().toISOString(),
        pace: pace
      }, { onConflict: 'user_id' });
      
    if (analyticsError) {
      return NextResponse.json({ error: analyticsError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, pace: pace });
  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message || err }, { status: 500 });
  }
}