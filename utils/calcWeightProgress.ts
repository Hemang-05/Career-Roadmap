// utils/calcWeightProgress.ts
export function calculateWeightProgress(roadmap: any): number {
  let totalWeight = 0;
  let completedWeight = 0;

  if (!roadmap?.yearly_roadmap) return 0;

  roadmap.yearly_roadmap.forEach((year: any) => {
    if (!year?.phases) return;
    year.phases.forEach((phase: any) => {
      if (!phase?.milestones) return;
      phase.milestones.forEach((milestone: any) => {
        if (!milestone?.tasks) return;
        milestone.tasks.forEach((task: any) => {
          const taskWeight = Number(task.weight) || 1; // Default weight if invalid or missing
          totalWeight += taskWeight;
          if (task.completed === true) {
            completedWeight += taskWeight;
          }
        });
      });
    });
  });

  return totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
}