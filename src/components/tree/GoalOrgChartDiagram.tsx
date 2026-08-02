'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  Circle,
  CheckCircle2,
  Target,
  ListTodo,
  CheckSquare,
  History,
} from 'lucide-react';
import { Goal, Task, TaskInstance, KeyResult } from '@/types/models';
import { useAppStore } from '@/lib/store';

interface GoalOrgChartDiagramProps {
  goals: Goal[];
  tasks: Task[];
  taskInstances: TaskInstance[];
  keyResults: KeyResult[];
}

interface NodeProps {
  goal: Goal;
  allGoals: Goal[];
  tasks: Task[];
  taskInstances: TaskInstance[];
  keyResults: KeyResult[];
  level?: number;
}

function OrgChartNode({
  goal,
  allGoals,
  tasks,
  taskInstances,
  keyResults,
  level = 0,
}: NodeProps) {
  const { toggleTaskInstance } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const childGoals = allGoals.filter((g) => g.parentId === goal.id);
  const goalKrs = keyResults.filter((kr) => kr.goalId === goal.id);

  // Calculate overall goal completion percentage
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

  // Map of completed task instances
  const goalTaskIds = new Set(goalTasks.map((t) => t.id));
  const completedInstances = taskInstances.filter(
    (inst) => inst.status === 'completed' && goalTaskIds.has(inst.taskId)
  );

  const timeframeBadges = {
    annual: { label: 'שנתי', bg: 'bg-cyan-500 text-white', border: 'border-cyan-400' },
    quarterly: { label: 'רבעוני', bg: 'bg-purple-600 text-white', border: 'border-purple-400' },
    monthly: { label: 'חודשי', bg: 'bg-indigo-600 text-white', border: 'border-indigo-400' },
  }[goal.timeframe || 'quarterly'];

  const categoryLabels = {
    work: 'עבודה',
    personal: 'אישי',
    health: 'בריאות',
    maintenance: 'תפעול',
  }[goal.category || 'work'];

  const hasChildren = childGoals.length > 0;
  const hasTasks = goalTasks.length > 0 || completedInstances.length > 0;

  return (
    <div className="flex flex-col items-center relative my-2">
      {/* Goal Card Node */}
      <div className="relative z-10 w-72 sm:w-80 bg-white rounded-2xl border-2 border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
        {/* Top Gradient Header Accent Bar */}
        <div className={`h-2.5 w-full ${timeframeBadges.bg}`} />

        <div className="p-3.5 space-y-2.5">
          {/* Badges & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md shadow-2xs ${timeframeBadges.bg}`}>
                {timeframeBadges.label}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                {categoryLabels}
              </span>
            </div>

            {/* Progress Badge */}
            <div className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              <span className="text-[11px] font-extrabold text-emerald-700">{overallProgress}%</span>
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <h4 className="font-extrabold text-slate-800 text-sm leading-snug break-words">
              {goal.title}
            </h4>
            {goal.description && (
              <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{goal.description}</p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
              <span>התקדמות KRs ({goalKrs.length})</span>
              <span>{overallProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
              <div
                className="bg-linear-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* Node Summary Stats */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
            <div className="flex items-center gap-1 text-indigo-700">
              <ListTodo className="w-3.5 h-3.5" />
              <span>{activeTasks.length} פעילות</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-700">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{completedInstances.length} בוצעו</span>
            </div>
            {hasChildren && (
              <div className="flex items-center gap-1 text-cyan-700">
                <Target className="w-3.5 h-3.5" />
                <span>{childGoals.length} תת-יעדים</span>
              </div>
            )}
          </div>
        </div>

        {/* Expand / Collapse Footer Toolbar */}
        {(hasChildren || hasTasks) && (
          <div className="bg-slate-50 border-t border-slate-100 px-3 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeTasks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowTasks(!showTasks)}
                  className="text-[10px] font-bold text-slate-600 hover:text-cyan-700 flex items-center gap-1 transition-colors"
                >
                  <ListTodo className="w-3 h-3 text-cyan-600" />
                  <span>{showTasks ? 'הסתר משימות' : 'הצג משימות'}</span>
                </button>
              )}
              {completedInstances.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-[10px] font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                >
                  <History className="w-3 h-3 text-emerald-600" />
                  <span>{showHistory ? 'הסתר היסטוריה' : 'היסטוריה'}</span>
                </button>
              )}
            </div>

            {hasChildren && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
              >
                <span>{isExpanded ? 'כווץ ענף' : 'הרחב ענף'}</span>
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3 dir-rtl:rotate-180" />}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Linked Active Tasks Nodes */}
      {showTasks && activeTasks.length > 0 && (
        <div className="flex flex-col items-center mt-3 space-y-2 relative z-10 w-full max-w-xs">
          <div className="w-0.5 h-3 bg-cyan-300" />
          <div className="w-full space-y-1.5">
            {activeTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-2 p-2 bg-white/95 rounded-xl border border-cyan-200/90 shadow-2xs hover:shadow-xs transition-all text-xs"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleTaskInstance(t.id)}
                    className="text-slate-300 hover:text-cyan-600 transition-colors shrink-0"
                    title="סמן כבוצע"
                  >
                    <Circle className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-slate-800 truncate">{t.title}</span>
                </div>
                {t.weight && (
                  <span className="px-1.5 py-0.2 bg-purple-50 text-purple-700 rounded text-[10px] font-bold shrink-0">
                    משקל: {t.weight}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Completed Tasks Nodes */}
      {showHistory && completedInstances.length > 0 && (
        <div className="flex flex-col items-center mt-3 space-y-1.5 relative z-10 w-full max-w-xs animate-in fade-in duration-200">
          <div className="w-0.5 h-3 bg-emerald-300" />
          <div className="w-full space-y-1 bg-emerald-50/60 p-2 rounded-xl border border-emerald-200/80">
            <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1 mb-1">
              <History className="w-3 h-3 text-emerald-600" />
              <span>היסטוריית ביצועים ({completedInstances.length}):</span>
            </span>
            {completedInstances.map((inst) => {
              const linkedTask = tasks.find((t) => t.id === inst.taskId);
              return (
                <div
                  key={inst.id}
                  className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-emerald-200/60 text-[11px]"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-medium text-slate-800 truncate">{linkedTask?.title || 'משימה'}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold shrink-0">{inst.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Child Branch Connecting Lines & Child Goal Nodes */}
      {isExpanded && hasChildren && (
        <div className="flex flex-col items-center mt-4 w-full relative">
          {/* Vertical stem line down from parent card */}
          <div className="w-0.5 h-6 bg-cyan-400/80 shadow-2xs" />

          {/* Horizontal branch line connecting all children */}
          {childGoals.length > 1 && (
            <div className="w-4/5 h-0.5 bg-cyan-300/80 relative" />
          )}

          {/* Child Goal Nodes Grid */}
          <div className="flex flex-wrap justify-center items-start gap-4 sm:gap-6 pt-2 w-full">
            {childGoals.map((child) => (
              <div key={child.id} className="flex flex-col items-center relative">
                {/* Connector line down to child node */}
                <div className="w-0.5 h-4 bg-cyan-300/80" />

                <OrgChartNode
                  goal={child}
                  allGoals={allGoals}
                  tasks={tasks}
                  taskInstances={taskInstances}
                  keyResults={keyResults}
                  level={level + 1}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function GoalOrgChartDiagram({
  goals,
  tasks,
  taskInstances,
  keyResults,
}: GoalOrgChartDiagramProps) {
  const activeGoals = goals
    .filter((g) => g.status === 'active')
    .map((g) => ({
      ...g,
      timeframe: g.timeframe || (g.parentId ? ('quarterly' as const) : ('annual' as const)),
    }));

  const rootGoals = activeGoals.filter(
    (g) => !g.parentId || !activeGoals.some((parent) => parent.id === g.parentId)
  );

  if (rootGoals.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300">
        <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-700">אין יעדים להצגה בתרשים</h3>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto p-4 sm:p-6 bg-slate-100/70 rounded-2xl border border-slate-200/80 min-h-[450px]">
      <div className="min-w-max flex flex-col items-center space-y-8">
        {rootGoals.map((rootGoal) => (
          <OrgChartNode
            key={rootGoal.id}
            goal={rootGoal}
            allGoals={activeGoals}
            tasks={tasks}
            taskInstances={taskInstances}
            keyResults={keyResults}
            level={0}
          />
        ))}
      </div>
    </div>
  );
}
