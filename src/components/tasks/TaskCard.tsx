'use client';

import React from 'react';
import { Task, Goal } from '@/types/models';
import { Check, Clock, Target, MapPin, Calendar } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  isCompleted: boolean;
  onToggle: () => void;
  goal?: Goal;
}

export function TaskCard({ task, isCompleted, onToggle, goal }: TaskCardProps) {
  const getWeightBadgeColor = (weight: number = 3) => {
    if (weight >= 4) return 'bg-cyan-100 text-cyan-800 border-cyan-300';
    if (weight === 3) return 'bg-slate-100 text-slate-700 border-slate-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  return (
    <div
      className={`group relative flex items-start gap-3 p-3.5 rounded-2xl border transition-all duration-200 ${
        isCompleted
          ? 'bg-slate-50/60 border-slate-200 opacity-75'
          : task.weight && task.weight >= 4
          ? 'bg-white border-cyan-200/90 shadow-sm hover:border-cyan-400'
          : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
      }`}
    >
      {/* Thumb-friendly Accessible Checkbox Button */}
      <button
        type="button"
        onClick={onToggle}
        className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 active:scale-90 ${
          isCompleted
            ? 'bg-cyan-500 border-cyan-500 text-white shadow-sm'
            : 'border-slate-300 bg-white hover:border-cyan-500'
        }`}
        aria-label={isCompleted ? 'סימון כלא הושלם' : 'סימון כהושלם'}
      >
        {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
      </button>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4
            className={`text-sm font-medium leading-snug transition-all ${
              isCompleted ? 'line-through text-slate-400' : 'text-slate-900 font-semibold'
            }`}
          >
            {task.title}
          </h4>

          {/* Weight Badge */}
          {task.weight && (
            <span
              className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getWeightBadgeColor(
                task.weight
              )}`}
            >
              משקל {task.weight}
            </span>
          )}
        </div>

        {task.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Goal Badge if present */}
        {goal && (
          <div className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-cyan-700 bg-cyan-50 border border-cyan-200/70 px-2 py-0.5 rounded-md">
            <Target className="w-3 h-3 text-cyan-600" />
            <span className="truncate max-w-[200px]">{goal.title}</span>
          </div>
        )}

        {/* When & Where Implementation Intentions if available */}
        {(task.when || task.where) && (
          <div className="mt-2 p-2 bg-slate-50 rounded-xl border border-slate-200/70 flex flex-col gap-1 text-[11px] text-slate-600">
            {task.when && (
              <div className="flex items-center gap-1.5 text-cyan-800 font-medium">
                <Calendar className="w-3 h-3 text-cyan-600 shrink-0" />
                <span>מתי: {task.when}</span>
              </div>
            )}
            {task.where && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>איפה: {task.where}</span>
              </div>
            )}
          </div>
        )}

        {/* Duration Meta Info */}
        {task.estimatedMinutes && (
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{task.estimatedMinutes} דקות</span>
          </div>
        )}
      </div>
    </div>
  );
}
