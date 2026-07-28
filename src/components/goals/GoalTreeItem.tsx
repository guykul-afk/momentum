'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  Plus,
  Edit2,
  Trash2,
  CheckSquare,
  Clock,
  Calendar,
  FolderKanban,
  ListTodo,
  CalendarDays,
} from 'lucide-react';
import { Goal } from '@/types/models';
import { useAppStore } from '@/lib/store';
import { EffortVsKrRing } from './EffortVsKrRing';
import { getAnnualRemainingInfo, getMonthlyRemainingInfo } from '@/lib/goalUtils';

interface GoalTreeItemProps {
  goal: Goal;
  childGoals: Goal[];
  allGoals: Goal[];
  onAddSubGoal: (parentId: string, timeframe: 'monthly') => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal?: (goal: Goal) => void;
  onCheckinKr: (goalId: string, currentKr: number) => void;
  level?: number;
}

export function GoalTreeItem({
  goal,
  childGoals,
  allGoals,
  onAddSubGoal,
  onEditGoal,
  onDeleteGoal,
  onCheckinKr,
  level = 0,
}: GoalTreeItemProps) {
  const { tasks, taskInstances, postponeMonthlyGoal, postponeAnnualGoal } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [checkinValue, setCheckinValue] = useState<number>(goal.krCurrent || 0);

  if (level > 4) return null;

  const hasChildren = childGoals.length > 0;
  const starved = false;
  const isAnnual = goal.timeframe === 'annual';

  // Task linking counters for monthly goals
  const linkedTasks = tasks.filter((t) => t.goalId === goal.id);
  const completedTaskIds = new Set(
    taskInstances.filter((inst) => inst.status === 'completed').map((inst) => inst.taskId)
  );
  const completedTasksCount = linkedTasks.filter((t) => completedTaskIds.has(t.id)).length;

  const levelStyles = {
    0: 'bg-white border-slate-200/90 shadow-sm hover:shadow-md border-r-4 border-r-cyan-500',
    1: 'bg-slate-50/70 border-slate-200/70 shadow-2xs border-r-4 border-r-indigo-400 mr-3',
    2: 'bg-slate-100/50 border-slate-200/60 shadow-none border-r-4 border-r-teal-400 mr-6',
  }[Math.min(level, 2)];

  const timeframeLabels = {
    annual: { label: 'שנתי', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    monthly: { label: 'חודשי', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  }[goal.timeframe || 'monthly'];

  const categoryLabels = {
    work: 'עבודה',
    personal: 'אישי',
    health: 'בריאות',
    maintenance: 'תפעול',
  }[goal.category || 'work'];

  const annualInfo = isAnnual ? getAnnualRemainingInfo(goal) : null;
  const monthlyInfo = !isAnnual ? getMonthlyRemainingInfo(goal) : null;

  const handleCheckinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckinKr(goal.id, Number(checkinValue));
    setIsCheckinOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Main Goal Card */}
      <div
        className={`rounded-2xl border p-4 transition-all duration-200 ${levelStyles} ${
          starved ? 'ring-1 ring-amber-400/60' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Collapse Toggle & Title */}
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            {hasChildren ? (
              <button
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
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${timeframeLabels.bg}`}
                >
                  {timeframeLabels.label}
                </span>

                <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  {categoryLabels}
                </span>

                {/* Remaining Time Badge */}
                {isAnnual && annualInfo && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-800 border border-amber-200/80">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>{annualInfo.text}</span>
                  </span>
                )}

                {!isAnnual && monthlyInfo && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200/80">
                    <Clock className="w-3 h-3 text-indigo-600" />
                    <span>{monthlyInfo.text}</span>
                  </span>
                )}
              </div>

              <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug break-words">
                {goal.title}
              </h3>

              {goal.description && (
                <p className="text-xs text-slate-500 line-clamp-2">{goal.description}</p>
              )}

              {/* Hierarchy counters */}
              <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold">
                {isAnnual ? (
                  <div className="flex items-center gap-1 text-cyan-700 bg-cyan-50/80 px-2 py-0.5 rounded-lg border border-cyan-100">
                    <FolderKanban className="w-3.5 h-3.5" />
                    <span>
                      {childGoals.length} יעדים חודשיים מקושרים
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-lg border border-indigo-100">
                    <ListTodo className="w-3.5 h-3.5" />
                    <span>
                      {linkedTasks.length} משימות מקושרות ({completedTasksCount} הושלמו)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Postpone */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
            {/* Postpone button - available anytime! */}
            {isAnnual ? (
              <button
                onClick={() => postponeAnnualGoal(goal.id)}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all shadow-2xs"
                title="דחה/הארך לשנה הקלנדרית הבאה"
              >
                <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
                <span>דחה בשנה</span>
              </button>
            ) : (
              <button
                onClick={() => postponeMonthlyGoal(goal.id)}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all shadow-2xs"
                title="דחה/הארך בחודש קלנדרי נוסף"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>דחה בחודש</span>
              </button>
            )}

            <div className="flex items-center gap-1">
              <button
                onClick={() => onEditGoal(goal)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="ערוך יעד"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              {onDeleteGoal && (
                <button
                  onClick={() => onDeleteGoal(goal)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="מחק יעד"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {isAnnual && (
                <button
                  onClick={() => onAddSubGoal(goal.id, 'monthly')}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-xl transition-colors"
                  title="הוסף יעד חודשי"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">יעד חודשי</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Visual Effort Ring vs KR Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <EffortVsKrRing
            krCurrent={goal.krCurrent || 0}
            krTarget={goal.krTarget || 100}
            krUnit={goal.krUnit || '%'}
            krTitle={goal.krTitle}
            size={level === 0 ? 'md' : 'sm'}
          />
        </div>

        {/* Inline KR Checkin trigger */}
        <div className="mt-2 flex justify-end">
          <button
            onClick={() => {
              setCheckinValue(goal.krCurrent || 0);
              setIsCheckinOpen(!isCheckinOpen);
            }}
            className="text-[11px] font-semibold text-cyan-600 hover:text-cyan-800 flex items-center gap-1 hover:underline"
          >
            <CheckSquare className="w-3 h-3" />
            <span>עדכן התקדמות KR ({goal.krCurrent || 0} / {goal.krTarget || 100})</span>
          </button>
        </div>

        {/* Inline Checkin Form */}
        {isCheckinOpen && (
          <form
            onSubmit={handleCheckinSubmit}
            className="mt-2.5 p-3 rounded-xl bg-cyan-50/60 border border-cyan-200 flex items-center gap-2 animate-in fade-in duration-150"
          >
            <span className="text-xs font-semibold text-slate-700 shrink-0">ערך עדכני:</span>
            <input
              type="number"
              value={checkinValue}
              onChange={(e) => setCheckinValue(Number(e.target.value))}
              className="w-24 text-xs bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <span className="text-xs text-slate-500">{goal.krUnit || '%'}</span>
            <button
              type="submit"
              className="mr-auto px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              שמור
            </button>
          </form>
        )}
      </div>

      {/* Render Child Tree Nodes if Expanded */}
      {isExpanded && hasChildren && (
        <div className="flex flex-col gap-2 relative">
          {/* Tree connector line */}
          <div className="absolute top-0 bottom-4 right-4 w-0.5 bg-slate-200/60" />
          {childGoals.map((child) => {
            const grandChildren = allGoals.filter((g) => g.parentId === child.id && g.id !== child.id && g.id !== goal.id);
            return (
              <GoalTreeItem
                key={child.id}
                goal={child}
                childGoals={grandChildren}
                allGoals={allGoals}
                onAddSubGoal={onAddSubGoal}
                onEditGoal={onEditGoal}
                onDeleteGoal={onDeleteGoal}
                onCheckinKr={onCheckinKr}
                level={level + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

