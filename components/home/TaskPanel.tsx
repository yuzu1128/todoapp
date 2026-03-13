import { AlertCircle, ListTodo, LoaderCircle, RefreshCcw } from "lucide-react";

import { DateHeader } from "@/components/calendar/DateHeader";
import { TaskList } from "@/components/task/TaskList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Task } from "@/lib/types";

interface TaskPanelProps {
  activeTasks: Task[];
  completedTaskCount: number;
  completedTasks: Task[];
  error: string | null;
  loading: boolean;
  mutating: boolean;
  onDeleteTask: (id: string) => void;
  onRetry: () => void;
  onTodayClick: () => void;
  onToggleTask: (id: string) => void;
  selectedDate: Date;
  totalTasks: number;
}

export function TaskPanel({
  activeTasks,
  completedTaskCount,
  completedTasks,
  error,
  loading,
  mutating,
  onDeleteTask,
  onRetry,
  onTodayClick,
  onToggleTask,
  selectedDate,
  totalTasks,
}: TaskPanelProps) {
  const remainingTasks = activeTasks.length;

  return (
    <div className="space-y-4">
      <DateHeader
        selectedDate={selectedDate}
        totalTasks={totalTasks}
        completedTasks={completedTaskCount}
        onTodayClick={onTodayClick}
      />

      {error ? (
        <div
          className="flex flex-col gap-3 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-900 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-rose-200 bg-white text-rose-700 hover:bg-rose-100 hover:text-rose-800"
            onClick={onRetry}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            再試行
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div
          className="flex items-center gap-3 rounded-[24px] border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800"
          aria-live="polite"
        >
          <LoaderCircle className="h-4 w-4 animate-spin" />
          選択中の日付のタスクを読み込んでいます。
        </div>
      ) : null}

      <Card className="overflow-hidden rounded-[28px] border-slate-200/80 bg-white shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-3 border-b border-slate-200/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">その日のタスク</p>
            <p className="mt-1 text-sm text-slate-500">
              {totalTasks === 0
                ? "未完了と完了済みを分けて、1日の見通しを作れます。"
                : `${completedTaskCount}件完了 / ${totalTasks}件`}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
            <ListTodo className="h-4 w-4" />
            {mutating
              ? "保存中..."
              : remainingTasks === 0
                ? "残タスクなし"
                : `残り ${remainingTasks}件`}
          </div>
        </div>

        <CardContent className="p-5">
          <TaskList
            activeTasks={activeTasks}
            completedTasks={completedTasks}
            isMutating={mutating}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
          />
        </CardContent>
      </Card>
    </div>
  );
}
