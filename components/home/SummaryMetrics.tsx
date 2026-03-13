interface SummaryMetricsProps {
  completedTaskCount: number;
  completionRate: number;
  remainingTasks: number;
  scheduledDays: number;
  totalTasks: number;
}

interface SummaryCardProps {
  accent: string;
  detail: string;
  title: string;
  value: string;
}

function SummaryCard({ accent, detail, title, value }: SummaryCardProps) {
  return (
    <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.85)]">
      <p className="text-xs font-semibold tracking-[0.28em] text-slate-400">
        {title}
      </p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold tracking-tight text-slate-950">
          {value}
        </p>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${accent}`}
        >
          {detail}
        </span>
      </div>
    </div>
  );
}

export function SummaryMetrics({
  completedTaskCount,
  completionRate,
  remainingTasks,
  scheduledDays,
  totalTasks,
}: SummaryMetricsProps) {
  return (
    <div className="mt-6 grid gap-3 md:grid-cols-3">
      <div data-testid="summary-completed">
        <SummaryCard
          title="完了"
          value={String(completedTaskCount)}
          detail={totalTasks === 0 ? "まだ0件" : `達成率 ${completionRate}%`}
          accent="bg-emerald-50 text-emerald-700"
        />
      </div>
      <div data-testid="summary-remaining">
        <SummaryCard
          title="残り"
          value={String(remainingTasks)}
          detail={remainingTasks === 0 ? "順調です" : "優先して着手"}
          accent="bg-amber-50 text-amber-700"
        />
      </div>
      <div data-testid="summary-scheduled-days">
        <SummaryCard
          title="予定日"
          value={String(scheduledDays)}
          detail={scheduledDays === 0 ? "これから開始" : "日付を追跡中"}
          accent="bg-sky-50 text-sky-700"
        />
      </div>
    </div>
  );
}
