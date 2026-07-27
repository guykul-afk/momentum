'use client';

import React from 'react';
import { CloudOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function SyncStatusBadge() {
  const { syncStatus, lastSyncedAt } = useAppStore();

  const formattedTime = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
    : null;

  if (syncStatus === 'syncing') {
    return (
      <div
        title="מסנכרן נתונים מול השרת..."
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 shadow-xs animate-pulse"
      >
        <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
        <span>מסנכרן...</span>
      </div>
    );
  }

  if (syncStatus === 'offline') {
    return (
      <div
        title="אין חיבור לשרת - השינויים נשמרים מקומית ויסתנכרנו בהתחברות"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 shadow-xs"
      >
        <CloudOff className="w-3 h-3 text-amber-500" />
        <span>גיבוי מקומי</span>
      </div>
    );
  }

  return (
    <div
      title={formattedTime ? `מסונכרן לשרת (${formattedTime})` : 'מסונכרן לשרת Cloud Firestore'}
      className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs"
    >
      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
      <span className="hidden sm:inline">מחובר ומסונכרן</span>
      <span className="sm:hidden">מסונכרן</span>
    </div>
  );
}
