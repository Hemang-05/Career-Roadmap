export function calculateWeightProgress(roadmap: any): number {
  let totalWeight = 0;
  let completedWeight = 0;

  roadmap.yearly_roadmap.forEach((year: any) => {
    year.phases.forEach((phase: any) => {
      phase.milestones.forEach((milestone: any) => {
        milestone.tasks.forEach((task: any) => {
          // Convert weight to a number explicitly.
          const taskWeight = Number(task.weight) || 1;
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
