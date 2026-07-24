'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export interface AdherenceDataPoint {
  date: string;
  adherencePct: number; // 0 to 100
  targetPct: number;
}

interface AdherenceLineChartProps {
  data: AdherenceDataPoint[];
  timeframeDays: number;
}

export function AdherenceLineChart({ data, timeframeDays }: AdherenceLineChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50/50 rounded-xl text-slate-400 text-xs">
        טוען גרף היענות...
      </div>
    );
  }

  // Calculate rolling average
  const avgAdherence =
    data.length > 0
      ? Math.round(data.reduce((acc, curr) => acc + curr.adherencePct, 0) / data.length)
      : 0;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs px-1">
        <span className="font-bold text-slate-700">
          ממוצע היענות ב-{timeframeDays} הימים האחרונים:
        </span>
        <span className="font-extrabold text-cyan-600 text-sm">{avgAdherence}%</span>
      </div>

      <div className="h-64 w-full bg-slate-50/40 p-2 rounded-xl border border-slate-200/60 dir-ltr">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="adherenceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
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
                        אחוז היענות: {payload[0].value}%
                      </p>
                      <p className="text-slate-400 text-[10px]">יעד היענות מומנטום: 80%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={80} stroke="#94a3b8" strokeDasharray="4 4" label="" />
            <Line
              type="monotone"
              dataKey="adherencePct"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={{ r: 4, fill: '#06b6d4', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6, fill: '#0891b2', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
