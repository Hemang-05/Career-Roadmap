// utils/calcAndStorePace.ts
import { supabase } from '@/utils/supabase/supabaseClient';
import { getCurrentPhaseInfo } from './getCurrentPhaseInfo';
import { determinePace } from './determinePace';

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
