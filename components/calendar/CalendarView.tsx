import * as React from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

import { buttonVariants } from "@/components/ui/button";
import { toDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";

export interface CalendarViewProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
  taskDates: string[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function CalendarView({
  onDateSelect,
  selectedDate,
  taskDates,
  currentMonth,
  onMonthChange,
}: CalendarViewProps) {
  const taskDateSet = new Set(taskDates);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDateDisabled = (date: Date) => {
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const hasTasks = (date: Date) => taskDateSet.has(toDateKey(date));

  return (
    <div
      className="rounded-[24px] bg-white p-3 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.4)] ring-1 ring-slate-200/70"
      data-testid="calendar-view"
    >
      <style>{`
        .rdp-day_has-tasks::after {
          content: "";
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #0ea5e9, #38bdf8);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.14);
        }

        .rdp-day_selected.rdp-day_has-tasks::after {
          background: white;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.24);
        }
      `}</style>

      <DayPicker
        mode="single"
        month={currentMonth}
        selected={selectedDate}
        onMonthChange={onMonthChange}
        onSelect={(date) => {
          if (date) {
            onDateSelect(date);
          }
        }}
        showOutsideDays={false}
        disabled={isDateDisabled}
        locale={ja}
        formatters={{
          formatCaption: (date) => format(date, "yyyy年 M月", { locale: ja }),
          formatWeekdayName: (date) => {
            const weekdayNames = ["日", "月", "火", "水", "木", "金", "土"];
            return weekdayNames[date.getDay()];
          },
        }}
        modifiers={{
          hasTasks: (date) => hasTasks(date),
        }}
        modifiersClassNames={{
          hasTasks: "rdp-day_has-tasks",
        }}
        classNames={{
          root: "rdp",
          months: "flex flex-col",
          month: "space-y-4",
          caption:
            "flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3",
          caption_label: "text-base font-semibold tracking-tight text-slate-950",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-8 w-8 rounded-full border-slate-200 bg-white p-0 text-slate-500 opacity-100 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
          ),
          nav_button_previous: "calendar-nav-previous absolute left-3",
          nav_button_next: "calendar-nav-next absolute right-3",
          table: "w-full border-collapse",
          head_row: "flex",
          head_cell:
            "w-11 rounded-md text-center text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-400",
          row: "mt-2 flex w-full",
          cell: "relative p-0 text-center text-sm",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "relative h-11 w-11 rounded-2xl p-0 text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
          ),
          day_selected:
            "bg-slate-950 text-white shadow-[0_14px_28px_-18px_rgba(15,23,42,0.9)] hover:bg-slate-950 hover:text-white",
          day_today:
            "border border-sky-200 bg-sky-50 font-semibold text-sky-700 hover:bg-sky-100",
          day_outside: "text-muted-foreground opacity-40",
          day_disabled: "text-slate-300 opacity-40",
          day_hidden: "invisible",
        }}
      />
    </div>
  );
}
