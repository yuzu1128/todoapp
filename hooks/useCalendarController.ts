"use client";

import { useEffect, useState } from "react";

import {
  formatSelectedDateLabel,
  fromDateKey,
  getTodayDateKey,
  toDateKey,
} from "@/lib/date";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useTaskStore } from "@/stores/taskStore";

export function useCalendarController() {
  const items = useTaskStore((state) => state.items);
  const selectedDateKey = useTaskStore((state) => state.selectedDateKey);
  const markerDateKeys = useTaskStore((state) => state.markerDateKeys);
  const recentTitles = useTaskStore((state) => state.recentTitles);
  const loading = useTaskStore((state) => state.loading);
  const mutating = useTaskStore((state) => state.mutating);
  const error = useTaskStore((state) => state.error);
  const initialize = useTaskStore((state) => state.initialize);
  const clearError = useTaskStore((state) => state.clearError);
  const createTask = useTaskStore((state) => state.createTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const loadMonthMarkers = useTaskStore((state) => state.loadMonthMarkers);
  const refreshSelectedDate = useTaskStore((state) => state.refreshSelectedDate);
  const selectDate = useTaskStore((state) => state.selectDate);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const { play } = useSoundEffects();

  const selectedDate = fromDateKey(selectedDateKey);
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    void initialize(selectedDateKey);
    setCurrentMonth(fromDateKey(selectedDateKey));
  }, [initialize, selectedDateKey]);

  const activeItems = items.filter((item) => !item.completed);
  const completedItems = items.filter((item) => item.completed);

  return {
    activeItems,
    clearError,
    completedItems,
    currentMonth,
    error,
    isDialogOpen,
    loading,
    markerDateKeys,
    mutating,
    recentTitles,
    selectedDate,
    selectedDateKey,
    selectedDateLabel: formatSelectedDateLabel(selectedDate),
    setCurrentMonth: (date: Date) => {
      setCurrentMonth(date);
      void loadMonthMarkers(date);
    },
    totalTasks: items.length,
    completedTaskCount: completedItems.length,
    openDialog: () => {
      clearError();
      setIsDialogOpen(true);
      play("dialog");
    },
    closeDialog: () => {
      clearError();
      setIsDialogOpen(false);
    },
    handleDateSelect: async (date: Date) => {
      setCurrentMonth(date);
      await loadMonthMarkers(date);
      await selectDate(toDateKey(date));
    },
    handleTodayClick: async () => {
      const todayKey = getTodayDateKey();
      const today = fromDateKey(todayKey);
      setCurrentMonth(today);
      await loadMonthMarkers(today);
      await selectDate(todayKey);
    },
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
  };
}
