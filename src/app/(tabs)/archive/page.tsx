'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Archive, Search, RotateCcw, Trash2, CheckCircle2, Clock, Target, Calendar, Award } from 'lucide-react';
import { Task, Goal } from '@/types/models';

interface CompletedItem {
  instanceId: string;
  task: Task;
  completedAt: number;
  dateStr: string;
  goal?: Goal;
}

export default function ArchivePage() {
  const { tasks, taskInstances, goals, toggleTaskInstance, deleteTask } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  // Compile all completed task instances
  const completedItems = useMemo(() => {
    const items: CompletedItem[] = [];

    // Filter task instances that are marked completed
    const completedInstances = taskInstances.filter((i) => i.status === 'completed');

    for (const inst of completedInstances) {
      const task = tasks.find((t) => t.id === inst.taskId);
      if (task) {
        const goal = goals.find((g) => g.id === task.goalId);
        items.push({
          instanceId: inst.id,
          task,
          completedAt: inst.completedAt || task.updatedAt || Date.now(),
          dateStr: inst.date,
          goal,
        });
      }
    }

    // Also check tasks that don't have an instance yet but are marked completed in inactive tasks if any
    // Sort descending by completion timestamp
    return items.sort((a, b) => b.completedAt - a.completedAt);
  }, [tasks, taskInstances, goals]);

  // Filter by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return completedItems;
    const q = searchQuery.toLowerCase().trim();
    return completedItems.filter(
      (item) =>
        item.task.title.toLowerCase().includes(q) ||
        (item.task.description && item.task.description.toLowerCase().includes(q)) ||
        (item.goal && item.goal.title.toLowerCase().includes(q))
    );
  }, [completedItems, searchQuery]);

  // Calculate total focus minutes completed
  const totalCompletedMinutes = useMemo(() => {
    return completedItems.reduce((acc, item) => acc + (item.task.estimatedMinutes || 0), 0);
  }, [completedItems]);

  const getWeightBadgeColor = (weight: number = 3) => {
    if (weight >= 5) return 'bg-rose-100 text-rose-800 border-rose-300';
    if (weight === 4) return 'bg-cyan-100 text-cyan-800 border-cyan-300';
    if (weight === 3) return 'bg-slate-100 text-slate-700 border-slate-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  const formatCompletionTime = (timestamp: number, dateStr: string) => {
    try {
      const dateObj = new Date(timestamp);
      const timeStr = dateObj.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
      return `${dateStr} בשעה ${timeStr}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right pb-8">
      {/* Header */}
      <header className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600 mb-0.5">
            <Archive className="w-3.5 h-3.5" />
            <span>היסטוריית תפוקה</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">ארכיון משימות</h1>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 font-bold text-sm">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </header>

      {/* Summary Stats Cards */}
      <section className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-3.5 text-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-80">
            <span className="text-xs font-medium">משימות שהושלמו</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black">{completedItems.length}</span>
            <span className="text-xs mr-1 opacity-90">משימות</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-600">זמן פוקוס שנצבר</span>
            <Clock className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900">{totalCompletedMinutes}</span>
            <span className="text-xs mr-1 text-slate-500">דקות</span>
          </div>
        </div>
      </section>

      {/* Search Input Bar */}
      {completedItems.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חפש בארכיון משימות..."
            className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              נקה
            </button>
          )}
        </div>
      )}

      {/* Completed Tasks List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-cyan-600" />
            <h2 className="text-base font-bold text-slate-900">משימות בארכיון</h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {filteredItems.length}
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
              <Archive className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">
                {searchQuery ? 'לא נמצאו משימות תואמות לחיפוש' : 'ארכיון המשימות ריק עדיין'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery
                  ? 'נסה להזין מילת חיפוש אחרת'
                  : 'כאשר תסמן משימות כבוצעו ברשימה הכללית, הן יופיעו כאן בארכיון'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.instanceId}
                className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:border-cyan-300 transition-all flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 w-5 h-5 rounded-md bg-cyan-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 line-through decoration-slate-400">
                        {item.task.title}
                      </h4>
                      {item.task.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {item.task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {item.task.weight && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getWeightBadgeColor(
                        item.task.weight
                      )}`}
                    >
                      חשיבות {item.task.weight}
                    </span>
                  )}
                </div>

                {/* Goal Tag */}
                {item.goal && (
                  <div className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-700 bg-cyan-50 border border-cyan-200/70 px-2 py-0.5 rounded-md w-fit">
                    <Target className="w-3 h-3 text-cyan-600" />
                    <span className="truncate max-w-[200px]">{item.goal.title}</span>
                  </div>
                )}

                {/* Footer Metadata & Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2 mt-1 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{formatCompletionTime(item.completedAt, item.dateStr)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Restore Task Button */}
                    <button
                      type="button"
                      onClick={() => toggleTaskInstance(item.task.id)}
                      className="flex items-center gap-1 text-[11px] font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200/80 px-2.5 py-1 rounded-xl transition-all active:scale-95"
                      title="שחזר משימה לרשימה הפעילה"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>שחזר</span>
                    </button>

                    {/* Delete Task Button */}
                    <button
                      type="button"
                      onClick={() => setDeletingTaskId(item.task.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="מחק משימה לצמיתות"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {deletingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xs w-full shadow-2xl border border-slate-100 p-4 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150 dir-rtl text-right">
            <div className="flex items-center gap-2.5 text-rose-600 font-bold text-sm">
              <Trash2 className="w-5 h-5 shrink-0" />
              <span>אישור מחיקת משימה מהארכיון</span>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              האם למחוק את המשימה לצמיתות? לא ניתן יהיה לשחזר אותה לאחר המחיקה.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingTaskId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTask(deletingTaskId);
                  setDeletingTaskId(null);
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
