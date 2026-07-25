'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, TaskInstance, RawCaptureItem, DailyStats, Goal, EndOfDayReflection } from '../types/models';

function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function getTomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

const INITIAL_GOALS: Goal[] = [
  {
    id: 'g-annual-1',
    uid: 'user-1',
    title: 'השקת מוצר Momentum v1.0 והרחבת בסיס משתמשים',
    description: 'בניית מוצר מוביל לניהול מומנטום אישי והשקתו ל-1,000 משתמשים הראשונים',
    timeframe: 'annual',
    krTitle: '1,000 משתמשים פעילים',
    krTarget: 1000,
    krCurrent: 650,
    krUnit: 'משתמשים',
    effortTargetPoints: 200,
    effortCompletedPoints: 170,
    category: 'work',
    lastPointsAssignedAt: Date.now() - 86400000 * 2,
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now() - 86400000 * 2,
    status: 'active',
  },
  {
    id: 'g-monthly-1',
    uid: 'user-1',
    parentId: 'g-annual-1',
    title: 'פיתוח 4 ריטואלים עיקריים ומערכת יעדים',
    description: 'בניית מסכי עץ יעדים, סטטיסטיקה, סיכום שבועי וסיכום חודשי',
    timeframe: 'monthly',
    krTitle: '4 ריטואלים מוכנים לייצור',
    krTarget: 4,
    krCurrent: 1,
    krUnit: 'ריטואלים',
    effortTargetPoints: 60,
    effortCompletedPoints: 48, // 80% effort vs 25% KR = 55% gap (>30% Coral alert!)
    category: 'work',
    lastPointsAssignedAt: Date.now() - 86400000 * 1,
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 86400000 * 1,
    status: 'active',
  },
  {
    id: 'g-weekly-1',
    uid: 'user-1',
    parentId: 'g-monthly-1',
    title: 'מסך עץ יעדים, סטטיסטיקה ו-2 ריטואלים ברמת RTL',
    description: 'סיום ארבעת המסכים הנדרשים ע"י ארכיטקט התוכנה',
    timeframe: 'weekly',
    krTitle: '4 רכיבים מלאים פועלים',
    krTarget: 4,
    krCurrent: 3,
    krUnit: 'רכיבים',
    effortTargetPoints: 20,
    effortCompletedPoints: 16,
    category: 'work',
    lastPointsAssignedAt: Date.now() - 86400000 * 1,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 1,
    status: 'active',
  },
  {
    id: 'g-annual-2',
    uid: 'user-1',
    title: 'שגרה בריאה, אנרגיה וכושר גופני גבוה',
    description: 'אימונים סדירים, תזונה מבוקרת ואיזון אנרגטי',
    timeframe: 'annual',
    krTitle: '150 אימונים שנתיים',
    krTarget: 150,
    krCurrent: 45,
    krUnit: 'אימונים',
    effortTargetPoints: 150,
    effortCompletedPoints: 45,
    category: 'health',
    lastPointsAssignedAt: Date.now() - 86400000 * 3,
    createdAt: Date.now() - 86400000 * 90,
    updatedAt: Date.now() - 86400000 * 3,
    status: 'active',
  },
  {
    id: 'g-monthly-2',
    uid: 'user-1',
    parentId: 'g-annual-2',
    title: '16 אימוני כוח והידראוטיזציה יומית',
    description: 'התמדה ב-4 אימונים בשבוע לאורך כל החודש',
    timeframe: 'monthly',
    krTitle: '16 אימונים בחודש',
    krTarget: 16,
    krCurrent: 12,
    krUnit: 'אימונים',
    effortTargetPoints: 40,
    effortCompletedPoints: 30,
    category: 'health',
    lastPointsAssignedAt: Date.now() - 86400000 * 3,
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 86400000 * 3,
    status: 'active',
  },
  {
    id: 'g-weekly-2',
    uid: 'user-1',
    parentId: 'g-monthly-2',
    title: '4 אימוני כושר שבועיים בשעות הבוקר',
    description: 'שמירה על רצף הרגלים פעיל',
    timeframe: 'weekly',
    krTitle: '4 אימונים בשבוע',
    krTarget: 4,
    krCurrent: 3,
    krUnit: 'אימונים',
    effortTargetPoints: 10,
    effortCompletedPoints: 8,
    category: 'health',
    lastPointsAssignedAt: Date.now() - 86400000 * 3,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 3,
    status: 'active',
  },
  {
    id: 'g-annual-3',
    uid: 'user-1',
    title: 'כתיבת ספר מקצועי בנושא ארכיטקטורת תוכנה',
    description: 'תיעוד ניסיון מעשי והוצאה לאור',
    timeframe: 'annual',
    krTitle: '10 פרקים כתובים',
    krTarget: 10,
    krCurrent: 1,
    krUnit: 'פרקים',
    effortTargetPoints: 100,
    effortCompletedPoints: 10,
    category: 'personal',
    lastPointsAssignedAt: Date.now() - 86400000 * 20, // 20 days ago > 14 days (STARVED!)
    createdAt: Date.now() - 86400000 * 100,
    updatedAt: Date.now() - 86400000 * 20,
    status: 'active',
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    uid: 'user-1',
    goalId: 'g-weekly-1',
    title: 'בדיקת UI ורספונסיביות של מסך היום',
    description: 'לוודא תמיכה ב-390px iPhone ותקן RTL מלא',
    type: 'daily',
    isActive: true,
    weight: 5,
    estimatedMinutes: 45,
    category: 'work',
    when: 'בשעה 10:00 בבוקר עם תחילת יום העבודה',
    where: 'בחדר עבודה שקט ליד השולחן',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
  },
  {
    id: 't-2',
    uid: 'user-1',
    goalId: 'g-weekly-1',
    title: 'סנכרון ארכיטקטורה מול תשתית AI Triage',
    description: 'סיום הגדרת fallback וסכימת AI',
    type: 'daily',
    isActive: true,
    weight: 4,
    estimatedMinutes: 30,
    category: 'work',
    when: 'מיד אחרי פגישת הצוות ב-11:30',
    where: 'מחשב נייד - סביבת פיתוח',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
  },
  {
    id: 't-3',
    uid: 'user-1',
    goalId: 'g-weekly-2',
    title: 'אימון כושר יומי 30 דקות',
    description: 'אימון אינטרוולים קצר להגברת האנרגיה',
    type: 'daily',
    isActive: true,
    weight: 3,
    estimatedMinutes: 30,
    category: 'health',
    isHabit: true,
    streakCount: 6,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now(),
  },
  {
    id: 't-4',
    uid: 'user-1',
    title: 'שתיית 2 ליטר מים',
    description: 'שמירה על הידרציה במהלך יום העבודה',
    type: 'daily',
    isActive: true,
    weight: 2,
    estimatedMinutes: 5,
    category: 'health',
    isHabit: true,
    streakCount: 14,
    createdAt: Date.now() - 86400000 * 14,
    updatedAt: Date.now(),
  },
  {
    id: 't-5',
    uid: 'user-1',
    title: 'עבור על מיילים נכנסים והודעות Slack',
    description: 'ניקוי אינבוקס וסינון משימות חשובות',
    type: 'recurring',
    isActive: true,
    weight: 2,
    estimatedMinutes: 15,
    category: 'maintenance',
    isMaintenance: true,
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now(),
  },
  {
    id: 't-6',
    uid: 'user-1',
    title: 'גיבוי קבצי פרויקט וסנכרון Git',
    description: 'בדיקת קומיטים אחרונים ודחיפה למאגר',
    type: 'recurring',
    isActive: true,
    weight: 2,
    estimatedMinutes: 10,
    category: 'maintenance',
    isMaintenance: true,
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now(),
  },
];

