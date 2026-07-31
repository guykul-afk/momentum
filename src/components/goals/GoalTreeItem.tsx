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
  Target,
  Gauge,
} from 'lucide-react';
import { Goal, KeyResult } from '@/types/models';
import { useAppStore } from '@/lib/store';
import { getAnnualRemainingInfo, getMonthlyRemainingInfo } from '@/lib/goalUtils';
import { KeyResultModal } from './KeyResultModal';

interface GoalTreeItemProps {
  goal: Goal;
  childGoals: Goal[];
  allGoals: Goal[];
  onAddSubGoal: (parentId: string, timeframe: 'quarterly' | 'monthly') => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal?: (goal: Goal) => void;
  level?: number;
}

export function GoalTreeItem({
  goal,
  childGoals,
  allGoals,
  onAddSubGoal,
  onEditGoal,
  onDeleteGoal,
  level = 0,
}: GoalTreeItemProps) {
  const {
    tasks,
    taskInstances,
    keyResults,
    addKeyResult,
    updateKeyResult,
    deleteKeyResult,
    addKrCheckin,
    postponeMonthlyGoal,
    postponeAnnualGoal,
  } = useAppStore();

  const [isExpanded, setIsExpanded] = useState(true);
  const [isKrModalOpen, setIsKrModalOpen] = useState(false);
  const [editingKr, setEditingKr] = useState<KeyResult | undefined>(undefined);

  const [checkinKrId, setCheckinKrId] = useState<string | null>(null);
  const [checkinValue, setCheckinValue] = useState<number>(0);
  const [checkinConfidence, setCheckinConfidence] = useState<number>(7);

  if (level > 4) return null;

  const hasChildren = childGoals.length > 0;
  const isAnnual = goal.timeframe === 'annual';

  // Get Key Results for this Goal
  const goalKrs = keyResults.filter((kr) => kr.goalId === goal.id);

  // Calculate overall goal completion percentage as average of KRs progress
  const overallProgress =
    goalKrs.length > 0
      ? Math.round(
          goalKrs.reduce((acc, kr) => {
            const ratio = kr.target > 0 ? Math.min(1, kr.current / kr.target) : 0;
            return acc + ratio * 100;
          }, 0) / goalKrs.length
        )
      : 0;

  // Task linking counters
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

  const handleSaveKr = (krData: Omit<KeyResult, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => {
    if (editingKr) {
      updateKeyResult(editingKr.id, krData);
    } else {
      addKeyResult(krData);
    }
    setEditingKr(undefined);
  };

  const handleCheckinSubmit = (e: React.FormEvent, krId: string) => {
    e.preventDefault();
    addKrCheckin(goal.id, krId, Number(checkinValue), Number(checkinConfidence));
    setCheckinKrId(null);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Main Goal Card (Objective) */}
      <div className={`rounded-2xl border p-4 transition-all duration-200 ${levelStyles}`}>
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
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${timeframeLabels.bg}`}>
                  {timeframeLabels.label}
                </span>

                <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  {categoryLabels}
                </span>

                {/* Overall Goal Progress Badge */}
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  התקדמות: {overallProgress}%
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
                    <span>{childGoals.length} יעדי משנה</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-lg border border-indigo-100">
                    <ListTodo className="w-3.5 h-3.5" />
                    <span>
                      {linkedTasks.length} משימות/יוזמות מקושרות ({completedTasksCount} הושלמו)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
            {isAnnual ? (
              <button
                onClick={() => postponeAnnualGoal(goal.id)}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all shadow-2xs"
                title="דחה/הארך לשנה הבאה"
              >
                <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
                <span>דחה בשנה</span>
              </button>
            ) : (
              <button
                onClick={() => postponeMonthlyGoal(goal.id)}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all shadow-2xs"
                title="דחה/הארך בחודש"
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
                  onClick={() => onAddSubGoal(goal.id, 'quarterly')}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-xl transition-colors"
                  title="הוסף יעד רבעוני"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">יעד רבעוני</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Key Results Section */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-cyan-600" />
              <span>תוצאות מפתח (Key Results - KRs) ({goalKrs.length})</span>
            </h4>
            <button
              onClick={() => {
                setEditingKr(undefined);
                setIsKrModalOpen(true);
              }}
              className="text-xs font-semibold text-cyan-600 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 px-2.5 py-1 rounded-lg border border-cyan-200 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>הוסף מדד (KR)</span>
            </button>
          </div>

          {goalKrs.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic bg-slate-50/50 p-2 rounded-xl border border-dashed border-slate-200 text-center">
              טרם הוגדרו תוצאות מפתח (KRs) ליעד זה. לחץ על &quot;הוסף מדד&quot; כדי להגדיר מדד כמותי.
            </p>
          ) : (
            <div className="space-y-2">
              {goalKrs.map((kr) => {
                const percent = kr.target > 0 ? Math.min(100, Math.round((kr.current / kr.target) * 100)) : 0;
                const isCheckinThisKr = checkinKrId === kr.id;

                return (
                  <div key={kr.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 text-xs">{kr.title}</span>
                          {kr.confidenceScore && (
                            <span className="flex items-center gap-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
                              <Gauge className="w-3 h-3 text-indigo-500" />
                              <span>{kr.confidenceScore}/10</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setCheckinValue(kr.current);
                            setCheckinConfidence(kr.confidenceScore || 7);
                            setCheckinKrId(isCheckinThisKr ? null : kr.id);
                          }}
                          className="text-[11px] font-semibold text-cyan-600 hover:text-cyan-800 flex items-center gap-1 hover:underline px-2 py-0.5"
                        >
                          <CheckSquare className="w-3 h-3" />
                          <span>עדכן התקדמות</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditingKr(kr);
                            setIsKrModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200/50"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => deleteKeyResult(kr.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>{kr.current} / {kr.target} {kr.unit}</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-cyan-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Inline Checkin Form */}
                    {isCheckinThisKr && (
                      <form
                        onSubmit={(e) => handleCheckinSubmit(e, kr.id)}
                        className="mt-2 p-2.5 rounded-xl bg-white border border-cyan-200 space-y-2 animate-in fade-in duration-150"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">ערך נוכחי:</label>
                            <input
                              type="number"
                              value={checkinValue}
                              onChange={(e) => setCheckinValue(Number(e.target.value))}
                              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">מדד ביטחון (1-10):</label>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={checkinConfidence}
                              onChange={(e) => setCheckinConfidence(Number(e.target.value))}
                              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-900"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setCheckinKrId(null)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 rounded-lg"
                          >
                            ביטול
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] font-semibold rounded-lg transition-colors"
                          >
                            שמור צ&apos;ק-אין
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal for adding/editing KR */}
      <KeyResultModal
        isOpen={isKrModalOpen}
        onClose={() => {
          setIsKrModalOpen(false);
          setEditingKr(undefined);
        }}
        onSave={handleSaveKr}
        goalId={goal.id}
        initialKeyResult={editingKr}
        onDelete={deleteKeyResult}
      />

      {/* Render Child Tree Nodes if Expanded */}
      {isExpanded && hasChildren && (
        <div className="flex flex-col gap-2 relative">
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
                level={level + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
