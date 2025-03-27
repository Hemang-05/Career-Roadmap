export function calculateWeightProgress(roadmap: any): number {
    let totalWeight = 0;
    let completedWeight = 0;
  
    roadmap.yearly_roadmap.forEach((year: any) => {
      year.phases.forEach((phase: any) => {
        phase.milestones.forEach((milestone: any) => {
          milestone.tasks.forEach((task: any) => {
            totalWeight += task.weight || 1;
            if (task.completed) {
              completedWeight += task.weight || 1;
            }
          });
        });
      });
    });
  
    return totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
  }
  