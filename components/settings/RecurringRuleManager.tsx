"use client";

import { useState } from "react";
import { CalendarSync, Pencil, Plus, Power, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WEEKDAY_OPTIONS, describeRecurringRule } from "@/lib/recurrence";
import type { RecurringFrequency, RecurringRule } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SaveRuleInput {
  enabled?: boolean;
  frequency: RecurringFrequency;
  id?: string;
  title: string;
  weekdays?: number[];
}

interface RecurringRuleManagerProps {
  error: string | null;
  onDeleteRule: (id: string) => Promise<void>;
  onSaveRule: (input: SaveRuleInput) => Promise<boolean>;
  onToggleEnabled: (id: string, enabled: boolean) => Promise<void>;
  recentTitles: string[];
  rules: RecurringRule[];
  saving: boolean;
}

export function RecurringRuleManager({
  error,
  onDeleteRule,
  onSaveRule,
  onToggleEnabled,
  recentTitles,
  rules,
  saving,
}: RecurringRuleManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<RecurringFrequency>("daily");
  const [title, setTitle] = useState("");
  const [weekdays, setWeekdays] = useState<number[]>([]);

  const resetForm = () => {
    setEditingId(null);
    setFrequency("daily");
    setTitle("");
    setWeekdays([]);
  };

  const startEdit = (rule: RecurringRule) => {
    setEditingId(rule.id);
    setFrequency(rule.frequency);
    setTitle(rule.title);
    setWeekdays(rule.weekdays);
  };

  const toggleWeekday = (value: number) => {
    setWeekdays((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value].sort((left, right) => left - right)
    );
  };

  const handleSubmit = async () => {
    const saved = await onSaveRule({
      enabled: true,
      frequency,
      id: editingId ?? undefined,
      title,
      weekdays,
    });

    if (saved) {
      resetForm();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px] border-white/10 bg-[rgba(8,14,27,0.88)] shadow-none">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">
                Recurring Engine
              </p>
              <h3 className="mt-2 font-display text-2xl tracking-[0.12em] text-white">
                繰り返しタスク
              </h3>
            </div>
            {editingId ? (
              <Button
                variant="outline"
                className="rounded-full border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                onClick={resetForm}
              >
                編集をやめる
              </Button>
            ) : null}
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="recurring-title" className="text-slate-200">
                タスク名
              </Label>
              <Input
                id="recurring-title"
                className="h-12 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:ring-cyan-300/40"
                placeholder="例: 体重記録、週報送信"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            {recentTitles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {recentTitles.map((recentTitle) => (
                  <button
                    key={recentTitle}
                    type="button"
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 transition hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-white"
                    onClick={() => setTitle(recentTitle)}
                  >
                    {recentTitle}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label className="text-slate-200">頻度</Label>
              <div className="flex gap-2">
                {[
                  { label: "毎日", value: "daily" as const },
                  { label: "週ごと", value: "weekly" as const },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition",
                      frequency === item.value
                        ? "border-cyan-300/30 bg-cyan-400/10 text-white"
                        : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    )}
                    onClick={() => setFrequency(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {frequency === "weekly" ? (
              <div className="grid gap-2">
                <Label className="text-slate-200">曜日</Label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAY_OPTIONS.map((option) => {
                    const active = weekdays.includes(option.value);

                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={cn(
                          "h-10 min-w-10 rounded-full border px-3 text-sm transition",
                          active
                            ? "border-cyan-300/30 bg-cyan-400/10 text-white"
                            : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                        )}
                        onClick={() => toggleWeekday(option.value)}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {error ? (
              <div
                className="rounded-[22px] border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100"
                data-testid="rule-form-error"
              >
                {error}
              </div>
            ) : null}

            <Button
              className="w-full rounded-2xl bg-[linear-gradient(135deg,rgba(12,242,255,0.96),rgba(59,130,246,0.9))] text-slate-950 shadow-[0_24px_50px_-24px_rgba(12,242,255,0.8)]"
              data-testid="save-rule-button"
              disabled={saving}
              onClick={() => void handleSubmit()}
            >
              {editingId ? (
                <Pencil className="mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {saving ? "保存中..." : editingId ? "ルールを更新" : "ルールを追加"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[32px] border-white/10 bg-[rgba(8,14,27,0.88)] shadow-none">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[20px] border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
              <CalendarSync className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.28em] text-slate-500">
                Active Rules
              </p>
              <h3 className="mt-1 font-display text-xl tracking-[0.12em] text-white">
                ルール一覧
              </h3>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {rules.length > 0 ? (
              rules.map((rule) => (
                <div
                  key={rule.id}
                  className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4"
                  data-testid="recurring-rule-item"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{rule.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
                        {describeRecurringRule(rule)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.22em]",
                        rule.enabled
                          ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-200"
                          : "border-white/10 bg-white/5 text-slate-400"
                      )}
                    >
                      {rule.enabled ? "Enabled" : "Paused"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      className="rounded-full border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                      onClick={() => startEdit(rule)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      編集
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                      onClick={() => void onToggleEnabled(rule.id, !rule.enabled)}
                    >
                      <Power className="mr-2 h-4 w-4" />
                      {rule.enabled ? "停止" : "有効化"}
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full border-rose-300/20 bg-rose-400/10 text-rose-100 hover:bg-rose-400/20 hover:text-white"
                      onClick={() => void onDeleteRule(rule.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      削除
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-sm leading-6 text-slate-400">
                まだ繰り返しルールはありません。毎日の固定タスクや週次タスクをここで作成します。
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