const INITIAL_INSTANCES: TaskInstance[] = [
  {
    id: 'inst-1',
    uid: 'user-1',
    taskId: 't-1',
    date: getTodayDateString(),
    status: 'completed',
    completedAt: Date.now() - 3600000,
  },
  {
    id: 'inst-2',
    uid: 'user-1',
    taskId: 't-2',
    date: getTodayDateString(),
    status: 'pending',
  },
  {
    id: 'inst-3',
    uid: 'user-1',
    taskId: 't-3',
    date: getTodayDateString(),
    status: 'completed',
    completedAt: Date.now() - 7200000,
  },
  {
    id: 'inst-4',
    uid: 'user-1',
    taskId: 't-4',
    date: getTodayDateString(),
    status: 'completed',
    completedAt: Date.now() - 14400000,
  },
  {
    id: 'inst-5',
    uid: 'user-1',
    taskId: 't-5',
    date: getTodayDateString(),
    status: 'pending',
  },
  {
    id: 'inst-6',
    uid: 'user-1',
    taskId: 't-6',
    date: getTodayDateString(),
    status: 'pending',
  },
];

const INITIAL_RAW_CAPTURES: RawCaptureItem[] = [
  {
    id: 'cap-1',
    uid: 'user-1',
    content: 'להתקשר ללקוח לגבי משוב על העיצוב החדש ביום ראשון',
    createdAt: Date.now() - 3600000 * 3,
    status: 'inbox',
    suggestedBreakdown: {
      title: 'שיחת משוב עיצוב מול הלקוח',
      weight: 4,
      estimatedMinutes: 30,
      type: 'one-off',
      category: 'work',
      goalId: 'g-weekly-1',
      when: 'יום ראשון בשעה 11:00 בבוקר',
      where: 'שיחת Google Meet מחדר הישיבות',
      aiRationale: 'משימה בעלת השפעה גבוהה על שביעות רצון הלקוח והתקדמות הפרויקט',
    },
  },
  {
    id: 'cap-2',
    uid: 'user-1',
    content: 'הקלטת קול: להזמין ציוד ארגונומי למשרד (כיסא ומסך משני)',
    createdAt: Date.now() - 3600000 * 5,
    audioDuration: 12,
    status: 'inbox',
    suggestedBreakdown: {
      title: 'הזמנת ציוד ארגונומי למשרד',
      weight: 2,
      estimatedMinutes: 20,
      type: 'one-off',
      category: 'personal',
      aiRationale: 'משימת תפעול קלה לשיפור סביבת העבודה',
    },
  },
  {
    id: 'cap-3',
    uid: 'user-1',
    content: 'להכין מצגת סיכום רבעוני עבור צוות ההנהלה',
    createdAt: Date.now() - 3600000 * 8,
    status: 'inbox',
    suggestedBreakdown: {
      title: 'הכנת מצגת סיכום רבעוני',
      weight: 5,
      estimatedMinutes: 60,
      type: 'one-off',
      category: 'work',
      goalId: 'g-weekly-1',
      when: 'מחר בשעה 09:00 בבוקר לפני הפגישה',
      where: 'חדר עבודה שקט בלפטופ',
      aiRationale: 'משימה אסטרטגית במשקל גבוה 5/5, מומלץ להגדיר כוונת ביצוע (When & Where)',
    },
  },
];

