'use client';

import React, { useState } from 'react';
import { Task, Goal } from '@/types/models';
import { Check, Clock, Target, MapPin, Calendar, CalendarPlus, Edit2, Trash2, AlertTriangle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  isCompleted: boolean;
  onToggle: () => void;
  onPostponeToTomorrow?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  goal?: Goal;
}

export function TaskCard({ task, isCompleted, onToggle, onPostponeToTomorrow, onEdit, onDelete, goal }: TaskCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const getWeightBadgeColor = (weight: number = 3) => {
    if (weight >= 4) return 'bg-cyan-100 text-cyan-800 border-cyan-300';
    if (weight === 3) return 'bg-slate-100 text-slate-700 border-slate-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  const getPostponeStripeColor = (count: number = 0) => {
    if (count === 1) return 'border-r-4 border-r-yellow-400';
    if (count === 2) return 'border-r-4 border-r-orange-500';
    if (count >= 3) return 'border-r-4 border-r-red-500';
    return '';
  };

  const postponeStripe = getPostponeStripeColor(task.postponeCount);

  return (
    <div
      className={`group relative flex items-start gap-3 p-3.5 rounded-2xl border transition-all duration-200 ${postponeStripe} ${
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

          <div className="flex items-center gap-1 shrink-0">
            {/* Weight Badge */}
            {task.weight && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getWeightBadgeColor(
                  task.weight
                )}`}
              >
                משקל {task.weight}
              </span>
            )}

            {/* Edit Button */}
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="p-1 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors opacity-70 group-hover:opacity-100"
                title="ערוך משימה"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Delete Button */}
            {onDelete && (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-70 group-hover:opacity-100"
                title="מחק משימה"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
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

        {/* Bottom Actions & Meta Info */}
        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {task.estimatedMinutes && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{task.estimatedMinutes} דקות</span>
              </div>
            )}

            {task.postponeCount && task.postponeCount > 0 ? (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  task.postponeCount === 1
                    ? 'bg-yellow-50 text-yellow-800 border-yellow-300'
                    : task.postponeCount === 2
                    ? 'bg-orange-50 text-orange-800 border-orange-300'
                    : 'bg-red-50 text-red-800 border-red-300'
                }`}
              >
                הועברה {task.postponeCount}X
              </span>
            ) : null}
          </div>

          {!isCompleted && onPostponeToTomorrow && (
            <button
              type="button"
              onClick={onPostponeToTomorrow}
              className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2.5 py-1 rounded-xl transition-all active:scale-95 shrink-0"
              title="העבר משימה למחר"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>העברה למחר</span>
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xs w-full shadow-2xl border border-slate-100 p-4 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150 dir-rtl text-right">
            <div className="flex items-center gap-2.5 text-rose-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>אישור מחיקת משימה</span>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              האם למחוק את המשימה <strong className="text-slate-800 font-bold">&quot;{task.title}&quot;</strong> לצמיתות?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDelete) onDelete();
                  setShowConfirmDelete(false);
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                מחק לצמיתות
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
