// utils/calcTaskCountProgress.ts
export function calculateTaskCountProgress(roadmap: any): number {
  let completedTasks = 0;

  roadmap.yearly_roadmap.forEach((year: any) => {
    year.phases.forEach((phase: any) => {
      phase.milestones.forEach((milestone: any) => {
        milestone.tasks.forEach((task: any) => {
          if (task.completed) completedTasks += 1;
        });
      });
    });
  });

  return completedTasks;
}
