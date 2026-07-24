'use client';

import React, { useState, useRef, useEffect } from 'react';
import { VoiceRecorder } from './VoiceRecorder';
import { Mic, Type, X, Sparkles, Send } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickCaptureModal({ isOpen, onClose }: QuickCaptureModalProps) {
  const { addRawCapture } = useAppStore();
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isOpen && mode === 'text') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addRawCapture(text);
    setText('');
    onClose();
  };

  const handleVoiceComplete = (audioUrl: string, duration: number, transcribedText: string) => {
    addRawCapture(transcribedText, audioUrl, duration);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 border border-slate-100 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-cyan-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">לכידת רעיון / משימה מהירה</h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'text'
                ? 'bg-white text-cyan-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>הקלדת טקסט</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('voice')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'voice'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>הקלטה קולית</span>
          </button>
        </div>

        {/* Text Mode Input Form */}
        {mode === 'text' ? (
          <form onSubmit={handleSubmitText} className="space-y-4 pt-1">
            <div>
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="מה יש לך בראש? (למשל: להתקשר ללקוח, להכין טיוטה...)"
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all placeholder:text-slate-400 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitText(e);
                  }
                }}
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                טיפ: לחץ Enter לשמירה מהירה לאינבוקס
              </span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={!text.trim()}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 rotate-180" />
                <span>לכוד לאינבוקס</span>
              </button>
            </div>
          </form>
        ) : (
          <VoiceRecorder
            onRecordingComplete={handleVoiceComplete}
            onCancel={onClose}
          />
        )}
      </div>
    </div>
  );
}
