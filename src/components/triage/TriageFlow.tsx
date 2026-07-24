'use client';

import React, { useState, useEffect } from 'react';
import { RawCaptureItem, Task } from '@/types/models';
import { useAppStore } from '@/lib/store';
import {
  Sparkles,
  Check,
  X,
  Edit2,
  Clock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Volume2,
  Target,
} from 'lucide-react';

interface TriageFlowProps {
  items: RawCaptureItem[];
  onComplete: () => void;
}

export function TriageFlow({ items, onComplete }: TriageFlowProps) {
  const { triageApprove, triageReject, goals } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const currentItem = items[currentIndex];

  // Editable Form State
  const [editTitle, setEditTitle] = useState('');
  const [editWeight, setEditWeight] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [editDuration, setEditDuration] = useState(30);
  const [editType, setEditType] = useState<'daily' | 'one-off' | 'recurring'>('daily');
  const [editCategory, setEditCategory] = useState<
    'work' | 'personal' | 'health' | 'maintenance' | 'habit'
  >('work');
  const [editGoalId, setEditGoalId] = useState<string>('');
  const [editWhen, setEditWhen] = useState('');
  const [editWhere, setEditWhere] = useState('');

  // Sync form state when currentItem changes
  useEffect(() => {
    if (!currentItem) return;
    setIsAiLoading(true);

    // Simulate mock AI processing fallback
    const timer = setTimeout(() => {
      const breakdown = currentItem.suggestedBreakdown || {
        title: currentItem.content,
        weight: 3 as const,
        estimatedMinutes: 30,
        type: 'daily' as const,
        category: 'work' as const,
        aiRationale: 'ניתוח אוטומטי של תפוקה מוצעת על בסיס התוכן שנלכד',
      };

      setEditTitle(breakdown.title);
      setEditWeight(breakdown.weight);
      setEditDuration(breakdown.estimatedMinutes);
      setEditType(breakdown.type);
      setEditCategory(breakdown.category);
      setEditGoalId(breakdown.goalId || '');
      setEditWhen(breakdown.when || '');
      setEditWhere(breakdown.where || '');

      setIsAiLoading(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [currentIndex, currentItem]);

  if (!currentItem || currentIndex >= items.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-md">
        <div className="w-16 h-16 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">סיימת את הטריאז׳ בהצלחה!</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          כל המשימות עובדו, סווגו והועברו לרשימות הביצוע שלך.
        </p>
        <button
          onClick={onComplete}
          className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
        >
          חזרה לאינבוקס
        </button>
      </div>
    );
  }

  const handleApprove = () => {
    const taskData: Partial<Task> = {
      title: editTitle,
      weight: editWeight,
      estimatedMinutes: editDuration,
      type: editType,
      category: editCategory,
      goalId: editGoalId || undefined,
      when: editWhen || undefined,
      where: editWhere || undefined,
      isHabit: editCategory === 'habit',
      isMaintenance: editCategory === 'maintenance',
    };

    triageApprove(currentItem.id, taskData);

    if (currentIndex + 1 >= items.length) {
      onComplete();
    } else {
      setCurrentIndex((prev) => prev + 1);
      setIsEditing(false);
    }
  };

  const handleReject = () => {
    triageReject(currentItem.id);
    if (currentIndex + 1 >= items.length) {
      onComplete();
    } else {
      setCurrentIndex((prev) => prev + 1);
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Progress */}
      <div className="flex items-center justify-between">
        <button
          onClick={onComplete}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          <ArrowRight className="w-4 h-4" />
          <span>סגור טריאז׳</span>
        </button>
        <span className="text-xs font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-full">
          פריט {currentIndex + 1} מתוך {items.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-cyan-500 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
        />
      </div>

      {/* Raw Capture Original Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-lg space-y-2 border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-cyan-400">תוכן נלכד מקורי:</span>
          {currentItem.audioDuration && (
            <span className="flex items-center gap-1 bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px]">
              <Volume2 className="w-3 h-3 text-cyan-400" />
              {currentItem.audioDuration} שניות
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-slate-100 leading-relaxed">
          &quot;{currentItem.content}&quot;
        </p>
      </div>

      {/* AI Breakdown Suggestion Card */}
      {isAiLoading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3 shadow-sm">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-700">AI מנתח את הפריט ומציע פירוק משימה...</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-700">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span>המלצת AI לסיווג ופירוק</span>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-semibold text-slate-500 hover:text-cyan-600 flex items-center gap-1 bg-slate-100 hover:bg-cyan-50 px-2.5 py-1 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'סגור עריכה' : 'ערוך פירוק'}</span>
            </button>
          </div>

          {/* AI Rationale Badge */}
          {currentItem.suggestedBreakdown?.aiRationale && (
            <div className="bg-cyan-50/70 border border-cyan-200/70 rounded-xl p-2.5 text-[11px] text-cyan-800">
              <span className="font-bold">נימוק המודל: </span>
              {currentItem.suggestedBreakdown.aiRationale}
            </div>
          )}

          {/* Structured Fields Form / View */}
          <div className="space-y-3.5 text-xs">
            {/* Title */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 mb-1 block">כותרת המשימה:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500"
                />
              ) : (
                <span className="text-sm font-bold text-slate-900 block">{editTitle}</span>
              )}
            </div>

            {/* Weight & Duration Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Weight Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">
                  משקל / חשיבות (1-5):
                </label>
                {isEditing ? (
                  <select
                    value={editWeight}
                    onChange={(e) => setEditWeight(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500"
                  >
                    <option value={1}>1 - נמוך מאוד</option>
                    <option value={2}>2 - נמוך</option>
                    <option value={3}>3 - בינוני</option>
                    <option value={4}>4 - גבוה</option>
                    <option value={5}>5 - קריטי / משמעותי</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((w) => (
                      <span
                        key={w}
                        className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center ${
                          w <= editWeight
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Estimated Duration */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">משך מוערך:</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editDuration}
                    onChange={(e) => setEditDuration(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500"
                  />
                ) : (
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {editDuration} דקות
                  </span>
                )}
              </div>
            </div>

            {/* Type & Category Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">סוג משימה:</label>
                <select
                  value={editType}
                  onChange={(e) =>
                    setEditType(e.target.value as 'daily' | 'one-off' | 'recurring')
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500"
                >
                  <option value="daily">יומי (Daily)</option>
                  <option value="one-off">חד-פעמי (One-off)</option>
                  <option value="recurring">מחזורי (Recurring)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">קטגוריה:</label>
                <select
                  value={editCategory}
                  onChange={(e) =>
                    setEditCategory(
                      e.target.value as 'work' | 'personal' | 'health' | 'maintenance' | 'habit'
                    )
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500"
                >
                  <option value="work">עבודה</option>
                  <option value="personal">אישי</option>
                  <option value="health">בריאות וספורט</option>
                  <option value="habit">הרגל</option>
                  <option value="maintenance">תחזוקה ושגרה</option>
                </select>
              </div>
            </div>

            {/* Associated Goal Selector */}
            {goals.length > 0 && (
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">
                  שיוך ליעד מרכזי (OKR):
                </label>
                <select
                  value={editGoalId}
                  onChange={(e) => setEditGoalId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500"
                >
                  <option value="">ללא שיוך ליעד</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Implementation Intentions Section (When & Where) - Triggered for Weight 4-5 */}
            {editWeight >= 4 && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800">
                  <Target className="w-3.5 h-3.5 text-amber-600" />
                  <span>כוונת ביצוע (When & Where) למשימה במשקל גבוה</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-bold text-amber-900 block mb-0.5">
                      מתי? (זמן / טריגר ביצוע):
                    </label>
                    <input
                      type="text"
                      value={editWhen}
                      onChange={(e) => setEditWhen(e.target.value)}
                      placeholder="למשל: בשעה 10:00 בבוקר אחרי הקפה"
                      className="w-full bg-white border border-amber-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-amber-900 block mb-0.5">
                      איפה? (מיקום / קונטקסט):
                    </label>
                    <input
                      type="text"
                      value={editWhere}
                      onChange={(e) => setEditWhere(e.target.value)}
                      placeholder="למשל: בחדר עבודה שקט בלפטופ"
                      className="w-full bg-white border border-amber-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: Approve / Reject */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <button
              onClick={handleReject}
              className="flex items-center justify-center gap-1.5 py-3 rounded-2xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold transition-all active:scale-95"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              <span>דחה / מחק</span>
            </button>

            <button
              onClick={handleApprove}
              className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>אישור והעברה למשימות</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
