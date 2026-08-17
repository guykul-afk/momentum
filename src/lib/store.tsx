'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, TaskInstance, RawCaptureItem, DailyStats, Goal, KeyResult, EndOfDayReflection, KrCheckin, WeeklyPlan, MonthlyCloseReport } from '../types/models';
import { db, initAuth } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, DocumentReference, SetOptions } from 'firebase/firestore';
import {
  getPostponedMonthlyEndDate,
  getPostponedAnnualEndDate,
  getDefaultAnnualEndDate,
} from './goalUtils';
import { getTodayDateString, getTomorrowDateString } from './dateUtils';

export type SyncStatus = 'synced' | 'syncing' | 'offline';

// Helper function to sanitize objects for Firestore (removes undefined fields)
function cleanForFirestore<T extends object>(obj: T): Record<string, unknown> {
  if (!obj || typeof obj !== 'object') return (obj || {}) as Record<string, unknown>;
  const clean: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      clean[key] = val;
    }
  }
  return clean;
}

function safeSetDoc<T extends object>(
  reference: DocumentReference,
  data: T,
  options?: SetOptions
) {
  const cleaned = cleanForFirestore(data);
  return options ? setDoc(reference, cleaned, options) : setDoc(reference, cleaned);
}

interface AppContextType {
  tasks: Task[];
  taskInstances: TaskInstance[];
  rawCaptures: RawCaptureItem[];
  dailyStats: DailyStats[];
  goals: Goal[];
  keyResults: KeyResult[];
  reflections: EndOfDayReflection[];
  krCheckins: KrCheckin[];
  weeklyPlans: WeeklyPlan[];
  monthlyReports: MonthlyCloseReport[];
  syncStatus: SyncStatus;
  lastSyncedAt: number | null;
  toggleTaskInstance: (taskId: string) => void;
  addRawCapture: (content: string, audioUrl?: string, audioDuration?: number) => void;
  deleteRawCapture: (id: string) => void;
  addTask: (taskData: Partial<Task>, targetDate?: 'today' | 'tomorrow' | string) => Task;
  triageApprove: (rawId: string, taskData: Partial<Task>, targetDate?: 'today' | 'tomorrow' | string) => void;
  triageReject: (rawId: string) => void;
  addReflection: (reflection: Omit<EndOfDayReflection, 'id' | 'createdAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  postponeTaskToTomorrow: (taskId: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => Goal;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  deleteGoal: (goalId: string) => void;
  postponeMonthlyGoal: (goalId: string) => void;
  postponeAnnualGoal: (goalId: string) => void;
  addKeyResult: (krData: Omit<KeyResult, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => KeyResult;
  updateKeyResult: (krId: string, updates: Partial<KeyResult>) => void;
  deleteKeyResult: (krId: string) => void;
  addKrCheckin: (goalId: string, keyResultId: string, value: number, confidenceScore?: number, notes?: string) => void;
  saveWeeklyPlan: (plan: Omit<WeeklyPlan, 'id' | 'uid' | 'createdAt'>) => void;
  performFreshStart: () => void;
  saveMonthlyCloseReport: (report: Omit<MonthlyCloseReport, 'id' | 'uid' | 'createdAt'>) => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInstances, setTaskInstances] = useState<TaskInstance[]>([]);
  const [rawCaptures, setRawCaptures] = useState<RawCaptureItem[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
  const [reflections, setReflections] = useState<EndOfDayReflection[]>([]);
  const [krCheckins, setKrCheckins] = useState<KrCheckin[]>([]);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([]);
  const [monthlyReports, setMonthlyReports] = useState<MonthlyCloseReport[]>([]);
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Monitor browser online/offline status
  useEffect(() => {
    const handleOnline = () => setSyncStatus('synced');
    const handleOffline = () => setSyncStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSyncStatus('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Helper function to safely execute Firestore write operations
  const saveToFirestore = async (operation: () => Promise<void>) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSyncStatus('offline');
      return;
    }
    setSyncStatus('syncing');
    try {
      await operation();
      setSyncStatus('synced');
      setLastSyncedAt(Date.now());
    } catch (err) {
      console.warn('Firestore write error:', err);
      setSyncStatus('offline');
    }
  };

  useEffect(() => {
    initAuth();

    try {
      const hasResetFlag = !!localStorage.getItem('momentum_reset_v5');
      if (!hasResetFlag) {
        localStorage.clear();
        localStorage.setItem('momentum_reset_v5', 'true');
      } else {
        const savedTasks = localStorage.getItem('momentum_tasks');
        const savedInstances = localStorage.getItem('momentum_instances');
        const savedCaptures = localStorage.getItem('momentum_captures');
        const savedStats = localStorage.getItem('momentum_stats');
        const savedGoals = localStorage.getItem('momentum_goals');
        const savedKeyResults = localStorage.getItem('momentum_key_results');
        const savedReflections = localStorage.getItem('momentum_reflections');
        const savedCheckins = localStorage.getItem('momentum_kr_checkins');
        const savedWeeklyPlans = localStorage.getItem('momentum_weekly_plans');
        const savedMonthlyReports = localStorage.getItem('momentum_monthly_reports');

        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedInstances) setTaskInstances(JSON.parse(savedInstances));
        if (savedCaptures) setRawCaptures(JSON.parse(savedCaptures));
        if (savedStats) setDailyStats(JSON.parse(savedStats));
        if (savedGoals) setGoals(JSON.parse(savedGoals));
        if (savedKeyResults) setKeyResults(JSON.parse(savedKeyResults));
        if (savedReflections) setReflections(JSON.parse(savedReflections));
        if (savedCheckins) setKrCheckins(JSON.parse(savedCheckins));
        if (savedWeeklyPlans) setWeeklyPlans(JSON.parse(savedWeeklyPlans));
        if (savedMonthlyReports) setMonthlyReports(JSON.parse(savedMonthlyReports));
      }
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    } finally {
      setIsLoaded(true);
    }

    // Real-time Firestore Listeners for ALL collections
    const unsubGoals = onSnapshot(
      collection(db, 'goals'),
      (snapshot) => {
        const serverItems = snapshot.docs.map((d) => d.data() as Goal);
        setGoals(serverItems);
        setSyncStatus('synced');
        setLastSyncedAt(Date.now());
      },
      (err) => {
        console.warn('Firestore goals listener warning:', err);
        setSyncStatus('offline');
      }
    );

    const unsubKeyResults = onSnapshot(
      collection(db, 'keyResults'),
      (snapshot) => {
        const serverItems = snapshot.docs.map((d) => d.data() as KeyResult);
        setKeyResults(serverItems);
        setSyncStatus('synced');
        setLastSyncedAt(Date.now());
      },
      (err) => {
        console.warn('Firestore keyResults listener warning:', err);
        setSyncStatus('offline');
      }
    );

    const unsubTasks = onSnapshot(
      collection(db, 'tasks'),
      (snapshot) => {
        const serverItems = snapshot.docs.map((d) => d.data() as Task);
        setTasks(serverItems);
        setSyncStatus('synced');
        setLastSyncedAt(Date.now());
      },
      (err) => {
        console.warn('Firestore tasks listener warning:', err);
        setSyncStatus('offline');
      }
    );

    const unsubInstances = onSnapshot(
      collection(db, 'taskInstances'),
      (snapshot) => {
        const serverItems = snapshot.docs.map((d) => d.data() as TaskInstance);
        setTaskInstances(serverItems);
        setSyncStatus('synced');
        setLastSyncedAt(Date.now());
      },
      (err) => {
        console.warn('Firestore instances listener warning:', err);
        setSyncStatus('offline');
      }
    );

    const unsubCaptures = onSnapshot(
      collection(db, 'rawCaptures'),
      (snapshot) => {
        const serverItems = snapshot.docs.map((d) => d.data() as RawCaptureItem);
        setRawCaptures(serverItems);
        setSyncStatus('synced');
        setLastSyncedAt(Date.now());
      },
      (err) => {
        console.warn('Firestore captures listener warning:', err);
        setSyncStatus('offline');
      }
    );

    const unsubReflections = onSnapshot(
      collection(db, 'reflections'),
      (snapshot) => {
        const serverItems = snapshot.docs.map((d) => d.data() as EndOfDayReflection);
        setReflections(serverItems);
        setSyncStatus('synced');
        setLastSyncedAt(Date.now());
      },
      (err) => {
        console.warn('Firestore reflections listener warning:', err);
        setSyncStatus('offline');
      }
    );

    const unsubCheckins = onSnapshot(
      collection(db, 'krCheckins'),
      (snapshot) => {
        const serverItems = snapshot.docs.map((d) => d.data() as KrCheckin);
        setKrCheckins(serverItems);
        setSyncStatus('synced');
        setLastSyncedAt(Date.now());
      },
      (err) => {
        console.warn('Firestore checkins listener warning:', err);
        setSyncStatus('offline');
      }
    );

    const unsubWeeklyPlans = onSnapshot(
      collection(db, 'weeklyPlans'),
      (snapshot) => {
        const serverItems = snapshot.docs.map((d) => d.data() as WeeklyPlan);
        setWeeklyPlans(serverItems);
        setSyncStatus('synced');
        setLastSyncedAt(Date.now());
      },
      (err) => {
        console.warn('Firestore weeklyPlans listener warning:', err);
        setSyncStatus('offline');
      }
    );

    const unsubMonthlyReports = onSnapshot(
      collection(db, 'monthlyReports'),
      (snapshot) => {
        const serverItems = snapshot.docs.map((d) => d.data() as MonthlyCloseReport);
        setMonthlyReports(serverItems);
        setSyncStatus('synced');
        setLastSyncedAt(Date.now());
      },
      (err) => {
        console.warn('Firestore monthlyReports listener warning:', err);
        setSyncStatus('offline');
      }
    );

    return () => {
      unsubGoals();
      unsubKeyResults();
      unsubTasks();
      unsubInstances();
      unsubCaptures();
      unsubReflections();
      unsubCheckins();
      unsubWeeklyPlans();
      unsubMonthlyReports();
    };
  }, []);

  // Save to localStorage as local backup
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('momentum_tasks', JSON.stringify(tasks));
      localStorage.setItem('momentum_instances', JSON.stringify(taskInstances));
      localStorage.setItem('momentum_captures', JSON.stringify(rawCaptures));
      localStorage.setItem('momentum_stats', JSON.stringify(dailyStats));
      localStorage.setItem('momentum_goals', JSON.stringify(goals));
      localStorage.setItem('momentum_key_results', JSON.stringify(keyResults));
      localStorage.setItem('momentum_reflections', JSON.stringify(reflections));
      localStorage.setItem('momentum_kr_checkins', JSON.stringify(krCheckins));
      localStorage.setItem('momentum_weekly_plans', JSON.stringify(weeklyPlans));
      localStorage.setItem('momentum_monthly_reports', JSON.stringify(monthlyReports));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [tasks, taskInstances, rawCaptures, dailyStats, goals, keyResults, reflections, krCheckins, weeklyPlans, monthlyReports, isLoaded]);

  const toggleTaskInstance = (taskId: string) => {
    const today = getTodayDateString();
    const instanceId = `inst_${taskId}_${today}`;
    let updatedInstance: TaskInstance;

    const existing = taskInstances.find(
      (i) => i.id === instanceId || (i.taskId === taskId && i.date === today)
    );

    const willBeCompleted = existing ? existing.status !== 'completed' : true;

    if (existing) {
      updatedInstance = {
        ...existing,
        id: instanceId,
        status: willBeCompleted ? 'completed' : 'pending',
        completedAt: willBeCompleted ? Date.now() : undefined,
      };
      setTaskInstances((prev) =>
        prev.map((i) => (i.id === existing.id || i.id === instanceId ? updatedInstance : i))
      );
    } else {
      updatedInstance = {
        id: instanceId,
        uid: 'user-1',
        taskId,
        date: today,
        status: 'completed',
        completedAt: Date.now(),
      };
      setTaskInstances((prev) => [...prev.filter((i) => i.id !== instanceId), updatedInstance]);
    }

    // Save instance to Firestore
    saveToFirestore(() => safeSetDoc(doc(db, 'taskInstances', instanceId), updatedInstance));

    // Update habit streak or active status for one-off tasks
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === taskId) {
          let updatedTask = t;
          let changed = false;

          if (t.isHabit) {
            const wasCompleted = existing?.status === 'completed';
            const newStreak = wasCompleted
              ? Math.max(0, (t.streakCount || 1) - 1)
              : (t.streakCount || 0) + 1;
            updatedTask = { ...updatedTask, streakCount: newStreak, updatedAt: Date.now() };
            changed = true;
          }

          if (t.type === 'one-off' || !t.type) {
            const newIsActive = !willBeCompleted;
            if (updatedTask.isActive !== newIsActive) {
              updatedTask = { ...updatedTask, isActive: newIsActive, updatedAt: Date.now() };
              changed = true;
            }
          }

          if (changed) {
            saveToFirestore(() => safeSetDoc(doc(db, 'tasks', taskId), updatedTask, { merge: true }));
          }
          return updatedTask;
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
    saveToFirestore(() => safeSetDoc(doc(db, 'rawCaptures', newItem.id), newItem));
  };

  const deleteRawCapture = (id: string) => {
    setRawCaptures((prev) => prev.filter((item) => item.id !== id));
    saveToFirestore(() => deleteDoc(doc(db, 'rawCaptures', id)));
  };

  const addTask = (
    taskData: Partial<Task>,
    targetDate?: 'today' | 'tomorrow' | string
  ): Task => {
    const newTask: Task = {
      id: `t-${Date.now()}`,
      uid: 'user-1',
      title: taskData.title || 'משימה חדשה',
      description: taskData.description || '',
      type: taskData.type || 'one-off',
      isActive: true,
      weight: taskData.weight || 3,
      estimatedMinutes: taskData.estimatedMinutes || 30,
      category: taskData.category || 'work',
      goalId: taskData.goalId,
      keyResultId: taskData.keyResultId,
      when: taskData.when,
      where: taskData.where,
      isHabit: taskData.isHabit,
      isMaintenance: taskData.isMaintenance,
      streakCount: taskData.isHabit ? 1 : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const targetDateStr =
      targetDate === 'tomorrow'
        ? getTomorrowDateString()
        : targetDate && targetDate !== 'today'
        ? targetDate
        : getTodayDateString();

    const instanceId = `inst_${newTask.id}_${targetDateStr}`;
    const newInstance: TaskInstance = {
      id: instanceId,
      uid: 'user-1',
      taskId: newTask.id,
      date: targetDateStr,
      status: 'pending',
    };

    setTasks((prev) => [newTask, ...prev]);
    setTaskInstances((prev) => [...prev.filter((i) => i.id !== instanceId), newInstance]);

    saveToFirestore(async () => {
      await safeSetDoc(doc(db, 'tasks', newTask.id), newTask);
      await safeSetDoc(doc(db, 'taskInstances', instanceId), newInstance);
    });

    return newTask;
  };

  const triageApprove = (
    rawId: string,
    taskData: Partial<Task>,
    targetDate?: 'today' | 'tomorrow' | string
  ) => {
    addTask(taskData, targetDate);

    setRawCaptures((prev) =>
      prev.map((c) => {
        if (c.id === rawId) {
          const updated = { ...c, status: 'triaged' as const };
          saveToFirestore(() => safeSetDoc(doc(db, 'rawCaptures', rawId), updated, { merge: true }));
          return updated;
        }
        return c;
      })
    );
  };

  const triageReject = (rawId: string) => {
    setRawCaptures((prev) =>
      prev.map((c) => {
        if (c.id === rawId) {
          const updated = { ...c, status: 'discarded' as const };
          saveToFirestore(() => safeSetDoc(doc(db, 'rawCaptures', rawId), updated, { merge: true }));
          return updated;
        }
        return c;
      })
    );
  };

  const addReflection = (reflectionData: Omit<EndOfDayReflection, 'id' | 'createdAt'>) => {
    const newRef: EndOfDayReflection = {
      ...reflectionData,
      id: `ref-${Date.now()}`,
      createdAt: Date.now(),
    };
    setReflections((prev) => [newRef, ...prev]);
    saveToFirestore(() => safeSetDoc(doc(db, 'reflections', newRef.id), newRef));
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = { ...t, ...updates, updatedAt: Date.now() };
          saveToFirestore(() => safeSetDoc(doc(db, 'tasks', taskId), updated, { merge: true }));
          return updated;
        }
        return t;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    const instancesToDelete = taskInstances.filter((i) => i.taskId === taskId);

    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setTaskInstances((prev) => prev.filter((i) => i.taskId !== taskId));

    saveToFirestore(async () => {
      await deleteDoc(doc(db, 'tasks', taskId));
      for (const inst of instancesToDelete) {
        await deleteDoc(doc(db, 'taskInstances', inst.id)).catch(() => {});
      }
    });
  };

  const postponeTaskToTomorrow = (taskId: string) => {
    const todayStr = getTodayDateString();
    const tomorrowStr = getTomorrowDateString();
    const tomorrowInstId = `inst_${taskId}_${tomorrowStr}`;
    const todayInstId = `inst_${taskId}_${todayStr}`;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = { ...t, postponeCount: (t.postponeCount || 0) + 1, updatedAt: Date.now() };
          saveToFirestore(() => safeSetDoc(doc(db, 'tasks', taskId), updated, { merge: true }));
          return updated;
        }
        return t;
      })
    );

    const newInstance: TaskInstance = {
      id: tomorrowInstId,
      uid: 'user-1',
      taskId,
      date: tomorrowStr,
      status: 'pending',
    };

    setTaskInstances((prev) => {
      const filtered = prev.filter((i) => !(i.taskId === taskId && (i.date === todayStr || i.date === tomorrowStr)));
      return [...filtered, newInstance];
    });

    saveToFirestore(async () => {
      await safeSetDoc(doc(db, 'taskInstances', tomorrowInstId), newInstance);
      await deleteDoc(doc(db, 'taskInstances', todayInstId)).catch(() => {});
    });
  };

  const addGoal = (goalData: Omit<Goal, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `g-${Date.now()}`,
      uid: 'user-1',
      status: goalData.status || 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setGoals((prev) => [...prev, newGoal]);
    saveToFirestore(() => safeSetDoc(doc(db, 'goals', newGoal.id), newGoal));
    return newGoal;
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const updated = { ...g, ...updates, updatedAt: Date.now() };
          saveToFirestore(() => safeSetDoc(doc(db, 'goals', goalId), updated, { merge: true }));
          return updated;
        }
        return g;
      })
    );
  };

  const deleteGoal = (goalId: string) => {
    const getGoalAndChildIds = (id: string, allGoals: Goal[]): string[] => {
      const children = allGoals.filter((g) => g.parentId === id);
      const childIds = children.flatMap((c) => getGoalAndChildIds(c.id, allGoals));
      return [id, ...childIds];
    };

    const idsToDelete = getGoalAndChildIds(goalId, goals);
    const idsToDeleteSet = new Set(idsToDelete);

    setGoals((prevGoals) => prevGoals.filter((g) => !idsToDeleteSet.has(g.id)));

    // Cascade delete KeyResults belonging to deleted goals
    setKeyResults((prevKrs) => {
      const krsToDelete = prevKrs.filter((kr) => idsToDeleteSet.has(kr.goalId));
      krsToDelete.forEach((kr) => {
        saveToFirestore(() => deleteDoc(doc(db, 'keyResults', kr.id)));
      });
      return prevKrs.filter((kr) => !idsToDeleteSet.has(kr.goalId));
    });

    idsToDelete.forEach((id) => {
      saveToFirestore(() => deleteDoc(doc(db, 'goals', id)));
    });

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.goalId === goalId ? { ...t, goalId: undefined, keyResultId: undefined, updatedAt: Date.now() } : t))
    );
  };

  const addKeyResult = (krData: Omit<KeyResult, 'id' | 'uid' | 'createdAt' | 'updatedAt'>): KeyResult => {
    const newKr: KeyResult = {
      ...krData,
      id: `kr-${Date.now()}`,
      uid: 'user-1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setKeyResults((prev) => [...prev, newKr]);
    saveToFirestore(() => safeSetDoc(doc(db, 'keyResults', newKr.id), newKr));
    return newKr;
  };

  const updateKeyResult = (krId: string, updates: Partial<KeyResult>) => {
    setKeyResults((prev) =>
      prev.map((kr) => {
        if (kr.id === krId) {
          const updated = { ...kr, ...updates, updatedAt: Date.now() };
          saveToFirestore(() => safeSetDoc(doc(db, 'keyResults', krId), updated, { merge: true }));
          return updated;
        }
        return kr;
      })
    );
  };

  const deleteKeyResult = (krId: string) => {
    setKeyResults((prev) => prev.filter((kr) => kr.id !== krId));
    saveToFirestore(() => deleteDoc(doc(db, 'keyResults', krId)));
  };

  const postponeMonthlyGoal = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const { newEndDate, newYear, newMonthStr } = getPostponedMonthlyEndDate(goal.endDate);

    let newParentId = goal.parentId;
    if (newYear) {
      let annualGoal = goals.find(
        (g) =>
          g.timeframe === 'annual' &&
          (g.targetYear === newYear || (g.endDate && new Date(g.endDate).getFullYear() === newYear))
      );
      if (!annualGoal) {
        annualGoal = addGoal({
          title: `יעד שנתי לשנת ${newYear}`,
          timeframe: 'annual',
          targetYear: newYear,
          endDate: getDefaultAnnualEndDate(newYear),
          category: goal.category || 'work',
          status: 'active',
        });
      }
      newParentId = annualGoal.id;
    }

    updateGoal(goalId, {
      endDate: newEndDate,
      targetMonth: newMonthStr,
      parentId: newParentId,
      updatedAt: Date.now(),
    });
  };

  const postponeAnnualGoal = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const { newEndDate, newYear } = getPostponedAnnualEndDate(goal.endDate, goal.targetYear);

    updateGoal(goalId, {
      endDate: newEndDate,
      targetYear: newYear,
      updatedAt: Date.now(),
    });
  };

  const addKrCheckin = (goalId: string, keyResultId: string, value: number, confidenceScore?: number, notes?: string) => {
    const today = getTodayDateString();
    const newCheckin: KrCheckin = {
      id: `checkin-${Date.now()}`,
      uid: 'user-1',
      goalId,
      keyResultId,
      value,
      confidenceScore,
      notes,
      date: today,
      createdAt: Date.now(),
    };
    setKrCheckins((prev) => [newCheckin, ...prev]);
    saveToFirestore(() => safeSetDoc(doc(db, 'krCheckins', newCheckin.id), newCheckin));
    
    // Update keyResult
    updateKeyResult(keyResultId, {
      current: value,
      ...(confidenceScore ? { confidenceScore } : {}),
      updatedAt: Date.now(),
    });
  };

  const saveWeeklyPlan = (planData: Omit<WeeklyPlan, 'id' | 'uid' | 'createdAt'>) => {
    const newPlan: WeeklyPlan = {
      ...planData,
      id: `wp-${Date.now()}`,
      uid: 'user-1',
      createdAt: Date.now(),
    };
    setWeeklyPlans((prev) => [newPlan, ...prev]);
    saveToFirestore(() => safeSetDoc(doc(db, 'weeklyPlans', newPlan.id), newPlan));
  };

  const performFreshStart = () => {
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
    saveToFirestore(() => safeSetDoc(doc(db, 'monthlyReports', newReport.id), newReport));
  };

  const clearAllData = () => {
    setTasks([]);
    setTaskInstances([]);
    setRawCaptures([]);
    setDailyStats([]);
    setGoals([]);
    setKeyResults([]);
    setReflections([]);
    setKrCheckins([]);
    setWeeklyPlans([]);
    setMonthlyReports([]);

    try {
      localStorage.removeItem('momentum_tasks');
      localStorage.removeItem('momentum_instances');
      localStorage.removeItem('momentum_captures');
      localStorage.removeItem('momentum_stats');
      localStorage.removeItem('momentum_goals');
      localStorage.removeItem('momentum_key_results');
      localStorage.removeItem('momentum_reflections');
      localStorage.removeItem('momentum_kr_checkins');
      localStorage.removeItem('momentum_weekly_plans');
      localStorage.removeItem('momentum_monthly_reports');
    } catch (e) {
      console.error('Failed to clear localStorage', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        taskInstances,
        rawCaptures,
        dailyStats,
        goals,
        keyResults,
        reflections,
        krCheckins,
        weeklyPlans,
        monthlyReports,
        syncStatus,
        lastSyncedAt,
        toggleTaskInstance,
        addRawCapture,
        deleteRawCapture,
        addTask,
        triageApprove,
        triageReject,
        addReflection,
        updateTask,
        deleteTask,
        postponeTaskToTomorrow,
        addGoal,
        updateGoal,
        deleteGoal,
        postponeMonthlyGoal,
        postponeAnnualGoal,
        addKeyResult,
        updateKeyResult,
        deleteKeyResult,
        addKrCheckin,
        saveWeeklyPlan,
        performFreshStart,
        saveMonthlyCloseReport,
        clearAllData,
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
