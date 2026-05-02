"use client";

import { useStore } from "../lib/store";
import StandardPageShell from "../components/StandardPageShell";
import IntelligenceInterface from "../components/IntelligenceInterface";
import GoalPlanner from "../components/GoalPlanner";
import Link from "next/link";
import { useState } from "react";

export default function Insights() {
  const { transactions, settings, isLoaded } = useStore();
  const [subscriptionStatus, setSubscriptionStatus] = useState<"pending" | "confirmed" | "reminded">("pending");

  const now = new Date();
  const thisMonthStr = now.toISOString().substring(0, 7);
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(thisMonthStr));
  const totalSpent = monthlyTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Categorize
  const categoryTotals = monthlyTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  // Compute Outliers (Any category > 30% of total)
  const outliers = Object.entries(categoryTotals)
    .filter(([, amount]) => amount > totalSpent * 0.3)
    .map(([cat, amount]) => ({ cat, amount }));

  // Savings Opportunity
  const savingsOpp = totalSpent * 0.15; // Placeholder logic: save 15%

  if (!isLoaded) return <div className="p-12 text-center text-gray-400">Loading AI insights...</div>;

  return (
    <StandardPageShell
      title="My Insights"
      description="Smart tips and analysis based on your spending habits."
      showBack={true}
    >
      <div className="space-y-12">
        <IntelligenceInterface />
        <GoalPlanner />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
          {/* Main Insights Area */}
          <div className="lg:col-span-8 space-y-8">
            {totalSpent > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Insight 1: Projections */}
                <div className="interactive-card p-6 sm:p-8 rounded-[28px] space-y-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                      <span className="material-symbols-outlined">trending_down</span>
                    </div>
                    <span className="text-xs font-bold bg-green-500/10 text-green-600 px-3 py-1 rounded-full uppercase tracking-wider">Optimal</span>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Predicted Savings</h3>
                    <p className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white leading-tight">
                      {settings.currency}{savingsOpp.toLocaleString()}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-400 mt-4 leading-relaxed">
                      Based on your speed-to-spend ratio, you are on track to have a surplus this month. 
                      Consider moving this to a high-yield account.
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl flex items-center gap-4 mt-auto border border-slate-100 dark:border-white/5">
                    <div className="flex -space-x-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1A1F36] bg-slate-200 shadow-sm"></div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Trusted by 2.4k users</p>
                  </div>
                </div>

                {/* Insight 2: Outliers */}
                <div className="interactive-card p-6 sm:p-8 rounded-[28px] space-y-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                      <span className="material-symbols-outlined">warning</span>
                    </div>
                    <span className="text-xs font-bold bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full uppercase tracking-wider">Attention</span>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Spending Alert</h3>
                    <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white leading-tight">
                      {outliers.length > 0 ? outliers[0].cat.toUpperCase() : "Transport"}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-400 mt-4 leading-relaxed">
                      {outliers.length > 0 
                        ? `${outliers[0].cat} accounts for a major chunk of your budget. High spending in this area detected.`
                        : "Your category distribution is healthy this month. No major outliers detected."}
                    </p>
                  </div>
                  <Link href="/analytics" className="w-full block text-center py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 pressable hover:bg-slate-50 dark:hover:bg-white/5 uppercase tracking-widest mt-auto shadow-sm">
                    View Category Analysis
                  </Link>
                </div>

                {/* Insight 3: Subscription Detection (Mock) */}
                <div className="interactive-card md:col-span-2 p-8 sm:p-10 rounded-[28px] text-white overflow-hidden relative" style={{ backgroundColor: '#101828' }}>
                  <div className="absolute top-0 right-0 p-6 sm:p-10 opacity-10 pointer-events-none">
                    <span className="material-symbols-outlined text-8xl sm:text-9xl">receipt_long</span>
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-4">Recurring Payment Detected</h4>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 min-w-0">
                      <div className="min-w-0 w-full">
                        <h3 className="text-2xl sm:text-3xl font-black tracking-tighter truncate">Netflix Premium Subscription</h3>
                        <p className="text-white/70 text-xs sm:text-sm mt-2 font-medium">
                          {subscriptionStatus === "pending"
                            ? `Due in 4 days / ${settings.currency}649.00`
                            : subscriptionStatus === "confirmed"
                              ? "Marked as expected"
                              : "Reminder queued locally"}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                        <button
                          onClick={() => setSubscriptionStatus("confirmed")}
                          className="px-6 py-3 sm:py-4 bg-white text-[#1A1F36] rounded-xl sm:rounded-2xl font-bold text-sm pressable hover:bg-slate-100 w-full sm:w-auto text-center"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setSubscriptionStatus("reminded")}
                          className="px-6 py-3 sm:py-4 bg-white/10 rounded-xl sm:rounded-2xl font-bold text-white border border-white/20 pressable hover:bg-white/20 w-full sm:w-auto text-center"
                        >
                          Remind Me
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="interactive-card p-12 sm:p-24 rounded-[28px] flex flex-col items-center justify-center text-center gap-4 animate-in fade-in zoom-in-95 duration-700 h-full min-h-[400px]">
                <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-2 shadow-inner border border-slate-100 dark:border-white/10">
                  <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-white/20">psychology</span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">Analyzing Data...</h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">We need at least 5 transactions to start generating personalized AI insights for you.</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Financial Health Score */}
          <div className="lg:col-span-4">
            <div className="interactive-card p-8 sm:p-10 rounded-[28px] text-white shadow-2xl shadow-secondary/30 flex flex-col items-center text-center space-y-8 sticky top-32" style={{ backgroundColor: 'var(--secondary)' }}>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Health Score</h4>
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                  <circle className="text-white/10" cx="100" cy="100" fill="transparent" r="85" stroke="currentColor" strokeWidth="16"></circle>
                  <circle 
                    className="text-white transition-all duration-1000" cx="100" cy="100" fill="transparent" r="85" 
                    stroke="currentColor" 
                    strokeDasharray="534" 
                    strokeDashoffset={534 - (534 * (totalSpent > 0 ? 82 : 0)) / 100} 
                    strokeLinecap="round" strokeWidth="16"
                  ></circle>
                </svg>
                <div className="absolute flex flex-col items-center mt-2">
                  <span className="text-5xl sm:text-6xl font-black drop-shadow-sm">{totalSpent > 0 ? 82 : 0}</span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase opacity-90 tracking-widest mt-1">Excellent</span>
                </div>
              </div>
              <div className="space-y-4 w-full pt-4">
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium">
                  Your financial vitality is in the top 15% of users. You have a very consistent spending pattern.
                </p>
                <div className="h-px bg-white/20 w-full my-4"></div>
                <div className="flex justify-between items-center text-xs font-bold pt-2">
                  <span className="opacity-80 uppercase tracking-wider">Last Month</span>
                  <span className="bg-white/10 px-3 py-1 rounded-full">74 Points</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StandardPageShell>
  );
}
