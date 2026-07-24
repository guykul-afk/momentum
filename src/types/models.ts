export interface Goal {
  id: string;
  uid: string; // The user ID owning the goal
  title: string;
  description?: string;
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
}

export interface TaskInstance {
  id: string;
  uid: string;
  taskId: string;
  date: string; // YYYY-MM-DD
  completedAt?: number;
  status: 'pending' | 'completed' | 'skipped';
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
