import { CheckCircle2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface FloatingActionBarProps {
  isBusy: boolean;
  onOpenDialog: () => void;
  remainingTasks: number;
}

export function FloatingActionBar({
  isBusy,
  onOpenDialog,
  remainingTasks,
}: FloatingActionBarProps) {
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-100 via-slate-100/65 to-transparent" />
      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-5xl px-4 pb-5 sm:px-6 lg:px-8">
        <div className="rounded-[24px] border border-white/80 bg-white/86 p-3 shadow-[0_22px_50px_-32px_rgba(15,23,42,0.55)] backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  次のアクションを追加
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {remainingTasks === 0
                    ? "新しい予定を足して、その日の流れを先回りで整えます。"
                    : `残り${remainingTasks}件。思いついたらすぐ記録できます。`}
                </p>
              </div>
            </div>

            <Button
              className="h-12 rounded-2xl px-6 text-base shadow-[0_18px_40px_-24px_rgba(14,165,233,0.8)]"
              data-testid="open-add-task-dialog"
              size="lg"
              onClick={onOpenDialog}
              disabled={isBusy}
            >
              <Plus className="mr-2 h-5 w-5" />
              タスクを追加
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
