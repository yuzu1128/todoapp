"use client";

import type { ReactNode } from "react";
import { CheckCircle2, Clock3, Orbit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { describeRecurringRule } from "@/lib/recurrence";
import type { TaskListItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskListProps {
  activeItems: TaskListItem[];
  completedItems: TaskListItem[];
  isMutating?: boolean;
  onDeleteTask: (item: TaskListItem) => Promise<unknown> | unknown;
  onToggleTask: (item: TaskListItem) => Promise<unknown> | unknown;
  scrollClassName?: string;
}

interface TaskSectionProps {
  description: string;
  emptyMessage: string;
  icon: ReactNode;
  isMutating: boolean;
  items: TaskListItem[];
  onDeleteTask: (item: TaskListItem) => Promise<unknown> | unknown;
  onToggleTask: (item: TaskListItem) => Promise<unknown> | unknown;
  testId: string;
  title: string;
}

function getSourceLabel(item: TaskListItem): string {
  if (item.source === "manual") {
    return "Manual";
  }

  return describeRecurringRule({
    id: item.ruleId ?? "temp",
    title: item.title,
    frequency: item.recurringFrequency ?? "daily",
    weekdays: item.recurringWeekdays ?? [],
    enabled: true,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  });
}

function TaskSection({
  description,
  emptyMessage,
  icon,
  isMutating,
  items,
  onDeleteTask,
  onToggleTask,
  testId,
  title,
}: TaskSectionProps) {
  return (
    <section className="space-y-3" data-testid={testId}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-200 shadow-[0_0_30px_-20px_rgba(12,242,255,0.7)]">
            {icon}
          </div>
          <div>
            <h3 className="font-display text-lg tracking-[0.12em] text-white">
              {title}
            </h3>
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          </div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-5 py-5 text-sm leading-6 text-slate-400">
          {emptyMessage}
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="group flex items-center gap-3 rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-3.5 shadow-[0_24px_40px_-36px_rgba(12,242,255,0.45)] transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30"
              data-testid="task-item"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
                <Checkbox
                  checked={item.completed}
                  aria-label={`${item.title}の完了状態を切り替える`}
                  className="h-5 w-5 rounded-md border-slate-500 data-[state=checked]:border-cyan-300 data-[state=checked]:bg-cyan-300 data-[state=checked]:text-slate-950"
                  disabled={isMutating}
                  onCheckedChange={() => onToggleTask(item)}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={cn(
                      "truncate text-sm font-medium text-slate-100 transition-colors",
                      item.completed && "text-slate-500 line-through"
                    )}
                  >
                    {item.title}
                  </p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-cyan-200">
                    {getSourceLabel(item)}
                  </span>
                </div>
                <p className="mt-1 text-[0.68rem] uppercase tracking-[0.24em] text-slate-500">
                  {item.completed ? "Completed" : "Queued"}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                aria-label={
                  item.source === "manual"
                    ? `${item.title}を削除`
                    : `${item.title}をこの日だけ非表示`
                }
                className="rounded-2xl text-slate-400 hover:bg-rose-400/10 hover:text-rose-200"
                disabled={isMutating}
                onClick={() => onDeleteTask(item)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function TaskList({
  activeItems,
  completedItems,
  isMutating = false,
  onDeleteTask,
  onToggleTask,
  scrollClassName,
}: TaskListProps) {
  if (activeItems.length === 0 && completedItems.length === 0) {
    return (
      <div
        className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-10 text-center"
        data-testid="task-list-empty"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-cyan-300/20 bg-cyan-400/10 text-cyan-200 shadow-[0_0_40px_-18px_rgba(12,242,255,0.8)]">
          <Orbit className="h-7 w-7" />
        </div>
        <h3 className="mt-5 font-display text-xl tracking-[0.12em] text-white">
          No Tasks Online
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          まだ予定がありません。追加ボタンから今日のタスクを登録してください。
        </p>
      </div>
    );
  }

  const content = (
    <div className="space-y-6">
      <TaskSection
        title="Active Queue"
        description="これから着手するタスクです。"
        emptyMessage="未完了タスクはありません。新しい予定を追加するか、完了済みの履歴を確認してください。"
        icon={<Clock3 className="h-4 w-4" />}
        isMutating={isMutating}
        items={activeItems}
        onDeleteTask={onDeleteTask}
        onToggleTask={onToggleTask}
        testId="active-task-section"
      />
      <TaskSection
        title="Completed Log"
        description="完了したタスクがここに移動します。"
        emptyMessage="完了済みのタスクはまだありません。"
        icon={<CheckCircle2 className="h-4 w-4" />}
        isMutating={isMutating}
        items={completedItems}
        onDeleteTask={onDeleteTask}
        onToggleTask={onToggleTask}
        testId="completed-task-section"
      />
    </div>
  );

  if (!scrollClassName) {
    return content;
  }

  return (
    <ScrollArea className={cn("pr-3", scrollClassName)}>
      {content}
    </ScrollArea>
  );
}
