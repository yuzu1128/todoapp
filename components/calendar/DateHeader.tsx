import * as React from "react";
import { format, isSameDay } from "date-fns";
import { ja } from "date-fns/locale";

import { Button } from "@/components/ui/button";

export interface DateHeaderProps {
  selectedDate: Date;
  totalTasks: number;
  completedTasks: number;
  onTodayClick: () => void;
}

export function DateHeader({
  selectedDate,
  totalTasks,
  completedTasks,
  onTodayClick,
}: DateHeaderProps) {
  const isToday = isSameDay(selectedDate, new Date());
  const formattedDate = format(selectedDate, "M月d日（EEE）", { locale: ja });
  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const helperText =
    totalTasks === 0
      ? "まだ予定は空です。小さなタスクから始めましょう。"
      : `${completedTasks}件完了、残り${totalTasks - completedTasks}件です。`;

  return (
    <div
      className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(240,249,255,0.98),rgba(255,255,255,0.92))] shadow-[0_18px_48px_-36px_rgba(14,165,233,0.55)]"
      data-testid="date-header"
    >
      <div className="px-5 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 ring-1 ring-inset ring-sky-100">
                {isToday ? "Today" : "Selected"}
              </span>
              <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium text-slate-600">
                {totalTasks === 0
                  ? "No tasks yet"
                  : `${completedTasks}/${totalTasks} 完了`}
              </span>
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              {formattedDate}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{helperText}</p>
          </div>

          {!isToday && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-slate-200 bg-white/90 px-4"
              onClick={onTodayClick}
            >
              今日へ戻る
            </Button>
          )}
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-medium tracking-[0.18em] text-slate-400">
            <span>進捗</span>
            <span>{completionRate}%</span>
          </div>
          <div className="mt-2 h-2.5 rounded-full bg-white/80 ring-1 ring-inset ring-slate-200/70">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#0ea5e9,#38bdf8,#7dd3fc)] transition-[width] duration-300"
              style={{
                width:
                  totalTasks === 0
                    ? "0%"
                    : `${completionRate === 0 ? 0 : Math.max(completionRate, 8)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
