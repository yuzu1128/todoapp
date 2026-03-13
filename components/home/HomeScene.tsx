"use client";

import { useState } from "react";
import { Cpu, ListTodo, Plus, Radar, Sparkles } from "lucide-react";

import { AddTaskDialog } from "@/components/task/AddTaskDialog";
import { TaskList } from "@/components/task/TaskList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useHomeController } from "@/hooks/useHomeController";
import { formatShortDateLabel } from "@/lib/date";

function LoadingCard() {
  return (
    <div className="space-y-3 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
      <div className="h-6 w-40 animate-pulse rounded-full bg-white/10" />
      <div className="h-24 animate-pulse rounded-[24px] bg-white/5" />
      <div className="h-24 animate-pulse rounded-[24px] bg-white/5" />
    </div>
  );
}

export function HomeScene() {
  const {
    activeItems,
    clearError,
    closeDialog,
    completedItems,
    error,
    handleAddTask,
    handleDeleteTask,
    handleRetry,
    handleToggleTask,
    isDialogOpen,
    loading,
    mutating,
    openDialog,
    recentTitles,
    selectedDateLabel,
    todayDate,
    totalTasks,
    upcomingDateLabels,
  } = useHomeController();

  const completedCount = completedItems.length;
  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);
  const [draftTitle, setDraftTitle] = useState("");

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(145deg,rgba(10,18,34,0.95),rgba(6,10,22,0.9))] shadow-[0_34px_90px_-42px_rgba(12,242,255,0.35)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(12,242,255,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_34%)]" />
        <div className="relative grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.32em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              Home Nexus
            </div>
            <h1 className="mt-3 font-display text-3xl tracking-[0.16em] text-white sm:text-4xl">
              Today&apos;s Command Center
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              今日の予定、履歴、完了率を1画面で確認できます。タスクは手動追加と
              繰り返しルールの両方に対応しています。
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                className="rounded-full bg-[linear-gradient(135deg,rgba(12,242,255,0.96),rgba(59,130,246,0.9))] px-5 text-slate-950 shadow-[0_24px_50px_-24px_rgba(12,242,255,0.8)]"
                data-testid="open-add-task-dialog"
                disabled={mutating}
                onClick={() => {
                  setDraftTitle("");
                  openDialog();
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                クイック追加
              </Button>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                {selectedDateLabel}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: Radar,
                label: "Signal",
                value: `${completionRate}%`,
                detail: "今日の完了率",
              },
              {
                icon: ListTodo,
                label: "Queue",
                value: `${totalTasks}`,
                detail: "総タスク数",
              },
              {
                icon: Cpu,
                label: "Memory",
                value: `${recentTitles.length}`,
                detail: "履歴候補",
              },
            ].map((item) => (
              <Card
                key={item.label}
                className="overflow-hidden rounded-[24px] border-white/10 bg-white/[0.04] shadow-none"
              >
                <CardContent className="p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
                    <item.icon className="h-4.5 w-4.5" />
                  </div>
                  <p className="mt-3 text-[0.62rem] uppercase tracking-[0.26em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-1 font-display text-xl tracking-[0.08em] text-white">
                    {item.value}
                  </p>
                  <p className="mt-1 text-[0.7rem] leading-5 text-slate-400">
                    {item.detail}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_340px]">
        <Card className="rounded-[32px] border-white/10 bg-[rgba(8,14,27,0.88)] shadow-[0_28px_60px_-38px_rgba(12,242,255,0.28)]">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">
                  Today Queue
                </p>
                <h2 className="mt-2 font-display text-2xl tracking-[0.12em] text-white">
                  {formatShortDateLabel(todayDate)}
                </h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">
                {completedCount}/{totalTasks} done
              </div>
            </div>

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

        <div className="space-y-5">
          <Card className="rounded-[32px] border-white/10 bg-[rgba(8,14,27,0.88)] shadow-none">
            <CardContent className="p-5">
              <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">
                Memory Bank
              </p>
              <h3 className="mt-2 font-display text-xl tracking-[0.12em] text-white">
                最近使った候補
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {recentTitles.length > 0 ? (
                  recentTitles.map((title) => (
                    <button
                      key={title}
                      type="button"
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 transition hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-white"
                      onClick={() => {
                        setDraftTitle(title);
                        openDialog();
                      }}
                    >
                      {title}
                    </button>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-slate-400">
                    まだ履歴はありません。追加ダイアログで候補が蓄積されます。
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-white/10 bg-[rgba(8,14,27,0.88)] shadow-none">
            <CardContent className="p-5">
              <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">
                Horizon
              </p>
              <h3 className="mt-2 font-display text-xl tracking-[0.12em] text-white">
                次に見る日付
              </h3>
              <div className="mt-4 grid gap-3">
                {upcomingDateLabels.map((entry) => (
                  <div
                    key={entry.dateKey}
                    className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4"
                  >
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Outlook
                    </p>
                    <p className="mt-2 font-display text-xl tracking-[0.1em] text-white">
                      {formatShortDateLabel(entry.date)}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      カレンダータブで選択して、個別の一覧とマーカーを確認できます。
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <AddTaskDialog
        error={error}
        initialTitle={draftTitle}
        isOpen={isDialogOpen}
        isSubmitting={mutating}
        onAddTask={handleAddTask}
        onClearError={clearError}
        onClose={() => {
          setDraftTitle("");
          closeDialog();
        }}
        recentTitles={recentTitles}
        selectedDateLabel={selectedDateLabel}
      />
    </div>
  );
}
