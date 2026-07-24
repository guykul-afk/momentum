'use client';

import React from 'react';

interface DailyQuotaRingProps {
  completed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

export function DailyQuotaRing({
  completed,
  total,
  size = 110,
  strokeWidth = 10,
}: DailyQuotaRingProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle in Turquoise #06B6D4 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#06B6D4"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold text-slate-800 tracking-tight">{percentage}%</span>
          <span className="text-[11px] text-slate-500 font-medium">{completed} / {total} משימות</span>
        </div>
      </div>
    </div>
  );
}
