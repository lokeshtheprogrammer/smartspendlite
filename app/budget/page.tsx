"use client";

import { useState } from "react";
import { useStore } from "../lib/store";
import StandardPageShell from "../components/StandardPageShell";

export default function Budget() {
  const { transactions, budgets, settings, updateBudget, isLoaded } = useStore();
  const [newLimit, setNewLimit] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const now = new Date();
  const thisMonthStr = now.toISOString().substring(0, 7);

  const monthlyTransactions = transactions.filter(t => t.date.startsWith(thisMonthStr));
  const spentMonthly = monthlyTransactions.reduce((acc, t) => acc + t.amount, 0);

  const currentBudget = budgets.find(b => b.month === thisMonthStr)?.limit || settings.income / 2;
  const safeBudget = currentBudget || 1;
  const progress = (spentMonthly / safeBudget) * 100;
  const remaining = Math.max(0, currentBudget - spentMonthly);

  // SVG Progress Ring Calculations
  const radius = 125;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (Math.min(spentMonthly, safeBudget) / safeBudget) * circumference;

  const handleSaveBudget = () => {
    const limit = parseFloat(newLimit);
    if (!isNaN(limit) && limit >= 0) {
      updateBudget(limit, thisMonthStr);
      setIsEditing(false);
    }
  };

  if (!isLoaded) return <div className="p-12 text-center text-gray-400">Loading budget...</div>;

  return (
    <StandardPageShell
      title="Liquidity Limits"
      description="Manage and track your monthly capital burn rates across all vectors."
      showBack={true}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Primary Controls & Gauge */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-8 xl:sticky xl:top-32">
          <section className="interactive-card rounded-2xl p-10 flex flex-col items-center">
            <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle className="text-slate-100 dark:text-white/5" cx="50%" cy="50%" fill="transparent" r={radius} stroke="currentColor" strokeWidth="14"></circle>
                <circle 
                  className={`transition-all duration-1000 ${progress > 100 ? 'text-red-500' : 'text-secondary'}`} 
                  cx="50%" cy="50%" fill="transparent" r={radius} 
                  stroke="currentColor" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={dashoffset} 
                  strokeLinecap="round" strokeWidth="14"
                ></circle>
              </svg>
              <div className="absolute flex flex-col items-center text-center px-4 max-w-full">
                <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest truncate max-w-[160px]">Remaining</span>
                <span className="text-3xl md:text-4xl font-extrabold text-[#1A1F36] dark:text-white py-2 tracking-tighter break-all line-clamp-2 max-w-[180px] md:max-w-[220px]">
                  {settings.currency}{remaining.toLocaleString()}
                </span>
                <div className="h-1 w-12 bg-secondary rounded-full my-2"></div>
                <span className="text-xs md:text-sm font-semibold text-slate-500 truncate max-w-[180px] md:max-w-[220px]">
                  of {settings.currency}{currentBudget.toLocaleString()} budget
                </span>
              </div>
            </div>
          </section>

          <section className="interactive-card rounded-2xl p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:justify-between sm:items-start mb-8">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Monthly Budget</p>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-slate-400">{settings.currency}</span>
                    <input 
                      type="number" 
                      value={newLimit}
                      onChange={(e) => setNewLimit(e.target.value)}
                      className="min-w-0 bg-transparent text-3xl font-bold text-[#1A1F36] dark:text-white outline-none w-full max-w-[200px] border-b-2 border-primary"
                      autoFocus
                    />
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-[#1A1F36] dark:text-white ui-safe-text break-all">{settings.currency}{currentBudget.toLocaleString()}</p>
                )}
              </div>
              <button 
                onClick={() => {
                  if (isEditing) {
                    handleSaveBudget();
                  } else {
                    setNewLimit(currentBudget.toString());
                    setIsEditing(true);
                  }
                }}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 shadow-sm pressable hover:bg-slate-50 dark:border-white/10 dark:bg-white/5"
              >
                <span className="material-symbols-outlined text-secondary text-lg">{isEditing ? "save" : "edit"}</span>
                <span className="text-sm font-bold text-[#1A1F36] dark:text-white">{isEditing ? "Save" : "Adjust Limit"}</span>
              </button>
            </div>
            
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex gap-3">
              <span className="material-symbols-outlined text-primary">info</span>
              <p className="text-xs text-primary/80 leading-relaxed">
                We recommend allocating no more than 50% of your income ({settings.currency}{(settings.income / 2).toLocaleString()}) to essential spending.
              </p>
            </div>
          </section>
        </div>

        {/* Right Column: Transaction List for context */}
        <div className="lg:col-span-12 xl:col-span-7">
          <section className="interactive-card rounded-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-[#1A1F36] dark:text-white">Recent Spending</h3>
                <p className="text-sm text-slate-400 mt-1">Transaction history for {now.toLocaleString('default', { month: 'long' })}.</p>
              </div>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-white/5">
              {monthlyTransactions.slice(0, 10).map((t) => (
                <div key={t.id} className="p-6 flex items-center justify-between gap-4 group hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors">
                  <div className="flex min-w-0 items-center gap-4 sm:gap-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl text-slate-500">payments</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-[#1A1F36] dark:text-white">{t.note || "Expense"}</p>
                      <p className="text-xs text-slate-400 capitalize">{t.category} / {new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#1A1F36] dark:text-white">{settings.currency}{t.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {monthlyTransactions.length === 0 && (
                <div className="p-16 text-center flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-700">
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-2 shadow-inner border border-slate-100 dark:border-white/10">
                    <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-white/20">wallet</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-bold text-sm">No Transactions</p>
                  <p className="text-slate-400 text-xs max-w-[220px] leading-relaxed mx-auto">You haven&apos;t authorized any entries for this period yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </StandardPageShell>
  );
}
