'use client';

import React, { useState } from 'react';
import { X, Target, Save, Trash2, Sparkles, Check, Lightbulb } from 'lucide-react';
import { Goal } from '@/types/models';
import { getDefaultAnnualEndDate, getDefaultMonthlyEndDate } from '@/lib/goalUtils';
import { evaluateObjective } from '@/lib/okrKnowledge';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => void;
  availableParents?: Goal[];
  initialGoal?: Goal;
  defaultTimeframe?: 'annual' | 'quarterly' | 'monthly';
  defaultParentId?: string;
  onDelete?: (goal: Goal) => void;
}

export function GoalModal({
  isOpen,
  onClose,
  onSave,
  availableParents = [],
  initialGoal,
  defaultTimeframe = 'quarterly',
  defaultParentId,
  onDelete,
}: GoalModalProps) {
  const [title, setTitle] = useState(initialGoal?.title || '');
  const [description, setDescription] = useState(initialGoal?.description || '');
  const [timeframe, setTimeframe] = useState<'annual' | 'quarterly' | 'monthly'>(
    initialGoal ? (initialGoal.timeframe || 'quarterly') : defaultTimeframe
  );
  const [parentId, setParentId] = useState(initialGoal?.parentId || defaultParentId || '');
  const [category, setCategory] = useState<'work' | 'personal' | 'health' | 'maintenance'>(
    initialGoal?.category || 'work'
  );

  // AI Refiner State
  const [aiAnalysis, setAiAnalysis] = useState<{
    tip: string;
    suggestion?: string;
    isGood: boolean;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setTitle(initialGoal?.title || '');
      setDescription(initialGoal?.description || '');
      setTimeframe(initialGoal ? (initialGoal.timeframe || 'quarterly') : defaultTimeframe);
      const effectiveParentId = initialGoal?.parentId || defaultParentId || '';
      setParentId(effectiveParentId);
      setAiAnalysis(null);

      const parentGoal = availableParents.find((p) => p.id === effectiveParentId);
      setCategory(initialGoal?.category || parentGoal?.category || 'work');
    }
  }, [isOpen, initialGoal, defaultTimeframe, defaultParentId, availableParents]);

  if (!isOpen) return null;

  const handleAnalyzeWithAi = () => {
    if (!title.trim()) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      const evaluation = evaluateObjective(title);
      setAiAnalysis({
        isGood: evaluation.isGood,
        tip: evaluation.tip,
        suggestion: evaluation.suggestion,
      });
      setIsAnalyzing(false);
    }, 300);
  };

  const handleApplySuggestion = (suggestedText: string) => {
    setTitle(suggestedText);
    setAiAnalysis(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const currentYear = new Date().getFullYear();
    const currentMonthStr = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const currentQuarterStr = `${currentYear}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;

    const targetYear = timeframe === 'annual' ? (initialGoal?.targetYear || currentYear) : undefined;
    const targetQuarter = timeframe === 'quarterly' ? (initialGoal?.targetQuarter || currentQuarterStr) : undefined;
    const targetMonth = timeframe === 'monthly' ? (initialGoal?.targetMonth || currentMonthStr) : undefined;

    const endDate =
      timeframe === 'annual'
        ? getDefaultAnnualEndDate(targetYear)
        : getDefaultMonthlyEndDate(targetMonth);

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      timeframe,
      parentId: parentId || undefined,
      targetYear,
      targetQuarter,
      targetMonth,
      endDate,
      category,
      status: initialGoal?.status || 'active',
    });

    onClose();
  };

  const filteredParents = availableParents.filter(
    (g) => g.status === 'active' && g.id !== initialGoal?.id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              {initialGoal ? 'עריכת יעד (Objective)' : 'הוספת יעד חדש (Objective)'}
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
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'annual', label: 'שנתי' },
                  { id: 'quarterly', label: 'רבעוני (מומלץ)' },
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
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
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

          {/* Parent Goal selection if available */}
          {timeframe !== 'annual' && filteredParents.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                שיוך ליעד אב
              </label>
              <select
                value={parentId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setParentId(selectedId);
                  if (!initialGoal && selectedId) {
                    const p = availableParents.find((g) => g.id === selectedId);
                    if (p?.category) setCategory(p.category);
                  }
                }}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">-- ללא יעד אב ישיר --</option>
                {filteredParents.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.timeframe === 'annual' ? 'שנתי' : p.timeframe === 'quarterly' ? 'רבעוני' : 'חודשי'}] {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title & AI Refiner */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                כותרת היעד (Objective) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAnalyzeWithAi}
                disabled={!title.trim() || isAnalyzing}
                className="text-[11px] font-bold text-cyan-700 hover:text-cyan-900 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-cyan-600" />
                <span>{isAnalyzing ? 'מנתח...' : 'שפר ניסוח עם AI (OKR)'}</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setAiAnalysis(null);
              }}
              placeholder="לדוגמה: להפוך למובילים בשביעות רצון הלקוחות"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />

            {/* AI Analysis Result Box */}
            {aiAnalysis && (
              <div
                className={`p-3 rounded-xl border text-xs space-y-2 animate-in fade-in duration-200 ${
                  aiAnalysis.isGood
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                    : 'bg-cyan-50/90 border-cyan-200 text-cyan-900'
                }`}
              >
                <div className="flex items-start gap-1.5 font-medium leading-relaxed">
                  <Lightbulb className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span>{aiAnalysis.tip}</span>
                </div>

                {aiAnalysis.suggestion && (
                  <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200/80 mt-1">
                    <span className="font-bold text-slate-800 text-[11px] truncate">
                      הצעה: &quot;{aiAnalysis.suggestion}&quot;
                    </span>
                    <button
                      type="button"
                      onClick={() => handleApplySuggestion(aiAnalysis.suggestion!)}
                      className="px-2.5 py-1 text-[10px] font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-md shrink-0 flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      <span>אמץ ניסוח</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">תיאור איכותי</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תיאור מעורר השראה של המטרה המרכזית..."
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
