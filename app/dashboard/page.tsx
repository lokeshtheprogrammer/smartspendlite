"use client";

import { useStore } from "../lib/store";
import { useAuth } from "../lib/auth";
import { useRouter } from "next/navigation";
import StandardPageShell from "../components/StandardPageShell";
import { PageSkeleton } from "../components/LoadingSkeleton";
import { EnhancedCard } from "../components/enhanced/EnhancedCard";
import { AnimatedMetric } from "../components/enhanced/AnimatedMetric";
import { MiniChart } from "../components/enhanced/MiniChart";
import { QuickActions, createQuickActions } from "../components/enhanced/QuickActions";
import AddExpenseModal from "../components/AddExpenseModal";
import PanicModeModal from "../components/enhanced/PanicModeModal";
import { useState, useRef, useEffect } from "react";
import { parseTransactionInput } from "../lib/transactionParser";

export default function Dashboard() {
  const { transactions, budgets, settings, isLoaded, addTransaction, updateBudget } = useStore();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [omniInput, setOmniInput] = useState("");
  const [omniState, setOmniState] = useState<"idle" | "parsing" | "success">("idle");
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [editingCatBudget, setEditingCatBudget] = useState<string | null>(null);
  const [newCatLimit, setNewCatLimit] = useState("");
  const [isPanicModeOpen, setIsPanicModeOpen] = useState(false);
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleExport = () => {
    const headers = ["Date", "Category", "Note", "Amount", "Type"];
    const escapeCsv = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.category,
      t.note,
      t.amount,
      t.type
    ]);
    const csvContent = headers.join(",") + "\n"
      + rows.map(e => e.map(escapeCsv).join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `smartspend_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const quickActions = createQuickActions(
    () => setIsExpenseModalOpen(true), 
    handleExport,
    () => setIsPanicModeOpen(true)
  );

  const handleOmniSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!omniInput.trim()) return;
    
    setOmniState("parsing");
    setAiFeedback(null);
    
    setTimeout(() => {
      const parsed = parseTransactionInput(omniInput);
      if (parsed.amount > 0) {
        const cat = parsed.category !== "income" ? parsed.category : "other";
        addTransaction({
          amount: parsed.amount,
          category: cat,
          note: parsed.merchant || "Quick Entry",
          type: parsed.type,
        });
        
        const catBudgetObj = budgets.find(b => b.month === thisMonthStr && b.category === cat);
        const currentCatSpend = monthlyTransactions.filter(t => t.category === cat).reduce((sum, t) => sum + t.amount, 0);
        const newCatTotal = currentCatSpend + parsed.amount;

        // Generate Category Intelligence Feedback
        let feedback = "";
        if (catBudgetObj) {
          const pct = Math.round((newCatTotal / catBudgetObj.limit) * 100);
          const status = pct > 100 ? "Exceeded 🚨" : pct >= 80 ? "Warning ⚠️" : "Stable ✅";
          feedback = `${cat.charAt(0).toUpperCase() + cat.slice(1)}: ${settings.currency}${newCatTotal} / ${settings.currency}${catBudgetObj.limit} (${pct}%) – ${status}`;
        } else {
          const isLarge = parsed.amount > (safeBudget * 0.1);
          const daysLeftTemp = Math.max(1, Math.floor((safeBudget - (monthlySpend + parsed.amount)) / parsed.amount));
          feedback = isLarge 
            ? `Watch out! You may run out of budget in ${daysLeftTemp} days at this pace.`
            : `${cat.charAt(0).toUpperCase() + cat.slice(1)} spending is up a bit this week. You are doing fine.`;
        }
          
        setAiFeedback(feedback);
        setOmniState("success");
        setOmniInput("");
        setTimeout(() => {
          setOmniState("idle");
          setTimeout(() => setAiFeedback(null), 5000);
        }, 2000);
      } else {
        setOmniState("idle");
        setIsExpenseModalOpen(true);
      }
    }, 400);
  };

  // Zero-Effort Background Intelligence (Paste/SMS Auto-Capture)
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // Don't hijack if user is explicitly typing somewhere else
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      
      const pastedText = e.clipboardData?.getData('text');
      if (!pastedText || pastedText.length < 5) return;
      
      setOmniState("parsing");
      setAiFeedback("Reading your pasted text...");
      
      setTimeout(() => {
        const parsed = parseTransactionInput(pastedText);
        if (parsed.amount > 0) {
          const cat = parsed.category !== "income" ? parsed.category : "other";
          addTransaction({
            amount: parsed.amount,
            category: cat,
            note: parsed.merchant || "Auto-Captured Receipt",
            type: parsed.type,
          });
          
          setAiFeedback(`Added ${cat}: ${settings.currency}${parsed.amount}. Records updated.`);
          setOmniState("success");
          setTimeout(() => {
            setOmniState("idle");
            setTimeout(() => setAiFeedback(null), 4000);
          }, 2000);
        } else {
          setOmniState("idle");
          setAiFeedback("Could not read amount. Please try again or add manually.");
          setTimeout(() => setAiFeedback(null), 3000);
        }
      }, 800); // Slight delay for dramatic AI effect
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [addTransaction, settings.currency]);

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const thisMonthStr = now.toISOString().substring(0, 7);

  const todayTransactions = transactions.filter(t => t.date.startsWith(todayStr));
  const todaySpend = todayTransactions.reduce((acc, t) => acc + t.amount, 0);

  const monthlyTransactions = transactions.filter(t => t.date.startsWith(thisMonthStr));
  const monthlySpend = monthlyTransactions.reduce((acc, t) => acc + t.amount, 0);

  const currentBudget = budgets.find(b => b.month === thisMonthStr)?.limit || settings.income / 2;
  const safeBudget = currentBudget || 1;
  const budgetProgress = (monthlySpend / safeBudget) * 100;

  // Waveform HUD State Logic
  const isSafe = budgetProgress < 75;
  const isWarning = budgetProgress >= 75 && budgetProgress < 90;

  const waveColor = isSafe ? 'from-emerald-400 to-teal-500' : isWarning ? 'from-secondary to-purple-500' : 'from-orange-500 to-red-500';
  const waveSpeed = isSafe ? '15s' : isWarning ? '8s' : '4s';
  const statusText = isSafe ? 'On Track' : isWarning ? 'Getting Close' : 'Budget Exceeded';
  const statusIcon = isSafe ? 'water_drop' : isWarning ? 'waves' : 'tsunami';

  const recentActivity = transactions.slice(0, 5);
  
  // Generate sample data for charts
  const chartData = transactions.slice(-7).map(t => t.amount);
  const previousMonthSpend = monthlyTransactions.slice(-30).reduce((acc, t) => acc + t.amount, 0) * 0.8; // Simulated previous month

  // Time Travel Calculations
  const currentDay = Math.max(1, now.getDate());
  const dailyBurn = monthlySpend / currentDay;
  const amountLeft = safeBudget - monthlySpend;
  const isExceeded = amountLeft < 0;
  const daysLeft = Math.floor(dailyBurn > 0 ? Math.max(0, amountLeft) / dailyBurn : 30);

  // Inline Exploration Aggregation
  const categoryTotals = monthlyTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);
  // Category Initialization fallback for Auto EMI
  const categoriesList = ['food', 'emi', 'transport', 'shopping', 'utilities'];
  categoriesList.forEach(c => {
    if (!categoryTotals[c]) categoryTotals[c] = 0;
  });

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (!isLoaded || authLoading) return (
    <StandardPageShell
      title="Loading..."
      description="Preparing your financial dashboard."
    >
      <PageSkeleton />
    </StandardPageShell>
  );

  if (!user) return null; // Prevent flicker while redirecting

  return (
    <StandardPageShell
      title={`Good evening, ${settings.name || "Member"}`}
      description="Money is the defence to solve or face many problems."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          
          {/* Quick Add - Type to Log */}
          <div className="relative group/omni animate-premium-reveal flex flex-col" style={{ animationDelay: '0ms' }}>
            <div className="flex justify-between items-end mb-2 px-1 z-10">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Quick Add</span>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md" title="Listening for SMS/Receipt clipboard drops">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Auto-Capture Active</span>
              </div>
            </div>
            
            <div className={`absolute inset-0 -inset-x-1 -inset-y-1 rounded-[24px] bg-gradient-to-r blur-xl transition-all duration-700 -z-10 ${
              omniState === 'success' ? 'from-emerald-500/0 via-emerald-500/40 to-emerald-500/0 opacity-100' :
              'from-secondary/0 via-secondary/30 to-secondary/0 opacity-0 group-focus-within/omni:opacity-100'
            }`}></div>
            <form onSubmit={handleOmniSubmit} className={`relative flex items-center rounded-3xl border backdrop-blur-2xl transition-all duration-500 shadow-2xl w-full z-10 ${
              omniState === 'success' ? 'border-emerald-500/50 bg-emerald-50/90 dark:bg-emerald-900/20' :
              'border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[#0A0F1C]/90 group-focus-within/omni:border-secondary/50'
            }`}>
              <div className="absolute left-6 flex items-center justify-center">
                {omniState === 'parsing' ? (
                  <span className="material-symbols-outlined text-secondary animate-spin">data_usage</span>
                ) : omniState === 'success' ? (
                  <span className="material-symbols-outlined text-emerald-500 animate-in zoom-in">check_circle</span>
                ) : (
                  <span className="material-symbols-outlined text-slate-400 group-focus-within/omni:text-secondary transition-colors">psychology</span>
                )}
              </div>
              <input 
                type="text" 
                placeholder="Type 'spent 45 on coffee' to log instantly..."
                className="w-full bg-transparent py-5 sm:py-6 pl-16 pr-6 text-base sm:text-lg font-bold outline-none placeholder:text-slate-400/70 text-slate-900 dark:text-white"
                value={omniInput}
                onChange={(e) => setOmniInput(e.target.value)}
                disabled={omniState !== 'idle'}
              />
              <div className="absolute right-3">
                <button type="submit" disabled={!omniInput.trim() || omniState !== 'idle'} className="flex items-center justify-center h-10 sm:h-12 px-4 sm:px-6 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm pressable disabled:opacity-30 disabled:scale-100 hover:scale-105 transition-all">
                  Log
                </button>
              </div>
            </form>
            
            {/* AI Moat Feedback Banner */}
            <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-top ${
              aiFeedback ? 'max-h-20 opacity-100 scale-y-100 mt-3' : 'max-h-0 opacity-0 scale-y-0 mt-0'
            }`}>
              <div className="flex items-center gap-3 px-5 py-3.5 mx-2 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/5 border border-purple-500/20 backdrop-blur-xl shadow-lg">
                <span className="material-symbols-outlined text-purple-500 text-lg animate-pulse">auto_awesome</span>
                <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                  {aiFeedback}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Enhanced Today's Spend Card */}
            <EnhancedCard variant="glass" glow={true} className="p-6 sm:p-8 animate-premium-reveal" style={{ animationDelay: '50ms' }}>
              <div className="flex justify-between items-start gap-4 mb-6">
                <span className="text-slate-500 font-medium text-xs sm:text-sm uppercase tracking-widest">Today&apos;s Spend</span>
                <div className="bg-secondary/10 p-3 rounded-xl">
                  <span className="material-symbols-outlined text-secondary text-2xl">payments</span>
                </div>
              </div>
              <AnimatedMetric 
                value={todaySpend} 
                label="Spent Today"
                prefix={settings.currency}
                format="currency"
                className="mb-4"
              />
              <div className="flex items-center gap-2 text-slate-400 font-medium text-xs sm:text-sm">
                <span className="material-symbols-outlined text-sm">receipt_long</span>
                <span className="truncate">{todayTransactions.length} transactions today</span>
              </div>
            </EnhancedCard>

            {/* Enhanced Budget Progress Card */}
            <EnhancedCard variant={isWarning ? "gradient" : "glass"} glow={true} className="p-6 sm:p-8 animate-premium-reveal" style={{ animationDelay: '100ms' }}>
              <div className="flex justify-between items-start gap-4 mb-6">
                <span className="text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full animate-pulse ${isSafe ? 'bg-emerald-500' : isWarning ? 'bg-secondary' : 'bg-red-500'}`}></span>
                  Budget Status
                </span>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 ${isSafe ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : isWarning ? 'bg-secondary/10 text-secondary' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                  <span className="material-symbols-outlined text-sm">{statusIcon}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider">{statusText}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <AnimatedMetric 
                  value={monthlySpend} 
                  previousValue={previousMonthSpend}
                  label="This Month"
                  prefix={settings.currency}
                  format="currency"
                  trend={monthlySpend > previousMonthSpend ? "up" : "down"}
                />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                    <span>Budget Used</span>
                    <span>{Math.round(budgetProgress)}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${waveColor}`} style={{width: `${Math.min(budgetProgress, 100)}%`}}></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">of {settings.currency}{currentBudget.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </div>

          {/* Spending Trend Chart */}
          <EnhancedCard variant="glass" className="p-6 sm:p-8 animate-premium-reveal" style={{ animationDelay: '150ms' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">7-Day Spending Trend</h3>
              <span className="material-symbols-outlined text-slate-400">show_chart</span>
            </div>
            <MiniChart 
              data={chartData.length > 0 ? chartData : [100, 150, 120, 180, 140, 200, 160]} 
              height={120}
              color="#006adc"
              showGradient={true}
              animated={true}
            />
          </EnhancedCard>

          {/* Quick Actions */}
          <div className="animate-premium-reveal" style={{ animationDelay: '200ms' }}>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Quick Actions</h3>
            <QuickActions actions={quickActions} />
          </div>

          {/* Transaction Stream Section */}
          <div className="mt-10 animate-premium-reveal" style={{ animationDelay: '200ms' }}>
            <div className="flex justify-between items-center mb-6 px-1">
              <h2 className="text-xl font-bold text-[#1A1F36] dark:text-white">Transaction History</h2>
            </div>
            <div className="interactive-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto soft-scrollbar">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Entry</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Timeline</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                  {recentActivity.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-[#1A1F36] dark:text-white truncate max-w-[150px]">{t.note || "General Entry"}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 capitalize">{t.category}</td>
                      <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">{new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</td>
                      <td className="px-6 py-4 text-right font-bold text-[#1A1F36] dark:text-white">{settings.currency}{t.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  {recentActivity.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-700">
                          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-2 shadow-inner border border-slate-100 dark:border-white/10">
                            <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-white/20">account_balance_wallet</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 font-bold text-sm">Ledger is Empty</p>
                          <p className="text-slate-400 text-xs max-w-[220px] leading-relaxed mx-auto">Your secure transaction history will appear here once you authorize an entry.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence & Exploration Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Time Travel USP - Front and Center */}
          <EnhancedCard glow={true} className="p-8 animate-premium-reveal overflow-hidden relative bg-gradient-to-br from-[#1A1F36] via-[#0057c2] to-[#00a3ff] border-none shadow-2xl" style={{ animationDelay: '250ms' }}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <span className="material-symbols-outlined text-3xl text-white">schedule</span>
              <h3 className="text-xl font-black text-white tracking-tight">Budget Forecast</h3>
            </div>
            <div className="space-y-2 relative z-10">
              <p className="text-white/80 text-sm font-bold uppercase tracking-widest">At your current spending</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                {settings.currency}{Math.abs(amountLeft).toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xl sm:text-2xl text-white/60">{isExceeded ? 'overdrawn' : 'left'}</span>
              </h2>
              <div className="pt-6 flex items-center gap-3 border-t border-white/10 mt-4">
                <span className="material-symbols-outlined text-white/80 text-xl">{isExceeded ? 'warning' : 'hourglass_bottom'}</span>
                <p className="text-white text-base font-bold">
                  {isExceeded ? <span className="text-red-300">Budget limit crossed</span> : <>Budget will last <span className="text-yellow-300">{daysLeft} more days</span></>}
                </p>
              </div>
            </div>
          </EnhancedCard>

          {/* Inline Exploration (Category Velocity) */}
          <EnhancedCard variant="glass" className="p-6 animate-premium-reveal" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Spending by Category</h3>
              <span className="material-symbols-outlined text-slate-400">category</span>
            </div>
            
            <div className="space-y-4">
              {topCategories.length > 0 ? topCategories.map(([cat, total]) => {
                const isExpanded = expandedCategory === cat;
                const catTransactions = monthlyTransactions.filter(t => t.category === cat).slice(0, 4);
                const catBudgetObj = budgets.find(b => b.month === thisMonthStr && b.category === cat);
                const catLimit = catBudgetObj ? catBudgetObj.limit : 0;
                const pct = catLimit > 0 ? Math.min(100, Math.round((total / catLimit) * 100)) : 0;
                
                return (
                  <div key={cat} className="rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 overflow-hidden transition-all duration-300 hover:border-secondary/30">
                    <div className="w-full flex flex-col p-4 group">
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedCategory(isExpanded ? null : cat)}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${cat === 'emi' ? 'bg-purple-500/10 text-purple-600' : 'bg-secondary/10 text-secondary'}`}>
                            <span className="material-symbols-outlined text-lg">
                              {cat === 'food' ? 'restaurant' : cat === 'transport' ? 'directions_car' : cat === 'emi' ? 'account_balance' : cat === 'utilities' ? 'electric_bolt' : 'shopping_bag'}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white capitalize">{cat === 'emi' ? 'EMI & Loans' : cat}</p>
                            {catLimit > 0 && (
                              <p className="text-[10px] text-slate-500 font-medium">Limit: {settings.currency}{catLimit}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-black text-slate-900 dark:text-white">{settings.currency}{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                          <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-secondary' : ''} text-sm`}>expand_more</span>
                        </div>
                      </div>

                      {/* Category Budget Progress Bar */}
                      {catLimit > 0 && (
                        <div className="mt-4 w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{width: `${pct}%`}}></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Inline Expansion Area */}
                    <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0A0F1C]/30 flex flex-col gap-4">
                        
                        {/* Budget Configurator */}
                        <div className="flex items-center justify-between bg-white dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                          {editingCatBudget === cat ? (
                            <div className="flex items-center gap-2 w-full">
                              <input 
                                type="number" 
                                placeholder="New Limit..."
                                value={newCatLimit}
                                onChange={(e) => setNewCatLimit(e.target.value)}
                                className="bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none w-full border-b border-secondary"
                                autoFocus
                              />
                              <button onClick={() => {
                                if (parseFloat(newCatLimit) > 0) updateBudget(parseFloat(newCatLimit), thisMonthStr, cat);
                                setEditingCatBudget(null);
                              }} className="material-symbols-outlined text-secondary text-sm p-1">check_circle</button>
                            </div>
                          ) : (
                            <>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{catLimit > 0 ? 'Edit Limit' : 'Set Category Budget'}</span>
                              <button onClick={() => { setEditingCatBudget(cat); setNewCatLimit(catLimit > 0 ? catLimit.toString() : ""); }} className="material-symbols-outlined text-slate-400 hover:text-secondary text-sm p-1 transition-colors">edit</button>
                            </>
                          )}
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Recent Expenses</p>
                          {catTransactions.length > 0 ? (
                            <div className="space-y-3">
                              {catTransactions.map(t => (
                                <div key={t.id} className="flex justify-between items-center text-sm group/item">
                                  <span className="text-slate-600 dark:text-slate-300 font-medium truncate pr-4 group-hover/item:text-secondary transition-colors">{t.note}</span>
                                  <span className="text-slate-900 dark:text-white font-bold">{settings.currency}{t.amount}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic">No activity this month.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">category</span>
                  <p className="text-sm text-slate-400">No category data yet</p>
                </div>
              )}
            </div>
          </EnhancedCard>
        </div>
      </div>
      
      {/* Add Expense Modal */}
      <AddExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)} 
      />

      {/* Panic Mode Modal */}
      <PanicModeModal
        isOpen={isPanicModeOpen}
        onClose={() => setIsPanicModeOpen(false)}
      />
    </StandardPageShell>
  );
}
