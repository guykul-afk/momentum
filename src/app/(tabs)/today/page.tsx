'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { DailyQuotaRing } from '@/components/tasks/DailyQuotaRing';
import { AdherenceSparkline } from '@/components/tasks/AdherenceSparkline';
import { TaskCard } from '@/components/tasks/TaskCard';
import { MaintenanceSection } from '@/components/tasks/MaintenanceSection';
import { HabitSection } from '@/components/tasks/HabitSection';
import { EditTaskModal } from '@/components/tasks/EditTaskModal';
import { computeDailyQuota } from '@/lib/metrics';
import { Calendar, Sparkles, CheckCircle2, ListTodo } from 'lucide-react';
import { Task } from '@/types/models';

import { getTodayDateString } from '@/lib/dateUtils';

export default function TodayPage() {
  const { tasks, taskInstances, dailyStats, goals, toggleTaskInstance, postponeTaskToTomorrow, deleteTask } = useAppStore();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const todayStr = getTodayDateString();

  // Calculate Hebrew date string representation
  const todayFormatted = new Date().toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Priority sorting helper: weight descending (5 -> 1), then createdAt descending
  const sortByImportance = (a: Task, b: Task) => {
    const weightA = a.weight ?? 3;
    const weightB = b.weight ?? 3;
    if (weightB !== weightA) return weightB - weightA;
    return b.createdAt - a.createdAt;
  };

  // Filter tasks by categories and sort by level of importance
  const rawDailyTasks = tasks.filter((t) => (t.type === 'daily' || t.type === 'one-off' || !t.type) && !t.isHabit && !t.isMaintenance && t.isActive);
  const maintenanceTasks = tasks.filter((t) => t.isMaintenance && t.isActive).sort(sortByImportance);
  const habitTasks = tasks.filter((t) => t.isHabit && t.isActive).sort(sortByImportance);

  // Daily quota calculation using lib metrics
  const dailyQuotaCount = computeDailyQuota(tasks);

  // Completed daily tasks count for today (includes both active recurring and archived one-off tasks)
  const todayCompletedCount = taskInstances.filter((i) => {
    if (i.date !== todayStr || i.status !== 'completed') return false;
    const task = tasks.find((t) => t.id === i.taskId);
    return task && (task.type === 'daily' || task.type === 'one-off' || !task.type) && !task.isHabit && !task.isMaintenance;
  }).length;

  // Active (uncompleted) daily tasks sorted by level of importance
  const activeDailyTasks = rawDailyTasks
    .filter((t) => {
      const inst = taskInstances.find((i) => i.taskId === t.id && i.date === todayStr);
      return inst?.status !== 'completed';
    })
    .sort(sortByImportance);

  const displayedDailyTasks = activeDailyTasks;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600 mb-0.5">
            <Calendar className="w-3.5 h-3.5" />
            <span suppressHydrationWarning>{todayFormatted}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">היום שלי</h1>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 font-bold text-sm">
          <Sparkles className="w-5 h-5" />
        </div>
      </header>

      {/* Metrics Section: Daily Quota Progress Ring & 7-Day Adherence Sparkline */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* Daily Quota Progress Ring (Turquoise #06B6D4) */}
          <div className="flex flex-col items-center bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60">
            <h2 className="text-xs font-bold text-slate-600 mb-3 tracking-wide">
              מכסה יומית (Daily Quota)
            </h2>
            <DailyQuotaRing
              completed={todayCompletedCount}
              total={Math.max(dailyQuotaCount, rawDailyTasks.length)}
            />
          </div>

          {/* 7-day Rolling Adherence Sparkline */}
          <AdherenceSparkline stats={dailyStats} />
        </div>
      </section>

      {/* Habits Section */}
      {habitTasks.length > 0 && (
        <section>
          <HabitSection
            habits={habitTasks}
            taskInstances={taskInstances}
            onToggleHabit={toggleTaskInstance}
            onEditHabit={(task) => setEditingTask(task)}
            todayDateStr={todayStr}
          />
        </section>
      )}

      {/* Today's Tasks Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-cyan-600" />
            <h2 className="text-base font-bold text-slate-900">משימות היום</h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {activeDailyTasks.length} לביצוע
            </span>
          </div>

          {/* Priority sorting indicator */}
          <span className="text-[11px] font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200/80 px-2.5 py-0.5 rounded-full">
            ממוין לפי חשיבות ⚡
          </span>
        </div>

        {/* Task Cards List */}
        <div className="space-y-2.5">
          {displayedDailyTasks.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4">
              <CheckCircle2 className="w-8 h-8 text-cyan-500 mx-auto mb-2 opacity-70" />
              <p className="text-xs font-semibold text-slate-600">אין משימות לביצוע ברשימה הכללית</p>
              <p className="text-[11px] text-slate-400 mt-1">
                משימות שהושלמו הועברו לארכיון המשימות! כל הכבוד 🎉
              </p>
            </div>
          ) : (
            displayedDailyTasks.map((task) => {
              const inst = taskInstances.find((i) => i.taskId === task.id && i.date === todayStr);
              const isCompleted = inst?.status === 'completed';
              const goal = goals.find((g) => g.id === task.goalId);

              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  isCompleted={isCompleted}
                  onToggle={() => toggleTaskInstance(task.id)}
                  onPostponeToTomorrow={() => postponeTaskToTomorrow(task.id)}
                  onEdit={() => setEditingTask(task)}
                  onDelete={() => deleteTask(task.id)}
                  goal={goal}
                />
              );
            })
          )}
        </div>
      </section>

      {/* Maintenance Section */}
      <section className="pt-2">
        <MaintenanceSection
          maintenanceTasks={maintenanceTasks}
          taskInstances={taskInstances}
          onToggleMaintenance={toggleTaskInstance}
          onEditTask={(task) => setEditingTask(task)}
          todayDateStr={todayStr}
        />
      </section>

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
      />
    </div>
  );
}
