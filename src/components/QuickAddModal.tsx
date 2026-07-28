'use client';

import React, { useState } from 'react';
import { X, Target, CheckSquare, Plus, Save } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getDefaultAnnualEndDate, getDefaultMonthlyEndDate } from '@/lib/goalUtils';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'goal' | 'task';
}

export function QuickAddModal({ isOpen, onClose, defaultTab = 'goal' }: QuickAddModalProps) {
  const { goals, addGoal, addTask } = useAppStore();
  const [tab, setTab] = useState<'goal' | 'task'>(defaultTab);

  // Goal Form State
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTimeframe, setGoalTimeframe] = useState<'annual' | 'monthly'>('monthly');
  const [goalCategory, setGoalCategory] = useState<'work' | 'personal' | 'health' | 'maintenance'>('work');
  const [goalParentId, setGoalParentId] = useState('');
  const [krTitle, setKrTitle] = useState('');
  const [krTarget, setKrTarget] = useState(100);
  const [krUnit, setKrUnit] = useState('%');

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<'work' | 'personal' | 'health' | 'maintenance'>('work');
  const [taskGoalId, setTaskGoalId] = useState('');
  const [taskWeight, setTaskWeight] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [taskMinutes, setTaskMinutes] = useState(30);
  const [taskTargetDate, setTaskTargetDate] = useState<'today' | 'tomorrow'>('today');

  if (!isOpen) return null;

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    const currentYear = new Date().getFullYear();
    const currentMonthStr = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    const targetYear = goalTimeframe === 'annual' ? currentYear : undefined;
    const targetMonth = goalTimeframe === 'monthly' ? currentMonthStr : undefined;
    const endDate = goalTimeframe === 'annual' ? getDefaultAnnualEndDate(currentYear) : getDefaultMonthlyEndDate(currentMonthStr);

    addGoal({
      title: goalTitle.trim(),
      timeframe: goalTimeframe,
      parentId: goalTimeframe === 'monthly' ? goalParentId || undefined : undefined,
      targetYear,
      targetMonth,
      endDate,
      category: goalCategory,
      krTitle: krTitle.trim() || 'יעד כמותי',
      krTarget: Number(krTarget) || 100,
      krCurrent: 0,
      krUnit: krUnit.trim() || '%',
      status: 'active',
    });

    setGoalTitle('');
    setKrTitle('');
    onClose();
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask(
      {
        title: taskTitle.trim(),
        category: taskCategory,
        goalId: taskGoalId || undefined,
        weight: taskWeight,
        estimatedMinutes: taskMinutes,
        type: 'daily',
      },
      taskTargetDate
    );

    setTaskTitle('');
    onClose();
  };

  const filteredParents = goals.filter(
    (g) =>
      g.status === 'active' &&
      (g.timeframe === 'annual' || !g.parentId || g.id === goalParentId)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-5 flex flex-col gap-4">
        {/* Header with Type Selector */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setTab('goal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                tab === 'goal'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>יעד חדש</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('task')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                tab === 'task'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>משימה חדשה</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Goal Form */}
        {tab === 'goal' && (
          <form onSubmit={handleSaveGoal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                כותרת היעד <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="לדוגמה: השקת מוצר Momentum v1.0"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">רמת זמן</label>
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
                      setGoalTimeframe(t.id);
                      setGoalParentId('');
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      goalTimeframe === t.id
                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {goalTimeframe !== 'annual' && filteredParents.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">שיוך ליעד אב</label>
                <select
                  value={goalParentId}
                  onChange={(e) => setGoalParentId(e.target.value)}
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">קטגוריה</label>
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
                    onClick={() => setGoalCategory(c.id)}
                    className={`py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                      goalCategory === c.id
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="text-xs font-bold text-slate-700">מדד תוצאה (Key Result - KR)</div>
              <div>
                <input
                  type="text"
                  value={krTitle}
                  onChange={(e) => setKrTitle(e.target.value)}
                  placeholder="תיאור מדד (לדוגמה: 100 לקוחות חדשים)"
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-0.5">ערך יעד</label>
                  <input
                    type="number"
                    value={krTarget}
                    onChange={(e) => setKrTarget(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-0.5">יחידה</label>
                  <input
                    type="text"
                    value={krUnit}
                    onChange={(e) => setKrUnit(e.target.value)}
                    placeholder="%, משתמשים"
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                ביטול
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>צור יעד</span>
              </button>
            </div>
          </form>
        )}

        {/* Task Form */}
        {tab === 'task' && (
          <form onSubmit={handleSaveTask} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                כותרת המשימה <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="לדוגמה: בדיקת UI ורספונסיביות"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">תאריך יעד</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTaskTargetDate('today')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    taskTargetDate === 'today'
                      ? 'bg-cyan-500 text-white border-cyan-500 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  להיום
                </button>
                <button
                  type="button"
                  onClick={() => setTaskTargetDate('tomorrow')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    taskTargetDate === 'tomorrow'
                      ? 'bg-cyan-500 text-white border-cyan-500 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  למחר
                </button>
              </div>
            </div>

            {goals.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">שיוך ליעד</label>
                <select
                  value={taskGoalId}
                  onChange={(e) => setTaskGoalId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">-- ללא שיוך ליעד --</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} ({g.timeframe})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">משקל משימה (1-5)</label>
                <select
                  value={taskWeight}
                  onChange={(e) => setTaskWeight(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                >
                  <option value={1}>1 - קלה מאד</option>
                  <option value={2}>2 - קלה</option>
                  <option value={3}>3 - בינונית</option>
                  <option value={4}>4 - חשובה</option>
                  <option value={5}>5 - קריטית</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">זמן משוער (בדקות)</label>
                <input
                  type="number"
                  value={taskMinutes}
                  onChange={(e) => setTaskMinutes(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                ביטול
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>צור משימה</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
