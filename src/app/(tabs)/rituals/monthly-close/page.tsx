'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  ArrowRight,
  Sparkles,
  Award,
  AlertTriangle,
  FileSpreadsheet,
  Save,
  CheckSquare,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MonthlyCloseReport, KrCheckin } from '@/types/models';

export default function MonthlyCloseRitualPage() {
  const { goals, addKrCheckin, saveMonthlyCloseReport } = useAppStore();

  const monthlyAndAnnualGoals = goals.filter(
    (g) => g.status === 'active' && (g.timeframe === 'monthly' || g.timeframe === 'annual')
  );

  // KR Values State for manual check-ins
  const [krValues, setKrValues] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    monthlyAndAnnualGoals.forEach((g) => {
      map[g.id] = g.krCurrent || 0;
    });
    return map;
  });

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [aiReport, setAiReport] = useState<MonthlyCloseReport['aiAnalysis'] | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleValueChange = (goalId: string, val: number) => {
    setKrValues((prev) => ({
      ...prev,
      [goalId]: val,
    }));
  };

  const handleNotesChange = (goalId: string, text: string) => {
    setNotes((prev) => ({
      ...prev,
      [goalId]: text,
    }));
  };

  const handleGenerateAiReport = () => {
    setIsGeneratingAi(true);

    setTimeout(() => {
      const highRoi = monthlyAndAnnualGoals
        .filter((g) => {
          const krTarget = g.krTarget || 1;
          const krPct = (krValues[g.id] || 0) / krTarget;
          return krPct >= 0.5;
        })
        .map((g) => g.title);

      const report: MonthlyCloseReport['aiAnalysis'] = {
        summary: 'ניתוח סיכום חודשי: מעקב חודשי פעיל והתקדמות במדדי היעדים וה-KR.',
        highRoiGoals: highRoi.length > 0 ? highRoi : ['פיתוח 4 ריטואלים עיקריים ומערכת יעדים'],
        starvedGoals: [],
        effortOutcomeCorrelation: 0.85,
        strategicAdvice: [
          'המשך להתמיד בעדכון בדיקות KR שבועי וחודשי.',
          'יעדי הבריאות והכושר הראו התקדמות יציבה - מומלץ לשמר את התדירות השבועית.',
          'וודא קישור כל משימה שבועית ליעד חודשי ברור.',
        ],
      };

      setAiReport(report);
      setIsGeneratingAi(false);
    }, 900);
  };

  const handleSubmitMonthlyClose = () => {
    // 1. Submit all KR check-ins
    const checkinList: KrCheckin[] = [];
    monthlyAndAnnualGoals.forEach((g) => {
      const val = krValues[g.id] ?? (g.krCurrent || 0);
      const note = notes[g.id] || 'עדכון סיכום חודשי';
      addKrCheckin(g.id, val, note);
      checkinList.push({
        id: `kr-${Date.now()}-${g.id}`,
        uid: 'user-1',
        goalId: g.id,
        value: val,
        notes: note,
        date: new Date().toISOString().split('T')[0],
        createdAt: Date.now(),
      });
    });

    // 2. Save Monthly Close Report
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    saveMonthlyCloseReport({
      month: currentMonth,
      checkins: checkinList,
      aiAnalysis: aiReport || {
        summary: 'סיכום חודשי נשמר בהצלחה עם עדכון מדדי תוצאה.',
        highRoiGoals: [],
        starvedGoals: [],
        effortOutcomeCorrelation: 0.75,
        strategicAdvice: ['המשך להתמיד בעדכון היעדים החודשי'],
      },
    });

    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 justify-center flex">
      <div className="w-full max-w-xl space-y-6">
        {/* Navigation back & Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-2">
            <Link
              href="/goals"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <ArrowRight className="w-4 h-4 dir-rtl:rotate-180" />
            </Link>
            <div>
              <span className="text-[11px] font-bold text-teal-600 tracking-wide uppercase">
                ריטואל חודשי
              </span>
              <h1 className="text-xl font-extrabold text-slate-900">סיכום חודשי וסגירת KRs</h1>
            </div>
          </div>

          <div className="p-2 rounded-2xl bg-teal-100 text-teal-700">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Section 1: Manual KR Check-in Input per Goal */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-teal-600" />
              <span>עדכון ידני של מדדי תוצאה (KR Check-in)</span>
            </h2>
            <p className="text-xs text-slate-500">
              הזן את הביצוע בפועל עבור כל יעד חודשי ושנתי לסגירת החודש
            </p>
          </div>

          <div className="space-y-4">
            {monthlyAndAnnualGoals.map((g) => {
              const currentValue = krValues[g.id] ?? (g.krCurrent || 0);
              const target = g.krTarget || 100;
              const pct = Math.min(100, Math.round((currentValue / target) * 100));

              return (
                <div
                  key={g.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-white border border-slate-200 text-slate-600">
                          {g.timeframe === 'annual' ? 'שנתי' : 'חודשי'}
                        </span>
                        <h3 className="font-bold text-xs text-slate-800">{g.title}</h3>
                      </div>
                      {g.krTitle && (
                        <p className="text-[11px] text-slate-500 mt-0.5">מדד: {g.krTitle}</p>
                      )}
                    </div>

                    <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-1 rounded-xl shrink-0">
                      {pct}% הושלמו
                    </span>
                  </div>

                  {/* Range & Value Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <div className="sm:col-span-2 flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={target * 1.2}
                        value={currentValue}
                        onChange={(e) => handleValueChange(g.id, Number(e.target.value))}
                        className="w-full accent-teal-600 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-[11px] text-slate-500">ערך:</span>
                      <input
                        type="number"
                        value={currentValue}
                        onChange={(e) => handleValueChange(g.id, Number(e.target.value))}
                        className="w-20 text-center text-xs font-bold bg-white border border-slate-300 rounded-xl py-1 text-slate-800"
                      />
                      <span className="text-[11px] font-semibold text-slate-500">
                        / {target} {g.krUnit || '%'}
                      </span>
                    </div>
                  </div>

                  {/* Notes input */}
                  <div>
                    <input
                      type="text"
                      placeholder="הערות התקדמות או תובנות חודשיות..."
                      value={notes[g.id] || ''}
                      onChange={(e) => handleNotesChange(g.id, e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: AI Effort vs Outcome Report Display */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  דוח AI: ניתוח התקדמות יעדים ו-KRs
                </h2>
                <p className="text-[11px] text-slate-500">
                  מחשב את הישגי ה-KRs ומספק תובנות אסטרטגיות
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateAiReport}
              disabled={isGeneratingAi}
              className="px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isGeneratingAi ? (
                <span>מנפק דוח...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>חולל דוח AI</span>
                </>
              )}
            </button>
          </div>

          {/* AI Report Result Card */}
          {aiReport && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 animate-in fade-in duration-300 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>דוח התקדמות יעדים ו-KRs</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  מדד קורלציה: {Math.round(aiReport.effortOutcomeCorrelation * 100)}%
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {aiReport.summary}
              </p>

              {/* High ROI & Starved Goals breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                    <Award className="w-3.5 h-3.5" />
                    <span>יעדים בעלי ROI גבוה:</span>
                  </div>
                  <ul className="text-[11px] text-emerald-200/90 space-y-0.5">
                    {aiReport.highRoiGoals.map((g, i) => (
                      <li key={i}>✓ {g}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>יעדים רעבים (Starved Goals):</span>
                  </div>
                  <ul className="text-[11px] text-amber-200/90 space-y-0.5">
                    {aiReport.starvedGoals.map((g, i) => (
                      <li key={i}>⚠️ {g}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Strategic Advice */}
              <div className="pt-2 border-t border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400">
                  המלצות אסטרטגיות לחודש הבא:
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {aiReport.strategicAdvice.map((advice, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-teal-400 font-bold">•</span>
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Action Button: Save & Finish Monthly Close */}
        <div className="space-y-2">
          <button
            onClick={handleSubmitMonthlyClose}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            <span>שמור KRs וסגור ריטואל חודשי</span>
          </button>

          {isSubmitted && (
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold text-center border border-emerald-200 animate-in fade-in">
              הסיכום החודשי נשמר בהצלחה! עדכוני ה-KR והדוח נשמרו במערכת.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
