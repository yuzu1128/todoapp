import { format, parse } from "date-fns";

const DATE_KEY_FORMAT = "yyyy-MM-dd";

export function toDateKey(date: Date): string {
  return format(date, DATE_KEY_FORMAT);
}

export function fromDateKey(dateKey: string): Date {
  return parse(dateKey, DATE_KEY_FORMAT, new Date());
}
