'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { DailyQuotaRing } from '@/components/tasks/DailyQuotaRing';
import { AdherenceSparkline } from '@/components/tasks/AdherenceSparkline';
import { TaskCard } from '@/components/tasks/TaskCard';
import { HabitSection } from '@/components/tasks/HabitSection';
import { MaintenanceSection } from '@/components/tasks/MaintenanceSection';
import { computeDailyQuota } from '@/lib/metrics';
import { Calendar, Sparkles, CheckCircle2, ListTodo } from 'lucide-react';

export default function TodayPage() {
  const { tasks, taskInstances, dailyStats, goals, toggleTaskInstance } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate Hebrew date string representation
  const todayFormatted = new Date().toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Filter tasks by categories
  const dailyTasks = tasks.filter((t) => t.type === 'daily' && !t.isHabit && !t.isMaintenance && t.isActive);
  const habitTasks = tasks.filter((t) => t.isHabit && t.isActive);
  const maintenanceTasks = tasks.filter((t) => t.isMaintenance && t.isActive);

  // Daily quota calculation using lib metrics
  const dailyQuotaCount = computeDailyQuota(tasks);

  // Completed daily tasks count for today
  const todayCompletedCount = dailyTasks.filter((t) => {
    const inst = taskInstances.find((i) => i.taskId === t.id && i.date === todayStr);
    return inst?.status === 'completed';
  }).length;

  // Filtered daily tasks based on view filter
  const displayedDailyTasks = dailyTasks.filter((t) => {
    const inst = taskInstances.find((i) => i.taskId === t.id && i.date === todayStr);
    const isCompleted = inst?.status === 'completed';
    if (filter === 'pending') return !isCompleted;
    if (filter === 'completed') return isCompleted;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600 mb-0.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{todayFormatted}</span>
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
              total={Math.max(dailyQuotaCount, dailyTasks.length)}
            />
          </div>

          {/* 7-day Rolling Adherence Sparkline */}
          <AdherenceSparkline stats={dailyStats} />
        </div>
      </section>

      {/* Today's Tasks Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-cyan-600" />
            <h2 className="text-base font-bold text-slate-900">משימות היום</h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {dailyTasks.length}
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-white text-cyan-700 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              הכל
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === 'pending'
                  ? 'bg-white text-cyan-700 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              לביצוע
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === 'completed'
                  ? 'bg-white text-cyan-700 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              הושלמו
            </button>
          </div>
        </div>

        {/* Task Cards List */}
        <div className="space-y-2.5">
          {displayedDailyTasks.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4">
              <CheckCircle2 className="w-8 h-8 text-cyan-500 mx-auto mb-2 opacity-70" />
              <p className="text-xs font-semibold text-slate-600">אין משימות בקטגוריה זו</p>
              <p className="text-[11px] text-slate-400 mt-1">כל הכבוד! נצל את הזמן להתרעננות</p>
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
                  goal={goal}
                />
              );
            })
          )}
        </div>
      </section>

      {/* Habit Section */}
      <section className="pt-2">
        <HabitSection
          habits={habitTasks}
          taskInstances={taskInstances}
          onToggleHabit={toggleTaskInstance}
          todayDateStr={todayStr}
        />
      </section>

      {/* Maintenance Section */}
      <section className="pt-2">
        <MaintenanceSection
          maintenanceTasks={maintenanceTasks}
          taskInstances={taskInstances}
          onToggleMaintenance={toggleTaskInstance}
          todayDateStr={todayStr}
        />
      </section>
    </div>
  );
}
