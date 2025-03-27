import { supabase } from '@/utils/supabase/supabaseClient';

/**
 * Determines the pace for a task based on planned start/end dates and the actual completion date.
 */
export function determinePace(plannedStart: Date, plannedEnd: Date, actualCompletion: Date): string {
  if (actualCompletion < plannedStart) {
    return 'ahead_of_schedule'; // e.g., "Before Time" or "Genius Pace"
  } else if (actualCompletion >= plannedStart && actualCompletion <= plannedEnd) {
    return 'on_track';
  } else {
    return 'behind_schedule';
  }
}

/**
 * Extracts the current phase's planned dates from the roadmap JSON.
 * Assumes each phase contains "planned_start_date" and "planned_end_date" fields.
 */
export function getCurrentPhaseInfo(roadmap: any, currentPhaseIdentifier: string): { startDate: Date; endDate: Date } | null {
  for (const year of roadmap.yearly_roadmap) {
    for (const phase of year.phases) {
      if (phase.phase_name && phase.phase_name.includes(currentPhaseIdentifier)) {
        if (phase.planned_start_date && phase.planned_end_date) {
          return {
            startDate: new Date(phase.planned_start_date),
            endDate: new Date(phase.planned_end_date)
          };
        }
      }
    }
  }
  return null;
}

/**
 * Updates the user's pace in the user_analytics table based on the current phase info extracted from the roadmap.
 */
export async function updateUserPaceFromRoadmap(
  userId: string,
  roadmap: any,
  currentPhaseIdentifier: string,
  actualCompletion: Date
) {
  const phaseInfo = getCurrentPhaseInfo(roadmap, currentPhaseIdentifier);
  if (!phaseInfo) {
    console.error('Current phase info not found in roadmap.');
    return;
  }
  const pace = determinePace(phaseInfo.startDate, phaseInfo.endDate, actualCompletion);
  const { data, error } = await supabase
    .from('user_analytics')
    .update({ pace, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) {
    console.error('Error updating pace:', error);
  }
  return { pace, data, error };
}
