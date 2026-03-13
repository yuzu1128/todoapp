import {
  eachDayOfInterval,
  endOfMonth,
  isWithinInterval,
  startOfDay,
  startOfMonth,
} from "date-fns";

import { fromDateKey, toDateKey } from "@/lib/date";
import type {
  RecurringOverride,
  RecurringRule,
  Task,
  TaskListItem,
} from "@/lib/types";

export const WEEKDAY_OPTIONS = [
  { label: "日", value: 0 },
  { label: "月", value: 1 },
  { label: "火", value: 2 },
  { label: "水", value: 3 },
  { label: "木", value: 4 },
  { label: "金", value: 5 },
  { label: "土", value: 6 },
] as const;

export function normalizeWeekdays(weekdays: number[]): number[] {
  return Array.from(new Set(weekdays))
    .filter((value) => value >= 0 && value <= 6)
    .sort((left, right) => left - right);
}

export function matchesRecurringRule(
  rule: RecurringRule,
  dateKeyOrDate: string | Date
): boolean {
  if (!rule.enabled) {
    return false;
  }

  const date =
    typeof dateKeyOrDate === "string"
      ? startOfDay(fromDateKey(dateKeyOrDate))
      : startOfDay(dateKeyOrDate);

  if (rule.frequency === "daily") {
    return true;
  }

  return normalizeWeekdays(rule.weekdays).includes(date.getDay());
}

export function describeRecurringRule(rule: RecurringRule): string {
  if (rule.frequency === "daily") {
    return "毎日";
  }

  const labels = normalizeWeekdays(rule.weekdays).map(
    (weekday) =>
      WEEKDAY_OPTIONS.find((option) => option.value === weekday)?.label ?? ""
  );

  return `毎週 ${labels.join("・")}`;
}

export function getMatchingDateKeysForMonth(
  rule: RecurringRule,
  month: Date
): string[] {
  const interval = {
    start: startOfMonth(month),
    end: endOfMonth(month),
  };

  return eachDayOfInterval(interval)
    .filter((date) => matchesRecurringRule(rule, date))
    .map((date) => toDateKey(date));
}

export function buildTaskListItemsForDate(params: {
  dateKey: string;
  manualTasks: Task[];
  overrides: RecurringOverride[];
  rules: RecurringRule[];
}): TaskListItem[] {
  const overrideMap = new Map(
    params.overrides.map((override) => [
      `${override.ruleId}:${override.dateKey}`,
      override,
    ])
  );

  const manualItems: TaskListItem[] = params.manualTasks.map((task) => ({
    id: `manual:${task.id}`,
    title: task.title,
    dateKey: task.date,
    completed: task.completed,
    source: "manual",
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    taskId: task.id,
  }));

  const recurringItems: TaskListItem[] = params.rules
    .filter((rule) => matchesRecurringRule(rule, params.dateKey))
    .flatMap((rule) => {
      const override = overrideMap.get(`${rule.id}:${params.dateKey}`);

      if (override?.dismissed) {
        return [];
      }

      return [
        {
          id: `recurring:${rule.id}:${params.dateKey}`,
          title: rule.title,
          dateKey: params.dateKey,
          completed: override?.completed ?? false,
          source: "recurring" as const,
          createdAt: rule.createdAt,
          updatedAt: override?.updatedAt ?? rule.updatedAt,
          ruleId: rule.id,
          recurringFrequency: rule.frequency,
          recurringWeekdays: rule.weekdays,
        },
      ];
    });

  return [...manualItems, ...recurringItems].sort((left, right) => {
    if (left.completed !== right.completed) {
      return Number(left.completed) - Number(right.completed);
    }

    if (left.source !== right.source) {
      return left.source === "manual" ? -1 : 1;
    }

    return left.createdAt - right.createdAt || left.title.localeCompare(right.title, "ja");
  });
}

export function buildMarkerDateKeysForMonth(params: {
  manualTasks: Task[];
  overrides: RecurringOverride[];
  rules: RecurringRule[];
  month: Date;
}): string[] {
  const interval = {
    start: startOfMonth(params.month),
    end: endOfMonth(params.month),
  };
  const dismissedKeys = new Set(
    params.overrides
      .filter((override) => override.dismissed)
      .map((override) => `${override.ruleId}:${override.dateKey}`)
  );
  const markerKeys = new Set(params.manualTasks.map((task) => task.date));

  for (const date of eachDayOfInterval(interval)) {
    const dateKey = toDateKey(date);
    const hasRecurring = params.rules.some((rule) => {
      if (!matchesRecurringRule(rule, date)) {
        return false;
      }

      return !dismissedKeys.has(`${rule.id}:${dateKey}`);
    });

    if (hasRecurring) {
      markerKeys.add(dateKey);
    }
  }

  return Array.from(markerKeys).sort();
}

export function isDateWithinMonth(dateKey: string, month: Date): boolean {
  return isWithinInterval(fromDateKey(dateKey), {
    start: startOfMonth(month),
    end: endOfMonth(month),
  });
}