const INITIAL_DAILY_STATS: DailyStats[] = [
  { id: 'ds-1', uid: 'user-1', date: '2026-07-18', tasksCompleted: 4, totalTasks: 5, dailyQuota: 4, adherence: 1.0, focusRatio: 0.8, createdAt: 0 },
  { id: 'ds-2', uid: 'user-1', date: '2026-07-19', tasksCompleted: 3, totalTasks: 4, dailyQuota: 4, adherence: 0.75, focusRatio: 0.67, createdAt: 0 },
  { id: 'ds-3', uid: 'user-1', date: '2026-07-20', tasksCompleted: 4, totalTasks: 4, dailyQuota: 4, adherence: 1.0, focusRatio: 0.75, createdAt: 0 },
  { id: 'ds-4', uid: 'user-1', date: '2026-07-21', tasksCompleted: 2, totalTasks: 4, dailyQuota: 4, adherence: 0.5, focusRatio: 0.5, createdAt: 0 },
  { id: 'ds-5', uid: 'user-1', date: '2026-07-22', tasksCompleted: 4, totalTasks: 4, dailyQuota: 4, adherence: 1.0, focusRatio: 0.8, createdAt: 0 },
  { id: 'ds-6', uid: 'user-1', date: '2026-07-23', tasksCompleted: 3, totalTasks: 4, dailyQuota: 4, adherence: 0.75, focusRatio: 0.67, createdAt: 0 },
  { id: 'ds-7', uid: 'user-1', date: '2026-07-24', tasksCompleted: 3, totalTasks: 4, dailyQuota: 4, adherence: 0.75, focusRatio: 0.75, createdAt: 0 },
];

