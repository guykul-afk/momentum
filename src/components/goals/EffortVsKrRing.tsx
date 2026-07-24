'use client';

import React from 'react';
import { Flame } from 'lucide-react';

interface EffortVsKrRingProps {
  effortCompleted?: number;
  effortTarget?: number;
  krCurrent?: number;
  krTarget?: number;
  krUnit?: string;
  krTitle?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EffortVsKrRing({
  effortCompleted = 0,
  effortTarget = 1,
  krCurrent = 0,
  krTarget = 1,
  krUnit = '%',
  krTitle,
  size = 'md',
}: EffortVsKrRingProps) {
  const safeEffortTarget = effortTarget > 0 ? effortTarget : 1;
  const safeKrTarget = krTarget > 0 ? krTarget : 1;

  const effortPct = Math.min(100, Math.round((effortCompleted / safeEffortTarget) * 100));
  const krPct = Math.min(100, Math.round((krCurrent / safeKrTarget) * 100));

  const gap = Math.abs(effortPct - krPct);
  const isCoralGapAlert = gap > 30;

  // Ring dimension setup
  const ringDimensions = {
    sm: { size: 42, strokeWidth: 4, radius: 17 },
    md: { size: 54, strokeWidth: 5, radius: 22 },
    lg: { size: 68, strokeWidth: 6, radius: 28 },
  }[size];

  const { size: svgSize, strokeWidth, radius } = ringDimensions;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (effortPct / 100) * circumference;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Upper row: Effort Ring & KR Metric Bar */}
      <div className="flex items-center gap-3">
        {/* Circular Effort Ring */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg width={svgSize} height={svgSize} className="transform -rotate-90">
            {/* Background Track */}
            <circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              className="stroke-slate-200"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              className={isCoralGapAlert ? 'stroke-[#F97316]' : 'stroke-cyan-500'}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold text-slate-700 leading-tight">
              {effortPct}%
            </span>
            <span className="text-[8px] text-slate-400 font-medium">מאמץ</span>
          </div>
        </div>

        {/* KR Progress details & Bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-slate-700 truncate" title={krTitle || 'תוצאת מפתח (KR)'}>
              {krTitle || 'תוצאת מפתח (KR)'}
            </span>
            <span className="font-semibold text-slate-800 shrink-0 text-[11px] dir-ltr">
              {krCurrent} / {krTarget} {krUnit}
            </span>
          </div>

          {/* KR Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60 relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCoralGapAlert ? 'bg-[#F97316]' : 'bg-gradient-to-r from-cyan-500 to-teal-400'
              }`}
              style={{ width: `${krPct}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
            <span>ביצוע מפתח: {krPct}%</span>
            <span>נקודות: {effortCompleted}/{effortTarget}</span>
          </div>
        </div>
      </div>

      {/* Visual Coral Highlight for Gap > 30% */}
      {isCoralGapAlert && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-[#F97316] border border-[#F97316]/30 text-xs font-semibold shadow-2xs animate-pulse">
          <Flame className="w-3.5 h-3.5 shrink-0 text-[#F97316]" />
          <span>
            התראת פער מומנטום ({gap}% פער בין מאמץ לתוצאות):{' '}
            {effortPct > krPct ? 'מאמץ גבוה ביחס לתוצאות' : 'תוצאות ללא מאמץ תואם'}
          </span>
        </div>
      )}
    </div>
  );
}
