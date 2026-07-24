import { describe, it, expect } from 'vitest';
import { computeDailyQuota, computeRollingAdherence, computeFocusRatio } from './index';
import { Task, TaskInstance, DailyStats } from '../../types/models';

describe('Metrics Lib', () => {
  describe('computeDailyQuota', () => {
    it('calculates the number of active daily tasks', () => {
      const tasks: Task[] = [
        { id: '1', uid: 'u1', title: 'Task 1', type: 'daily', isActive: true, createdAt: 0, updatedAt: 0 },
        { id: '2', uid: 'u1', title: 'Task 2', type: 'one-off', isActive: true, createdAt: 0, updatedAt: 0 },
        { id: '3', uid: 'u1', title: 'Task 3', type: 'daily', isActive: false, createdAt: 0, updatedAt: 0 },
        { id: '4', uid: 'u1', title: 'Task 4', type: 'daily', isActive: true, createdAt: 0, updatedAt: 0 },
      ];
      expect(computeDailyQuota(tasks)).toBe(2);
    });

    it('returns 0 for empty array', () => {
      expect(computeDailyQuota([])).toBe(0);
    });
  });

  describe('computeRollingAdherence', () => {
    it('calculates rolling adherence correctly', () => {
      const stats: DailyStats[] = [
        { id: 's1', uid: 'u1', date: '2023-01-01', tasksCompleted: 2, totalTasks: 2, dailyQuota: 4, adherence: 0.5, focusRatio: 0, createdAt: 0 },
        { id: 's2', uid: 'u1', date: '2023-01-02', tasksCompleted: 4, totalTasks: 4, dailyQuota: 4, adherence: 1.0, focusRatio: 0, createdAt: 0 },
      ];
      // Total completed: 6, total quota: 8. Adherence = 6 / 8 = 0.75
      expect(computeRollingAdherence(stats)).toBe(0.75);
    });

    it('handles 0 quota without throwing NaN', () => {
      const stats: DailyStats[] = [
        { id: 's1', uid: 'u1', date: '2023-01-01', tasksCompleted: 0, totalTasks: 0, dailyQuota: 0, adherence: 0, focusRatio: 0, createdAt: 0 },
      ];
      expect(computeRollingAdherence(stats)).toBe(0);
    });
  });

  describe('computeFocusRatio', () => {
    it('calculates focus ratio based on goal-related tasks', () => {
      const tasks: Task[] = [
        { id: 't1', uid: 'u1', title: 'T1', type: 'daily', isActive: true, goalId: 'g1', createdAt: 0, updatedAt: 0 },
        { id: 't2', uid: 'u1', title: 'T2', type: 'daily', isActive: true, createdAt: 0, updatedAt: 0 },
      ];
      const instances: TaskInstance[] = [
        { id: 'i1', uid: 'u1', taskId: 't1', date: '2023-01-01', status: 'completed' },
        { id: 'i2', uid: 'u1', taskId: 't2', date: '2023-01-01', status: 'completed' },
        { id: 'i3', uid: 'u1', taskId: 't2', date: '2023-01-02', status: 'pending' },
      ];
      
      // Completed instances: i1 (goal), i2 (no goal). Focus ratio = 1/2 = 0.5
      expect(computeFocusRatio(tasks, instances)).toBe(0.5);
    });

    it('returns 0 when no completed instances exist', () => {
      expect(computeFocusRatio([], [])).toBe(0);
    });
  });
});
