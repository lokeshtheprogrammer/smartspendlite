"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StandardPageShell from "../components/StandardPageShell";
import { useStore } from "../lib/store";

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"];

export default function MonthlyIncome() {
  const router = useRouter();
  const { settings, updateSettings, isLoaded } = useStore();
  const [draftValue, setDraftValue] = useState<string | null>(null);

  const value = draftValue ?? (settings.income ? String(settings.income) : "");
  const income = Number(value) || 0;
  const preview = useMemo(
    () => [
      { label: "Needs", pct: 50, amount: income * 0.5, tone: "bg-secondary" },
      { label: "Wants", pct: 30, amount: income * 0.3, tone: "bg-emerald-500" },
      { label: "Savings", pct: 20, amount: income * 0.2, tone: "bg-amber-500" },
    ],
    [income]
  );

  const pushKey = (key: string) => {
    if (key === "." && value.includes(".")) return;
    setDraftValue((current) => `${current ?? value}${key}`.replace(/^0+(?=\d)/, ""));
  };

  const saveIncome = () => {
    updateSettings({ income });
    router.push("/budget");
  };

  if (!isLoaded) return <div className="p-12 text-center text-gray-400">Loading income tools...</div>;

  return (
    <StandardPageShell
      title="Monthly Income"
      description="Set a realistic monthly baseline and instantly preview a practical allocation plan."
      showBack={true}
    >
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="interactive-card rounded-[28px] p-8">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-primary dark:text-white ui-safe-text">
                {settings.currency}{income.toLocaleString()}
              </div>
              <p className="mt-2 text-sm font-bold uppercase text-on-surface-variant">Monthly Baseline</p>
            </div>

            <div className="mx-auto mt-8 grid max-w-xs grid-cols-3 gap-3">
              {keys.map((key) => (
                <button
                  key={key}
                  onClick={() => pushKey(key)}
                  className="aspect-square rounded-xl bg-surface-container-low text-xl font-bold text-primary pressable hover:bg-surface-container-high dark:text-white"
                >
                  {key}
                </button>
              ))}
              <button
                onClick={() => setDraftValue((current) => (current ?? value).slice(0, -1))}
                className="aspect-square rounded-xl bg-error/10 text-xl font-bold text-error pressable hover:bg-error/20"
                title="Backspace"
              >
                <span className="material-symbols-outlined">backspace</span>
              </button>
            </div>
          </section>

          <section className="interactive-card rounded-[28px] p-8">
            <h3 className="mb-6 text-lg font-bold text-primary dark:text-white">Quick Tune</h3>
            <input
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-container-high accent-secondary"
              type="range"
              min="0"
              max="300000"
              step="1000"
              value={income}
              onChange={(event) => setDraftValue(event.target.value)}
            />
            <div className="mt-4 flex justify-between text-xs font-bold text-on-surface-variant">
              <span>{settings.currency}0</span>
              <span>{settings.currency}300k</span>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="interactive-card metric-strip rounded-[28px] p-6">
            <span className="material-symbols-outlined mb-4 text-4xl text-secondary">auto_awesome</span>
            <h3 className="text-lg font-black tracking-tight text-primary dark:text-white">Allocation Preview</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              The budget engine uses this number to calculate limits, warnings, and daily spending velocity.
            </p>
          </section>

          <section className="interactive-card rounded-[28px] p-6">
            <h3 className="mb-5 text-sm font-bold text-primary dark:text-white">50 / 30 / 20 Split</h3>
            <div className="space-y-4">
              {preview.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-on-surface-variant">{item.label} ({item.pct}%)</span>
                    <span className="text-primary dark:text-white ui-safe-text">{settings.currency}{item.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-container-low">
                    <div className={`h-full rounded-full ${item.tone}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <button
            onClick={saveIncome}
            disabled={income <= 0}
            className="w-full rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-sm pressable hover:bg-primary/90 disabled:opacity-40 dark:bg-white dark:text-[#0d1424]"
          >
            Set Monthly Income
          </button>
        </div>
      </div>
    </StandardPageShell>
  );
}
