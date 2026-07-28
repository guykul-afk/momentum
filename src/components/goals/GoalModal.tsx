'use client';

import React, { useState } from 'react';
import { X, Target, Save, CheckCircle, Trash2 } from 'lucide-react';
import { Goal } from '@/types/models';
import { getDefaultAnnualEndDate, getDefaultMonthlyEndDate } from '@/lib/goalUtils';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => void;
  availableParents?: Goal[];
  initialGoal?: Goal;
  defaultTimeframe?: 'annual' | 'monthly';
  defaultParentId?: string;
  onDelete?: (goal: Goal) => void;
}

export function GoalModal({
  isOpen,
  onClose,
  onSave,
  availableParents = [],
  initialGoal,
  defaultTimeframe = 'monthly',
  defaultParentId,
  onDelete,
}: GoalModalProps) {
  const [title, setTitle] = useState(initialGoal?.title || '');
  const [description, setDescription] = useState(initialGoal?.description || '');
  const [timeframe, setTimeframe] = useState<'annual' | 'monthly'>(
    initialGoal ? (initialGoal.timeframe || 'monthly') : defaultTimeframe
  );
  const [parentId, setParentId] = useState(initialGoal?.parentId || defaultParentId || '');
  const [krTitle, setKrTitle] = useState(initialGoal?.krTitle || '');
  const [krTarget, setKrTarget] = useState<number>(initialGoal?.krTarget || 100);
  const [krCurrent, setKrCurrent] = useState<number>(initialGoal?.krCurrent || 0);
  const [krUnit, setKrUnit] = useState(initialGoal?.krUnit || '%');
  const [effortTargetPoints, setEffortTargetPoints] = useState<number>(
    initialGoal?.effortTargetPoints || 20
  );
  const [category, setCategory] = useState<'work' | 'personal' | 'health' | 'maintenance'>(
    initialGoal?.category || 'work'
  );

  React.useEffect(() => {
    if (isOpen) {
      setTitle(initialGoal?.title || '');
      setDescription(initialGoal?.description || '');
      setTimeframe(initialGoal ? (initialGoal.timeframe || 'monthly') : defaultTimeframe);
      setParentId(initialGoal?.parentId || defaultParentId || '');
      setKrTitle(initialGoal?.krTitle || '');
      setKrTarget(initialGoal?.krTarget || 100);
      setKrCurrent(initialGoal?.krCurrent || 0);
      setKrUnit(initialGoal?.krUnit || '%');
      setEffortTargetPoints(initialGoal?.effortTargetPoints || 20);
      setCategory(initialGoal?.category || 'work');
    }
  }, [isOpen, initialGoal, defaultTimeframe, defaultParentId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const currentYear = new Date().getFullYear();
    const currentMonthStr = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    const targetYear = timeframe === 'annual' ? (initialGoal?.targetYear || currentYear) : undefined;
    const targetMonth = timeframe === 'monthly' ? (initialGoal?.targetMonth || currentMonthStr) : undefined;
    const endDate =
      timeframe === 'annual'
        ? getDefaultAnnualEndDate(targetYear)
        : getDefaultMonthlyEndDate(targetMonth);

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      timeframe,
      parentId: timeframe === 'monthly' ? parentId || undefined : undefined,
      targetYear,
      targetMonth,
      endDate,
      krTitle: krTitle.trim() || 'יעד כמותי',
      krTarget: Number(krTarget) || 100,
      krCurrent: Number(krCurrent) || 0,
      krUnit: krUnit.trim() || '%',
      effortTargetPoints: Number(effortTargetPoints) || 20,
      effortCompletedPoints: initialGoal?.effortCompletedPoints || 0,
      category,
      status: initialGoal?.status || 'active',
      lastPointsAssignedAt: initialGoal?.lastPointsAssignedAt || Date.now(),
    });

    onClose();
  };

  const filteredParents = availableParents.filter((g) => g.timeframe === 'annual' && g.status === 'active');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              {initialGoal ? 'עריכת יעד' : 'הוספת יעד חדש'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Timeframe Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              רמת היררכיה בזמן
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'annual', label: 'שנתי' },
                  { id: 'monthly', label: 'חודשי' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTimeframe(t.id);
                    setParentId('');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    timeframe === t.id
                      ? 'bg-cyan-500 text-white border-cyan-500 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Parent Goal selection if monthly */}
          {timeframe === 'monthly' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                שיוך ליעד אב (יעד שנתי)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">-- ללא יעד אב ישיר --</option>
                {filteredParents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title & Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              כותרת היעד <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="לדוגמה: השקת מוצר Momentum v1.0"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">תיאור קצר</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תיאור מפורט של היעד והתוצר המיוחל..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">קטגוריה</label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { id: 'work', label: 'עבודה' },
                  { id: 'personal', label: 'אישי' },
                  { id: 'health', label: 'בריאות' },
                  { id: 'maintenance', label: 'תפעול' },
                ] as const
              ).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border transition-all ${
                    category === c.id
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* KR (Key Result) & Effort target */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <CheckCircle className="w-4 h-4 text-cyan-600" />
              <span>הגדרת מדד תוצאה (Key Result - KR)</span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">תיאור מדד KR</label>
              <input
                type="text"
                value={krTitle}
                onChange={(e) => setKrTitle(e.target.value)}
                placeholder="לדוגמה: 1,000 משתמשים רשומים"
                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-slate-600 mb-0.5">
                  ערך נוכחי
                </label>
                <input
                  type="number"
                  value={krCurrent}
                  onChange={(e) => setKrCurrent(Number(e.target.value))}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-600 mb-0.5">
                  יעד (Target)
                </label>
                <input
                  type="number"
                  value={krTarget}
                  onChange={(e) => setKrTarget(Number(e.target.value))}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-600 mb-0.5">יחידה</label>
                <input
                  type="text"
                  value={krUnit}
                  onChange={(e) => setKrUnit(e.target.value)}
                  placeholder="%, משתמשים"
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                יעד נקודות מאמץ מתוכנן (Effort Points)
              </label>
              <input
                type="number"
                value={effortTargetPoints}
                onChange={(e) => setEffortTargetPoints(Number(e.target.value))}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div>
              {initialGoal && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(initialGoal);
                    onClose();
                  }}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>מחק יעד</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                ביטול
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>שמור יעד</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
