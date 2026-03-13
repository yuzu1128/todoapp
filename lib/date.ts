import {
  addDays,
  endOfMonth,
  format,
  isSameDay,
  parse,
  startOfMonth,
} from "date-fns";
import { ja } from "date-fns/locale";

const DATE_KEY_FORMAT = "yyyy-MM-dd";
const MONTH_KEY_FORMAT = "yyyy-MM";

export function toDateKey(date: Date): string {
  return format(date, DATE_KEY_FORMAT);
}

export function fromDateKey(dateKey: string): Date {
  return parse(dateKey, DATE_KEY_FORMAT, new Date());
}

export function toMonthKey(date: Date): string {
  return format(date, MONTH_KEY_FORMAT);
}

export function fromMonthKey(monthKey: string): Date {
  return parse(`${monthKey}-01`, DATE_KEY_FORMAT, new Date());
}

export function getMonthBounds(date: Date) {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function formatMonthLabel(date: Date): string {
  return format(date, "yyyy年 M月", { locale: ja });
}

export function formatSelectedDateLabel(date: Date): string {
  return format(date, "M月d日 EEE", { locale: ja });
}

export function formatShortDateLabel(date: Date): string {
  return format(date, "M/d EEE", { locale: ja });
}

export function formatDayNumber(date: Date): string {
  return format(date, "d");
}

export function formatWeekdayLabel(date: Date): string {
  return format(date, "EEEEE", { locale: ja });
}

export function getTodayDateKey(): string {
  return toDateKey(new Date());
}

export function getTomorrowDateKey(): string {
  return toDateKey(addDays(new Date(), 1));
}

export function isTodayDateKey(dateKey: string): boolean {
  return isSameDay(fromDateKey(dateKey), new Date());
}
