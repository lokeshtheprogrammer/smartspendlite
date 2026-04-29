"use client";

import { useState } from "react";
import { useStore } from "../lib/store";

export function TransactionAlerts() {
  const { transactions, budgets, settings, isLoaded } = useStore();
  const [dismissedMessage, setDismissedMessage] = useState<string | null>(null);

  const now = new Date();
  const thisMonth = now.toISOString().substring(0, 7);
  const monthlySpend = transactions
    .filter(t => t.date.startsWith(thisMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBudget = budgets.find(b => b.month === thisMonth)?.limit || settings.income / 2;
  const ratio = currentBudget > 0 ? monthlySpend / currentBudget : 0;

  const alert =
    ratio >= 1.0
      ? { type: "critical", message: "Budget Depleted! You have exceeded your monthly limit." }
      : ratio >= 0.9
        ? { type: "warning", message: "Usage Alert: 90% of your budget has been utilized." }
        : ratio >= 0.75
          ? { type: "info", message: "Efficiency Note: You have reached 75% of your planned budget." }
          : null;

  const activeAlert = isLoaded && alert?.message !== dismissedMessage ? alert : null;

  if (!activeAlert) return null;

  const colors = {
    critical: "bg-red-500 shadow-red-500/20 text-white",
    warning: "bg-orange-500 shadow-orange-500/20 text-white",
    info: "bg-secondary shadow-secondary/20 text-white",
  };

  return (
    <div className={`fixed bottom-24 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center gap-4 rounded-2xl px-6 py-4 shadow-2xl animate-in slide-in-from-bottom-8 duration-500 lg:bottom-8 ${colors[activeAlert.type as keyof typeof colors]}`}>
      <span className="material-symbols-outlined fill-1">
        {activeAlert.type === "critical" ? "error" : "notifications_active"}
      </span>
      <span className="text-sm font-bold tracking-tight flex-1 min-w-0">{activeAlert.message}</span>
      <button onClick={() => setDismissedMessage(activeAlert.message)} className="ml-auto opacity-60 pressable hover:opacity-100" title="Dismiss alert">
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
}
