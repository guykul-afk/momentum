'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Target,
  Plus,
  Flame,
  AlertTriangle,
  Layers,
  Sparkles,
  CalendarCheck,
  Filter,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Goal } from '@/types/models';
import { GoalTreeItem } from '@/components/goals/GoalTreeItem';
import { GoalModal } from '@/components/goals/GoalModal';
import { isGoalStarved } from '@/components/goals/StarveBadge';

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal, addKrCheckin } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [modalDefaultTimeframe, setModalDefaultTimeframe] = useState<'annual' | 'monthly' | 'weekly'>('annual');
  const [modalDefaultParentId, setModalDefaultParentId] = useState<string | undefined>(undefined);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);

  const [timeframeFilter, setTimeframeFilter] = useState<'all' | 'annual' | 'monthly' | 'weekly'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter goals based on selection
  const activeGoals = goals.filter((g) => g.status === 'active');

  const filteredGoals = activeGoals.filter((g) => {
    if (timeframeFilter !== 'all' && g.timeframe !== timeframeFilter) return false;
    if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;
    return true;
  });

  // Root goals for the tree display (Annual goals or orphan goals without parents)
  const rootGoals = filteredGoals.filter(
    (g) => !g.parentId || !goals.some((parent) => parent.id === g.parentId)
  );

  // Statistics calculation
  const starvedCount = activeGoals.filter((g) => isGoalStarved(g.lastPointsAssignedAt)).length;
  const gapAlertCount = activeGoals.filter((g) => {
    const effortTarget = g.effortTargetPoints || 1;
    const krTarget = g.krTarget || 1;
    const effortPct = Math.min(100, Math.round(((g.effortCompletedPoints || 0) / effortTarget) * 100));
    const krPct = Math.min(100, Math.round(((g.krCurrent || 0) / krTarget) * 100));
    return Math.abs(effortPct - krPct) > 30;
  }).length;

  const handleOpenAddModal = (parentId?: string, timeframe: 'annual' | 'monthly' | 'weekly' = 'annual') => {
    setEditingGoal(undefined);
    setModalDefaultTimeframe(timeframe);
    setModalDefaultParentId(parentId);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setModalDefaultTimeframe(goal.timeframe || 'monthly');
    setModalDefaultParentId(goal.parentId);
    setIsModalOpen(true);
  };

  const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, goalData);
    } else {
      addGoal(goalData);
    }
  };

  const handleCheckinKr = (goalId: string, currentKr: number) => {
    addKrCheckin(goalId, currentKr, 'עדכון מהיר מעץ היעדים');
  };

  const handleRequestDeleteGoal = (goal: Goal) => {
    setDeletingGoal(goal);
  };

  const handleConfirmDelete = () => {
    if (deletingGoal) {
      deleteGoal(deletingGoal.id);
      setDeletingGoal(null);
    }
  };

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500 text-white shadow-xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">עץ יעדים ו-KRs</h1>
              <p className="text-xs text-slate-500 font-medium">
                היררכיית יעדים רב-שנתית, מדדי מאמץ והתראות מומנטום
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAddModal(undefined, 'annual')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>יעד חדש</span>
          </button>
        </div>
      </div>

      {/* Ritual Quick Access Links */}
      <div className="grid grid-cols-2 gap-2.5">
        <Link
          href="/rituals/weekly-planning"
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-cyan-50 to-indigo-50 border border-cyan-200/80 hover:border-cyan-400 transition-all shadow-2xs group"
        >
          <div className="p-2 rounded-xl bg-white text-cyan-600 shadow-xs group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-slate-800">תכנון שבועי</div>
            <div className="text-[10px] text-slate-500">הקצאת נקודות מאמץ</div>
          </div>
        </Link>

        <Link
          href="/rituals/monthly-close"
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 hover:border-teal-400 transition-all shadow-2xs group"
        >
          <div className="p-2 rounded-xl bg-white text-teal-600 shadow-xs group-hover:scale-105 transition-transform">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-slate-800">סיכום חודשי</div>
            <div className="text-[10px] text-slate-500">עדכון KRs ודוח AI</div>
          </div>
        </Link>
      </div>

      {/* Executive Summary Metrics Banner */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white p-3 rounded-2xl border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold text-slate-600">סה&quot;כ יעדים</span>
            <Layers className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-xl font-black text-slate-800">{activeGoals.length}</div>
          <div className="text-[10px] text-slate-400">פעילים במערכת</div>
        </div>

        <div className="bg-orange-50/70 p-3 rounded-2xl border border-orange-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-orange-400 mb-1">
            <span className="text-[11px] font-semibold text-orange-800">פער מאמץ (&gt;30%)</span>
            <Flame className="w-4 h-4 text-[#F97316]" />
          </div>
          <div className="text-xl font-black text-[#F97316]">{gapAlertCount}</div>
          <div className="text-[10px] text-orange-600/80 font-medium">התראת Coral highlight</div>
        </div>

        <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-[11px] font-semibold text-amber-800">יעדים רעבים</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-700">{starvedCount}</div>
          <div className="text-[10px] text-amber-600/80 font-medium">ללא נקודות 14+ יום</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          {(
            [
              { id: 'all', label: 'הכל' },
              { id: 'annual', label: 'שנתי' },
              { id: 'monthly', label: 'חודשי' },
              { id: 'weekly', label: 'שבועי' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframeFilter(t.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                timeframeFilter === t.id
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 focus:outline-none"
          >
            <option value="all">כל הקטגוריות</option>
            <option value="work">עבודה</option>
            <option value="personal">אישי</option>
            <option value="health">בריאות</option>
            <option value="maintenance">תפעול</option>
          </select>
        </div>
      </div>

      {/* Goals Tree Hierarchy View */}
      {rootGoals.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300">
          <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">לא נמצאו יעדים במערכת</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            הגדר את היעדים השנתיים, החודשיים והשבועיים שלך כדי להתחיל למדוד מומנטום
          </p>
          <button
            onClick={() => handleOpenAddModal(undefined, 'annual')}
            className="px-4 py-2 bg-cyan-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-cyan-700 transition-colors"
          >
            צור יעד ראשון
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {rootGoals.map((rootGoal) => {
            const childGoals = filteredGoals.filter((g) => g.parentId === rootGoal.id);
            return (
              <GoalTreeItem
                key={rootGoal.id}
                goal={rootGoal}
                childGoals={childGoals}
                allGoals={filteredGoals}
                onAddSubGoal={(parentId, timeframe) => handleOpenAddModal(parentId, timeframe)}
                onEditGoal={handleOpenEditModal}
                onDeleteGoal={handleRequestDeleteGoal}
                onCheckinKr={handleCheckinKr}
                level={0}
              />
            );
          })}
        </div>
      )}

      {/* Goal Create / Edit Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveGoal}
        onDelete={handleRequestDeleteGoal}
        availableParents={goals}
        initialGoal={editingGoal}
        defaultTimeframe={modalDefaultTimeframe}
        defaultParentId={modalDefaultParentId}
      />

      {/* Delete Confirmation Modal */}
      {deletingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">אישור מחיקת יעד</h3>
                <p className="text-xs text-slate-500">פעולה זו אינה ניתנת לביטול</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <p className="text-xs font-semibold text-slate-700">{deletingGoal.title}</p>
              {goals.some((g) => g.parentId === deletingGoal.id) && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">
                  ⚠️ שים לב: מחיקת יעד זה תביא למחיקת תתי-היעדים שתחתיו!
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingGoal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
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
