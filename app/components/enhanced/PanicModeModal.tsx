import React, { useEffect, useState } from "react";
import { useStore } from "../../lib/store";

interface PanicModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PanicModeModal({ isOpen, onClose }: PanicModeModalProps) {
  const { transactions, settings, budgets } = useStore();
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const interval = setInterval(() => setGlitch(prev => !prev), 1500);
      return () => {
        document.body.style.overflow = "unset";
        clearInterval(interval);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const now = new Date();
  const thisMonthStr = now.toISOString().substring(0, 7);
  
  // Hard Reality Calculations
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(thisMonthStr));
  const incomeTransactions = monthlyTransactions.filter(t => t.type === "income");
  const expenseTransactions = monthlyTransactions.filter(t => t.type !== "income");

  const totalIncome = incomeTransactions.reduce((acc, t) => acc + t.amount, 0) || settings.income;
  const totalSpent = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);
  const emiSpent = expenseTransactions.filter(t => t.category === "emi").reduce((acc, t) => acc + t.amount, 0);
  
  const currentBudget = budgets.find(b => b.month === thisMonthStr)?.limit || settings.income / 2;
  const totalCashLeft = Math.max(0, totalIncome - totalSpent);
  
  const dailyBurn = totalSpent / Math.max(1, now.getDate());
  const survivalDays = Math.floor(dailyBurn > 0 ? totalCashLeft / dailyBurn : 30);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-red-900/10 pointer-events-none" style={{ animation: 'pulse 2s infinite' }}></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black/80 to-black pointer-events-none"></div>
      
      <div className="relative w-full max-w-2xl px-6">
        <div className="border border-red-500/30 bg-black/50 rounded-[32px] p-8 md:p-12 shadow-[0_0_100px_rgba(220,38,38,0.2)]">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50 animate-pulse">
                <span className="material-symbols-outlined text-4xl text-red-500">warning</span>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Panic Mode</h2>
                <p className="text-red-500/80 font-bold tracking-widest text-xs uppercase mt-1">Financial Reality Check</p>
              </div>
            </div>
            <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10">
              <span className="material-symbols-outlined text-white">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            <div className={`p-6 rounded-2xl border border-white/5 bg-white/5 transition-transform duration-75 ${glitch ? 'translate-x-1' : ''}`}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Liquid Cash</p>
              <p className="text-4xl font-black text-emerald-400 font-mono tracking-tight">{settings.currency}{totalCashLeft.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
              <p className="text-xs font-bold text-red-400/70 uppercase tracking-widest mb-2">Total Loans & EMI Burn</p>
              <p className="text-4xl font-black text-red-500 font-mono tracking-tight">{settings.currency}{emiSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-r from-red-950/50 to-orange-950/50 border border-red-500/20 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-sm font-bold text-white/60 uppercase tracking-widest mb-1">Survival Runway</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-white">{survivalDays}</span>
                  <span className="text-xl font-bold text-white/50">Days Left</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Current Velocity</p>
                <p className="text-lg font-bold text-red-400">-{settings.currency}{Math.round(dailyBurn)} / day</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
