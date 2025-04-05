// // utils/getCurrentPhaseInfo.ts
// export function getCurrentPhaseInfo(
//   roadmap: any,
//   currentPhaseIdentifier: string
// ): { startDate: Date; endDate: Date } | null {
//   // Normalize the identifier to make comparison more flexible
//   const normalizedIdentifier = currentPhaseIdentifier.toLowerCase().trim();
  
//   for (const year of roadmap.yearly_roadmap) {
//     for (const phase of year.phases) {
//       // Log for debugging
//       console.log("Checking phase:", phase.phase_name, "against", normalizedIdentifier);
      
//       // More flexible comparison - check if the phase name contains the identifier
//       if (
//         phase.phase_name && 
//         phase.phase_name.toLowerCase().includes(normalizedIdentifier)
//       ) {
//         if (phase.planned_start_date && phase.planned_end_date) {
//           console.log("Found matching phase:", phase.phase_name);
//           return {
//             startDate: new Date(phase.planned_start_date),
//             endDate: new Date(phase.planned_end_date)
//           };
//         }
//       }
//     }
//   }
  
//   console.log("No matching phase found for identifier:", currentPhaseIdentifier);
//   return null;
// }