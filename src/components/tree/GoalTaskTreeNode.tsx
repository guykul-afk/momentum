'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  ListTodo,
  CheckSquare,
  History,
} from 'lucide-react';
import { Goal, Task, TaskInstance, KeyResult } from '@/types/models';
import { useAppStore } from '@/lib/store';
import { getAnnualRemainingInfo, getMonthlyRemainingInfo } from '@/lib/goalUtils';

interface GoalTaskTreeNodeProps {
  goal: Goal;
  childGoals: Goal[];
  allGoals: Goal[];
  tasks: Task[];
  taskInstances: TaskInstance[];
  keyResults: KeyResult[];
  level?: number;
  defaultExpanded?: boolean;
}

export function GoalTaskTreeNode({
  goal,
  childGoals,
  allGoals,
  tasks,
  taskInstances,
  keyResults,
  level = 0,
  defaultExpanded = true,
}: GoalTaskTreeNodeProps) {
  const { toggleTaskInstance } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showHistory, setShowHistory] = useState(false);

  if (level > 4) return null;

  const hasChildren = childGoals.length > 0;
  const isAnnual = goal.timeframe === 'annual';

  // Key results for this goal
  const goalKrs = keyResults.filter((kr) => kr.goalId === goal.id);

  // KR Progress percentage
  const overallProgress =
    goalKrs.length > 0
      ? Math.round(
          goalKrs.reduce((acc, kr) => {
            const ratio = kr.target > 0 ? Math.min(1, kr.current / kr.target) : 0;
            return acc + ratio * 100;
          }, 0) / goalKrs.length
        )
      : 0;

  // Tasks linked directly to this goal
  const goalTasks = tasks.filter((t) => t.goalId === goal.id);
  const activeTasks = goalTasks.filter((t) => t.isActive);

  // Map of completed task instances for goal's tasks
  const goalTaskIds = new Set(goalTasks.map((t) => t.id));
  
  // Historical completed instances linked to tasks under this goal
  const completedInstances = taskInstances.filter(
    (inst) => inst.status === 'completed' && goalTaskIds.has(inst.taskId)
  );

  // Sort completed instances by date descending
  const sortedCompletedInstances = [...completedInstances].sort((a, b) => {
    const timeA = a.completedAt || new Date(a.date).getTime();
    const timeB = b.completedAt || new Date(b.date).getTime();
    return timeB - timeA;
  });

  const levelStyles = {
    0: 'bg-white border-slate-200/90 shadow-sm border-r-4 border-r-cyan-500',
    1: 'bg-slate-50/80 border-slate-200/70 border-r-4 border-r-indigo-400 mr-2 sm:mr-4',
    2: 'bg-slate-100/60 border-slate-200/60 border-r-4 border-r-teal-400 mr-4 sm:mr-8',
  }[Math.min(level, 2)];

  const timeframeLabels = {
    annual: { label: 'שנתי', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    quarterly: { label: 'רבעוני', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
    monthly: { label: 'חודשי', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  }[goal.timeframe || 'quarterly'];

  const categoryLabels = {
    work: 'עבודה',
    personal: 'אישי',
    health: 'בריאות',
    maintenance: 'תפעול',
  }[goal.category || 'work'];

  const annualInfo = isAnnual ? getAnnualRemainingInfo(goal) : null;
  const monthlyInfo = !isAnnual ? getMonthlyRemainingInfo(goal) : null;

  // Helper date formatter
  const formatDate = (dateStr: string, completedAt?: number) => {
    if (completedAt) {
      const d = new Date(completedAt);
      return `${d.toLocaleDateString('he-IL')} בשעה ${d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return dateStr;
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Main Goal Card Node */}
      <div className={`rounded-2xl border p-3.5 sm:p-4 transition-all duration-200 ${levelStyles}`}>
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {hasChildren || goalTasks.length > 0 || sortedCompletedInstances.length > 0 ? (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-0.5 p-1 rounded-lg hover:bg-slate-200/60 text-slate-500 transition-colors"
                title={isExpanded ? 'כווץ' : 'הרחב'}
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5 dir-rtl:rotate-180" />
                )}
              </button>
            ) : (
              <div className="w-6 h-6 shrink-0" />
            )}

            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${timeframeLabels.bg}`}>
                  {timeframeLabels.label}
                </span>

                <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  {categoryLabels}
                </span>

                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  מדדים: {overallProgress}%
                </span>

                {isAnnual && annualInfo && (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>{annualInfo.text}</span>
                  </span>
                )}

                {!isAnnual && monthlyInfo && (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                    <Clock className="w-3 h-3 text-indigo-600" />
                    <span>{monthlyInfo.text}</span>
                  </span>
                )}
              </div>

              {/* Goal Title */}
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug break-words">
                {goal.title}
              </h3>

              {goal.description && (
                <p className="text-xs text-slate-500 line-clamp-2">{goal.description}</p>
              )}

              {/* Counters */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold">
                <div className="flex items-center gap-1 text-indigo-700 bg-indigo-50/90 px-2 py-0.5 rounded-lg border border-indigo-100">
                  <ListTodo className="w-3.5 h-3.5" />
                  <span>{activeTasks.length} משימות פעילות</span>
                </div>

                <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50/90 px-2 py-0.5 rounded-lg border border-emerald-100">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{sortedCompletedInstances.length} ביצועים היסטוריים</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Results Summary */}
        {goalKrs.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-cyan-600" />
              <span>תוצאות מפתח ({goalKrs.length}):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {goalKrs.map((kr) => {
                const percent = kr.target > 0 ? Math.min(100, Math.round((kr.current / kr.target) * 100)) : 0;
                return (
                  <div key={kr.id} className="p-2 bg-slate-50 rounded-xl border border-slate-200/70 text-xs flex flex-col gap-1">
                    <div className="flex items-center justify-between font-medium text-slate-700">
                      <span className="truncate max-w-[180px]">{kr.title}</span>
                      <span className="font-bold text-cyan-700 text-[11px]">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                      <div className="bg-cyan-500 h-1 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Linked Active Tasks Section */}
        {isExpanded && activeTasks.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center gap-1.5 text-cyan-800">
                <ListTodo className="w-4 h-4 text-cyan-600" />
                <span>משימות פעילות תחת יעד זה ({activeTasks.length})</span>
              </div>
            </div>

            <div className="space-y-1.5">
              {activeTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start justify-between gap-2 p-2.5 bg-white hover:bg-slate-50/80 rounded-xl border border-slate-200/80 shadow-2xs transition-colors"
                >
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleTaskInstance(t.id)}
                      className="mt-0.5 text-slate-300 hover:text-cyan-600 transition-colors"
                      title="סמן כבוצע להיום"
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 break-words">{t.title}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                        {t.category && (
                          <span className="px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 font-medium">
                            {t.category}
                          </span>
                        )}
                        {t.weight && (
                          <span className="px-1.5 py-0.2 bg-purple-50 text-purple-700 rounded font-semibold">
                            משקל: {t.weight}
                          </span>
                        )}
                        {t.estimatedMinutes && (
                          <span className="flex items-center gap-0.5 text-slate-500">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {t.estimatedMinutes} דק&apos;
                          </span>
                        )}
                        {t.type && (
                          <span className="px-1.5 py-0.2 bg-cyan-50 text-cyan-700 rounded font-medium">
                            {t.type === 'daily' ? 'יומי' : t.type === 'recurring' ? 'מחזורי' : 'חד פעמי'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historical Completed Tasks Section */}
        {isExpanded && sortedCompletedInstances.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between p-2 bg-emerald-50/80 hover:bg-emerald-100/70 border border-emerald-200/80 rounded-xl transition-colors text-xs font-bold text-emerald-900"
            >
              <div className="flex items-center gap-1.5">
                <History className="w-4 h-4 text-emerald-600" />
                <span>היסטוריית משימות שבוצעו ({sortedCompletedInstances.length} מופעים)</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700">
                <span>{showHistory ? 'הסתר היסטוריה' : 'הצג היסטוריה'}</span>
                {showHistory ? <ChevronDown className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4 dir-rtl:rotate-180" />}
              </div>
            </button>

            {showHistory && (
              <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
                {sortedCompletedInstances.map((inst) => {
                  const linkedTask = tasks.find((t) => t.id === inst.taskId);
                  const title = linkedTask?.title || 'משימה שנמחקה/הושלמה';
                  return (
                    <div
                      key={inst.id}
                      className="flex items-center justify-between gap-2 p-2 bg-white/90 rounded-xl border border-emerald-200/60 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">{title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium shrink-0">
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100 font-bold">
                          {formatDate(inst.date, inst.completedAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty state when no tasks exist */}
        {isExpanded && activeTasks.length === 0 && sortedCompletedInstances.length === 0 && (
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400 italic text-center">
            אין כרגע משימות פעילות או היסטוריית ביצוע ליעד זה.
          </div>
        )}
      </div>

      {/* Recursive Child Goals Rendering */}
      {isExpanded && hasChildren && (
        <div className="flex flex-col gap-2 relative">
          <div className="absolute top-0 bottom-4 right-3 sm:right-4 w-0.5 bg-slate-200/70" />
          {childGoals.map((child) => {
            const grandChildren = allGoals.filter(
              (g) => g.parentId === child.id && g.id !== child.id && g.id !== goal.id
            );
            return (
              <GoalTaskTreeNode
                key={child.id}
                goal={child}
                childGoals={grandChildren}
                allGoals={allGoals}
                tasks={tasks}
                taskInstances={taskInstances}
                keyResults={keyResults}
                level={level + 1}
                defaultExpanded={defaultExpanded}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
