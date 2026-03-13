"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { History, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TASK_TITLE_MAX_LENGTH,
  getTaskTitleLength,
  validateTaskTitle,
} from "@/lib/task";

interface AddTaskDialogProps {
  error: string | null;
  initialTitle?: string;
  isOpen: boolean;
  isSubmitting: boolean;
  onAddTask: (title: string) => Promise<boolean> | boolean;
  onClearError: () => void;
  onClose: () => void;
  recentTitles: string[];
  selectedDateLabel: string;
}

export function AddTaskDialog({
  error,
  initialTitle = "",
  isOpen,
  isSubmitting,
  onAddTask,
  onClearError,
  onClose,
  recentTitles,
  selectedDateLabel,
}: AddTaskDialogProps) {
  const [taskTitle, setTaskTitle] = useState(initialTitle);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTaskTitle(initialTitle);
      setLocalError(null);
    }
  }, [initialTitle, isOpen]);

  const titleLength = getTaskTitleLength(taskTitle);
  const validationMessage =
    taskTitle.length > 0 ? validateTaskTitle(taskTitle) : null;
  const errorMessage = localError ?? error ?? validationMessage;

  const handleAddTask = async () => {
    const currentValidationMessage = validateTaskTitle(taskTitle);

    if (currentValidationMessage || isSubmitting) {
      setLocalError(currentValidationMessage);
      return;
    }

    const wasAdded = await Promise.resolve(onAddTask(taskTitle));

    if (wasAdded) {
      setTaskTitle("");
      setLocalError(null);
      onClose();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !validationMessage) {
      void handleAddTask();
    }
  };

  const handleSelectRecentTitle = (title: string) => {
    setTaskTitle(title);
    setLocalError(null);
    if (error) {
      onClearError();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="overflow-hidden border-white/10 bg-[rgba(6,12,24,0.96)] p-0 text-slate-100 shadow-[0_40px_120px_-40px_rgba(12,242,255,0.45)] backdrop-blur-xl sm:max-w-lg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(12,242,255,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_32%)]" />

        <DialogHeader className="relative border-b border-white/10 px-6 py-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.28em] text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Quick Add
          </div>
          <DialogTitle className="mt-4 font-display text-2xl tracking-[0.12em] text-white">
            Task Composer
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-6 text-slate-300">
            {selectedDateLabel} に追加するタスクを入力します。
          </DialogDescription>
        </DialogHeader>

        <div className="relative grid gap-5 px-6 py-6">
          {recentTitles.length > 0 ? (
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                <History className="h-3.5 w-3.5" />
                最近使った候補
              </div>
              <div className="flex flex-wrap gap-2">
                {recentTitles.map((title) => (
                  <button
                    key={title}
                    type="button"
                    data-testid="recent-title-chip"
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-white"
                    onClick={() => handleSelectRecentTitle(title)}
                  >
                    {title}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="task-title" className="text-slate-200">
              タスク名
            </Label>
            <Input
              id="task-title"
              aria-invalid={Boolean(errorMessage)}
              autoFocus
              className="h-12 rounded-2xl border-white/10 bg-white/5 px-4 text-base text-white placeholder:text-slate-500 focus-visible:ring-cyan-300/40"
              data-testid="task-title-input"
              placeholder="例: デザイン確認、請求処理、散歩"
              value={taskTitle}
              onChange={(event) => {
                setTaskTitle(event.target.value);
                setLocalError(null);
                if (error) {
                  onClearError();
                }
              }}
              onKeyDown={handleKeyDown}
            />
            <div className="flex items-center justify-between gap-3 text-xs">
              <p
                className={errorMessage ? "text-rose-300" : "text-slate-400"}
                data-testid="task-title-feedback"
              >
                {errorMessage ?? "空白のみの入力は保存されません。"}
              </p>
              <p
                className={
                  titleLength > TASK_TITLE_MAX_LENGTH
                    ? "font-medium text-rose-300"
                    : "text-slate-500"
                }
              >
                {titleLength}/{TASK_TITLE_MAX_LENGTH}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="relative border-t border-white/10 bg-black/10 px-6 py-4">
          <Button
            variant="outline"
            className="rounded-2xl border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
            onClick={onClose}
          >
            <X className="mr-2 h-4 w-4" />
            閉じる
          </Button>
          <Button
            className="rounded-2xl bg-[linear-gradient(135deg,rgba(12,242,255,0.95),rgba(59,130,246,0.92))] text-slate-950 shadow-[0_24px_50px_-28px_rgba(12,242,255,0.9)] hover:opacity-95"
            data-testid="submit-task-button"
            disabled={Boolean(validationMessage) || isSubmitting}
            onClick={() => void handleAddTask()}
          >
            {isSubmitting ? "保存中..." : "タスクを追加"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
