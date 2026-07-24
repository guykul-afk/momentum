'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
        טוען תרשים יחס פוקוס...
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs px-1">
        <span className="font-bold text-slate-700">תפוקה לפי פוקוס יעדים vs תפעול:</span>
        <span className="font-semibold text-slate-500 text-[11px]">סה&quot;כ משימות: {total}</span>
      </div>

      <div className="h-64 w-full bg-slate-50/40 p-2 rounded-xl border border-slate-200/60 flex items-center justify-center dir-ltr">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
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
            <Legend
              formatter={(value) => (
                <span className="text-[11px] font-medium text-slate-700 mx-1">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
