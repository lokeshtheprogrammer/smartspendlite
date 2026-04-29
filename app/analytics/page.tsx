"use client";

import { useStore } from "../lib/store";
import StandardPageShell from "../components/StandardPageShell";
import Link from "next/link";
import { useState } from "react";

const CATEGORY_COLORS: Record<string, string> = {
  food: "bg-orange-500",
  transport: "bg-blue-500",
  shopping: "bg-purple-500",
  utilities: "bg-yellow-500",
  housing: "bg-green-500",
  entertainment: "bg-red-500",
  other: "bg-slate-500",
};

export default function Analytics() {
  const { transactions, settings, isLoaded } = useStore();
  const [periodDays, setPeriodDays] = useState(7);

  const now = new Date();
  const thisMonthStr = now.toISOString().substring(0, 7);
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(thisMonthStr));
  const totalMonthlySpend = monthlyTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Aggregated Category Data
  const categories = Array.from(new Set(monthlyTransactions.map(t => t.category)));
  const categorySummary = categories.map(cat => {
    const amount = monthlyTransactions.filter(t => t.category === cat).reduce((acc, t) => acc + t.amount, 0);
    const percentage = totalMonthlySpend > 0 ? (amount / totalMonthlySpend) * 100 : 0;
    return {
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      amount,
      percentage: Math.round(percentage),
      color: CATEGORY_COLORS[cat] || "bg-slate-400",
    };
  }).sort((a, b) => b.amount - a.amount);

  const recentDays = [...Array(periodDays)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const amount = transactions
      .filter(t => t.date.startsWith(dateStr))
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      amount
    };
  }).reverse();

  const maxAmount = Math.max(...recentDays.map(d => d.amount), 1);
  const categorySegments = categorySummary.reduce(
    (segments, cat) => {
      const radius = 40;
      const circumference = 2 * Math.PI * radius;
      const dashoffset = (segments.accumulated / 100) * circumference;

      return {
        accumulated: segments.accumulated + cat.percentage,
        items: [
          ...segments.items,
          {
            ...cat,
            radius,
            circumference,
            dashoffset,
            strokeDasharray: `${(cat.percentage / 100) * circumference} ${circumference}`,
          },
        ],
      };
    },
    {
      accumulated: 0,
      items: [] as Array<
        (typeof categorySummary)[number] & {
          radius: number;
          circumference: number;
          dashoffset: number;
          strokeDasharray: string;
        }
      >,
    }
  ).items;

  if (!isLoaded) return <div className="p-12 text-center text-gray-400">Loading analytics...</div>;

  return (
    <StandardPageShell
      title="Wealth Telemetry"
      description="Advanced data intelligence and categorical breakdown of your asset allocation."
      showBack={true}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Left Column: Weekly Trends */}
        <div className="lg:col-span-2 space-y-8">
          <div className="interactive-card p-8 rounded-2xl">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Weekly Activity</h3>
              <div className="flex gap-2">
                {[7, 30].map((days) => (
                  <button
                    key={days}
                    onClick={() => setPeriodDays(days)}
                    className={`rounded-lg px-4 py-2 text-sm font-bold pressable ${
                      periodDays === days
                        ? "bg-slate-100 text-slate-800 shadow-sm dark:bg-white/10 dark:text-white"
                        : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5"
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end justify-between h-64 gap-4 px-4">
              {recentDays.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="relative w-full h-full flex flex-col justify-end">
                    <div 
                      className="w-full bg-secondary/20 group-hover:bg-secondary rounded-t-lg transition-all duration-500 ease-out relative"
                      style={{ height: `${(data.amount / maxAmount) * 100}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition shadow-xl z-10 whitespace-nowrap pointer-events-none">
                        {settings.currency}{data.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{data.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="interactive-card p-8 rounded-2xl">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-8">Top Spending Categories</h3>
            <div className="space-y-6">
              {categorySummary.slice(0, 5).map((cat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{cat.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{settings.currency}{cat.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${cat.color} rounded-full transition-all duration-1000`} 
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {categorySummary.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-4 animate-in fade-in zoom-in-95 duration-700">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center shadow-inner border border-slate-100 dark:border-white/10">
                    <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-white/20">bar_chart</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white">No Category Data</h4>
                    <p className="text-xs text-slate-500 mt-1">Transactions will be mapped here automatically.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Structure & Insights */}
        <div className="space-y-8">
          <div className="interactive-card p-8 rounded-2xl">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-8 text-center">Expense Structure</h3>
            <div className="relative w-full aspect-square flex items-center justify-center p-4">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-slate-100 dark:text-white/5" />
                {categorySegments.map((cat, i) => (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r={cat.radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={cat.strokeDasharray}
                    strokeDashoffset={-cat.dashoffset}
                    className={`transition-all duration-1000 ${cat.color.replace('bg-', 'text-')}`}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-800 dark:text-white">
                  {totalMonthlySpend > 0 ? "100%" : "0%"}
                </span>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Efficiency</span>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              {categorySummary.slice(0, 3).map((cat, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{cat.name}</span>
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{cat.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="interactive-card p-8 rounded-2xl text-white shadow-xl shadow-secondary/20 group" style={{ backgroundColor: 'var(--secondary)' }}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
              <span className="material-symbols-outlined text-8xl">auto_awesome</span>
            </div>
            <h4 className="text-xl font-bold mb-2">Smart Prediction</h4>
            <p className="text-white/90 text-sm leading-relaxed mb-6 font-medium">
              {totalMonthlySpend > 0 
                ? "Your spending patterns suggest you could save up to 10% more by optimizing your dining choices."
                : "Add transactions to unlock AI-powered insights and spending predictions."}
            </p>
            <Link href="/insights" className="block w-full py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-center text-sm font-bold pressable">
              View Analysis
            </Link>
          </div>
        </div>
      </div>
    </StandardPageShell>
  );
}
