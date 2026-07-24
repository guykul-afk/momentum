import { Task, TaskInstance, DailyStats } from '../../types/models';

/**
 * Computes the daily quota based on the active recurring/daily tasks.
 * @param tasks All tasks for a user
 * @returns The daily quota number
 */
export function computeDailyQuota(tasks: Task[]): number {
  return tasks.filter((t) => t.isActive && t.type === 'daily').length;
}

/**
 * Computes a rolling average of adherence over a given number of days.
 * @param stats Array of daily stats
 * @param days The window size for the rolling average (e.g., 7 or 30 days)
 * @returns The rolling adherence as a percentage (0 to 1)
 */
export function computeRollingAdherence(stats: DailyStats[], days: number = 7): number {
  if (stats.length === 0) return 0;
  
  // Sort stats by date descending
  const sortedStats = [...stats].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recentStats = sortedStats.slice(0, days);
  
  const totalCompleted = recentStats.reduce((sum, stat) => sum + stat.tasksCompleted, 0);
  const totalQuota = recentStats.reduce((sum, stat) => sum + stat.dailyQuota, 0);
  
  if (totalQuota === 0) return 0;
  return totalCompleted / totalQuota;
}

/**
 * Computes the focus ratio (e.g., completed tasks belonging to goals vs total completed tasks).
 * @param tasks List of all tasks to map task instances to goals
 * @param instances List of completed task instances for a period
 * @returns Focus ratio (0 to 1)
 */
export function computeFocusRatio(tasks: Task[], instances: TaskInstance[]): number {
  const completedInstances = instances.filter((i) => i.status === 'completed');
  if (completedInstances.length === 0) return 0;

  let goalFocusedCount = 0;
  const taskMap = new Map<string, Task>();
  tasks.forEach((t) => taskMap.set(t.id, t));

  completedInstances.forEach((instance) => {
    const task = taskMap.get(instance.taskId);
    // If the task has a goalId, it is considered focus work
    if (task && task.goalId) {
      goalFocusedCount++;
    }
  });

  return goalFocusedCount / completedInstances.length;
}
