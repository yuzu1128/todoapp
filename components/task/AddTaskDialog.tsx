import { useEffect, useState } from "react";
import { X } from "lucide-react";

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
  isOpen: boolean;
  isSubmitting: boolean;
  onClearError: () => void;
  onClose: () => void;
  onAddTask: (title: string) => Promise<boolean> | boolean;
  selectedDateLabel: string;
}

export function AddTaskDialog({
  error,
  isOpen,
  isSubmitting,
  onClearError,
  onClose,
  onAddTask,
  selectedDateLabel,
}: AddTaskDialogProps) {
  const [taskTitle, setTaskTitle] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTaskTitle("");
      setLocalError(null);
    }
  }, [isOpen]);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !validationMessage) {
      void handleAddTask();
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
      <DialogContent className="overflow-hidden rounded-[28px] border-slate-200 bg-white/95 p-0 shadow-[0_30px_70px_-36px_rgba(15,23,42,0.55)] sm:max-w-md">
        <DialogHeader className="border-b border-slate-200/80 px-6 py-5">
          <DialogTitle className="text-xl text-slate-950">
            タスクを追加
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-slate-500">
            {selectedDateLabel} に保存するタスク名を入力してください。
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          <div className="grid gap-2">
            <Label htmlFor="task-title" className="text-slate-700">
              タスク名
            </Label>
            <Input
              aria-invalid={Boolean(errorMessage)}
              id="task-title"
              className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 text-base shadow-none placeholder:text-slate-400 focus-visible:ring-sky-300"
              data-testid="task-title-input"
              placeholder="タスクを入力..."
              value={taskTitle}
              onChange={(e) => {
                setTaskTitle(e.target.value);
                setLocalError(null);
                if (error) {
                  onClearError();
                }
              }}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <div className="flex items-center justify-between gap-3 text-xs">
              <p
                className={
                  errorMessage ? "text-rose-600" : "text-slate-500"
                }
                data-testid="task-title-feedback"
              >
                {errorMessage ?? "空白のみの入力は保存されません。"}
              </p>
              <p
                className={
                  titleLength > TASK_TITLE_MAX_LENGTH
                    ? "font-medium text-rose-600"
                    : "text-slate-400"
                }
              >
                {titleLength}/{TASK_TITLE_MAX_LENGTH}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-slate-200/80 px-6 py-4">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 bg-white"
            onClick={onClose}
          >
            <X className="mr-2 h-4 w-4" />
            キャンセル
          </Button>
          <Button
            className="rounded-2xl shadow-[0_18px_32px_-22px_rgba(14,165,233,0.8)]"
            data-testid="submit-task-button"
            onClick={() => void handleAddTask()}
            disabled={Boolean(validationMessage) || isSubmitting}
          >
            {isSubmitting ? "追加中..." : "追加"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
