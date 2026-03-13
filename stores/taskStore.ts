import { create } from "zustand";

import { taskRepository } from "@/lib/db";
import { toDateKey } from "@/lib/date";
import { normalizeTaskTitle, validateTaskTitle } from "@/lib/task";
import type { Task } from "@/lib/types";

interface TaskState {
  error: string | null;
  loading: boolean;
  mutating: boolean;
  tasks: Task[];
  selectedDateKey: string;
  taskDates: string[];
}

interface TaskActions {
  clearError: () => void;
  createTask: (title: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  initialize: () => Promise<void>;
  refreshSelectedDate: () => Promise<void>;
  selectDate: (dateKey: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
}

type TaskStore = TaskState & TaskActions;

let latestSnapshotRequestId = 0;

const getTodayDate = (): string => {
  return toDateKey(new Date());
};

const getErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

const loadSnapshot = async (selectedDateKey: string) => {
  const [tasks, taskDates] = await Promise.all([
    taskRepository.getByDate(selectedDateKey),
    taskRepository.getTaskDates(),
  ]);

  return { tasks, taskDates };
};

const syncSnapshot = async (
  dateKey: string,
  set: (partial: Partial<TaskStore>) => void,
  fallbackMessage: string
) => {
  const requestId = ++latestSnapshotRequestId;

  set({
    error: null,
    loading: true,
    selectedDateKey: dateKey,
  });

  try {
    const snapshot = await loadSnapshot(dateKey);

    if (requestId === latestSnapshotRequestId) {
      set({
        loading: false,
        selectedDateKey: dateKey,
        ...snapshot,
      });
    }
  } catch (error) {
    if (requestId === latestSnapshotRequestId) {
      set({
        error: getErrorMessage(error, fallbackMessage),
        loading: false,
        selectedDateKey: dateKey,
      });
    }

    throw error;
  }
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  error: null,
  loading: true,
  mutating: false,
  tasks: [],
  selectedDateKey: getTodayDate(),
  taskDates: [],

  clearError: () => {
    set({ error: null });
  },

  initialize: async () => {
    await syncSnapshot(
      get().selectedDateKey,
      set,
      "今日のタスクを読み込めませんでした。"
    );
  },

  selectDate: async (dateKey: string) => {
    await syncSnapshot(
      dateKey,
      set,
      "選択した日のタスクを読み込めませんでした。"
    );
  },

  refreshSelectedDate: async () => {
    await syncSnapshot(
      get().selectedDateKey,
      set,
      "タスク一覧を最新の状態に更新できませんでした。"
    );
  },

  createTask: async (title: string) => {
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
      const { selectedDateKey } = get();

      await taskRepository.add({
        title: normalizedTitle,
        date: selectedDateKey,
        completed: false,
      });

      await syncSnapshot(
        selectedDateKey,
        set,
        "タスク一覧を更新できませんでした。"
      );
    } catch (error) {
      const message = getErrorMessage(error, "タスクを追加できませんでした。");
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ mutating: false });
    }
  },

  toggleTask: async (id: string) => {
    set({
      error: null,
      mutating: true,
    });

    try {
      await taskRepository.toggle(id);
      await syncSnapshot(
        get().selectedDateKey,
        set,
        "タスク一覧を更新できませんでした。"
      );
    } catch (error) {
      const message = getErrorMessage(
        error,
        "タスクの状態を更新できませんでした。"
      );
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ mutating: false });
    }
  },

  deleteTask: async (id: string) => {
    set({
      error: null,
      mutating: true,
    });

    try {
      await taskRepository.delete(id);
      await syncSnapshot(
        get().selectedDateKey,
        set,
        "タスク一覧を更新できませんでした。"
      );
    } catch (error) {
      const message = getErrorMessage(error, "タスクを削除できませんでした。");
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ mutating: false });
    }
  },
}));
