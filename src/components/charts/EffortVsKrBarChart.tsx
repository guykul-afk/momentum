'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface EffortVsKrDataPoint {
  goalTitle: string;
  effortProgressPct: number; // 0 to 100
  krProgressPct: number; // 0 to 100
}

interface EffortVsKrBarChartProps {
  data: EffortVsKrDataPoint[];
}

export function EffortVsKrBarChart({ data }: EffortVsKrBarChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50/50 rounded-xl text-slate-400 text-xs">
        טוען גרף מאמץ מול תוצאות...
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs px-1">
        <span className="font-bold text-slate-700">השוואת ביצוע: מאמץ הושקע vs תוצאה (KR):</span>
      </div>

      <div className="h-64 w-full bg-slate-50/40 p-2 rounded-xl border border-slate-200/60 dir-ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="goalTitle"
              tick={{ fontSize: 9, fill: '#64748b' }}
              tickLine={false}
              interval={0}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              unit="%"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg text-xs font-sans dir-rtl border border-slate-700">
                      <p className="font-bold text-slate-200 mb-1">{label}</p>
                      <p className="text-cyan-400 font-semibold">
                        מאמץ שבוצע: {payload[0].value}%
                      </p>
                      <p className="text-[#F97316] font-semibold">
                        תוצאת KR שהושגה: {payload[1].value}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              formatter={(value) => (
                <span className="text-[11px] font-medium text-slate-700 mx-1">
                  {value === 'effortProgressPct' ? 'אחוז מאמץ' : 'אחוז תוצאה (KR)'}
                </span>
              )}
            />
            <Bar
              dataKey="effortProgressPct"
              name="effortProgressPct"
              fill="#06b6d4"
              radius={[6, 6, 0, 0]}
              barSize={16}
            />
            <Bar
              dataKey="krProgressPct"
              name="krProgressPct"
              fill="#F97316"
              radius={[6, 6, 0, 0]}
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
