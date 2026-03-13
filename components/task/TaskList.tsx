import { CheckCircle2, Clock3, ListTodo, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskListProps {
  activeTasks: Task[];
  completedTasks: Task[];
  isMutating?: boolean;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

interface TaskSectionProps {
  description: string;
  emptyMessage: string;
  icon: React.ReactNode;
  isMutating: boolean;
  tasks: Task[];
  testId: string;
  title: string;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
}

function TaskSection({
  description,
  emptyMessage,
  icon,
  isMutating,
  tasks,
  testId,
  title,
  onDeleteTask,
  onToggleTask,
}: TaskSectionProps) {
  return (
    <section className="space-y-3" data-testid={testId}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 ring-1 ring-slate-200/80">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {tasks.length}件
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
          {emptyMessage}
        </div>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="group flex items-center gap-3 rounded-[24px] border border-slate-200/80 bg-white p-3.5 shadow-[0_16px_32px_-28px_rgba(15,23,42,0.7)] transition duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_18px_36px_-24px_rgba(14,165,233,0.28)]"
              data-testid="task-item"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-200/70">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => onToggleTask(task.id)}
                  aria-label={`${task.title}の完了ステータスを切り替える`}
                  className="h-5 w-5 rounded-md border-slate-300 data-[state=checked]:border-sky-500 data-[state=checked]:bg-sky-500"
                  disabled={isMutating}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate text-sm font-medium text-slate-800 transition-colors",
                    task.completed && "text-slate-400 line-through"
                  )}
                >
                  {task.title}
                </p>
                <p className="mt-1 text-[0.68rem] font-semibold tracking-[0.24em] text-slate-400">
                  {task.completed ? "完了済み" : "未完了"}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-2xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                onClick={() => onDeleteTask(task.id)}
                aria-label={`${task.title}を削除`}
                disabled={isMutating}
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
  activeTasks,
  completedTasks,
  isMutating = false,
  onToggleTask,
  onDeleteTask,
}: TaskListProps) {
  if (activeTasks.length === 0 && completedTasks.length === 0) {
    return (
      <div
        className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-10 text-center"
        data-testid="task-list-empty"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-[0_18px_30px_-24px_rgba(14,165,233,0.55)] ring-1 ring-slate-200/70">
          <ListTodo className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-950">
          まだタスクはありません
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          下の「タスクを追加」から、その日にやることを1件登録してみてください。
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[420px] pr-3">
      <div className="space-y-6">
        <TaskSection
          title="未完了"
          description="これから着手するタスクです。"
          emptyMessage="未完了のタスクはありません。新しい予定を追加するか、完了済みを確認してください。"
          icon={<Clock3 className="h-4 w-4" />}
          isMutating={isMutating}
          tasks={activeTasks}
          testId="active-task-section"
          onDeleteTask={onDeleteTask}
          onToggleTask={onToggleTask}
        />
        <TaskSection
          title="完了済み"
          description="終わった作業をここにまとめます。"
          emptyMessage="まだ完了済みのタスクはありません。"
          icon={<CheckCircle2 className="h-4 w-4" />}
          isMutating={isMutating}
          tasks={completedTasks}
          testId="completed-task-section"
          onDeleteTask={onDeleteTask}
          onToggleTask={onToggleTask}
        />
      </div>
    </ScrollArea>
  );
}
