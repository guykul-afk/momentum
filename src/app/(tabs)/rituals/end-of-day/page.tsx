'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { DailyQuotaRing } from '@/components/tasks/DailyQuotaRing';
import { computeDailyQuota } from '@/lib/metrics';
import {
  Sparkles,
  Moon,
  Award,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { getTodayDateString } from '@/lib/dateUtils';

export default function EndOfDayRitualPage() {
  const { tasks, taskInstances, addReflection, toggleTaskInstance } = useAppStore();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const todayStr = getTodayDateString();

  const dailyTasks = tasks.filter((t) => t.type === 'daily' && !t.isHabit && !t.isMaintenance && t.isActive);

  const completedCount = dailyTasks.filter((t) => {
    const inst = taskInstances.find((i) => i.taskId === t.id && i.date === todayStr);
    return inst?.status === 'completed';
  }).length;

  const pendingTasks = dailyTasks.filter((t) => {
    const inst = taskInstances.find((i) => i.taskId === t.id && i.date === todayStr);
    return inst?.status !== 'completed';
  });

  const dailyQuotaCount = computeDailyQuota(tasks);
  const adherencePct = dailyQuotaCount > 0 ? Math.round((completedCount / dailyQuotaCount) * 100) : 100;

  // Step 3 Reflection State
  const [wins, setWins] = useState('');
  const [learnings, setLearnings] = useState('');

  // Step 4 Tomorrow Priorities State
  const [tomorrowPriorities, setTomorrowPriorities] = useState<string[]>([
    'פגישת תכנון שבועית וסנכרון מול הצוות',
    'סיום בדיקות UI ורספונסיביות מלאה',
    '',
  ]);

  const handlePriorityChange = (index: number, val: string) => {
    const updated = [...tomorrowPriorities];
    updated[index] = val;
    setTomorrowPriorities(updated);
  };

  const handleFinish = () => {
    addReflection({
      date: todayStr,
      wins,
      learnings,
      tomorrowPriorities: tomorrowPriorities.filter((p) => p.trim()),
      tasksCompletedCount: completedCount,
      adherenceScore: adherencePct / 100,
    });
    setStep(5);
  };

  return (
    <div className="space-y-5 max-w-md mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Link
            href="/today"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-1 text-xs font-bold text-cyan-600">
              <Moon className="w-3.5 h-3.5" />
              <span>ריטואל סיום יום</span>
            </div>
            <h1 className="text-xl font-black text-slate-900">סיכום והערכות למחר</h1>
          </div>
        </div>
        <span className="text-xs font-extrabold text-cyan-800 bg-cyan-100/70 px-2.5 py-1 rounded-full">
          שלב {step} מתוך 5
        </span>
      </header>

      {/* Step Progress Bar */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-cyan-500 h-full transition-all duration-300"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      {/* STEP 1: Daily Summary & Adherence Review */}
      {step === 1 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-5">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">
              צעד 1: ביצועי היום
            </span>
            <h2 className="text-lg font-bold text-slate-900">איך עבר היום שלך?</h2>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center">
            <DailyQuotaRing completed={completedCount} total={Math.max(dailyQuotaCount, dailyTasks.length)} />
            <p className="text-xs text-slate-500 mt-3 font-medium text-center">
              השלמת {completedCount} מתוך {dailyQuotaCount} משימות מכסה יומית ({adherencePct}% עקביות)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center text-xs">
            <div className="bg-cyan-50 border border-cyan-200/80 rounded-2xl p-3">
              <span className="text-slate-500 block">משימות שהושלמו</span>
              <span className="text-lg font-black text-cyan-700">{completedCount}</span>
            </div>
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3">
              <span className="text-slate-500 block">נותרו לטיפול</span>
              <span className="text-lg font-black text-amber-700">{pendingTasks.length}</span>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>המשך לטיפול במשימות שלא הושלמו</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Unfinished Tasks Triage */}
      {step === 2 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">
              צעד 2: משימות שלא הושלמו
            </span>
            <h2 className="text-lg font-bold text-slate-900">טיפול במשימות פתוחות</h2>
            <p className="text-xs text-slate-500">
              תוכל לסמן משימות שהושלמו בדקה האחרונה, או להעביר אותן ליום מחר.
            </p>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-cyan-600 mx-auto" />
              <p className="text-xs font-bold text-cyan-900">כל משימות היום הושלמו!</p>
              <p className="text-[11px] text-cyan-700">אין משימות פתוחות שדורשות דחייה.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl"
                >
                  <span className="text-xs font-semibold text-slate-800">{t.title}</span>
                  <button
                    onClick={() => toggleTaskInstance(t.id)}
                    className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-white text-[11px] font-bold rounded-xl shadow-xs transition-all"
                  >
                    סמן כהושלם
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              חזרה
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>המשך לרפלקציה ומשוב</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Reflection & Wins */}
      {step === 3 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">
              צעד 3: רפלקציה יומית
            </span>
            <h2 className="text-lg font-bold text-slate-900">תובנות והישגים מהיום</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                🏆 מה עבד הכי טוב היום? (הישגים וניצחונות קטנים)
              </label>
              <textarea
                value={wins}
                onChange={(e) => setWins(e.target.value)}
                placeholder="למשל: סיימתי את משימת העיצוב בזמן, שמרתי על ריכוז גבוה..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                💡 מה למדת או ניתן לשפר מחר?
              </label>
              <textarea
                value={learnings}
                onChange={(e) => setLearnings(e.target.value)}
                placeholder="למשל: לתכנן אימונים מוקדם בבוקר כדי למנוע דחיינות..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              חזרה
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>המשך להגדרת 3 עדיפויות למחר</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Tomorrow's Top 3 Priorities */}
      {step === 4 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">
              צעד 4: תכנון למחר
            </span>
            <h2 className="text-lg font-bold text-slate-900">3 העדיפויות המרכזיות למחר</h2>
            <p className="text-xs text-slate-500">
              הגדר מראש את המשימות בעלות המשקל הגבוה ביותר (Weight 4-5) לבוקר מחר.
            </p>
          </div>

          <div className="space-y-3">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <span className="w-5 h-5 rounded-md bg-cyan-100 text-cyan-800 text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span>עדיפות #{idx + 1}</span>
                </label>
                <input
                  type="text"
                  value={tomorrowPriorities[idx] || ''}
                  onChange={(e) => handlePriorityChange(idx, e.target.value)}
                  placeholder={`הכנס עדיפות מרכזית #${idx + 1}`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              חזרה
            </button>
            <button
              onClick={handleFinish}
              className="flex-1 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>סים ריטואל ושמור</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Final Celebration */}
      {step === 5 && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center mx-auto shadow-lg animate-bounce">
            <Award className="w-10 h-10 text-cyan-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-white">יום מצוין הגיע לסיומו!</h2>
            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              שמרת על מומנטום גבוה והגדרת עדיפויות ברורות למחר. עבודה מעולה!
            </p>
          </div>

          {/* Inspirational Quote */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-xs text-cyan-200 italic">
            &quot;הדרך להשיג עקביות היא לא על ידי שלמות יומיומית, אלא על ידי התקדמות מתמדת.&quot;
          </div>

          <Link
            href="/today"
            className="block w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all active:scale-95"
          >
            חזרה למסך היום שלי
          </Link>
        </div>
      )}
    </div>
  );
}
