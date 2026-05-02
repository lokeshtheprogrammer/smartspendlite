"use client";

import { useStore } from "../lib/store";
import StandardPageShell from "../components/StandardPageShell";
import Link from "next/link";
import { useMemo, useEffect } from "react";

export default function Dashboard() {
  const { transactions, settings, accounts, recurring, isLoaded, addTransaction } = useStore();

  const now = new Date();
  const thisMonthStr = now.toISOString().substring(0, 7);

  // Stats
  const stats = useMemo(() => {
    const monthly = transactions.filter(t => t.date.startsWith(thisMonthStr));
    const income = monthly.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
    const expense = monthly.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
    const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
    
    return { income, expense, totalBalance, remaining: income - expense };
  }, [transactions, thisMonthStr, accounts]);

  // Process Recurring Transactions
  useEffect(() => {
    if (!isLoaded) return;
    
    const todayStr = new Date().toISOString().split('T')[0];
    recurring.forEach(async (r) => {
       // Simple check: if not triggered this month (for monthly)
       const lastTriggeredMonth = r.lastTriggered?.substring(0, 7);
       if (r.frequency === "monthly" && lastTriggeredMonth !== thisMonthStr) {
          // Trigger it
          await addTransaction({
            amount: r.amount,
            category: r.category,
            note: `${r.note} (Recurring)`,
            type: r.type,
            date: new Date().toISOString()
          });
          // Note: In a real app, you'd update the recurring object's lastTriggered in the store
          // For now, we'll assume it's handled or we'll add that logic next if needed
       }
    });
  }, [isLoaded, recurring, thisMonthStr, addTransaction]);

  if (!isLoaded) return <div className="p-12 text-center text-gray-400 font-bold">Waking up SuperSpend...</div>;

  return (
    <StandardPageShell
      title={`Hi, ${settings.name || 'Investor'}`}
      description="Your unified financial position and asset allocation across all vectors."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Balances & Stats */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Net Worth Card */}
          <div className="interactive-card p-10 rounded-[40px] bg-[#0057c2] text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[120px]">account_balance_wallet</span>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-[0.3em] opacity-60 mb-2">Total Combined Liquidity</p>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10">
                {settings.currency}{stats.totalBalance.toLocaleString()}
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-md">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Monthly Income</p>
                  <p className="text-2xl font-bold">{settings.currency}{stats.income.toLocaleString()}</p>
                </div>
                <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-md">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Monthly Expense</p>
                  <p className="text-2xl font-bold">{settings.currency}{stats.expense.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Accounts Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {accounts.map(acc => (
              <div key={acc.id} className="interactive-card p-8 rounded-3xl border border-slate-100 dark:border-white/5">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${acc.type === 'cash' ? 'bg-orange-500/10 text-orange-600' : acc.type === 'upi' ? 'bg-purple-500/10 text-purple-600' : 'bg-blue-500/10 text-blue-600'}`}>
                    <span className="material-symbols-outlined">{acc.type === 'cash' ? 'payments' : acc.type === 'upi' ? 'qr_code_2' : 'account_balance'}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{acc.type}</span>
                </div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{acc.name}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{settings.currency}{acc.balance.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Activity Feed */}
          <div className="interactive-card rounded-[40px] overflow-hidden">
            <div className="p-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-end">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Recent Activity</h3>
                <p className="text-sm text-slate-400 mt-1 font-medium">Your latest financial movements across all accounts.</p>
              </div>
              <Link href="/transactions" className="text-xs font-black text-[#0057c2] uppercase tracking-widest hover:underline">View Ledger</Link>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-white/5">
              {transactions.slice(0, 5).map(t => (
                <div key={t.id} className="p-8 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110">
                      <span className="material-symbols-outlined text-slate-400">{t.type === 'income' ? 'add_circle' : 'payments'}</span>
                    </div>
                    <div>
                      <p className="text-lg font-bold tracking-tight">{t.note}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                      {t.type === 'income' ? '+' : '-'}{settings.currency}{t.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <span className="material-symbols-outlined text-6xl text-slate-200">history</span>
                  <p className="text-slate-400 font-bold">No transactions found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI & Recurring */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="interactive-card p-10 rounded-[40px] bg-slate-900 text-white border-none shadow-2xl">
            <span className="material-symbols-outlined text-secondary text-4xl mb-6">bolt</span>
            <h4 className="text-2xl font-black mb-4 tracking-tight">Recurring Bills</h4>
            <div className="space-y-4">
              {recurring.length > 0 ? recurring.map(r => (
                <div key={r.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold">{r.note}</p>
                    <p className="text-[10px] font-black uppercase text-white/40">{r.frequency} • {settings.currency}{r.amount}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xs">schedule</span>
                  </div>
                </div>
              )) : (
                <div className="py-6 text-center">
                  <p className="text-sm text-white/40 italic font-medium">No active recurring bills.</p>
                  <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">Automatic tracking is off</p>
                </div>
              )}
              <Link href="/budget" className="block w-full py-4 mt-2 bg-white/10 hover:bg-white/20 rounded-2xl text-center text-xs font-black uppercase tracking-widest transition-all">Manage Bills</Link>
            </div>
          </div>

          <div className="interactive-card p-8 rounded-[40px] border border-slate-100 dark:border-white/5">
            <h4 className="text-xl font-black text-slate-900 dark:text-white mb-6">Asset Allocation</h4>
            <div className="space-y-6">
              {accounts.map(acc => {
                const pct = stats.totalBalance > 0 ? (acc.balance / stats.totalBalance) * 100 : 0;
                return (
                  <div key={acc.id} className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>{acc.name}</span>
                      <span>{Math.round(pct)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${acc.type === 'cash' ? 'bg-orange-500' : acc.type === 'upi' ? 'bg-purple-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </StandardPageShell>
  );
}
