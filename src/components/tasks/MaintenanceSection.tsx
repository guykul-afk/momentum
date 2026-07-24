'use client';

import React from 'react';
import { Task, TaskInstance } from '@/types/models';
import { Wrench, Check } from 'lucide-react';

interface MaintenanceSectionProps {
  maintenanceTasks: Task[];
  taskInstances: TaskInstance[];
  onToggleMaintenance: (taskId: string) => void;
  todayDateStr: string;
}

export function MaintenanceSection({
  maintenanceTasks,
  taskInstances,
  onToggleMaintenance,
  todayDateStr,
}: MaintenanceSectionProps) {
  if (maintenanceTasks.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <Wrench className="w-4 h-4 text-slate-500" />
        <h3 className="text-sm font-bold text-slate-800">משימות תחזוקה ושגרה</h3>
      </div>

      <div className="space-y-2">
        {maintenanceTasks.map((task) => {
          const instance = taskInstances.find(
            (i) => i.taskId === task.id && i.date === todayDateStr
          );
          const isDone = instance?.status === 'completed';

          return (
            <div
              key={task.id}
              onClick={() => onToggleMaintenance(task.id)}
              className={`cursor-pointer flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 active:scale-[0.99] ${
                isDone
                  ? 'bg-slate-100/70 border-slate-200 text-slate-400'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-slate-500 border-slate-500 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <span
                  className={`text-xs font-medium ${
                    isDone ? 'line-through text-slate-400' : 'text-slate-700'
                  }`}
                >
                  {task.title}
                </span>
              </div>

              {task.estimatedMinutes && (
                <span className="text-[11px] font-medium text-slate-400">
                  {task.estimatedMinutes} דק׳
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
