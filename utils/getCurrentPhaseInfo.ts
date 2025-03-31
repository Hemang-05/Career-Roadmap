// utils/getCurrentPhaseInfo.ts
export function getCurrentPhaseInfo(
    roadmap: any,
    currentPhaseIdentifier: string
  ): { startDate: Date; endDate: Date } | null {
    for (const year of roadmap.yearly_roadmap) {
      for (const phase of year.phases) {
        // Log for debugging (optional)
        // console.log("Checking phase:", phase.phase_name);
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
  