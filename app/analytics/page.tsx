"use client";

import { useStore } from "../lib/store";
import StandardPageShell from "../components/StandardPageShell";
import { useState, useMemo } from "react";

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
  
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().substring(0, 7);

  const monthlyTransactions = transactions.filter(t => t.date.startsWith(thisMonthStr) && t.type !== "income");
  const lastMonthTransactions = transactions.filter(t => t.date.startsWith(lastMonthStr) && t.type !== "income");

  const totalMonthlySpend = monthlyTransactions.reduce((acc, t) => acc + t.amount, 0);
  const totalLastMonthSpend = lastMonthTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Aggregated Category Data
  const categorySummary = useMemo(() => {
    const cats = Array.from(new Set(monthlyTransactions.map(t => t.category)));
    return cats.map(cat => {
      const amount = monthlyTransactions.filter(t => t.category === cat).reduce((acc, t) => acc + t.amount, 0);
      const percentage = totalMonthlySpend > 0 ? (amount / totalMonthlySpend) * 100 : 0;
      return {
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        amount,
        percentage: Math.round(percentage),
        color: CATEGORY_COLORS[cat] || "bg-slate-400",
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [monthlyTransactions, totalMonthlySpend]);

  // Spending Velocity Data (Cumulative)
  const spendingVelocity = useMemo(() => {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const data = [];
    let cumulative = 0;

    for (let i = 1; i <= daysInMonth; i++) {
      const dayTransactions = monthlyTransactions.filter(t => new Date(t.date).getDate() === i);
      const dayTotal = dayTransactions.reduce((acc, t) => acc + t.amount, 0);
      cumulative += dayTotal;
      
      if (i <= currentDay) {
        data.push({ day: i, amount: cumulative });
      }
    }
    return data;
  }, [monthlyTransactions, now]);

  const maxVelocity = Math.max(...spendingVelocity.map(d => d.amount), 1);

  if (!isLoaded) return <div className="p-12 text-center text-gray-400 font-bold">Initializing Telemetry...</div>;

  return (
    <StandardPageShell
      title="Financial Insights"
      description="Deep-dive analytics and spending patterns for the current fiscal period."
      showBack={true}
    >
      <div className="flex justify-end mb-6 no-print">
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">download</span>
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Row 1: Monthly Comparison & Gauge */}
        <div className="lg:col-span-2 interactive-card p-8 rounded-3xl">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Monthly Comparison</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Current vs Previous Period</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${totalMonthlySpend <= totalLastMonthSpend ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              {totalMonthlySpend <= totalLastMonthSpend ? 'Saving More' : 'Spending More'}
            </div>
          </div>

          <div className="flex items-end gap-12 h-48 px-4">
            <div className="flex-1 flex flex-col items-center gap-4 group">
              <div className="relative w-full h-full flex flex-col justify-end">
                <div 
                  className="w-full bg-slate-100 dark:bg-white/5 rounded-2xl transition-all duration-1000"
                  style={{ height: `${(totalLastMonthSpend / Math.max(totalMonthlySpend, totalLastMonthSpend, 1)) * 100}%` }}
                ></div>
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-slate-400">Last Month</p>
                <p className="text-base font-bold">{settings.currency}{totalLastMonthSpend.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center gap-4 group">
              <div className="relative w-full h-full flex flex-col justify-end">
                <div 
                  className="w-full bg-secondary rounded-2xl transition-all duration-1000 shadow-xl shadow-secondary/20"
                  style={{ height: `${(totalMonthlySpend / Math.max(totalMonthlySpend, totalLastMonthSpend, 1)) * 100}%` }}
                ></div>
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-secondary">This Month</p>
                <p className="text-base font-bold">{settings.currency}{totalMonthlySpend.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Structure (Donut) */}
        <div className="interactive-card p-8 rounded-3xl flex flex-col items-center justify-center">
          <h3 className="text-lg font-black text-slate-800 dark:text-white mb-8">Category Mix</h3>
          <div className="relative w-48 h-48 mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-slate-100 dark:text-white/5" />
              {categorySummary.reduce((acc, cat) => {
                const circumference = 2 * Math.PI * 40;
                const offset = (acc.sum / 100) * circumference;
                const stroke = (cat.percentage / 100) * circumference;
                const element = (
                  <circle
                    key={cat.name}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={`${stroke} ${circumference}`}
                    strokeDashoffset={-offset}
                    className={`transition-all duration-1000 ${cat.color.replace('bg-', 'text-')}`}
                  />
                );
                return { sum: acc.sum + cat.percentage, elements: [...acc.elements, element] };
              }, { sum: 0, elements: [] as React.ReactNode[] }).elements}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black">{totalMonthlySpend > 0 ? "100%" : "0%"}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Mix</span>
            </div>
          </div>
          <div className="w-full space-y-2">
            {categorySummary.slice(0, 3).map(cat => (
              <div key={cat.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>
                  <span className="font-bold text-slate-500">{cat.name}</span>
                </div>
                <span className="font-black">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Spending Velocity (Line Chart) */}
        <div className="lg:col-span-3 interactive-card p-10 rounded-[40px]">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Spending Velocity</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Cumulative Cash Burn (Current Month)</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projection</p>
              <p className="text-xl font-black text-secondary">
                {settings.currency}{Math.round(totalMonthlySpend / (now.getDate() || 1) * 30).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="relative h-64 w-full flex items-end gap-1 px-2">
            {spendingVelocity.map((point, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
                <div 
                  className="w-full bg-secondary/10 group-hover:bg-secondary transition-all rounded-full"
                  style={{ height: `${(point.amount / maxVelocity) * 100}%` }}
                >
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-20 font-bold">
                    Day {point.day}: {settings.currency}{point.amount.toLocaleString()}
                   </div>
                </div>
              </div>
            ))}
            {/* Legend Line */}
            <div className="absolute left-0 bottom-0 w-full h-[1px] bg-slate-200 dark:bg-white/10"></div>
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Day 1</span>
            <span>Today (Day {now.getDate()})</span>
            <span>Day 30</span>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="lg:col-span-3 interactive-card p-10 rounded-[40px]">
          <h3 className="text-xl font-black mb-8">Category Breakdown</h3>
          <div className="space-y-6">
            {categorySummary.map((cat) => (
              <div key={cat.name} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{cat.name}</p>
                    <p className="text-lg font-bold">{settings.currency}{cat.amount.toLocaleString()}</p>
                  </div>
                  <span className="text-sm font-black text-slate-300">{cat.percentage}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${cat.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${cat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .interactive-card { border: 1px solid #eee !important; box-shadow: none !important; break-inside: avoid; }
        }
      `}</style>
    </StandardPageShell>
  );
}
