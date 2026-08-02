'use client';

import React, { useState, useMemo } from 'react';
import {
  FolderTree,
  Search,
  Filter,
  CheckCircle2,
  ListTodo,
  ChevronDown,
  ChevronUp,
  Target,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Goal, Task, TaskInstance, KeyResult } from '@/types/models';
import { GoalTaskTreeNode } from './GoalTaskTreeNode';
import { GoalOrgChartDiagram } from './GoalOrgChartDiagram';

interface GoalTasksTreeViewProps {
  goals: Goal[];
  tasks: Task[];
  taskInstances: TaskInstance[];
  keyResults: KeyResult[];
}

export function GoalTasksTreeView({
  goals,
  tasks,
  taskInstances,
  keyResults,
}: GoalTasksTreeViewProps) {
  const [viewMode, setViewMode] = useState<'diagram' | 'list'>('diagram');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframeFilter, setTimeframeFilter] = useState<'all' | 'annual' | 'quarterly' | 'monthly'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [allExpanded, setAllExpanded] = useState(true);

  // Active non-archived goals
  const activeGoals = useMemo(() => {
    return goals
      .filter((g) => g.status === 'active')
      .map((g) => ({
        ...g,
        timeframe: g.timeframe || (g.parentId ? ('quarterly' as const) : ('annual' as const)),
      }));
  }, [goals]);

  // Filter goals by search term, timeframe, and category
  const filteredGoals = useMemo(() => {
    return activeGoals.filter((g) => {
      if (timeframeFilter !== 'all' && g.timeframe !== timeframeFilter) return false;
      if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const goalMatches = g.title.toLowerCase().includes(query) || g.description?.toLowerCase().includes(query);
        const linkedTasks = tasks.filter((t) => t.goalId === g.id);
        const taskMatches = linkedTasks.some((t) => t.title.toLowerCase().includes(query));
        return goalMatches || taskMatches;
      }

      return true;
    });
  }, [activeGoals, timeframeFilter, categoryFilter, searchQuery, tasks]);

  // Root goals for the tree
  const rootGoals = useMemo(() => {
    return filteredGoals.filter((g) => {
      if (timeframeFilter === 'monthly' || timeframeFilter === 'quarterly') return true;
      if (timeframeFilter === 'annual') return g.timeframe === 'annual';
      return !g.parentId || !activeGoals.some((parent) => parent.id === g.parentId);
    });
  }, [filteredGoals, timeframeFilter, activeGoals]);

  // General Metrics
  const totalGoals = activeGoals.length;
  const activeTasksCount = tasks.filter((t) => t.isActive && t.goalId).length;
  const completedInstancesCount = taskInstances.filter((inst) => inst.status === 'completed').length;

  return (
    <div className="space-y-4">
      {/* Metrics Banner */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold text-slate-600">סה&quot;כ יעדים</span>
            <Target className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-xl font-black text-slate-800">{totalGoals}</div>
          <div className="text-[10px] text-slate-400">בעץ היעדים</div>
        </div>

        <div className="bg-indigo-50/70 p-3 rounded-2xl border border-indigo-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-700 mb-1">
            <span className="text-[11px] font-semibold text-indigo-800">משימות פעילות</span>
            <ListTodo className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-indigo-900">{activeTasksCount}</div>
          <div className="text-[10px] text-indigo-700/80 font-medium">מקושרות ליעדים</div>
        </div>

        <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[11px] font-semibold text-emerald-800">ביצועים היסטוריים</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-900">{completedInstancesCount}</div>
          <div className="text-[10px] text-emerald-700/80 font-medium">משימות שהושלמו</div>
        </div>
      </div>

      {/* Control Toolbar (View Mode Switcher, Search, Filter, Expand/Collapse All) */}
      <div className="bg-slate-100/90 p-2.5 rounded-2xl space-y-2.5">
        {/* Top Row: View Switcher & Search */}
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
          {/* View Mode Toggle Switch */}
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl w-full sm:w-auto shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('diagram')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'diagram'
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>תרשים דיאגרמה (Diagram)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>תצוגת רשימה (List)</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חפש יעד או משימה בעץ..."
              className="w-full pr-9 pl-3 py-1.5 bg-white text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Toggle Expand All (List Mode) */}
          {viewMode === 'list' && (
            <button
              type="button"
              onClick={() => setAllExpanded(!allExpanded)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors shrink-0"
            >
              {allExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                  <span>כווץ הכל</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                  <span>הרחב הכל</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'all', label: 'הכל' },
                { id: 'annual', label: 'שנתי' },
                { id: 'quarterly', label: 'רבעוני' },
                { id: 'monthly', label: 'חודשי' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeframeFilter(t.id)}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap ${
                  timeframeFilter === t.id
                    ? 'bg-cyan-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
            >
              <option value="all">כל הקטגוריות</option>
              <option value="work">עבודה</option>
              <option value="personal">אישי</option>
              <option value="health">בריאות</option>
              <option value="maintenance">תפעול</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {rootGoals.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300">
          <FolderTree className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">לא נמצאו יעדים ומשימות</h3>
          <p className="text-xs text-slate-400 mt-1">
            לא נמצאו יעדים המתאימים למילת החיפוש או לסינונים שנבחרו.
          </p>
        </div>
      ) : viewMode === 'diagram' ? (
        <GoalOrgChartDiagram
          goals={filteredGoals}
          tasks={tasks}
          taskInstances={taskInstances}
          keyResults={keyResults}
        />
      ) : (
        <div className="space-y-4">
          {rootGoals.map((rootGoal) => {
            const childGoals = activeGoals.filter((g) => g.parentId === rootGoal.id);
            return (
              <GoalTaskTreeNode
                key={rootGoal.id}
                goal={rootGoal}
                childGoals={childGoals}
                allGoals={activeGoals}
                tasks={tasks}
                taskInstances={taskInstances}
                keyResults={keyResults}
                level={0}
                defaultExpanded={allExpanded}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
