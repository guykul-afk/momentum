'use client';

import React from 'react';

interface EffortVsKrRingProps {
  krCurrent?: number;
  krTarget?: number;
  krUnit?: string;
  krTitle?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EffortVsKrRing({
  krCurrent = 0,
  krTarget = 1,
  krUnit = '%',
  krTitle,
  size = 'md',
}: EffortVsKrRingProps) {
  const safeKrTarget = krTarget > 0 ? krTarget : 1;
  const krPct = Math.min(100, Math.round((krCurrent / safeKrTarget) * 100));

  const ringDimensions = {
    sm: { size: 42, strokeWidth: 4, radius: 17 },
    md: { size: 50, strokeWidth: 5, radius: 20 },
    lg: { size: 64, strokeWidth: 6, radius: 26 },
  }[size];

  const { size: svgSize, strokeWidth, radius } = ringDimensions;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (krPct / 100) * circumference;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-3">
        {/* KR Progress Ring */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg width={svgSize} height={svgSize} className="transform -rotate-90">
            <circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              className="stroke-slate-200"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              className="stroke-cyan-500"
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
              {krPct}%
            </span>
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

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60 relative">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-cyan-500 to-teal-400"
              style={{ width: `${krPct}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
            <span>התקדמות KR: {krPct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
