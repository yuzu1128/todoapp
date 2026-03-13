"use client";

import { Gauge, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  formatDayNumber,
  formatSelectedDateLabel,
  formatWeekdayLabel,
  isTodayDateKey,
  toDateKey,
} from "@/lib/date";

export interface DateHeaderProps {
  completedTasks: number;
  onTodayClick?: () => void;
  selectedDate: Date;
  totalTasks: number;
}

export function DateHeader({
  completedTasks,
  onTodayClick,
  selectedDate,
  totalTasks,
}: DateHeaderProps) {
  const selectedDateKey = toDateKey(selectedDate);
  const isToday = isTodayDateKey(selectedDateKey);
  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const remainingTasks = Math.max(totalTasks - completedTasks, 0);

  return (
    <section
      className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(12,20,36,0.98),rgba(9,15,28,0.9))] shadow-[0_32px_70px_-42px_rgba(12,242,255,0.45)]"
      data-testid="date-header"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,rgba(12,242,255,0.16),transparent_55%)]" />

      <div className="relative grid gap-6 px-5 py-5 sm:grid-cols-[132px_minmax(0,1fr)]">
        <div className="rounded-[28px] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(12,242,255,0.16),rgba(7,17,31,0.22))] p-4 text-center shadow-[0_0_60px_-28px_rgba(12,242,255,0.9)]">
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-200">
            {isToday ? "Today" : "Focus"}
          </p>
          <p className="mt-4 font-display text-5xl leading-none text-white">
            {formatDayNumber(selectedDate)}
          </p>
          <p className="mt-3 text-sm text-slate-300">
            {formatWeekdayLabel(selectedDate)}
          </p>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
              {formatSelectedDateLabel(selectedDate)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">
              Scheduled {totalTasks}
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-display text-2xl tracking-[0.12em] text-white sm:text-3xl">
                Daily Signal
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {totalTasks === 0
                  ? "まだ予定はありません。新しいタスクを追加して今日の流れを作ります。"
                  : `${completedTasks}件完了、残り${remainingTasks}件です。`}
              </p>
            </div>

            {!isToday && onTodayClick ? (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-white/10 bg-white/5 text-slate-200 hover:bg-cyan-400/10 hover:text-white"
                onClick={onTodayClick}
              >
                今日へ戻る
              </Button>
            ) : null}
          </div>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-400">
              <span className="inline-flex items-center gap-2">
                <Gauge className="h-3.5 w-3.5 text-cyan-200" />
                Completion
              </span>
              <span>{completionRate}%</span>
            </div>
            <div className="mt-3 h-2.5 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,rgba(12,242,255,1),rgba(59,130,246,0.9))] transition-[width] duration-300"
                style={{
                  width:
                    totalTasks === 0
                      ? "0%"
                      : `${completionRate === 0 ? 4 : Math.max(completionRate, 8)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
