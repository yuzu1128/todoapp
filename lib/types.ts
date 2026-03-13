export type RecurringFrequency = "daily" | "weekly";
export type TaskSource = "manual" | "recurring";

export interface Task {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface TaskHistoryEntry {
  title: string;
  lastUsedAt: number;
  useCount: number;
}

export interface RecurringRule {
  id: string;
  title: string;
  frequency: RecurringFrequency;
  weekdays: number[];
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface RecurringOverride {
  ruleId: string;
  dateKey: string;
  completed: boolean;
  dismissed: boolean;
  updatedAt: number;
}

export interface AppSettings {
  key: "app";
  soundEnabled: boolean;
  updatedAt: number;
}

export interface TaskListItem {
  id: string;
  title: string;
  dateKey: string;
  completed: boolean;
  source: TaskSource;
  createdAt: number;
  updatedAt: number;
  taskId?: string;
  ruleId?: string;
  recurringFrequency?: RecurringFrequency;
  recurringWeekdays?: number[];
}
