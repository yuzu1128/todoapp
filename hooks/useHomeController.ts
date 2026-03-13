"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

import { fromDateKey, toDateKey } from "@/lib/date";
import { useTaskStore } from "@/stores/taskStore";

export function useHomeController() {
  const tasks = useTaskStore((state) => state.tasks);
  const selectedDateKey = useTaskStore((state) => state.selectedDateKey);
  const taskDates = useTaskStore((state) => state.taskDates);
  const loading = useTaskStore((state) => state.loading);
  const mutating = useTaskStore((state) => state.mutating);
  const error = useTaskStore((state) => state.error);
  const initialize = useTaskStore((state) => state.initialize);
  const selectDate = useTaskStore((state) => state.selectDate);
  const refreshSelectedDate = useTaskStore((state) => state.refreshSelectedDate);
  const createTask = useTaskStore((state) => state.createTask);
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const clearError = useTaskStore((state) => state.clearError);

  const selectedDate = fromDateKey(selectedDateKey);
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const totalTasks = tasks.length;
  const completedTaskCount = completedTasks.length;
  const remainingTasks = activeTasks.length;
  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completedTaskCount / totalTasks) * 100);

  const selectedDateLabel = format(selectedDate, "M月d日（EEE）", { locale: ja });

  const handleDateSelect = (date: Date) => {
    setCurrentMonth(date);
    void selectDate(toDateKey(date));
  };

  const handleTodayClick = () => {
    const today = new Date();
    setCurrentMonth(today);
    void selectDate(toDateKey(today));
  };

  const handleRetry = () => {
    void refreshSelectedDate();
  };

  const handleAddTask = async (title: string) => {
    try {
      await createTask(title);
      return true;
    } catch {
      return false;
    }
  };

  const handleToggleTask = (id: string) => {
    void toggleTask(id);
  };

  const handleDeleteTask = (id: string) => {
    void deleteTask(id);
  };

  const openDialog = () => {
    clearError();
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    clearError();
    setIsDialogOpen(false);
  };

  return {
    activeTasks,
    clearError,
    closeDialog,
    completedTaskCount,
    completedTasks,
    completionRate,
    currentMonth,
    error,
    handleAddTask,
    handleDateSelect,
    handleDeleteTask,
    handleRetry,
    handleTodayClick,
    handleToggleTask,
    isDialogOpen,
    loading,
    mutating,
    openDialog,
    remainingTasks,
    selectedDate,
    selectedDateLabel,
    setCurrentMonth,
    taskDates,
    totalTasks,
  };
}
