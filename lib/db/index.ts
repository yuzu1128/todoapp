import Dexie, { Table } from "dexie";

import { fromDateKey, getMonthBounds, toDateKey } from "@/lib/date";
import { normalizeWeekdays } from "@/lib/recurrence";
import type {
  AppSettings,
  RecurringFrequency,
  RecurringOverride,
  RecurringRule,
  Task,
  TaskHistoryEntry,
} from "@/lib/types";

type SaveRecurringRuleInput = {
  enabled?: boolean;
  frequency: RecurringFrequency;
  id?: string;
  title: string;
  weekdays?: number[];
};

const DEFAULT_SETTINGS: AppSettings = {
  key: "app",
  soundEnabled: true,
  updatedAt: 0,
};

class ToDoAppDatabase extends Dexie {
  tasks!: Table<Task, string>;
  taskHistory!: Table<TaskHistoryEntry, string>;
  recurringRules!: Table<RecurringRule, string>;
  recurringOverrides!: Table<RecurringOverride, [string, string]>;
  settings!: Table<AppSettings, "app">;

  constructor() {
    super("ToDoAppDB");

    this.version(1).stores({
      tasks: "id, date, completed, createdAt",
    });

    this.version(2).stores({
      tasks: "id, date, completed, createdAt",
      taskHistory: "title, lastUsedAt, useCount",
      recurringRules: "id, enabled, frequency, updatedAt",
      recurringOverrides: "[ruleId+dateKey], ruleId, dateKey, updatedAt",
      settings: "key",
    });
  }
}

export const db = new ToDoAppDatabase();

async function getCurrentSettings(): Promise<AppSettings> {
  return (await db.settings.get("app")) ?? DEFAULT_SETTINGS;
}

export const taskRepository = {
  async getTasksForDate(dateKey: string): Promise<Task[]> {
    return db.tasks.where("date").equals(dateKey).sortBy("createdAt");
  },

  async getManualTasksInMonth(month: Date): Promise<Task[]> {
    const { start, end } = getMonthBounds(month);
    const startKey = toDateKey(start);
    const endKey = toDateKey(end);

    return db.tasks
      .where("date")
      .between(startKey, endKey, true, true)
      .sortBy("date");
  },

  async addTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const now = Date.now();
    const nextTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    await db.tasks.add(nextTask);
    return nextTask.id;
  },

  async toggleTask(id: string): Promise<void> {
    const task = await db.tasks.get(id);

    if (!task) {
      return;
    }

    await db.tasks.update(id, {
      completed: !task.completed,
      updatedAt: Date.now(),
    });
  },

  async deleteTask(id: string): Promise<void> {
    await db.tasks.delete(id);
  },

  async getRecentTaskTitles(limit = 8): Promise<string[]> {
    const entries = await db.taskHistory.orderBy("lastUsedAt").reverse().limit(limit).toArray();
    return entries.map((entry) => entry.title);
  },

  async upsertHistoryTitle(title: string): Promise<void> {
    const current = await db.taskHistory.get(title);
    const now = Date.now();

    await db.taskHistory.put({
      title,
      lastUsedAt: now,
      useCount: (current?.useCount ?? 0) + 1,
    });
  },

  async clearTaskHistory(): Promise<void> {
    await db.taskHistory.clear();
  },

  async getRecurringRules(): Promise<RecurringRule[]> {
    return db.recurringRules.orderBy("updatedAt").reverse().toArray();
  },

  async getEnabledRecurringRules(): Promise<RecurringRule[]> {
    const rules = await db.recurringRules.toArray();
    return rules.filter((rule) => rule.enabled);
  },

  async saveRecurringRule(input: SaveRecurringRuleInput): Promise<RecurringRule> {
    const existing = input.id ? await db.recurringRules.get(input.id) : undefined;
    const now = Date.now();
    const rule: RecurringRule = {
      id: existing?.id ?? crypto.randomUUID(),
      title: input.title,
      frequency: input.frequency,
      weekdays:
        input.frequency === "weekly"
          ? normalizeWeekdays(input.weekdays ?? [])
          : [],
      enabled: input.enabled ?? existing?.enabled ?? true,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await db.recurringRules.put(rule);
    return rule;
  },

  async setRecurringRuleEnabled(id: string, enabled: boolean): Promise<void> {
    await db.recurringRules.update(id, {
      enabled,
      updatedAt: Date.now(),
    });
  },

  async deleteRecurringRule(id: string): Promise<void> {
    await db.transaction(
      "rw",
      db.recurringRules,
      db.recurringOverrides,
      async () => {
        await db.recurringRules.delete(id);
        await db.recurringOverrides.where("ruleId").equals(id).delete();
      }
    );
  },

  async getRecurringOverridesForDate(dateKey: string): Promise<RecurringOverride[]> {
    return db.recurringOverrides.where("dateKey").equals(dateKey).toArray();
  },

  async getRecurringOverridesInMonth(month: Date): Promise<RecurringOverride[]> {
    const { start, end } = getMonthBounds(month);

    return db.recurringOverrides
      .where("dateKey")
      .between(toDateKey(start), toDateKey(end), true, true)
      .toArray();
  },

  async setRecurringOccurrenceCompleted(
    ruleId: string,
    dateKey: string,
    completed: boolean
  ): Promise<void> {
    const current =
      (await db.recurringOverrides.get([ruleId, dateKey])) ?? {
        ruleId,
        dateKey,
        completed: false,
        dismissed: false,
        updatedAt: 0,
      };

    await db.recurringOverrides.put({
      ...current,
      completed,
      dismissed: false,
      updatedAt: Date.now(),
    });
  },

  async dismissRecurringOccurrence(ruleId: string, dateKey: string): Promise<void> {
    const current =
      (await db.recurringOverrides.get([ruleId, dateKey])) ?? {
        ruleId,
        dateKey,
        completed: false,
        dismissed: false,
        updatedAt: 0,
      };

    await db.recurringOverrides.put({
      ...current,
      completed: false,
      dismissed: true,
      updatedAt: Date.now(),
    });
  },

  async getSettings(): Promise<AppSettings> {
    return getCurrentSettings();
  },

  async saveSettings(partialSettings: Partial<Omit<AppSettings, "key">>): Promise<AppSettings> {
    const current = await getCurrentSettings();
    const nextSettings: AppSettings = {
      ...current,
      ...partialSettings,
      key: "app",
      updatedAt: Date.now(),
    };

    await db.settings.put(nextSettings);
    return nextSettings;
  },
};