import { KrCheckin, WeeklyPlan, MonthlyCloseReport } from '../types/models';

interface AppContextType {
  tasks: Task[];
  taskInstances: TaskInstance[];
  rawCaptures: RawCaptureItem[];
  dailyStats: DailyStats[];
  goals: Goal[];
  reflections: EndOfDayReflection[];
  krCheckins: KrCheckin[];
  weeklyPlans: WeeklyPlan[];
  monthlyReports: MonthlyCloseReport[];
  toggleTaskInstance: (taskId: string) => void;
  addRawCapture: (content: string, audioUrl?: string, audioDuration?: number) => void;
  deleteRawCapture: (id: string) => void;
  triageApprove: (rawId: string, taskData: Partial<Task>, targetDate?: 'today' | 'tomorrow' | string) => void;
  triageReject: (rawId: string) => void;
  addReflection: (reflection: Omit<EndOfDayReflection, 'id' | 'createdAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => Goal;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  addKrCheckin: (goalId: string, value: number, notes?: string) => void;
  saveWeeklyPlan: (plan: Omit<WeeklyPlan, 'id' | 'uid' | 'createdAt'>) => void;
  performFreshStart: () => void;
  saveMonthlyCloseReport: (report: Omit<MonthlyCloseReport, 'id' | 'uid' | 'createdAt'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInstances, setTaskInstances] = useState<TaskInstance[]>([]);
  const [rawCaptures, setRawCaptures] = useState<RawCaptureItem[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>(INITIAL_DAILY_STATS);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [reflections, setReflections] = useState<EndOfDayReflection[]>([]);
  const [krCheckins, setKrCheckins] = useState<KrCheckin[]>([]);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([]);
  const [monthlyReports, setMonthlyReports] = useState<MonthlyCloseReport[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('momentum_tasks');
      const savedInstances = localStorage.getItem('momentum_instances');
      const savedCaptures = localStorage.getItem('momentum_captures');
      const savedStats = localStorage.getItem('momentum_stats');
      const savedGoals = localStorage.getItem('momentum_goals');
      const savedReflections = localStorage.getItem('momentum_reflections');
      const savedCheckins = localStorage.getItem('momentum_kr_checkins');
      const savedWeeklyPlans = localStorage.getItem('momentum_weekly_plans');
      const savedMonthlyReports = localStorage.getItem('momentum_monthly_reports');

      if (savedTasks) setTasks(JSON.parse(savedTasks));
      else setTasks(INITIAL_TASKS);

      if (savedInstances) setTaskInstances(JSON.parse(savedInstances));
      else setTaskInstances(INITIAL_INSTANCES);

      if (savedCaptures) setRawCaptures(JSON.parse(savedCaptures));
      else setRawCaptures(INITIAL_RAW_CAPTURES);

      if (savedStats) setDailyStats(JSON.parse(savedStats));

      if (savedGoals) setGoals(JSON.parse(savedGoals));
      else setGoals(INITIAL_GOALS);

      if (savedReflections) setReflections(JSON.parse(savedReflections));
      if (savedCheckins) setKrCheckins(JSON.parse(savedCheckins));
      if (savedWeeklyPlans) setWeeklyPlans(JSON.parse(savedWeeklyPlans));
      if (savedMonthlyReports) setMonthlyReports(JSON.parse(savedMonthlyReports));
    } catch {
      setTasks(INITIAL_TASKS);
      setTaskInstances(INITIAL_INSTANCES);
      setRawCaptures(INITIAL_RAW_CAPTURES);
      setGoals(INITIAL_GOALS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('momentum_tasks', JSON.stringify(tasks));
      localStorage.setItem('momentum_instances', JSON.stringify(taskInstances));
      localStorage.setItem('momentum_captures', JSON.stringify(rawCaptures));
      localStorage.setItem('momentum_stats', JSON.stringify(dailyStats));
      localStorage.setItem('momentum_goals', JSON.stringify(goals));
      localStorage.setItem('momentum_reflections', JSON.stringify(reflections));
      localStorage.setItem('momentum_kr_checkins', JSON.stringify(krCheckins));
      localStorage.setItem('momentum_weekly_plans', JSON.stringify(weeklyPlans));
      localStorage.setItem('momentum_monthly_reports', JSON.stringify(monthlyReports));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [tasks, taskInstances, rawCaptures, dailyStats, goals, reflections, krCheckins, weeklyPlans, monthlyReports, isLoaded]);

  const toggleTaskInstance = (taskId: string) => {
    const today = getTodayDateString();
    setTaskInstances((prev) => {
      const existing = prev.find((i) => i.taskId === taskId && i.date === today);
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id
            ? {
                ...i,
                status: i.status === 'completed' ? 'pending' : 'completed',
                completedAt: i.status === 'completed' ? undefined : Date.now(),
              }
            : i
        );
      } else {
        const newInstance: TaskInstance = {
          id: `inst-${Date.now()}`,
          uid: 'user-1',
          taskId,
          date: today,
          status: 'completed',
          completedAt: Date.now(),
        };
        return [...prev, newInstance];
      }
    });

    // Update streak if it's a habit
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === taskId && t.isHabit) {
          const instance = taskInstances.find((i) => i.taskId === taskId && i.date === today);
          const wasCompleted = instance?.status === 'completed';
          const newStreak = wasCompleted
            ? Math.max(0, (t.streakCount || 1) - 1)
            : (t.streakCount || 0) + 1;
          return { ...t, streakCount: newStreak };
        }
        return t;
      })
    );
  };

  const addRawCapture = (content: string, audioUrl?: string, audioDuration?: number) => {
    if (!content.trim() && !audioUrl) return;
    const newItem: RawCaptureItem = {
      id: `cap-${Date.now()}`,
      uid: 'user-1',
      content: content.trim() || 'הקלטה קולית ללא תמלול',
      createdAt: Date.now(),
      audioUrl,
      audioDuration,
      status: 'inbox',
      suggestedBreakdown: {
        title: content.trim() || 'משימה מוצעת מהקלטה קולית',
        weight: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
        estimatedMinutes: 20,
        type: 'daily',
        category: 'work',
        aiRationale: 'ניתוח אוטומטי של תפוקה מוצעת על בסיס התוכן שנלכד',
      },
    };
    setRawCaptures((prev) => [newItem, ...prev]);
  };

  const deleteRawCapture = (id: string) => {
    setRawCaptures((prev) => prev.filter((item) => item.id !== id));
  };

  const triageApprove = (
    rawId: string,
    taskData: Partial<Task>,
    targetDate?: 'today' | 'tomorrow' | string
  ) => {
    const newTask: Task = {
      id: `t-${Date.now()}`,
      uid: 'user-1',
      title: taskData.title || 'משימה חדשה',
      description: taskData.description || '',
      type: taskData.type || 'daily',
      isActive: true,
      weight: taskData.weight || 3,
      estimatedMinutes: taskData.estimatedMinutes || 30,
      category: taskData.category || 'work',
      goalId: taskData.goalId,
      when: taskData.when,
      where: taskData.where,
      isHabit: taskData.isHabit,
      isMaintenance: taskData.isMaintenance,
      streakCount: taskData.isHabit ? 1 : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setTasks((prev) => [newTask, ...prev]);

    // Create instance for selected date (today or tomorrow)
    const targetDateStr =
      targetDate === 'tomorrow'
        ? getTomorrowDateString()
        : targetDate && targetDate !== 'today'
        ? targetDate
        : getTodayDateString();

    setTaskInstances((prev) => [
      ...prev,
      {
        id: `inst-${Date.now()}`,
        uid: 'user-1',
        taskId: newTask.id,
        date: targetDateStr,
        status: 'pending',
      },
    ]);

    // Mark capture as triaged
    setRawCaptures((prev) =>
      prev.map((c) => (c.id === rawId ? { ...c, status: 'triaged' } : c))
    );
  };

  const triageReject = (rawId: string) => {
    setRawCaptures((prev) =>
      prev.map((c) => (c.id === rawId ? { ...c, status: 'discarded' } : c))
    );
  };

  const addReflection = (reflectionData: Omit<EndOfDayReflection, 'id' | 'createdAt'>) => {
    const newRef: EndOfDayReflection = {
      ...reflectionData,
      id: `ref-${Date.now()}`,
      createdAt: Date.now(),
    };
    setReflections((prev) => [newRef, ...prev]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates, updatedAt: Date.now() } : t))
    );
  };

  const addGoal = (goalData: Omit<Goal, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `g-${Date.now()}`,
      uid: 'user-1',
      status: goalData.status || 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastPointsAssignedAt: Date.now(),
    };
    setGoals((prev) => [...prev, newGoal]);
    return newGoal;
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, ...updates, updatedAt: Date.now() } : g))
    );
  };

  const addKrCheckin = (goalId: string, value: number, notes?: string) => {
    const today = getTodayDateString();
    const newCheckin: KrCheckin = {
      id: `kr-${Date.now()}`,
      uid: 'user-1',
      goalId,
      value,
      notes,
      date: today,
      createdAt: Date.now(),
    };
    setKrCheckins((prev) => [newCheckin, ...prev]);
    // Also update goal's current KR metric
    updateGoal(goalId, { krCurrent: value, updatedAt: Date.now() });
  };

  const saveWeeklyPlan = (planData: Omit<WeeklyPlan, 'id' | 'uid' | 'createdAt'>) => {
    const newPlan: WeeklyPlan = {
      ...planData,
      id: `wp-${Date.now()}`,
      uid: 'user-1',
      createdAt: Date.now(),
    };
    setWeeklyPlans((prev) => [newPlan, ...prev]);

    // Update goals effort target points from allocation
    planData.goalAllocations.forEach((alloc) => {
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id === alloc.goalId) {
            return {
              ...g,
              effortTargetPoints: (g.effortTargetPoints || 0) + alloc.allocatedPoints,
              lastPointsAssignedAt: Date.now(),
              updatedAt: Date.now(),
            };
          }
          return g;
        })
      );
    });
  };

  const performFreshStart = () => {
    // Clear pending task instances for today/past to give a fresh start
    setTaskInstances((prev) => prev.filter((inst) => inst.status === 'completed'));
  };

  const saveMonthlyCloseReport = (reportData: Omit<MonthlyCloseReport, 'id' | 'uid' | 'createdAt'>) => {
    const newReport: MonthlyCloseReport = {
      ...reportData,
      id: `mr-${Date.now()}`,
      uid: 'user-1',
      createdAt: Date.now(),
    };
    setMonthlyReports((prev) => [newReport, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        taskInstances,
        rawCaptures,
        dailyStats,
        goals,
        reflections,
        krCheckins,
        weeklyPlans,
        monthlyReports,
        toggleTaskInstance,
        addRawCapture,
        deleteRawCapture,
        triageApprove,
        triageReject,
        addReflection,
        updateTask,
        addGoal,
        updateGoal,
        addKrCheckin,
        saveWeeklyPlan,
        performFreshStart,
        saveMonthlyCloseReport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
