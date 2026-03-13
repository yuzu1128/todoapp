import { create } from "zustand";

import { taskRepository } from "@/lib/db";

interface SettingsState {
  error: string | null;
  initialized: boolean;
  loading: boolean;
  soundEnabled: boolean;
}

interface SettingsActions {
  clearHistory: () => Promise<void>;
  initialize: () => Promise<void>;
  setSoundEnabled: (soundEnabled: boolean) => Promise<void>;
}

export const useSettingsStore = create<SettingsState & SettingsActions>((set) => ({
  error: null,
  initialized: false,
  loading: false,
  soundEnabled: true,

  initialize: async () => {
    set({ loading: true });

    try {
      const settings = await taskRepository.getSettings();
      set({
        error: null,
        initialized: true,
        loading: false,
        soundEnabled: settings.soundEnabled,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "設定を読み込めませんでした。",
        loading: false,
      });
    }
  },

  setSoundEnabled: async (soundEnabled) => {
    set({ loading: true });

    try {
      const settings = await taskRepository.saveSettings({ soundEnabled });
      set({
        error: null,
        initialized: true,
        loading: false,
        soundEnabled: settings.soundEnabled,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "設定を保存できませんでした。",
        loading: false,
      });
    }
  },

  clearHistory: async () => {
    set({ loading: true });

    try {
      await taskRepository.clearTaskHistory();
      set({
        error: null,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "履歴を削除できませんでした。",
        loading: false,
      });
    }
  },
}));
