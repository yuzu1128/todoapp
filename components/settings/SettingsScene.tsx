"use client";

import { useEffect } from "react";
import { AudioWaveform, History, Sparkles } from "lucide-react";

import { RecurringRuleManager } from "@/components/settings/RecurringRuleManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useRecurringRulesStore } from "@/stores/recurringRulesStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTaskStore } from "@/stores/taskStore";

export function SettingsScene() {
  const settingsError = useSettingsStore((state) => state.error);
  const settingsInitialized = useSettingsStore((state) => state.initialized);
  const settingsLoading = useSettingsStore((state) => state.loading);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const initializeSettings = useSettingsStore((state) => state.initialize);
  const setSoundEnabled = useSettingsStore((state) => state.setSoundEnabled);
  const clearHistory = useSettingsStore((state) => state.clearHistory);

  const rules = useRecurringRulesStore((state) => state.rules);
  const rulesError = useRecurringRulesStore((state) => state.error);
  const rulesLoading = useRecurringRulesStore((state) => state.loading);
  const savingRules = useRecurringRulesStore((state) => state.saving);
  const initializeRules = useRecurringRulesStore((state) => state.initialize);
  const saveRule = useRecurringRulesStore((state) => state.saveRule);
  const setRuleEnabled = useRecurringRulesStore((state) => state.setRuleEnabled);
  const deleteRule = useRecurringRulesStore((state) => state.deleteRule);

  const recentTitles = useTaskStore((state) => state.recentTitles);
  const refreshRecentTitles = useTaskStore((state) => state.refreshRecentTitles);
  const { play } = useSoundEffects();

  useEffect(() => {
    if (!settingsInitialized) {
      void initializeSettings();
    }
    void initializeRules();
    void refreshRecentTitles();
  }, [
    initializeRules,
    initializeSettings,
    refreshRecentTitles,
    settingsInitialized,
  ]);

  return (
    <div className="space-y-6" data-testid="settings-page">
      <section className="overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(145deg,rgba(10,18,34,0.95),rgba(6,10,22,0.9))] shadow-[0_34px_90px_-42px_rgba(12,242,255,0.3)]">
        <div className="relative px-5 py-6 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.32em] text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Settings Bay
          </div>
          <h1 className="mt-4 font-display text-3xl tracking-[0.16em] text-white sm:text-4xl">
            System Controls
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            効果音、最近使った履歴、繰り返しルールを管理します。ここで設定したルールは
            Home と Calendar の両方に反映されます。
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card className="rounded-[32px] border-white/10 bg-[rgba(8,14,27,0.88)] shadow-none">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[20px] border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
                  <AudioWaveform className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">
                    Audio
                  </p>
                  <h3 className="mt-1 font-display text-xl tracking-[0.12em] text-white">
                    効果音
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                タブ切替、追加、完了、削除に短い操作音を割り当てています。
              </p>
              <Button
                className="mt-5 w-full rounded-2xl bg-[linear-gradient(135deg,rgba(12,242,255,0.96),rgba(59,130,246,0.9))] text-slate-950 shadow-[0_24px_50px_-24px_rgba(12,242,255,0.8)]"
                data-testid="sound-toggle"
                disabled={settingsLoading}
                onClick={async () => {
                  const nextValue = !soundEnabled;
                  await setSoundEnabled(nextValue);
                  if (nextValue) {
                    play("toggle");
                  }
                }}
              >
                {soundEnabled ? "効果音をOFF" : "効果音をON"}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-white/10 bg-[rgba(8,14,27,0.88)] shadow-none">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[20px] border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">
                    Memory
                  </p>
                  <h3 className="mt-1 font-display text-xl tracking-[0.12em] text-white">
                    履歴
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                追加ダイアログの候補として使う最近のタイトルです。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {recentTitles.length > 0 ? (
                  recentTitles.map((title) => (
                    <span
                      key={title}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300"
                    >
                      {title}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">履歴はまだありません。</p>
                )}
              </div>
              <Button
                variant="outline"
                className="mt-5 w-full rounded-2xl border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                data-testid="clear-history-button"
                disabled={settingsLoading}
                onClick={async () => {
                  await clearHistory();
                  await refreshRecentTitles();
                  play("dismiss");
                }}
              >
                履歴をクリア
              </Button>
            </CardContent>
          </Card>

          {settingsError ? (
            <div className="rounded-[24px] border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">
              {settingsError}
            </div>
          ) : null}
        </div>

        {rulesLoading && rules.length === 0 ? (
          <Card className="rounded-[32px] border-white/10 bg-[rgba(8,14,27,0.88)] shadow-none">
            <CardContent className="space-y-3 p-6">
              <div className="h-6 w-40 animate-pulse rounded-full bg-white/10" />
              <div className="h-24 animate-pulse rounded-[24px] bg-white/5" />
              <div className="h-24 animate-pulse rounded-[24px] bg-white/5" />
            </CardContent>
          </Card>
        ) : (
          <RecurringRuleManager
            error={rulesError}
            onDeleteRule={async (id) => {
              await deleteRule(id);
              play("dismiss");
            }}
            onSaveRule={async (input) => {
              try {
                await saveRule(input);
                await refreshRecentTitles();
                play("success");
                return true;
              } catch {
                return false;
              }
            }}
            onToggleEnabled={async (id, enabled) => {
              await setRuleEnabled(id, enabled);
              play("toggle");
            }}
            recentTitles={recentTitles}
            rules={rules}
            saving={savingRules}
          />
        )}
      </section>
    </div>
  );
}
