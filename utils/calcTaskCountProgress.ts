export function calculateTaskCountProgress(roadmap: any): number {
    let totalTasks = 0;
    let completedTasks = 0;
  
    roadmap.yearly_roadmap.forEach((year: any) => {
      year.phases.forEach((phase: any) => {
        phase.milestones.forEach((milestone: any) => {
          milestone.tasks.forEach((task: any) => {
            totalTasks += 1;
            if (task.completed) completedTasks += 1;
          });
        });
      });
    });
  
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  }
  