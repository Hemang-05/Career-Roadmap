// // utils/calcAndStorePace.ts
// import { supabase } from '@/utils/supabase/supabaseClient';
// import { getCurrentPhaseInfo } from './getCurrentPhaseInfo';
// import { determinePace } from './determinePace';

// export async function updateUserPaceFromRoadmap(
//   userId: string, 
//   roadmap: any,
//   defaultPhase: string = "Phase 1 (April - June)", 
//   currentPhaseIdentifier: string
// ): Promise<{ pace: string } | null> {
//   try {
//     // Use the currentPhaseIdentifier passed from the component if available
//     const phaseToUse = currentPhaseIdentifier || defaultPhase;
//     console.log("Looking for phase:", phaseToUse);
    
//     // Get current phase information
//     const phaseInfo = getCurrentPhaseInfo(roadmap, phaseToUse);
    
//     if (!phaseInfo) {
//       console.error("Current phase info not found in roadmap. Using fallback method...");
      
//       // Fallback method: Find the phase for the current month
//       const currentDate = new Date();
//       const currentMonth = currentDate.getMonth() + 1; // 1-12 format
      
//       // Map months to expected phases based on your description
//       let fallbackPhase = null;
//       if (currentMonth >= 4 && currentMonth <= 6) {
//         fallbackPhase = "Phase 1 (April - June)";
//       } else if (currentMonth >= 7 && currentMonth <= 9) {
//         fallbackPhase = "Phase 2 (July - September)";
//       } else if (currentMonth >= 10 && currentMonth <= 12) {
//         fallbackPhase = "Phase 3 (October - December)";
//       } else {
//         fallbackPhase = "Phase 4 (January - March)";
//       }
      
//       console.log("Using fallback phase for current month:", fallbackPhase);
      
//       // Try to get phase info again with the fallback phase
//       const fallbackPhaseInfo = getCurrentPhaseInfo(roadmap, fallbackPhase);
//       if (!fallbackPhaseInfo) {
//         console.error("Fallback phase info not found either.");
//         return { pace: "Unknown" }; // Return a default value instead of null
//       }
      
//       // Use the fallback phase info
//       const pace = determinePace(fallbackPhaseInfo.startDate, fallbackPhaseInfo.endDate, currentDate);
//       console.log("Determined pace from fallback:", pace);
      
//       // Store pace in the database
//       const { error } = await supabase
//         .from('user_analytics')
//         .upsert({
//           user_id: userId,
//           pace: pace,
//           updated_at: new Date().toISOString()
//         }, { onConflict: 'user_id' });
        
//       if (error) {
//         console.error("Error storing pace:", error);
//         return { pace }; // Still return the pace even if storage failed
//       }
      
//       return { pace };
//     }
    
//     // If we found the phase info, determine the pace
//     const currentDate = new Date();
//     const pace = determinePace(phaseInfo.startDate, phaseInfo.endDate, currentDate);
//     console.log("Determined pace:", pace);
    
//     // Store pace in the database
//     const { error } = await supabase
//       .from('user_analytics')
//       .upsert({
//         user_id: userId,
//         pace: pace,
//         updated_at: new Date().toISOString()
//       }, { onConflict: 'user_id' });
      
//     if (error) {
//       console.error("Error storing pace:", error);
//       return { pace }; // Still return the pace even if storage failed
//     }
    
//     return { pace };
//   } catch (err) {
//     console.error("Error in updateUserPaceFromRoadmap:", err);
//     return { pace: "Error" }; // Return a default value
//   }
// }