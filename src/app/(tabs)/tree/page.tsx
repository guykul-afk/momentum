'use client';

import React from 'react';
import { FolderTree } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { GoalTasksTreeView } from '@/components/tree/GoalTasksTreeView';

export default function TreePage() {
  const { goals, tasks, taskInstances, keyResults } = useAppStore();

  return (
    <div className="space-y-5 pb-8 transition-opacity duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500 text-white shadow-xs">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">עץ יעדים ומשימות</h1>
            <p className="text-xs text-slate-500 font-medium">
              מבנה היררכי מלא של יעדים, משימות מקושרות וכל היסטוריית הביצועים
            </p>
          </div>
        </div>
      </div>

      {/* Main Tree View Component */}
      <GoalTasksTreeView
        goals={goals}
        tasks={tasks}
        taskInstances={taskInstances}
        keyResults={keyResults}
      />
    </div>
  );
}
