'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Save, Trash2, Gauge, Sparkles, Lightbulb, Check } from 'lucide-react';
import { KeyResult } from '@/types/models';
import { evaluateKeyResult } from '@/lib/okrKnowledge';

interface KeyResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (krData: Omit<KeyResult, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => void;
  goalId: string;
  initialKeyResult?: KeyResult;
  onDelete?: (krId: string) => void;
}

export function KeyResultModal({
  isOpen,
  onClose,
  onSave,
  goalId,
  initialKeyResult,
  onDelete,
}: KeyResultModalProps) {
  const [title, setTitle] = useState(initialKeyResult?.title || '');
  const [target, setTarget] = useState<number>(initialKeyResult?.target || 100);
  const [current, setCurrent] = useState<number>(initialKeyResult?.current || 0);
  const [unit, setUnit] = useState(initialKeyResult?.unit || '%');
  const [confidenceScore, setConfidenceScore] = useState<number>(
    initialKeyResult?.confidenceScore || 7
  );

  // AI KR Refiner State
  const [aiAnalysis, setAiAnalysis] = useState<{
    tip: string;
    suggestion?: string;
    isGood: boolean;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setTitle(initialKeyResult?.title || '');
      setTarget(initialKeyResult?.target || 100);
      setCurrent(initialKeyResult?.current || 0);
      setUnit(initialKeyResult?.unit || '%');
      setConfidenceScore(initialKeyResult?.confidenceScore || 7);
      setAiAnalysis(null);
    }
  }, [isOpen, initialKeyResult]);

  if (!isOpen) return null;

  const handleAnalyzeKrWithAi = () => {
    if (!title.trim()) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      const evaluation = evaluateKeyResult(title, target, unit);
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

    onSave({
      goalId,
      title: title.trim(),
      target: Number(target) || 100,
      current: Number(current) || 0,
      unit: unit.trim() || '%',
      confidenceScore: Number(confidenceScore) || 7,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              {initialKeyResult ? 'עריכת תוצאת מפתח (KR)' : 'הוספת תוצאת מפתח (KR)'}
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
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                תיאור המדד הכמותי (KR) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAnalyzeKrWithAi}
                disabled={!title.trim() || isAnalyzing}
                className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>{isAnalyzing ? 'מנתח...' : 'ייעוץ AI לניסוח KR'}</span>
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
              placeholder="לדוגמה: להגיע ל-5,000 משתמשים פעילים בחודש"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {/* AI Analysis Result Box */}
            {aiAnalysis && (
              <div
                className={`p-3 rounded-xl border text-xs space-y-2 animate-in fade-in duration-200 ${
                  aiAnalysis.isGood
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                    : 'bg-indigo-50/90 border-indigo-200 text-indigo-900'
                }`}
              >
                <div className="flex items-start gap-1.5 font-medium leading-relaxed">
                  <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
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
                      className="px-2.5 py-1 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shrink-0 flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      <span>אמץ ניסוח</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                ערך נוכחי
              </label>
              <input
                type="number"
                value={current}
                onChange={(e) => setCurrent(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                יעד (Target)
              </label>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">יחידה</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="%, משתמשים"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800"
              />
            </div>
          </div>

          {/* Confidence Score */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Gauge className="w-4 h-4 text-indigo-600" />
                <span>מדד ביטחון בהשגת היעד (Confidence Score):</span>
              </label>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                {confidenceScore} / 10
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={confidenceScore}
              onChange={(e) => setConfidenceScore(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>1 - סיכוי נמוך מאוד</span>
              <span>5 - בינוני</span>
              <span>10 - בטוח לחלוטין</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div>
              {initialKeyResult && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(initialKeyResult.id);
                    onClose();
                  }}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>מחק מדד</span>
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
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>שמור מדד (KR)</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
