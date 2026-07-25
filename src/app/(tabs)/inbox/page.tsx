'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { FAB } from '@/components/capture/FAB';
import { TriageFlow } from '@/components/triage/TriageFlow';
import { TriageDrawer } from '@/components/triage/TriageDrawer';
import { RawCaptureItem } from '@/types/models';
import {
  Inbox,
  Sparkles,
  Trash2,
  Mic,
  ArrowLeft,
  CheckCircle2,
  Clock,
  SlidersHorizontal,
  ChevronLeft,
} from 'lucide-react';

export default function InboxPage() {
  const { rawCaptures, deleteRawCapture } = useAppStore();
  const [isBatchTriaging, setIsBatchTriaging] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RawCaptureItem | null>(null);

  const pendingCaptures = rawCaptures.filter((c) => c.status === 'inbox');
  const triagedCount = rawCaptures.filter((c) => c.status === 'triaged').length;

  if (isBatchTriaging) {
    return (
      <div className="space-y-4">
        <TriageFlow items={pendingCaptures} onComplete={() => setIsBatchTriaging(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600 mb-0.5">
            <Inbox className="w-3.5 h-3.5" />
            <span>לכידת רעיונות ומשימות גולמיות</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">אינבוקס (Inbox)</h1>
        </div>
        <div className="flex items-center gap-1 bg-cyan-100/80 text-cyan-800 px-3 py-1 rounded-full text-xs font-bold shadow-xs">
          <span>{pendingCaptures.length} בממתין</span>
        </div>
      </header>

      {/* Manual Triage Hero Action Banner */}
      <div className="bg-gradient-to-br from-cyan-500 to-cyan-700 text-white rounded-3xl p-5 shadow-lg space-y-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-200 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              אבחון ידני ומהיר בלחיצה (Manual Triage)
            </span>
            <h2 className="text-lg font-extrabold tracking-tight">לחץ על משימה לקביעת חשיבות ויעד</h2>
          </div>
        </div>

        <p className="text-xs text-cyan-100/90 leading-relaxed">
          לחץ על משימה שנלכדה כדי לפתוח חלון נגלל ולקבוע חשיבות (1-5), שיוך ליעד חודשי ותאריך ביצוע (היום או מחר).
        </p>

        <div className="pt-1 flex items-center gap-2">
          <button
            onClick={() => setIsBatchTriaging(true)}
            disabled={pendingCaptures.length === 0}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-cyan-50 text-cyan-900 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>טריאז׳ רציף באשף ({pendingCaptures.length})</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Raw Captures List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">פריטים גולמיים שנלכדו</h3>
          <span className="text-xs text-slate-400 font-medium">
            הועברו למשימות: {triagedCount}
          </span>
        </div>

        {pendingCaptures.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-6 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-cyan-500 mx-auto opacity-70" />
            <p className="text-xs font-bold text-slate-700">האינבוקס שלך ריק!</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              לחץ על כפתור הפלוס (+) בתחתית המסך להוספת רעיון בטקסט או הקלטה קולית
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingCaptures.map((item) => {
              const timeStr = new Date(item.createdAt).toLocaleTimeString('he-IL', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="group flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-cyan-400 hover:shadow-sm cursor-pointer transition-all active:scale-[0.99]"
                >
                  <div className="space-y-1.5 pr-1 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{timeStr}</span>
                      {item.audioDuration && (
                        <span className="flex items-center gap-1 bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                          <Mic className="w-3 h-3 text-cyan-600" />
                          הקלטה קולית ({item.audioDuration} שנ׳)
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-slate-800 leading-relaxed group-hover:text-cyan-900 transition-colors">
                      {item.content}
                    </p>

                    <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-600 pt-0.5">
                      <span>לחץ לאבחון ידני</span>
                      <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Delete Raw Capture */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRawCapture(item.id);
                    }}
                    className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors mr-2"
                    aria-label="מחיקת פריט גולמי"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Manual Triage Sliding Drawer */}
      <TriageDrawer
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
      />

      {/* Floating Action Button (FAB) */}
      <FAB />
    </div>
  );
}
