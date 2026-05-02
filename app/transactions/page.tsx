"use client";

import { useStore, Transaction } from "../lib/store";
import StandardPageShell from "../components/StandardPageShell";
import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

// Type definitions for better type safety
type PredictionEntry = {
  id: string;
  note: string;
  category: string;
  amount: number;
  date: string;
  isPrediction: true;
  timeLabel: string;
};

type TransactionEntry = Transaction | PredictionEntry;

const CATEGORY_MAP: Record<string, { label: string; icon: string; color: string }> = {
  food: { label: "Food", icon: "restaurant", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  transport: { label: "Travel", icon: "directions_car", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  shopping: { label: "Retail", icon: "shopping_bag", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  utilities: { label: "Bills", icon: "electric_bolt", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
  housing: { label: "Living", icon: "home", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
  entertainment: { label: "Fun", icon: "movie", color: "bg-red-500/10 text-red-600 dark:text-red-400" },
  other: { label: "Mix", icon: "more_horiz", color: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
};

export default function Transactions() {
  const { transactions, deleteTransaction, settings, isLoaded } = useStore();
  const [filter, setFilter] = useState("");
  const [parent] = useAutoAnimate();

  if (!isLoaded) return <div className="p-12 text-center text-gray-400">Loading transactions...</div>;

  // Generate predictive future transactions (Time-Travel feature)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 5);

  const predictions: PredictionEntry[] = [
    {
      id: "pred-1",
      note: "Netflix Subscription",
      category: "entertainment",
      amount: 15.99,
      date: tomorrow.toISOString(),
      isPrediction: true,
      timeLabel: "Tomorrow"
    },
    {
      id: "pred-2",
      note: "Rent / Mortgage Estimate",
      category: "housing",
      amount: (settings.income || 5000) * 0.3,
      date: nextWeek.toISOString(),
      isPrediction: true,
      timeLabel: "Next Week"
    }
  ];

  // Combine and sort
  const allEntries: TransactionEntry[] = [...predictions, ...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const filtered = allEntries.filter(t => 
    t.note.toLowerCase().includes(filter.toLowerCase()) || 
    t.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <StandardPageShell
      title="My Transactions"
      description="See your past spending and upcoming payments."
      showBack={true}
    >
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Premium Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 animate-premium-reveal">
          <div className="relative flex-1 group/input z-20">
            <div className="absolute inset-0 -inset-x-2 -inset-y-2 rounded-[24px] bg-gradient-to-r from-secondary/0 via-secondary/20 to-secondary/0 opacity-0 blur-xl transition-all duration-700 group-focus-within/input:opacity-100 -z-10"></div>
            <div className="relative flex items-center rounded-3xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0A0F1C]/80 backdrop-blur-2xl transition-all duration-500 group-focus-within/input:border-secondary/50 group-focus-within/input:bg-white dark:group-focus-within/input:bg-[#111827] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] w-full">
              <span className="absolute left-6 material-symbols-outlined text-slate-400 group-focus-within/input:text-secondary transition-colors duration-300">search</span>
              <input 
                type="text" 
                placeholder="Search history or predictions..."
                className="w-full bg-transparent py-5 pl-16 pr-6 text-base sm:text-lg font-semibold outline-none placeholder:text-slate-400 text-slate-900 dark:text-white"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Search transactions and predictions"
                role="searchbox"
              />
            </div>
          </div>
        </div>

        {/* Time-Travel Fluid Ledger */}
        <div className="relative mt-12 pl-2 sm:pl-4">
          <div className="space-y-6 sm:space-y-8" ref={parent}>
            {filtered.map((t, index) => {
              const catInfo = CATEGORY_MAP[t.category] || CATEGORY_MAP.other;
              const isPrediction = 'isPrediction' in t && t.isPrediction;
              const isFirstPrediction = index === 0 && isPrediction;
              const isFirstHistory = !isPrediction && (index === 0 || (index > 0 && 'isPrediction' in filtered[index - 1] && (filtered[index - 1] as PredictionEntry).isPrediction));

              return (
                <div key={t.id} className="relative flex gap-4 sm:gap-8 group" style={{ animationDelay: `${index * 50}ms` }}>
                  {/* Premium Timeline Rail */}
                  <div className="relative flex flex-col items-center w-8 shrink-0">
                    <div className="absolute top-8 bottom-[-48px] w-[2px] bg-gradient-to-b from-slate-200 to-slate-200 dark:from-white/10 dark:to-white/10 group-last:bg-gradient-to-b group-last:from-slate-200 group-last:to-transparent dark:group-last:from-white/10"></div>
                    
                    {/* Glowing Nodes */}
                    <div className="relative mt-8 flex items-center justify-center">
                      {(isFirstPrediction || isFirstHistory) ? (
                        <>
                          <div className={`absolute w-8 h-8 rounded-full blur-md opacity-50 ${isPrediction ? 'bg-secondary' : 'bg-slate-400 dark:bg-slate-600'}`}></div>
                          <div className={`relative z-10 w-4 h-4 rounded-full border-[3px] border-white dark:border-[#0d1424] ${isPrediction ? 'bg-secondary' : 'bg-slate-400 dark:bg-slate-500'}`}></div>
                        </>
                      ) : (
                        <div className="relative z-10 w-2 h-2 rounded-full bg-slate-300 dark:bg-white/20 transition-all duration-300 group-hover:bg-secondary group-hover:scale-150 group-hover:shadow-[0_0_10px_rgba(0,106,220,0.5)]"></div>
                      )}
                    </div>
                  </div>

                  {/* Transaction Card Wrapper */}
                  <div className="flex-1 min-w-0 animate-premium-reveal" style={{ animationDelay: `${index * 50}ms` }}>
                    
                    {/* Section Labels */}
                    {isFirstPrediction && (
                      <div className="mb-4 mt-6">
                        <span className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-secondary bg-secondary/10 dark:bg-secondary/20 px-3 py-1.5 rounded-lg border border-secondary/20 shadow-[0_0_15px_rgba(0,106,220,0.15)]">
                          <span className="material-symbols-outlined text-sm">auto_awesome</span>
                          Predicted Future
                        </span>
                      </div>
                    )}
                    {isFirstHistory && (
                      <div className="mb-4 mt-6">
                        <span className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10">
                          <span className="material-symbols-outlined text-sm">inventory_2</span>
                          Confirmed History
                        </span>
                      </div>
                    )}

                    {/* Premium Card Design */}
                    <div className={`group/card relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-6 rounded-[28px] transition-all duration-500 pressable ${
                      isPrediction 
                        ? 'bg-gradient-to-br from-secondary/5 to-transparent dark:from-secondary/10 border border-secondary/20 hover:border-secondary/40 shadow-lg shadow-secondary/5 hover:shadow-secondary/20 backdrop-blur-xl' 
                        : 'bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-white/20 hover:-translate-y-0.5'
                    }`}>
                      
                      {/* Decorative Background for Prediction */}
                      {isPrediction && (
                        <div className="absolute inset-0 rounded-[28px] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%220.04%22/%3E%3C/svg%3E')] pointer-events-none opacity-50 mix-blend-overlay z-0"></div>
                      )}

                      <div className="flex items-center gap-4 sm:gap-6 min-w-0 z-10 w-full sm:w-auto">
                        <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] flex items-center justify-center shrink-0 transition-transform duration-500 group-hover/card:scale-110 group-hover/card:rotate-3 ${
                          isPrediction ? 'bg-secondary text-white shadow-xl shadow-secondary/40' : catInfo.color
                        }`}>
                          {/* Inner glow */}
                          <div className="absolute inset-0 rounded-[20px] bg-white opacity-20 dark:opacity-10 mix-blend-overlay"></div>
                          <span className="material-symbols-outlined text-2xl sm:text-3xl relative z-10">{isPrediction ? 'auto_awesome' : catInfo.icon}</span>
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <p className={`font-extrabold text-lg sm:text-xl truncate max-w-full tracking-tight transition-colors duration-300 group-hover/card:text-secondary ${isPrediction ? 'text-secondary dark:text-secondary' : 'text-[#1A1F36] dark:text-white'}`}>
                            {t.note || "General Entry"}
                          </p>
                          <div className="flex items-center gap-2 sm:gap-3 mt-1.5 flex-wrap">
                            <span className={`text-[10px] sm:text-xs font-black tracking-widest uppercase rounded-md px-2 py-0.5 ${isPrediction ? 'bg-secondary/10 text-secondary' : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'}`}>
                              {catInfo.label}
                            </span>
                            <span className={`w-1 h-1 rounded-full ${isPrediction ? 'bg-secondary/30' : 'bg-slate-300 dark:bg-slate-700'}`}></span>
                            <span className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${isPrediction ? 'text-secondary/80' : 'text-slate-500 dark:text-slate-400'}`}>
                              {'timeLabel' in t ? (t as PredictionEntry).timeLabel : new Date(t.date).toLocaleString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-white/5 z-10 shrink-0 pl-0 sm:pl-6">
                        <div className="text-left sm:text-right">
                          <p className={`font-black text-2xl sm:text-3xl tracking-tighter ${isPrediction ? 'text-secondary dark:text-secondary drop-shadow-sm' : 'text-[#1A1F36] dark:text-white'}`}>
                            {settings.currency}{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        {!isPrediction && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTransaction(t.id);
                            }}
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 pressable hover:bg-red-500 hover:text-white transition-all duration-300 sm:opacity-0 sm:-translate-x-4 sm:group-hover/card:opacity-100 sm:group-hover/card:translate-x-0"
                            title="Delete transaction"
                            aria-label={`Delete transaction: ${t.note || 'General Entry'}`}
                          >
                            <span className="material-symbols-outlined text-2xl">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filtered.length === 0 && (
              <div className="py-32 flex flex-col items-center justify-center text-center gap-6 animate-premium-reveal">
                <div className="relative group">
                  <div className="absolute inset-0 bg-secondary/20 rounded-full blur-3xl scale-[2] transition-transform duration-1000 group-hover:scale-[3]"></div>
                  <div className="relative w-24 h-24 bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-[36px] flex items-center justify-center shadow-2xl border border-white/40 dark:border-white/10 transition-transform duration-700 group-hover:rotate-6">
                    <span className="material-symbols-outlined text-5xl text-slate-400 dark:text-white/40">inventory_2</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-3xl font-black text-[#1A1F36] dark:text-white tracking-tighter">No Records Found</h4>
                  <p className="text-base font-medium text-slate-500 mt-3 max-w-md mx-auto leading-relaxed">No transactions match your search. Try a different keyword.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StandardPageShell>
  );
}
