"use client";

import { useState, useMemo } from "react";
import { useStore } from "../lib/store";
import StandardPageShell from "../components/StandardPageShell";

const CATEGORIES = ["food", "transport", "shopping", "utilities", "housing", "entertainment", "other"];

export default function Budget() {
  const { transactions, budgets, settings, updateBudget, isLoaded } = useStore();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const now = new Date();
  const thisMonthStr = now.toISOString().substring(0, 7);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate() || 1;

  const monthlyTransactions = transactions.filter(t => t.date.startsWith(thisMonthStr) && t.type !== "income");
  const spentTotal = monthlyTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Budgets
  const totalBudget = budgets.find(b => b.month === thisMonthStr && !b.category)?.limit || settings.income / 2;
  const categoryBudgets = useMemo(() => {
    return CATEGORIES.map(cat => {
      const budget = budgets.find(b => b.month === thisMonthStr && b.category === cat)?.limit || 0;
      const spent = monthlyTransactions.filter(t => t.category === cat).reduce((acc, t) => acc + t.amount, 0);
      return { name: cat, limit: budget, spent };
    });
  }, [budgets, monthlyTransactions, thisMonthStr]);

  // Predictive Logic
  const dailyAverage = spentTotal / currentDay;
  const projectedTotal = dailyAverage * daysInMonth;
  const runOutDay = Math.floor(totalBudget / (dailyAverage || 1));
  const isOverBudgetProjected = projectedTotal > totalBudget;

  const handleSaveBudget = (category?: string) => {
    const val = parseFloat(editValue);
    if (!isNaN(val) && val >= 0) {
      updateBudget(val, thisMonthStr, category);
      setEditingCategory(null);
    }
  };

  if (!isLoaded) return <div className="p-12 text-center text-gray-400 font-bold">Initializing Budget Intelligence...</div>;

  return (
    <StandardPageShell
      title="Budget Intelligence"
      description="Smart capital allocation and predictive burn-rate analytics."
      showBack={true}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Budget Gauge & Prediction */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Prediction Banner */}
          <div className={`p-6 rounded-[32px] border flex items-center gap-6 animate-in slide-in-from-top-4 duration-700 ${isOverBudgetProjected ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isOverBudgetProjected ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
              <span className="material-symbols-outlined text-3xl">
                {isOverBudgetProjected ? "warning" : "verified"}
              </span>
            </div>
            <div>
              <h4 className="text-lg font-black tracking-tight">
                {isOverBudgetProjected 
                  ? `Over-budget Alert: Day ${Math.min(runOutDay, daysInMonth)}` 
                  : "Spending on Track"}
              </h4>
              <p className="text-sm font-medium opacity-80">
                {isOverBudgetProjected 
                  ? `At your current rate, you will exceed your budget by ${settings.currency}${(projectedTotal - totalBudget).toLocaleString()} this month.`
                  : "Great job! You are currently trending to stay within your monthly limit."}
              </p>
            </div>
          </div>

          <div className="interactive-card p-10 rounded-[40px] grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-black tracking-tight">Monthly Limit</h3>
              <div className="relative group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Allocated</p>
                {editingCategory === "total" ? (
                  <div className="flex items-end gap-3 pb-2 border-b-4 border-secondary">
                    <span className="text-2xl font-black text-slate-300">{settings.currency}</span>
                    <input 
                      type="number"
                      autoFocus
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={() => handleSaveBudget()}
                      className="bg-transparent text-5xl font-black outline-none w-full"
                    />
                  </div>
                ) : (
                  <div 
                    onClick={() => { setEditValue(totalBudget.toString()); setEditingCategory("total"); }}
                    className="cursor-pointer group"
                  >
                    <p className="text-5xl font-black text-slate-800 dark:text-white transition-transform group-hover:scale-[1.02]">{settings.currency}{totalBudget.toLocaleString()}</p>
                    <p className="text-xs text-secondary font-bold mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <span className="material-symbols-outlined text-sm">edit</span> Tap to change
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-6 grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Spent So Far</p>
                  <p className="text-xl font-bold">{settings.currency}{spentTotal.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Projected</p>
                  <p className="text-xl font-bold text-secondary">{settings.currency}{Math.round(projectedTotal).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
               <div className="relative w-48 h-48">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-white/5" />
                    <circle 
                      cx="50" cy="50" r="45" 
                      fill="transparent" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      strokeDasharray={2 * Math.PI * 45}
                      strokeDashoffset={(2 * Math.PI * 45) * (1 - Math.min(spentTotal / (totalBudget || 1), 1))}
                      strokeLinecap="round"
                      className={`transition-all duration-1000 ${spentTotal > totalBudget ? 'text-red-500' : 'text-secondary'}`} 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black">{Math.round((spentTotal / (totalBudget || 1)) * 100)}%</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilized</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Category Budgets */}
          <div className="interactive-card p-10 rounded-[40px]">
            <h3 className="text-xl font-black mb-10">Category Targets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {categoryBudgets.map(cat => (
                <div key={cat.name} className="space-y-4 group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{cat.name}</p>
                      <div 
                        onClick={() => { setEditValue(cat.limit.toString()); setEditingCategory(cat.name); }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        {editingCategory === cat.name ? (
                          <input 
                            autoFocus
                            type="number"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => handleSaveBudget(cat.name)}
                            className="bg-transparent border-b border-secondary font-bold text-lg w-20 outline-none"
                          />
                        ) : (
                          <p className="text-lg font-bold group-hover:text-secondary transition-colors text-slate-900 dark:text-white">
                            {settings.currency} {cat.limit > 0 ? cat.limit.toLocaleString() : "Set Limit"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Spent</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{settings.currency} {cat.spent.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${cat.spent > cat.limit && cat.limit > 0 ? 'bg-red-500' : 'bg-slate-400'}`}
                      style={{ width: `${cat.limit > 0 ? Math.min((cat.spent / cat.limit) * 100, 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights & Management */}
        <div className="space-y-8">
           <div className="interactive-card p-8 rounded-3xl !bg-slate-900 text-white border-none shadow-2xl">
              <span className="material-symbols-outlined text-secondary text-4xl mb-6">psychology</span>
              <h4 className="text-xl font-black mb-4 tracking-tight">Smart Suggestions</h4>
              <div className="space-y-4">
                {spentTotal < totalBudget * 0.8 ? (
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Surplus Alert</p>
                    <p className="text-sm leading-relaxed text-white/80">You have a projected surplus. Consider moving this to your Emergency Fund or a liquid SIP.</p>
                  </div>
                ) : (
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">Optimization</p>
                    <p className="text-sm leading-relaxed text-white/80">Your "Other" category is unusually high. Reviewing these could save you more this month.</p>
                  </div>
                )}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Tax Tip</p>
                  <p className="text-sm leading-relaxed text-white/80">Keep digital copies of your utility bills. These can be used for address proof or reimbursement claims.</p>
                </div>
              </div>
           </div>

           <div className="interactive-card p-8 rounded-3xl border border-slate-100 dark:border-white/5">
              <h4 className="text-lg font-black mb-6 text-slate-900 dark:text-white">Budget Strategy</h4>
              <div className="space-y-6">
                {[
                  { label: "Needs", pct: 50, color: "bg-blue-500" },
                  { label: "Wants", pct: 30, color: "bg-purple-500" },
                  { label: "Savings", pct: 20, color: "bg-emerald-500" },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest mb-2 text-slate-400">
                      <span>{item.label} (50/30/20 Rule)</span>
                      <span>{item.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-6 leading-relaxed italic">Following the 50/30/20 rule helps maintain a healthy financial life in the long run.</p>
           </div>
        </div>

      </div>
    </StandardPageShell>
  );
}
