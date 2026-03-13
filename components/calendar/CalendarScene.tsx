"use client";

import { CalendarRange, Plus } from "lucide-react";

import { CalendarView } from "@/components/calendar/CalendarView";
import { DateHeader } from "@/components/calendar/DateHeader";
import { AddTaskDialog } from "@/components/task/AddTaskDialog";
import { TaskList } from "@/components/task/TaskList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCalendarController } from "@/hooks/useCalendarController";

function LoadingCard() {
  return (
    <div className="space-y-3 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
      <div className="h-6 w-40 animate-pulse rounded-full bg-white/10" />
      <div className="h-24 animate-pulse rounded-[24px] bg-white/5" />
      <div className="h-24 animate-pulse rounded-[24px] bg-white/5" />
    </div>
  );
}

export function CalendarScene() {
  const {
    activeItems,
    clearError,
    completedItems,
    completedTaskCount,
    closeDialog,
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
    markerDateKeys,
    mutating,
    openDialog,
    recentTitles,
    selectedDate,
    selectedDateLabel,
    setCurrentMonth,
    totalTasks,
  } = useCalendarController();

  return (
    <div className="space-y-6" data-testid="calendar-page">
      <section className="overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(145deg,rgba(10,18,34,0.95),rgba(6,10,22,0.9))] shadow-[0_34px_90px_-42px_rgba(12,242,255,0.3)]">
        <div className="relative flex flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.32em] text-cyan-200">
              <CalendarRange className="h-3.5 w-3.5" />
              Calendar Grid
            </div>
            <h1 className="mt-4 font-display text-3xl tracking-[0.16em] text-white sm:text-4xl">
              Date Matrix
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              日付セル、選択ヘッダー、タスクリストを同じビジュアル言語で統一しました。
              カレンダーマーカーには手動タスクと繰り返しタスクの両方が反映されます。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              {selectedDateLabel}
            </div>
            <Button
              className="rounded-full bg-[linear-gradient(135deg,rgba(12,242,255,0.96),rgba(59,130,246,0.9))] px-5 text-slate-950 shadow-[0_24px_50px_-24px_rgba(12,242,255,0.8)]"
              data-testid="open-add-task-dialog"
              disabled={mutating}
              onClick={openDialog}
            >
              <Plus className="mr-2 h-4 w-4" />
              タスク追加
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <Card className="rounded-[32px] border-white/10 bg-[rgba(8,14,27,0.88)] shadow-[0_28px_60px_-38px_rgba(12,242,255,0.28)]">
          <CardContent className="p-5 sm:p-6">
            <CalendarView
              currentMonth={currentMonth}
              markerDateKeys={markerDateKeys}
              onDateSelect={handleDateSelect}
              onMonthChange={setCurrentMonth}
              selectedDate={selectedDate}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <DateHeader
            completedTasks={completedTaskCount}
            onTodayClick={handleTodayClick}
            selectedDate={selectedDate}
            totalTasks={totalTasks}
          />

          <Card className="rounded-[32px] border-white/10 bg-[rgba(8,14,27,0.88)] shadow-none">
            <CardContent className="p-5 sm:p-6">
              {error ? (
                <div className="mb-5 rounded-[22px] border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">
                  <p>{error}</p>
                  <Button
                    variant="ghost"
                    className="mt-3 rounded-full px-0 text-rose-100 hover:bg-transparent hover:text-white"
                    onClick={handleRetry}
                  >
                    再読み込み
                  </Button>
                </div>
              ) : null}

              {loading ? (
                <LoadingCard />
              ) : (
                <TaskList
                  activeItems={activeItems}
                  completedItems={completedItems}
                  isMutating={mutating}
                  onDeleteTask={handleDeleteTask}
                  onToggleTask={handleToggleTask}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <AddTaskDialog
        error={error}
        isOpen={isDialogOpen}
        isSubmitting={mutating}
        onAddTask={handleAddTask}
        onClearError={clearError}
        onClose={closeDialog}
        recentTitles={recentTitles}
        selectedDateLabel={selectedDateLabel}
      />
    </div>
  );
}
