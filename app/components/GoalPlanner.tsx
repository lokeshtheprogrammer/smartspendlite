"use client";

import { useState, useEffect } from "react";
import { useStore } from "../lib/store";

export default function GoalPlanner() {
  const { transactions, settings } = useStore();
  const [goalAmount, setGoalAmount] = useState<number | "">("");
  const [plan, setPlan] = useState<{
    summary: string;
    projection: string;
    fasterPlan: string;
    insight: string;
  } | null>(null);

  const calculatePlan = () => {
    if (!goalAmount || goalAmount <= 0) return;
    
    const now = new Date();
    const thisMonthStr = now.toISOString().substring(0, 7);
    const monthlyTransactions = transactions.filter(t => t.date.startsWith(thisMonthStr));
    
    const income = settings.income || 0;
    const spending = monthlyTransactions.reduce((acc, t) => acc + t.amount, 0);
    const savings = income - spending;
    
    // Formatting helper
    const formatMoney = (amount: number) => `${settings.currency}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

    let projection = "";
    let fasterPlan = "";
    let insight = "";
    
    // 1. Calculate Core Metrics & 2. Current Projection
    if (savings <= 0) {
      projection = `You are currently spending more than or equal to your income (${formatMoney(spending)}/month vs ${formatMoney(income)}/month). You won't be able to reach your goal with your current behavior.`;
      fasterPlan = `To reach your goal, you need to first create a monthly surplus by reducing expenses or increasing income.`;
    } else {
      const monthsToReach = Math.ceil(goalAmount / savings);
      projection = `At your current pace, you're saving ${formatMoney(savings)}/month — you'll reach your goal in about ${monthsToReach} month${monthsToReach > 1 ? 's' : ''}.`;
      
      // 3. Run What-if Simulations
      const reductionAmount = spending * 0.10; // 10% reduction
      const newSavings = savings + reductionAmount;
      const newMonthsToReach = Math.ceil(goalAmount / newSavings);
      const monthsSaved = monthsToReach - newMonthsToReach;
      
      if (monthsSaved > 0) {
        fasterPlan = `If you reduce spending by just ${formatMoney(reductionAmount)} (10%), you could reach it in ${newMonthsToReach} months — ${monthsSaved} month${monthsSaved > 1 ? 's' : ''} faster.`;
      } else {
        fasterPlan = `You're already saving very efficiently! Small reductions won't drastically change the timeline.`;
      }
    }

    // 4. Detect Spending Patterns & 5. Generate Smart Insights
    const categories = monthlyTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : "general items";
    
    const frequentNoteWords = ["swiggy", "zomato", "uber", "ola", "amazon", "netflix", "spotify"];
    let detectedWaste = false;
    for (const t of monthlyTransactions) {
      if (t.note && frequentNoteWords.some(w => t.note.toLowerCase().includes(w))) {
        detectedWaste = true;
        break;
      }
    }

    if (topCategory.toLowerCase() === "food" || detectedWaste) {
      insight = `Most of your spending is on ${topCategory.toLowerCase()} and small frequent expenses. Cutting just a bit there can make a big difference without affecting your lifestyle.`;
    } else if (sortedCategories.length > 0) {
      insight = `Your biggest expense is ${topCategory.toLowerCase()} (${formatMoney(sortedCategories[0][1])}). Looking for small optimizations here will speed up your savings plan safely.`;
    } else {
      insight = `Track more transactions to receive personalized coaching on where to cut back gently.`;
    }

    setPlan({
      summary: `Goal: ${formatMoney(goalAmount)}`,
      projection,
      fasterPlan,
      insight
    });
  };

  useEffect(() => {
    if (goalAmount) {
      const debounce = setTimeout(() => {
        calculatePlan();
      }, 500);
      return () => clearTimeout(debounce);
    } else {
      setPlan(null);
    }
  }, [goalAmount, transactions, settings]);

  return (
    <div className="interactive-card p-8 sm:p-10 rounded-[28px] text-white shadow-2xl relative overflow-hidden" style={{ backgroundColor: '#101828' }}>
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <span className="material-symbols-outlined text-[150px]">flag</span>
      </div>
      
      <div className="relative z-10 space-y-8">
        <div>
          <h2 className="text-2xl font-black tracking-tighter">Financial Goal Planner</h2>
          <p className="text-white/40 text-sm font-bold uppercase tracking-[0.2em] mt-2">Smart Projections</p>
        </div>

        <div className="group relative z-10">
          <div className="relative flex items-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 group-focus-within:border-secondary/50 group-focus-within:bg-white/10 w-full">
            <div className="pl-6 font-bold text-white/50">{settings.currency}</div>
            <input 
              type="number" 
              placeholder="Enter your target goal amount..."
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-transparent py-5 px-3 text-base font-bold outline-none transition-all placeholder:text-white/20 sm:py-6 sm:text-xl"
            />
          </div>
        </div>

        {plan && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
              
              {/* Goal Summary */}
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">track_changes</span>
                <span className="text-lg font-black">{plan.summary}</span>
              </div>
              
              <div className="h-px bg-white/10 w-full"></div>

              {/* Current Projection */}
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-1">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                </div>
                <p className="text-[15px] leading-relaxed text-white/90 font-medium">{plan.projection}</p>
              </div>

              {/* Faster Plan */}
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 mt-1">
                  <span className="material-symbols-outlined text-sm">bolt</span>
                </div>
                <p className="text-[15px] leading-relaxed text-white/90 font-medium">{plan.fasterPlan}</p>
              </div>

              {/* Insight / Advice */}
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 mt-1">
                  <span className="material-symbols-outlined text-sm">lightbulb</span>
                </div>
                <p className="text-[15px] leading-relaxed text-white/90 font-medium">{plan.insight}</p>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
