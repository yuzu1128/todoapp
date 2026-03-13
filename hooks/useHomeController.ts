"use client";

import { useEffect, useState } from "react";
import { addDays } from "date-fns";

import {
  formatSelectedDateLabel,
  fromDateKey,
  getTodayDateKey,
  toDateKey,
} from "@/lib/date";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useTaskStore } from "@/stores/taskStore";

export function useHomeController() {
  const todayKey = getTodayDateKey();
  const items = useTaskStore((state) => state.items);
  const recentTitles = useTaskStore((state) => state.recentTitles);
  const loading = useTaskStore((state) => state.loading);
  const mutating = useTaskStore((state) => state.mutating);
  const error = useTaskStore((state) => state.error);
  const initialize = useTaskStore((state) => state.initialize);
  const clearError = useTaskStore((state) => state.clearError);
  const createTask = useTaskStore((state) => state.createTask);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const selectDate = useTaskStore((state) => state.selectDate);
  const refreshSelectedDate = useTaskStore((state) => state.refreshSelectedDate);
  const { play } = useSoundEffects();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const todayDate = fromDateKey(todayKey);

  useEffect(() => {
    void initialize(todayKey);
  }, [initialize, todayKey]);

  const activeItems = items.filter((item) => !item.completed);
  const completedItems = items.filter((item) => item.completed);

  return {
    activeItems,
    completedItems,
    error,
    isDialogOpen,
    loading,
    mutating,
    recentTitles,
    selectedDateLabel: formatSelectedDateLabel(todayDate),
    todayDate,
    todayKey,
    totalTasks: items.length,
    openDialog: () => {
      clearError();
      setIsDialogOpen(true);
      play("dialog");
    },
    closeDialog: () => {
      clearError();
      setIsDialogOpen(false);
      play("dialog");
    },
    clearError,
    handleAddTask: async (title: string) => {
      try {
        await createTask(title);
        play("success");
        return true;
      } catch {
        return false;
      }
    },
    handleToggleTask: async (item: (typeof items)[number]) => {
      try {
        await toggleTask(item);
        play("toggle");
      } catch {
        return false;
      }

      return true;
    },
    handleDeleteTask: async (item: (typeof items)[number]) => {
      try {
        await deleteTask(item);
        play("dismiss");
      } catch {
        return false;
      }

      return true;
    },
    handleRetry: () => {
      void refreshSelectedDate();
    },
    upcomingDateLabels: [addDays(todayDate, 1), addDays(todayDate, 2)].map((date) => ({
      date,
      dateKey: toDateKey(date),
    })),
    focusToday: async () => {
      await selectDate(todayKey);
    },
  };
}
