// utils/calcTaskCountProgress.ts
interface TaskProgress {
  completedTasks: number;
  totalTasks: number;
  percentage: number;
}

export function calculateTaskCountProgress(roadmap: any): TaskProgress {
  let completedTasks = 0;
  let totalTasks = 0;

  if (!roadmap?.yearly_roadmap) return { completedTasks: 0, totalTasks: 0, percentage: 0 };

  roadmap.yearly_roadmap.forEach((year: any) => {
    if (!year?.phases) return;
    year.phases.forEach((phase: any) => {
      if (!phase?.milestones) return;
      phase.milestones.forEach((milestone: any) => {
        if (!milestone?.tasks) return;
        milestone.tasks.forEach((task: any) => {
          totalTasks++;
          if (task.completed) completedTasks++;
        });
      });
    });
  });

  return {
    completedTasks,
    totalTasks,
    percentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
  };
}