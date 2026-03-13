import { create } from "zustand";

import {
  fromDateKey,
  fromMonthKey,
  getTodayDateKey,
  toMonthKey,
} from "@/lib/date";
import { taskRepository } from "@/lib/db";
import {
  buildMarkerDateKeysForMonth,
  buildTaskListItemsForDate,
  isDateWithinMonth,
} from "@/lib/recurrence";
import { normalizeTaskTitle, validateTaskTitle } from "@/lib/task";
import type { TaskListItem } from "@/lib/types";

interface TaskState {
  error: string | null;
  items: TaskListItem[];
  loading: boolean;
  markerDateKeys: string[];
  markerMonthKey: string;
  mutating: boolean;
  recentTitles: string[];
  selectedDateKey: string;
}

interface TaskActions {
  clearError: () => void;
  createTask: (title: string) => Promise<void>;
  deleteTask: (item: TaskListItem) => Promise<void>;
  initialize: (dateKey?: string) => Promise<void>;
  loadMonthMarkers: (month: Date) => Promise<void>;
  refreshRecentTitles: () => Promise<void>;
  refreshSelectedDate: () => Promise<void>;
  selectDate: (dateKey: string) => Promise<void>;
  toggleTask: (item: TaskListItem) => Promise<void>;
}

type TaskStore = TaskState & TaskActions;

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

async function loadDateView(dateKey: string) {
  const [manualTasks, rules, overrides] = await Promise.all([
    taskRepository.getTasksForDate(dateKey),
    taskRepository.getEnabledRecurringRules(),
    taskRepository.getRecurringOverridesForDate(dateKey),
  ]);

  return buildTaskListItemsForDate({
    dateKey,
    manualTasks,
    overrides,
    rules,
  });
}

async function loadMarkerSnapshot(monthKey: string) {
  const month = fromMonthKey(monthKey);
  const [manualTasks, rules, overrides] = await Promise.all([
    taskRepository.getManualTasksInMonth(month),
    taskRepository.getEnabledRecurringRules(),
    taskRepository.getRecurringOverridesInMonth(month),
  ]);

  return buildMarkerDateKeysForMonth({
    manualTasks,
    overrides,
    rules,
    month,
  });
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  error: null,
  items: [],
  loading: true,
  markerDateKeys: [],
  markerMonthKey: toMonthKey(new Date()),
  mutating: false,
  recentTitles: [],
  selectedDateKey: getTodayDateKey(),

  clearError: () => {
    set({ error: null });
  },

  initialize: async (dateKey) => {
    const nextDateKey = dateKey ?? get().selectedDateKey;
    const monthKey = toMonthKey(fromDateKey(nextDateKey));

    set({
      error: null,
      loading: true,
      selectedDateKey: nextDateKey,
    });

    try {
      const [items, recentTitles, markerDateKeys] = await Promise.all([
        loadDateView(nextDateKey),
        taskRepository.getRecentTaskTitles(8),
        loadMarkerSnapshot(monthKey),
      ]);

      set({
        items,
        loading: false,
        markerDateKeys,
        markerMonthKey: monthKey,
        recentTitles,
        selectedDateKey: nextDateKey,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, "タスクを読み込めませんでした。"),
        loading: false,
        selectedDateKey: nextDateKey,
      });
    }
  },

  loadMonthMarkers: async (month) => {
    const markerMonthKey = toMonthKey(month);

    try {
      const markerDateKeys = await loadMarkerSnapshot(markerMonthKey);

      set({
        markerDateKeys,
        markerMonthKey,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, "カレンダーマーカーを読み込めませんでした。"),
      });
    }
  },

  refreshRecentTitles: async () => {
    const recentTitles = await taskRepository.getRecentTaskTitles(8);
    set({ recentTitles });
  },

  selectDate: async (dateKey) => {
    set({
      error: null,
      loading: true,
      selectedDateKey: dateKey,
    });

    try {
      const items = await loadDateView(dateKey);

      set({
        items,
        loading: false,
        selectedDateKey: dateKey,
      });

      if (!isDateWithinMonth(dateKey, fromMonthKey(get().markerMonthKey))) {
        await get().loadMonthMarkers(fromDateKey(dateKey));
      }
    } catch (error) {
      set({
        error: getErrorMessage(error, "選択した日のタスクを読み込めませんでした。"),
        loading: false,
        selectedDateKey: dateKey,
      });
    }
  },

  refreshSelectedDate: async () => {
    await get().selectDate(get().selectedDateKey);
  },

  createTask: async (title) => {
    const validationError = validateTaskTitle(title);

    if (validationError) {
      set({ error: validationError });
      throw new Error(validationError);
    }

    set({
      error: null,
      mutating: true,
    });

    try {
      const normalizedTitle = normalizeTaskTitle(title);

      await taskRepository.addTask({
        title: normalizedTitle,
        date: get().selectedDateKey,
        completed: false,
      });
      await taskRepository.upsertHistoryTitle(normalizedTitle);

      const selectedDateKey = get().selectedDateKey;
      const [items, recentTitles] = await Promise.all([
        loadDateView(selectedDateKey),
        taskRepository.getRecentTaskTitles(8),
      ]);

      const nextState: Partial<TaskStore> = {
        items,
        recentTitles,
      };

      if (isDateWithinMonth(selectedDateKey, fromMonthKey(get().markerMonthKey))) {
        nextState.markerDateKeys = await loadMarkerSnapshot(get().markerMonthKey);
      }

      set(nextState);
    } catch (error) {
      const message = getErrorMessage(error, "タスクを追加できませんでした。");
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ mutating: false });
    }
  },

  toggleTask: async (item) => {
    set({
      error: null,
      mutating: true,
    });

    try {
      if (item.source === "manual" && item.taskId) {
        await taskRepository.toggleTask(item.taskId);
      } else if (item.source === "recurring" && item.ruleId) {
        await taskRepository.setRecurringOccurrenceCompleted(
          item.ruleId,
          item.dateKey,
          !item.completed
        );
      }

      const items = await loadDateView(get().selectedDateKey);
      set({ items });
    } catch (error) {
      const message = getErrorMessage(error, "タスクの状態を更新できませんでした。");
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ mutating: false });
    }
  },

  deleteTask: async (item) => {
    set({
      error: null,
      mutating: true,
    });

    try {
      if (item.source === "manual" && item.taskId) {
        await taskRepository.deleteTask(item.taskId);
      } else if (item.source === "recurring" && item.ruleId) {
        await taskRepository.dismissRecurringOccurrence(item.ruleId, item.dateKey);
      }

      const selectedDateKey = get().selectedDateKey;
      const nextState: Partial<TaskStore> = {
        items: await loadDateView(selectedDateKey),
      };

      if (isDateWithinMonth(item.dateKey, fromMonthKey(get().markerMonthKey))) {
        nextState.markerDateKeys = await loadMarkerSnapshot(get().markerMonthKey);
      }

      set(nextState);
    } catch (error) {
      const message = getErrorMessage(error, "タスクを削除できませんでした。");
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ mutating: false });
    }
  },
}));
