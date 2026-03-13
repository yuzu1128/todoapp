"use client";

import { DayPicker } from "react-day-picker";
import { ja } from "date-fns/locale";

import { buttonVariants } from "@/components/ui/button";
import {
  formatMonthLabel,
  formatWeekdayLabel,
  isTodayDateKey,
  toDateKey,
} from "@/lib/date";
import { cn } from "@/lib/utils";

export interface CalendarViewProps {
  currentMonth: Date;
  markerDateKeys: string[];
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  selectedDate: Date;
}

export function CalendarView({
  currentMonth,
  markerDateKeys,
  onDateSelect,
  onMonthChange,
  selectedDate,
}: CalendarViewProps) {
  const markerSet = new Set(markerDateKeys);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div
      className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(10,17,31,0.96),rgba(7,11,22,0.92))] p-4 shadow-[0_30px_70px_-42px_rgba(12,242,255,0.45)]"
      data-testid="calendar-view"
    >
      <style>{`
        .calendar-day_has-marker {
          position: relative;
        }

        .calendar-day_has-marker button::after,
        button.calendar-day_has-marker::after {
          content: "";
          position: absolute;
          inset-inline-start: 50%;
          bottom: 0.38rem;
          width: 0.42rem;
          height: 0.42rem;
          border-radius: 9999px;
          transform: translateX(-50%);
          background: linear-gradient(135deg, rgba(12, 242, 255, 1), rgba(59, 130, 246, 1));
          box-shadow: 0 0 18px rgba(12, 242, 255, 0.8);
        }

        .calendar-day_has-marker button[aria-selected="true"]::after,
        button.calendar-day_has-marker[aria-selected="true"]::after {
          background: white;
          box-shadow: 0 0 18px rgba(255, 255, 255, 0.7);
        }
      `}</style>

      <DayPicker
        mode="single"
        className="text-slate-100"
        disabled={{ before: today }}
        formatters={{
          formatCaption: formatMonthLabel,
          formatWeekdayName: formatWeekdayLabel,
        }}
        locale={ja}
        modifiers={{
          hasMarker: (date) => markerSet.has(toDateKey(date)),
          isToday: (date) => isTodayDateKey(toDateKey(date)),
        }}
        modifiersClassNames={{
          hasMarker: "calendar-day_has-marker",
        }}
        month={currentMonth}
        onMonthChange={onMonthChange}
        onSelect={(date) => {
          if (date) {
            onDateSelect(date);
          }
        }}
        selected={selectedDate}
        showOutsideDays={false}
        classNames={{
          root: "w-full",
          months: "flex flex-col",
          month: "space-y-4",
          month_caption:
            "relative flex items-center justify-center rounded-[26px] border border-white/10 bg-white/[0.03] px-3 py-3",
          caption_label: "font-display text-lg tracking-[0.16em] text-white",
          nav: "absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between px-2",
          button_previous: cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-9 w-9 rounded-full border border-white/10 bg-white/[0.04] p-0 text-slate-300 hover:bg-cyan-400/10 hover:text-white"
          ),
          button_next: cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-9 w-9 rounded-full border border-white/10 bg-white/[0.04] p-0 text-slate-300 hover:bg-cyan-400/10 hover:text-white"
          ),
          weekdays: "grid grid-cols-7 gap-2",
          weekday:
            "text-center text-[0.68rem] font-medium uppercase tracking-[0.28em] text-slate-500",
          weeks: "space-y-2",
          week: "grid grid-cols-7 gap-2",
          day: "relative text-center",
          day_button: cn(
            buttonVariants({ variant: "ghost" }),
            "relative h-12 w-full rounded-[20px] border border-transparent bg-white/[0.03] p-0 text-sm font-medium text-slate-200 hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-white"
          ),
          selected:
            "border-cyan-300/30 bg-[linear-gradient(135deg,rgba(12,242,255,0.18),rgba(59,130,246,0.25))] text-white shadow-[0_0_24px_-10px_rgba(12,242,255,0.8)] hover:text-white",
          today: "border-white/10 bg-white/[0.06] text-cyan-200",
          disabled:
            "cursor-not-allowed border-transparent bg-transparent text-slate-700 opacity-50",
          hidden: "invisible",
        }}
      />
    </div>
  );
}
