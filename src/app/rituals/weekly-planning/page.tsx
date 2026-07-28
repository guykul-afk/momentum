'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldAlert,
  Sliders,
  FileText,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { WeeklyPlan } from '@/types/models';

export default function WeeklyPlanningRitualPage() {
  const { goals, saveWeeklyPlan, performFreshStart } = useAppStore();

  const activeGoals = goals.filter((g) => g.status === 'active');

  // Initial allocations map
  const [capacityLimit, setCapacityLimit] = useState<number>(40);
  const [allocations, setAllocations] = useState<Record<string, number>>(() => {
    const initialMap: Record<string, number> = {};
    activeGoals.forEach((g) => {
      initialMap[g.id] = 10;
    });
    return initialMap;
  });

  const [isFreshStartDone, setIsFreshStartDone] = useState(false);
  const [aiReport, setAiReport] = useState<WeeklyPlan['aiReport'] | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isPlanSaved, setIsPlanSaved] = useState(false);

  // Total allocated points calculation
  const totalAllocatedPoints = Object.values(allocations).reduce((sum, val) => sum + (val || 0), 0);
  const isOverloaded = totalAllocatedPoints > capacityLimit;
  const overloadPct = Math.round((totalAllocatedPoints / capacityLimit) * 100);

  const handlePointChange = (goalId: string, val: number) => {
    setAllocations((prev) => ({
      ...prev,
      [goalId]: Math.max(0, val),
    }));
  };

  const handleTriggerAiReport = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      const isHighOverload = totalAllocatedPoints > capacityLimit;
      const report = {
        summary: `ניתוח תכנון שבועי: הוגדרו מכסות עבור ${totalAllocatedPoints} משימות מתוכננות מתוך קיבולת של ${capacityLimit} (${overloadPct}% ניצול).`,
        recommendations: [
          isHighOverload
            ? 'מומלץ להפחית 10-15% מעומס המשימות ביעדי תפעול כדי למנוע שחיקה באמצע השבוע.'
            : 'חלוקת העומס מאוזנת היטב בין יעדי עבודה לבריאות.',
          'מקד את 3 הימים הראשונים של השבוע ביעד האסטרטגי המרכזי.',
          'וודא הגדרת כוונת ביצוע (When & Where) לכל משימה יומית שנגזרת מהיעדים.',
        ],
        riskAssessment: isHighOverload
          ? '⚠️ סיכון עומס יתר גבוה! הסתברות לשחיקה ודחיינות משימות עולה ב-45% במצב זה.'
          : '✅ רמת סיכון נמוכה - קצב התקדמות בר-קיימא.',
        generatedAt: Date.now(),
      };
      setAiReport(report);
      setIsGeneratingAi(false);
    }, 800);
  };

  const handleSavePlan = () => {
    const goalAllocations = Object.entries(allocations).map(([goalId, allocatedPoints]) => ({
      goalId,
      allocatedPoints,
    }));

    saveWeeklyPlan({
      weekStartDate: new Date().toISOString().split('T')[0],
      totalQuotaPoints: totalAllocatedPoints,
      capacityLimit,
      goalAllocations,
      freshStartCompleted: isFreshStartDone,
      aiReport: aiReport || undefined,
    });

    setIsPlanSaved(true);
  };

  const handlePerformFreshStart = () => {
    performFreshStart();
    setIsFreshStartDone(true);
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
              <span className="text-[11px] font-bold text-cyan-600 tracking-wide uppercase">
                ריטואל שבועי
              </span>
              <h1 className="text-xl font-extrabold text-slate-900">תכנון שבועי והקצאת מכסות</h1>
            </div>
          </div>

          <div className="p-2 rounded-2xl bg-cyan-100 text-cyan-700">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Fresh Start Mode Section ("New week, fresh page" / "שבוע חדש, דף חלק") */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-5 h-5 text-cyan-400 ${isFreshStartDone ? 'rotate-180 transition-transform duration-500' : ''}`} />
                <h2 className="text-base font-bold">מצב Fresh Start (&quot;שבוע חדש, דף חלק&quot;)</h2>
              </div>
              {isFreshStartDone && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  דף חלק הופעל!
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              אפס את משימות העבר שלא הושלמו, נקה עומסים ישנים והתחל את השבוע הקרוב עם אנרגיה מחודשת ופוקוס מוחלט.
            </p>

            {!isFreshStartDone ? (
              <button
                onClick={handlePerformFreshStart}
                className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>הפעל Fresh Start - &quot;שבוע חדש, דף חלק&quot;</span>
              </button>
            ) : (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>כל המשימות הפתוחות מהשבוע החולף אופסו. המערכת מוכנה לתכנון השבוע החדש!</span>
              </div>
            )}
          </div>
        </div>

        {/* Capacity Limit & Allocations Grid */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-600" />
                <span>הגדרת מכסת משימות שבועית</span>
              </h3>
              <p className="text-xs text-slate-500">קבע את מכסת המשימות המתוכננות שתוכל לבצע השבוע</p>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-600">קיבולת מקסימלית:</span>
              <input
                type="number"
                value={capacityLimit}
                onChange={(e) => setCapacityLimit(Math.max(10, Number(e.target.value)))}
                className="w-16 text-center text-xs font-bold bg-white border border-slate-300 rounded-xl py-1 text-slate-800"
              />
              <span className="text-xs font-bold text-slate-500">משימות</span>
            </div>
          </div>

          {/* Capacity Overload Warning Banner */}
          {isOverloaded ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2 animate-pulse">
              <div className="flex items-center gap-2 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>אזהרת עומס יתר! ({totalAllocatedPoints} / {capacityLimit} משימות - {overloadPct}%)</span>
              </div>
              <p className="text-[11px] text-rose-700/90 leading-snug">
                הקצאת המשימות הנוכחית חורגת מקיבולת העבודה השבועית שלך ב-{totalAllocatedPoints - capacityLimit} משימות.
                מומלץ להפחית משימות מיעדים משניים כדי למנוע עומס ושחיקה.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-cyan-50/80 border border-cyan-200 text-cyan-900 text-xs flex items-center justify-between">
              <span className="font-semibold">
                קיבולת מנוצלת: {totalAllocatedPoints} / {capacityLimit} משימות ({overloadPct}%)
              </span>
              <span className="font-bold text-emerald-600">איזון תקין ✓</span>
            </div>
          )}

          {/* Goal Allocations List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700">הקצאת מכסת משימות לפי יעדים פעילים:</h4>

            {activeGoals.map((g) => {
              const allocated = allocations[g.id] || 0;
              return (
                <div
                  key={g.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-white border border-slate-200 text-slate-600">
                        {g.timeframe === 'annual' ? 'שנתי' : g.timeframe === 'monthly' ? 'חודשי' : 'שבועי'}
                      </span>
                      <h5 className="font-bold text-xs text-slate-800 truncate">{g.title}</h5>
                    </div>
                    {g.krTitle && (
                      <p className="text-[11px] text-slate-500 truncate">KR: {g.krTitle}</p>
                    )}
                  </div>

                  {/* Points Slider / Input */}
                  <div className="flex items-center gap-3 shrink-0">
                    <input
                      type="range"
                      min={0}
                      max={30}
                      value={allocated}
                      onChange={(e) => handlePointChange(g.id, Number(e.target.value))}
                      className="w-28 accent-cyan-600 cursor-pointer"
                    />
                    <div className="flex items-center gap-1 min-w-[60px] justify-end">
                      <input
                        type="number"
                        value={allocated}
                        onChange={(e) => handlePointChange(g.id, Number(e.target.value))}
                        className="w-12 text-center text-xs font-bold bg-white border border-slate-300 rounded-lg py-1 text-slate-800"
                      />
                      <span className="text-[11px] text-slate-500">משימות</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Planning Report Section */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">מחולל דוח תכנון שבועי AI</h3>
                <p className="text-[11px] text-slate-500">
                  המלצות אסטרטגיות למניעת עומס ומיטוב ביצועים
                </p>
              </div>
            </div>

            <button
              onClick={handleTriggerAiReport}
              disabled={isGeneratingAi}
              className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isGeneratingAi ? (
                <span>מנתח נתונים...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>חולל דוח AI</span>
                </>
              )}
            </button>
          </div>

          {/* AI Report Display Card */}
          {aiReport && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3 animate-in fade-in duration-300 border border-slate-700">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>סיכום AI שבועי</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(aiReport.generatedAt).toLocaleTimeString('he-IL', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <p className="text-xs font-medium leading-relaxed text-slate-200">
                {aiReport.summary}
              </p>

              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-semibold text-amber-300">
                {aiReport.riskAssessment}
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-400 block">
                  המלצות פעולה שבועיות:
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {aiReport.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Submit Plan Button */}
        <div className="space-y-2">
          <button
            onClick={handleSavePlan}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>אשר ושמור תכנון שבועי</span>
          </button>

          {isPlanSaved && (
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold text-center border border-emerald-200 animate-in fade-in">
              התכנון השבועי נשמר בהצלחה! מכסות המשימות עודכנו.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
