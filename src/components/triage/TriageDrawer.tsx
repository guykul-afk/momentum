'use client';

import React, { useState, useEffect } from 'react';
import { RawCaptureItem, Task } from '@/types/models';
import { useAppStore } from '@/lib/store';
import {
  X,
  Check,
  Trash2,
  Sparkles,
  Volume2,
  Clock,
  Target,
  ChevronDown,
  Sun,
  Sunrise,
  CheckCircle,
} from 'lucide-react';

interface TriageDrawerProps {
  item: RawCaptureItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TriageDrawer({ item, isOpen, onClose }: TriageDrawerProps) {
  const { triageApprove, deleteRawCapture, goals, keyResults } = useAppStore();

  const [title, setTitle] = useState('');
  const [weight, setWeight] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [goalId, setGoalId] = useState<string>('');
  const [keyResultId, setKeyResultId] = useState<string>('');
  const [targetDate, setTargetDate] = useState<'today' | 'tomorrow'>('today');
  const [category, setCategory] = useState<
    'work' | 'personal' | 'health' | 'maintenance' | 'habit'
  >('work');
  const [taskType, setTaskType] = useState<'daily' | 'one-off' | 'recurring'>('daily');
  const [when, setWhen] = useState('');
  const [where, setWhere] = useState('');

  // Sync state when drawer opens with a new item
  useEffect(() => {
    if (!item) return;
    const breakdown = item.suggestedBreakdown;
    setTitle(breakdown?.title || item.content || '');
    setWeight((breakdown?.weight as 1 | 2 | 3 | 4 | 5) || 3);
    setEstimatedMinutes(breakdown?.estimatedMinutes || 30);
    setGoalId(breakdown?.goalId || '');
    setKeyResultId(breakdown?.keyResultId || '');
    setCategory(breakdown?.category || 'work');
    setTaskType(breakdown?.type || 'daily');
    setWhen(breakdown?.when || '');
    setWhere(breakdown?.where || '');
    setTargetDate('today');
  }, [item]);

  if (!isOpen || !item) return null;

  const availableKrs = goalId ? keyResults.filter((kr) => kr.goalId === goalId) : [];

  const handleApprove = () => {
    const taskData: Partial<Task> = {
      title: title.trim() || item.content,
      weight,
      estimatedMinutes,
      category,
      type: taskType,
      goalId: goalId || undefined,
      keyResultId: keyResultId || undefined,
      when: when || undefined,
      where: where || undefined,
      isHabit: category === 'habit',
      isMaintenance: category === 'maintenance',
    };

    triageApprove(item.id, taskData, targetDate);
    onClose();
  };

  const handleDelete = () => {
    deleteRawCapture(item.id);
    onClose();
  };

  const timeStr = new Date(item.createdAt).toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      {/* Backdrop overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2rem] p-6 shadow-2xl space-y-5 border border-slate-100 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header & Handle */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto sm:hidden" />
          <div className="flex items-center justify-between w-full pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4 text-cyan-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  אבחון משימה (Triage)
                </h3>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>הוקלט/הוקלד ב-{timeStr}</span>
                  {item.audioDuration && (
                    <span className="flex items-center gap-1 bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded-md font-bold text-[10px]">
                      <Volume2 className="w-3 h-3 text-cyan-600" />
                      הקלטה ({item.audioDuration} שנ׳)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              aria-label="סגור"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Captured Raw Content Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-inner space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
            תוכן שנלכד במקור:
          </span>
          <p className="text-xs font-medium text-slate-200 leading-relaxed">&quot;{item.content}&quot;</p>
        </div>

        {/* Task Title Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-700 block">כותרת המשימה:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="שם המשימה..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all shadow-xs"
          />
        </div>

        {/* 1. Importance (Weight) Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-slate-700">1. חשיבות ומשקל המשימה (1-5):</label>
            <span className="text-[11px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md">
              משקל {weight} מתוך 5
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {([1, 2, 3, 4, 5] as const).map((w) => {
              const labels = ['נמוך מאוד', 'נמוך', 'בינוני', 'גבוה', 'קריטי'];
              const isSelected = weight === w;
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeight(w)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-white border-cyan-600 shadow-md scale-105 font-black'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-cyan-300 font-semibold'
                  }`}
                >
                  <span className="text-sm font-black">{w}</span>
                  <span className="text-[9px] truncate w-full mt-0.5 opacity-90">
                    {labels[w - 1]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Connection to Goal & Key Result */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-700 block">
            2. שיוך ליעד אב ומדד תוצאה (OKR):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <select
                value={goalId}
                onChange={(e) => {
                  setGoalId(e.target.value);
                  setKeyResultId('');
                }}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all shadow-xs pr-8"
              >
                <option value="">ללא קשר ליעד (משימה עצמאית)</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title} ({g.timeframe})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {goalId && (
              <div className="relative">
                <select
                  value={keyResultId}
                  onChange={(e) => setKeyResultId(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-xs pr-8"
                >
                  <option value="">-- בחר מדד KR --</option>
                  {availableKrs.map((kr) => (
                    <option key={kr.id} value={kr.id}>
                      {kr.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        {/* 3. Execution Date Selection (Today / Tomorrow) */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-700 block">
            3. תאריך ביצוע המשימה:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTargetDate('today')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-extrabold transition-all shadow-xs ${
                targetDate === 'today'
                  ? 'bg-cyan-500 text-white border-cyan-600 shadow-md scale-[1.02]'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-cyan-50 hover:text-cyan-700'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>היום (Today)</span>
            </button>

            <button
              type="button"
              onClick={() => setTargetDate('tomorrow')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-extrabold transition-all shadow-xs ${
                targetDate === 'tomorrow'
                  ? 'bg-cyan-500 text-white border-cyan-600 shadow-md scale-[1.02]'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-cyan-50 hover:text-cyan-700'
              }`}
            >
              <Sunrise className="w-4 h-4" />
              <span>מחר (Tomorrow)</span>
            </button>
          </div>
        </div>

        {/* Additional Optional Details: Duration & Category */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[11px] font-bold text-slate-500 mb-1 block">משך מוערך (בדקות):</label>
            <input
              type="number"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 mb-1 block">קטגוריה:</label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value as 'work' | 'personal' | 'health' | 'maintenance' | 'habit'
                )
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="work">עבודה</option>
              <option value="personal">אישי</option>
              <option value="health">בריאות וספורט</option>
              <option value="habit">הרגל</option>
              <option value="maintenance">תחזוקה ושגרה</option>
            </select>
          </div>
        </div>

        {/* Implementation Intentions Trigger (When & Where) for High Weight */}
        {weight >= 4 && (
          <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800">
              <Target className="w-3.5 h-3.5 text-amber-600" />
              <span>כוונת ביצוע למשימה במשקל גבוה (When & Where)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                placeholder="מתי? (למשל: בשעה 10:00)"
                className="w-full bg-white border border-amber-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                value={where}
                onChange={(e) => setWhere(e.target.value)}
                placeholder="איפה? (למשל: במחשב נייד)"
                className="w-full bg-white border border-amber-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* Action Buttons: Delete & Approve */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center justify-center gap-1.5 py-3 rounded-2xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>מחק פריט</span>
          </button>

          <button
            type="button"
            onClick={handleApprove}
            className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-extrabold shadow-md transition-all active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>אישור והעברה למשימות</span>
          </button>
        </div>
      </div>
    </div>
  );
}
