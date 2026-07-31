'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Plus, Save, Target, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'goal' | 'task';
}

export function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const { goals, keyResults, addTask } = useAppStore();

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<'work' | 'personal' | 'health' | 'maintenance'>('work');
  const [taskGoalId, setTaskGoalId] = useState('');
  const [taskKeyResultId, setTaskKeyResultId] = useState('');
  const [taskWeight, setTaskWeight] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [taskMinutes, setTaskMinutes] = useState(30);
  const [taskTargetDate, setTaskTargetDate] = useState<'today' | 'tomorrow'>('today');

  useEffect(() => {
    if (isOpen) {
      setTaskTitle('');
      setTaskGoalId('');
      setTaskKeyResultId('');
      setTaskCategory('work');
      setTaskWeight(3);
      setTaskMinutes(30);
      setTaskTargetDate('today');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask(
      {
        title: taskTitle.trim(),
        category: taskCategory,
        goalId: taskGoalId || undefined,
        keyResultId: taskKeyResultId || undefined,
        weight: taskWeight,
        estimatedMinutes: taskMinutes,
        type: 'daily',
      },
      taskTargetDate
    );

    setTaskTitle('');
    setTaskGoalId('');
    setTaskKeyResultId('');
    onClose();
  };

  const availableKrs = taskGoalId ? keyResults.filter((kr) => kr.goalId === taskGoalId) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">משימה חדשה (Initiative)</h3>
              <p className="text-[11px] text-slate-400">הגדרת משימה ותכנון לביצוע</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Form Only */}
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
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
            />
          </div>

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
                  onClick={() => setTaskCategory(c.id)}
                  className={`py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                    taskCategory === c.id
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
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

          {/* OKR Goal & KR Linkage */}
          {goals.length > 0 && (
            <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-cyan-600" />
                  <span>1. שיוך ליעד אב (Objective)</span>
                </label>
                <select
                  value={taskGoalId}
                  onChange={(e) => {
                    const selectedGId = e.target.value;
                    setTaskGoalId(selectedGId);
                    setTaskKeyResultId('');
                  }}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">-- ללא שיוך ליעד --</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} ({g.timeframe})
                    </option>
                  ))}
                </select>
              </div>

              {taskGoalId && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>2. שיוך למדד תוצאה (Key Result - KR)</span>
                  </label>
                  <select
                    value={taskKeyResultId}
                    onChange={(e) => setTaskKeyResultId(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="">-- בחר מדד KR לקדום --</option>
                    {availableKrs.map((kr) => (
                      <option key={kr.id} value={kr.id}>
                        {kr.title} ({kr.current} / {kr.target} {kr.unit})
                      </option>
                    ))}
                  </select>
                  {availableKrs.length === 0 && (
                    <p className="text-[11px] text-amber-600 mt-1.5 italic">
                      ⚠️ ליעד זה טרם הוגדרו מדדי KR. ניתן להוסיף KR ליעד בעמוד היעדים.
                    </p>
                  )}
                </div>
              )}
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

          <div className="sticky bottom-0 bg-white pt-3 pb-1 border-t border-slate-100 flex items-center justify-end gap-2 mt-auto">
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
      </div>
    </div>
  );
}
