"use client";

import { Sparkles } from "lucide-react";

import { CalendarView } from "@/components/calendar/CalendarView";
import { FloatingActionBar } from "@/components/home/FloatingActionBar";
import { SummaryMetrics } from "@/components/home/SummaryMetrics";
import { TaskPanel } from "@/components/home/TaskPanel";
import { AddTaskDialog } from "@/components/task/AddTaskDialog";
import { Card, CardContent } from "@/components/ui/card";
import { useHomeController } from "@/hooks/useHomeController";

export default function Home() {
  const {
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
    taskDates,
    totalTasks,
    setCurrentMonth,
  } = useHomeController();

  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#edf4ff_48%,#eef2f7_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_55%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_48%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white/88 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.65)] backdrop-blur-xl">
          <div className="border-b border-slate-200/80 px-5 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-sky-700">
                  Daily Planner
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  ToDoApp
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                  日付ごとにタスクを整理して、今日やることを見失わないための
                  小さな作業ハブです。カレンダーと進捗を同じ画面で確認できます。
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3.5 py-2 text-sm font-medium text-sky-700 ring-1 ring-inset ring-sky-200">
                <Sparkles className="h-4 w-4" />
                オフライン対応
              </div>
            </div>

            <SummaryMetrics
              completedTaskCount={completedTaskCount}
              completionRate={completionRate}
              remainingTasks={remainingTasks}
              scheduledDays={taskDates.length}
              totalTasks={totalTasks}
            />
          </div>

          <div className="grid gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:px-8">
            <Card
              className="overflow-hidden rounded-[28px] border-sky-100 bg-slate-50/80 shadow-none"
              data-testid="calendar-card"
            >
              <div className="border-b border-slate-200/70 px-5 py-4">
                <p className="text-sm font-semibold text-slate-900">カレンダー</p>
                <p className="mt-1 text-sm text-slate-500">
                  選択中の日付を切り替えながら、タスクがある日を青いドットで確認できます。
                </p>
              </div>
              <CardContent className="p-4">
                <CalendarView
                  onDateSelect={handleDateSelect}
                  selectedDate={selectedDate}
                  taskDates={taskDates}
                  currentMonth={currentMonth}
                  onMonthChange={setCurrentMonth}
                />
              </CardContent>
            </Card>

            <TaskPanel
              activeTasks={activeTasks}
              completedTaskCount={completedTaskCount}
              completedTasks={completedTasks}
              error={error}
              loading={loading}
              mutating={mutating}
              onDeleteTask={handleDeleteTask}
              onRetry={handleRetry}
              onTodayClick={handleTodayClick}
              onToggleTask={handleToggleTask}
              selectedDate={selectedDate}
              totalTasks={totalTasks}
            />
          </div>
        </section>
      </div>

      <FloatingActionBar
        isBusy={loading || mutating}
        onOpenDialog={openDialog}
        remainingTasks={remainingTasks}
      />

      <AddTaskDialog
        error={error}
        isOpen={isDialogOpen}
        isSubmitting={mutating}
        onClearError={clearError}
        onClose={closeDialog}
        onAddTask={handleAddTask}
        selectedDateLabel={selectedDateLabel}
      />
    </main>
  );
}
