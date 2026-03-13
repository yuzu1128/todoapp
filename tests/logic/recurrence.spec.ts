import { expect, test } from "@playwright/test";

import {
  buildMarkerDateKeysForMonth,
  buildTaskListItemsForDate,
  matchesRecurringRule,
} from "@/lib/recurrence";
import type { RecurringOverride, RecurringRule, Task } from "@/lib/types";

test("matches daily and weekly recurring rules against dates", () => {
  const dailyRule: RecurringRule = {
    id: "daily",
    title: "Daily",
    frequency: "daily",
    weekdays: [],
    enabled: true,
    createdAt: 1,
    updatedAt: 1,
  };
  const weeklyRule: RecurringRule = {
    id: "weekly",
    title: "Weekly",
    frequency: "weekly",
    weekdays: [1, 3],
    enabled: true,
    createdAt: 1,
    updatedAt: 1,
  };

  expect(matchesRecurringRule(dailyRule, "2026-03-16")).toBe(true);
  expect(matchesRecurringRule(weeklyRule, "2026-03-16")).toBe(true);
  expect(matchesRecurringRule(weeklyRule, "2026-03-17")).toBe(false);
});

test("builds task list items with override completion and dismissal applied", () => {
  const manualTasks: Task[] = [
    {
      id: "task-1",
      title: "Manual task",
      date: "2026-03-16",
      completed: false,
      createdAt: 10,
      updatedAt: 10,
    },
  ];
  const rules: RecurringRule[] = [
    {
      id: "rule-daily",
      title: "Daily sync",
      frequency: "daily",
      weekdays: [],
      enabled: true,
      createdAt: 1,
      updatedAt: 1,
    },
    {
      id: "rule-weekly",
      title: "Weekly review",
      frequency: "weekly",
      weekdays: [1],
      enabled: true,
      createdAt: 2,
      updatedAt: 2,
    },
  ];
  const overrides: RecurringOverride[] = [
    {
      ruleId: "rule-daily",
      dateKey: "2026-03-16",
      completed: true,
      dismissed: false,
      updatedAt: 20,
    },
    {
      ruleId: "rule-weekly",
      dateKey: "2026-03-16",
      completed: false,
      dismissed: true,
      updatedAt: 21,
    },
  ];

  const items = buildTaskListItemsForDate({
    dateKey: "2026-03-16",
    manualTasks,
    overrides,
    rules,
  });

  expect(items).toHaveLength(2);
  expect(items.find((item) => item.taskId === "task-1")?.source).toBe("manual");
  expect(items.find((item) => item.ruleId === "rule-daily")?.completed).toBe(true);
  expect(items.find((item) => item.ruleId === "rule-weekly")).toBeUndefined();
});

test("builds month markers from manual and recurring tasks while ignoring dismissed occurrences", () => {
  const manualTasks: Task[] = [
    {
      id: "task-1",
      title: "Manual task",
      date: "2026-03-05",
      completed: false,
      createdAt: 10,
      updatedAt: 10,
    },
  ];
  const rules: RecurringRule[] = [
    {
      id: "rule-weekly",
      title: "Weekly review",
      frequency: "weekly",
      weekdays: [1],
      enabled: true,
      createdAt: 1,
      updatedAt: 1,
    },
  ];
  const overrides: RecurringOverride[] = [
    {
      ruleId: "rule-weekly",
      dateKey: "2026-03-16",
      completed: false,
      dismissed: true,
      updatedAt: 20,
    },
  ];

  const markerDateKeys = buildMarkerDateKeysForMonth({
    manualTasks,
    overrides,
    rules,
    month: new Date(2026, 2, 1),
  });

  expect(markerDateKeys).toContain("2026-03-05");
  expect(markerDateKeys).toContain("2026-03-02");
  expect(markerDateKeys).toContain("2026-03-09");
  expect(markerDateKeys).toContain("2026-03-23");
  expect(markerDateKeys).not.toContain("2026-03-16");
});
