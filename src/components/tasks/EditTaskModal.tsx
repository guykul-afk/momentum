'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Edit3, Target, Clock, MapPin, Calendar, CheckCircle } from 'lucide-react';
import { Task } from '@/types/models';
import { useAppStore } from '@/lib/store';

interface EditTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
}

export function EditTaskModal({ isOpen, task, onClose }: EditTaskModalProps) {
  const { goals, keyResults, updateTask, deleteTask } = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'work' | 'personal' | 'health' | 'maintenance' | 'habit'>('work');
  const [goalId, setGoalId] = useState('');
  const [keyResultId, setKeyResultId] = useState('');
  const [weight, setWeight] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [when, setWhen] = useState('');
  const [where, setWhere] = useState('');
  const [type, setType] = useState<'daily' | 'one-off' | 'recurring'>('daily');
  const [isHabit, setIsHabit] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setCategory(task.category || 'work');
      setGoalId(task.goalId || '');
      setKeyResultId(task.keyResultId || '');
      setWeight((task.weight as 1 | 2 | 3 | 4 | 5) || 3);
      setEstimatedMinutes(task.estimatedMinutes || 30);
      setWhen(task.when || '');
      setWhere(task.where || '');
      setType(task.type || 'daily');
      setIsHabit(!!task.isHabit);
      setIsMaintenance(!!task.isMaintenance);
      setShowConfirmDelete(false);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const availableKrs = goalId ? keyResults.filter((kr) => kr.goalId === goalId) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      goalId: goalId || undefined,
      keyResultId: keyResultId || undefined,
      weight,
      estimatedMinutes,
      when: when.trim() || undefined,
      where: where.trim() || undefined,
      type,
      isHabit,
      isMaintenance,
    });

    onClose();
  };

  const handleDelete = () => {
    deleteTask(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-5 flex flex-col gap-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800">
            <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">עריכת משימה (Initiative)</h3>
              <p className="text-[11px] text-slate-400">עדכון פרטים, שיוך ליעד/KR ותכנון ביצוע</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              כותרת המשימה <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="כותרת המשימה"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">תיאור / הערות נוספות</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="פירוט חופשי על המשימה..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Goal & KR Link */}
          {goals.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-cyan-600" />
                  <span>שיוך ליעד (Objective)</span>
                </label>
                <select
                  value={goalId}
                  onChange={(e) => {
                    setGoalId(e.target.value);
                    setKeyResultId('');
                  }}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">-- ללא שיוך ליעד --</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>

              {goalId && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>שיוך למדד (Key Result)</span>
                  </label>
                  <select
                    value={keyResultId}
                    onChange={(e) => setKeyResultId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- כללי ליעד --</option>
                    {availableKrs.map((kr) => (
                      <option key={kr.id} value={kr.id}>
                        {kr.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Category Selector */}
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
                  onClick={() => setCategory(c.id)}
                  className={`py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
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

          {/* Weight & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">משקל (1-5)</label>
              <select
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
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
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>זמן משוער (בדקות)</span>
              </label>
              <input
                type="number"
                min={1}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
          </div>

          {/* Implementation Intentions (When & Where) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="text-xs font-bold text-slate-700">כוונות ביצוע (Implementation Intentions)</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-cyan-600" />
                  <span>מתי (זמן/טריגר)</span>
                </label>
                <input
                  type="text"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                  placeholder="למשל: ישר אחרי קפה שחור"
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>איפה (מיקום/הקשר)</span>
                </label>
                <input
                  type="text"
                  value={where}
                  onChange={(e) => setWhere(e.target.value)}
                  placeholder="למשל: בחדר עבודה"
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Checkbox Toggles for Habit / Maintenance */}
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isMaintenance}
                onChange={(e) => {
                  setIsMaintenance(e.target.checked);
                  if (e.target.checked) setIsHabit(false);
                }}
                className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300"
              />
              <span>משימת תחזוקה/שגרה</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isHabit}
                onChange={(e) => {
                  setIsHabit(e.target.checked);
                  if (e.target.checked) setIsMaintenance(false);
                }}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300"
              />
              <span>הרגל יומי</span>
            </label>
          </div>

          {/* Action Buttons - Sticky at bottom of modal */}
          <div className="sticky bottom-0 bg-white pt-3 pb-1 border-t border-slate-100 flex items-center justify-between mt-auto">
            {showConfirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-600">למחוק משימה?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors"
                >
                  כן, מחק
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-2.5 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  ביטול
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium"
                title="מחק משימה"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">מחיקה</span>
              </button>
            )}

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
                className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>שמור שינויים</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
