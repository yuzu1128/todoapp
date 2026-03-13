import { create } from "zustand";

import { taskRepository } from "@/lib/db";
import { normalizeWeekdays } from "@/lib/recurrence";
import { normalizeTaskTitle, validateTaskTitle } from "@/lib/task";
import type { RecurringFrequency, RecurringRule } from "@/lib/types";

interface RecurringRulesState {
  error: string | null;
  loading: boolean;
  rules: RecurringRule[];
  saving: boolean;
}

interface SaveRuleInput {
  enabled?: boolean;
  frequency: RecurringFrequency;
  id?: string;
  title: string;
  weekdays?: number[];
}

interface RecurringRulesActions {
  deleteRule: (id: string) => Promise<void>;
  initialize: () => Promise<void>;
  saveRule: (input: SaveRuleInput) => Promise<void>;
  setRuleEnabled: (id: string, enabled: boolean) => Promise<void>;
}

function getRecurringValidationMessage(input: SaveRuleInput): string | null {
  const titleError = validateTaskTitle(input.title);

  if (titleError) {
    return titleError;
  }

  if (input.frequency === "weekly" && normalizeWeekdays(input.weekdays ?? []).length === 0) {
    return "週次タスクには曜日を1つ以上選択してください。";
  }

  return null;
}

export const useRecurringRulesStore = create<
  RecurringRulesState & RecurringRulesActions
>((set) => ({
  error: null,
  loading: true,
  rules: [],
  saving: false,

  initialize: async () => {
    set({ loading: true });

    try {
      const rules = await taskRepository.getRecurringRules();
      set({
        error: null,
        loading: false,
        rules,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "繰り返しタスクを読み込めませんでした。",
        loading: false,
      });
    }
  },

  saveRule: async (input) => {
    const validationMessage = getRecurringValidationMessage(input);

    if (validationMessage) {
      set({ error: validationMessage });
      throw new Error(validationMessage);
    }

    set({
      error: null,
      saving: true,
    });

    try {
      const normalizedTitle = normalizeTaskTitle(input.title);
      await taskRepository.saveRecurringRule({
        ...input,
        title: normalizedTitle,
        weekdays: normalizeWeekdays(input.weekdays ?? []),
      });
      await taskRepository.upsertHistoryTitle(normalizedTitle);

      set({
        rules: await taskRepository.getRecurringRules(),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "繰り返しタスクを保存できませんでした。";
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ saving: false });
    }
  },

  setRuleEnabled: async (id, enabled) => {
    set({
      error: null,
      saving: true,
    });

    try {
      await taskRepository.setRecurringRuleEnabled(id, enabled);
      set({
        rules: await taskRepository.getRecurringRules(),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "繰り返しタスクを更新できませんでした。";
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ saving: false });
    }
  },

  deleteRule: async (id) => {
    set({
      error: null,
      saving: true,
    });

    try {
      await taskRepository.deleteRecurringRule(id);
      set({
        rules: await taskRepository.getRecurringRules(),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "繰り返しタスクを削除できませんでした。";
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ saving: false });
    }
  },
}));
