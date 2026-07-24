'use client';

import React from 'react';
import { DailyStats } from '@/types/models';
import { computeRollingAdherence } from '@/lib/metrics';
import { TrendingUp, Award } from 'lucide-react';

interface AdherenceSparklineProps {
  stats: DailyStats[];
}

export function AdherenceSparkline({ stats }: AdherenceSparklineProps) {
  const rollingAdherence = computeRollingAdherence(stats, 7);
  const rollingPercentage = Math.round(rollingAdherence * 100);

  // Take last 7 stats or fill default mock values if less
  const recentStats = [...stats]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7);

  // Prepare days of week labels for Hebrew context
  const daysOfWeek = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-cyan-600" />
          <span className="text-xs font-semibold text-slate-700">עקביות 7 ימים אחרונים</span>
        </div>
        <div className="flex items-center gap-1 bg-cyan-100/70 text-cyan-800 px-2 py-0.5 rounded-full text-xs font-bold">
          <Award className="w-3.5 h-3.5" />
          <span>{rollingPercentage}%</span>
        </div>
      </div>

      {/* Visual Sparkline Bar Chart */}
      <div className="grid grid-cols-7 gap-1.5 items-end h-16 pt-2 pb-1">
        {recentStats.map((stat, idx) => {
          const dateObj = new Date(stat.date);
          const dayName = daysOfWeek[dateObj.getDay()] || 'יומי';
          const pct = Math.round((stat.adherence || 0) * 100);
          const isToday = idx === recentStats.length - 1;

          return (
            <div key={stat.id || idx} className="flex flex-col items-center gap-1 h-full justify-end group">
              <span className="text-[10px] text-slate-400 group-hover:text-cyan-600 transition-colors font-mono">
                {pct}%
              </span>
              <div className="w-full bg-slate-200 rounded-t-md h-full relative overflow-hidden max-h-[40px] flex items-end">
                <div
                  className={`w-full transition-all duration-500 rounded-t-md ${
                    isToday ? 'bg-cyan-500 shadow-sm' : 'bg-cyan-400/80 hover:bg-cyan-500'
                  }`}
                  style={{ height: `${Math.max(12, pct)}%` }}
                />
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isToday ? 'text-cyan-700 font-bold' : 'text-slate-500'
                }`}
              >
                {dayName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
