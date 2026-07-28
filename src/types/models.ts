export interface Goal {
  id: string;
  uid: string; // The user ID owning the goal
  title: string;
  description?: string;
  timeframe?: 'annual' | 'monthly';
  parentId?: string; // Links monthly -> annual
  targetYear?: number; // e.g. 2026
  targetMonth?: string; // e.g. '2026-07'
  endDate?: string; // ISO date string or YYYY-MM-DD
  krTitle?: string; // Key Result description
  krTarget?: number;
  krCurrent?: number;
  krUnit?: string;
  effortTargetPoints?: number;
  effortCompletedPoints?: number;
  lastPointsAssignedAt?: number; // timestamp for starve detection (2 weeks = 14 days)
  category?: 'work' | 'personal' | 'health' | 'maintenance';
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'completed' | 'archived';
}

export interface Task {
  id: string;
  uid: string;
  goalId?: string;
  title: string;
  description?: string;
  type: 'daily' | 'one-off' | 'recurring';
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
  weight?: number; // 1-5 scale
  estimatedMinutes?: number;
  category?: 'work' | 'personal' | 'health' | 'maintenance' | 'habit';
  when?: string; // Implementation intention: trigger/time
  where?: string; // Implementation intention: location/context
  streakCount?: number; // For habits
  postponeCount?: number; // Number of times task was postponed to tomorrow
  isHabit?: boolean;
  isMaintenance?: boolean;
}

export interface TaskInstance {
  id: string;
  uid: string;
  taskId: string;
  date: string; // YYYY-MM-DD
  completedAt?: number;
  status: 'pending' | 'completed' | 'skipped';
}

export interface RawCaptureItem {
  id: string;
  uid: string;
  content: string;
  createdAt: number;
  audioUrl?: string;
  audioDuration?: number;
  status: 'inbox' | 'triaged' | 'discarded';
  suggestedBreakdown?: {
    title: string;
    weight: 1 | 2 | 3 | 4 | 5;
    estimatedMinutes: number;
    type: 'daily' | 'one-off' | 'recurring';
    category: 'work' | 'personal' | 'health' | 'maintenance' | 'habit';
    goalId?: string;
    when?: string;
    where?: string;
    aiRationale?: string;
  };
}

export interface DailyStats {
  id: string;
  uid: string;
  date: string; // YYYY-MM-DD
  tasksCompleted: number;
  totalTasks: number;
  dailyQuota: number;
  adherence: number;
  focusRatio: number;
  createdAt: number;
}

export interface KrCheckin {
  id: string;
  uid: string;
  goalId: string;
  value: number;
  notes?: string;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface AnalysisReport {
  id: string;
  uid: string;
  dateRange: {
    start: string;
    end: string;
  };
  metrics: {
    rollingAdherence: number;
    focusRatio: number;
  };
  insights: string[];
  createdAt: number;
}

export interface EndOfDayReflection {
  id: string;
  date: string;
  wins: string;
  learnings: string;
  tomorrowPriorities: string[];
  tasksCompletedCount: number;
  adherenceScore: number;
  createdAt: number;
}

export interface WeeklyPlan {
  id: string;
  uid: string;
  weekStartDate: string; // YYYY-MM-DD
  totalQuotaPoints: number;
  capacityLimit: number;
  goalAllocations: { goalId: string; allocatedPoints: number }[];
  freshStartCompleted: boolean;
  aiReport?: {
    summary: string;
    recommendations: string[];
    riskAssessment: string;
    generatedAt: number;
  };
  createdAt: number;
}

export interface MonthlyCloseReport {
  id: string;
  uid: string;
  month: string; // YYYY-MM
  checkins: KrCheckin[];
  aiAnalysis: {
    summary: string;
    highRoiGoals: string[];
    starvedGoals: string[];
    effortOutcomeCorrelation: number; // 0 to 1 scale
    strategicAdvice: string[];
  };
  createdAt: number;
}
