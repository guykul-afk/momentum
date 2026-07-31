'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export interface FocusRatioCategoryData {
  name: string;
  value: number;
  color: string;
}

interface FocusRatioPieChartProps {
  data: FocusRatioCategoryData[];
}

export function FocusRatioPieChart({ data }: FocusRatioPieChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50/50 rounded-xl text-slate-400 text-xs">
        טוען תרשים עוגה...
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-xs px-1">
        <span className="font-bold text-slate-700">התפלגות יחס משימות ליעדים:</span>
        <span className="font-semibold text-slate-500 text-[11px]">סה&quot;כ משימות: {total}</span>
      </div>

      {/* Chart Container - Centered Donut Pie */}
      <div className="h-56 w-full bg-slate-50/60 p-2 rounded-xl border border-slate-200/60 flex items-center justify-center relative dir-ltr">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const entry = payload[0];
                  const percentage = total > 0 ? Math.round(((entry.value as number) / total) * 100) : 0;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg text-xs font-sans dir-rtl border border-slate-700">
                      <p className="font-bold text-slate-200">{entry.name}</p>
                      <p className="text-cyan-400 font-semibold mt-0.5">
                        {entry.value} משימות ({percentage}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Mobile-Optimized Clean Hebrew Legend List */}
      <div className="grid grid-cols-1 gap-2 pt-1">
        {data.map((item, idx) => {
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-200/50 text-xs"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-bold text-slate-700 truncate text-[11px]">{item.name}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-black text-slate-800 text-[11px]">{item.value} משימות</span>
                <span className="font-semibold px-1.5 py-0.5 rounded-full bg-slate-200/70 text-slate-700 text-[10px]">
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
