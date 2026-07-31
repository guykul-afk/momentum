'use client';

import React from 'react';
import { Task, TaskInstance } from '@/types/models';
import { Flame, Check, Sparkles, Edit2 } from 'lucide-react';

interface HabitSectionProps {
  habits: Task[];
  taskInstances: TaskInstance[];
  onToggleHabit: (taskId: string) => void;
  onEditHabit?: (task: Task) => void;
  todayDateStr: string;
}

export function HabitSection({
  habits,
  taskInstances,
  onToggleHabit,
  onEditHabit,
  todayDateStr,
}: HabitSectionProps) {
  if (habits.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <h3 className="text-sm font-bold text-slate-800">הרגלים ומומנטום יומי</h3>
        </div>
        <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {habits.length} הרגלים פעילים
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {habits.map((habit) => {
          const instance = taskInstances.find(
            (i) => i.taskId === habit.id && i.date === todayDateStr
          );
          const isDone = instance?.status === 'completed';

          return (
            <div
              key={habit.id}
              className={`group flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${
                isDone
                  ? 'bg-amber-50/50 border-amber-200/90 text-amber-900'
                  : 'bg-white border-slate-200 hover:border-amber-300 text-slate-800 shadow-sm'
              }`}
            >
              <div
                onClick={() => onToggleHabit(habit.id)}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              >
                <div
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                    isDone
                      ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                </div>

                <div className="min-w-0 flex-1">
                  <h4
                    className={`text-sm font-medium truncate ${
                      isDone ? 'line-through text-slate-500 font-normal' : 'font-semibold'
                    }`}
                  >
                    {habit.title}
                  </h4>
                  {habit.description && (
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{habit.description}</p>
                  )}
                </div>
              </div>

              {/* Actions & Streak Pill */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 bg-amber-100/80 text-amber-800 font-bold text-xs px-2.5 py-1 rounded-xl shadow-xs">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{habit.streakCount || 0} ימים</span>
                </div>

                {onEditHabit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditHabit(habit);
                    }}
                    className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors opacity-70 group-hover:opacity-100"
                    title="ערוך הרגל"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
