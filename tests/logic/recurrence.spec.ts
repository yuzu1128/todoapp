import { expect, test } from "@playwright/test";

import {
  formatMonthLabel,
  formatSelectedDateLabel,
} from "@/lib/date";
import {
  buildMarkerDateKeysForMonth,
  buildTaskListItemsForDate,
  matchesRecurringRule,
} from "@/lib/recurrence";
import {
  playSoundEffect,
  primeAudioContext,
  resetSoundEngineForTest,
} from "@/lib/sound";
import type { RecurringOverride, RecurringRule, Task } from "@/lib/types";

test.afterEach(() => {
  resetSoundEngineForTest();

  if ("window" in globalThis) {
    Reflect.deleteProperty(globalThis, "window");
  }
});

test("formats month and selected date labels in Japanese", () => {
  const date = new Date(2026, 2, 14);

  expect(formatMonthLabel(date)).toBe("2026年 3月");
  expect(formatSelectedDateLabel(date)).toBe("3月14日 土");
});

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

test("primes and plays sound effects when AudioContext is available", async () => {
  class MockGainNode {
    gain = {
      setValueAtTime() {},
      linearRampToValueAtTime() {},
      exponentialRampToValueAtTime() {},
    };

    connect() {}
  }

  class MockOscillator {
    type: OscillatorType = "sine";
    frequency = {
      setValueAtTime() {},
    };

    connect() {}
    start() {}
    stop() {}
  }

  class MockAudioContext {
    state: AudioContextState = "suspended";
    currentTime = 0;
    destination = {};

    createGain() {
      return new MockGainNode() as unknown as GainNode;
    }

    createOscillator() {
      return new MockOscillator() as unknown as OscillatorNode;
    }

    async resume() {
      this.state = "running";
    }
  }

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      AudioContext: MockAudioContext,
    } as unknown as Window & typeof globalThis,
  });

  await expect(primeAudioContext()).resolves.toBe(true);
  await expect(playSoundEffect("toggle")).resolves.toBe(true);
});
