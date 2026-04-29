"use client";

import { useState } from "react";
import { useStore } from "../lib/store";

export default function IntelligenceInterface() {
  const { transactions, settings } = useStore();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeData = (prompt = query) => {
    if (!prompt.trim()) return;
    setIsAnalyzing(true);
    
    // Simulate thinking depth
    setTimeout(() => {
      const q = prompt.toLowerCase();
      
      // 1. Time range detection
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const thisMonthStr = now.toISOString().substring(0, 7);
      
      const lastMonthDate = new Date(now);
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      const lastMonthStr = lastMonthDate.toISOString().substring(0, 7);

      const daysAgo = (days: number) => {
        const d = new Date(now);
        d.setDate(d.getDate() - days);
        return d.toISOString();
      };

      let timeRangeName = "this month";
      let filterTime = (t: { date: string }) => t.date.startsWith(thisMonthStr);
      let compareTime = (t: { date: string }) => t.date.startsWith(lastMonthStr);

      if (q.includes("today")) {
        timeRangeName = "today";
        filterTime = (t) => t.date.startsWith(todayStr);
        compareTime = (t) => t.date.startsWith(yesterdayStr);
      } else if (q.includes("yesterday")) {
        timeRangeName = "yesterday";
        filterTime = (t) => t.date.startsWith(yesterdayStr);
      } else if (q.includes("this week")) {
        timeRangeName = "this week";
        filterTime = (t) => t.date >= daysAgo(7);
        compareTime = (t) => t.date >= daysAgo(14) && t.date < daysAgo(7);
      } else if (q.includes("last week")) {
        timeRangeName = "last week";
        filterTime = (t) => t.date >= daysAgo(14) && t.date < daysAgo(7);
      } else if (q.includes("last month")) {
        timeRangeName = "last month";
        filterTime = (t) => t.date.startsWith(lastMonthStr);
      } else if (q.includes("lately") || q.includes("last 7 days") || q.includes("recently") || q.includes("last 30 days")) {
        const days = q.includes("recently") || q.includes("last 30 days") ? 30 : 7;
        timeRangeName = days === 30 ? "recently" : "lately";
        filterTime = (t) => t.date >= daysAgo(days);
        compareTime = (t) => t.date >= daysAgo(days * 2) && t.date < daysAgo(days);
      }

      // 2. Category detection
      let detectedCategory: string | null = null;
      let categoryName = "overall";
      
      const foodKeywords = ["food", "swiggy", "zomato", "eat", "dining", "restaurant", "lunch", "dinner", "breakfast", "meal"];
      const travelKeywords = ["travel", "uber", "ola", "flight", "cab", "transport", "fuel", "petrol", "ticket"];
      const shopKeywords = ["shopping", "amazon", "flipkart", "buy", "clothes", "myntra", "shoes", "apparel"];

      if (foodKeywords.some(k => q.includes(k))) { detectedCategory = "food"; categoryName = "food"; }
      else if (travelKeywords.some(k => q.includes(k))) { detectedCategory = "travel"; categoryName = "travel"; }
      else if (shopKeywords.some(k => q.includes(k))) { detectedCategory = "shopping"; categoryName = "shopping"; }

      const filterCat = (t: { category: string; note: string }) => {
        if (!detectedCategory) return true;
        const note = (t.note || "").toLowerCase();
        const cat = (t.category || "").toLowerCase();
        
        if (cat.includes(detectedCategory) || note.includes(detectedCategory)) return true;
        
        if (detectedCategory === "food" && foodKeywords.some(k => note.includes(k) || cat.includes(k))) return true;
        if (detectedCategory === "travel" && travelKeywords.some(k => note.includes(k) || cat.includes(k))) return true;
        if (detectedCategory === "shopping" && shopKeywords.some(k => note.includes(k) || cat.includes(k))) return true;
        
        return false;
      };

      // 3. Filter transactions
      const periodData = transactions.filter(t => filterTime(t) && filterCat(t));
      const compareData = transactions.filter(t => compareTime(t) && filterCat(t));
      
      const total = periodData.reduce((sum, t) => sum + t.amount, 0);
      const compareTotal = compareData.reduce((sum, t) => sum + t.amount, 0);
      
      let answer = "";

      const income = settings.income || 0;
      const currentMonthData = transactions.filter(t => t.date.startsWith(thisMonthStr));
      const currentMonthSpend = currentMonthData.reduce((sum, t) => sum + t.amount, 0);
      const currentSavings = income - currentMonthSpend;

      // 4. Intent detection & Response Generation
      if (q.includes("broke") || q.includes("no money") || q.includes("why am i poor") || q.includes("where did my money go")) {
        const cats = currentMonthData.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);
        const top = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
        const topName = top ? top[0].toLowerCase() : "various items";
        const topAmt = top ? top[1] : 0;
        answer = `Most of your spending is on ${topName} (${settings.currency}${topAmt.toLocaleString()}) and frequent small expenses. These add up quickly and leave you with very little savings.`;
      } 
      else if (q.includes("can i buy") || q.includes("can i afford") || q.includes("should i buy")) {
        const amountMatch = q.match(/[\d,]+/);
        let amount = amountMatch ? parseInt(amountMatch[0].replace(/,/g, ''), 10) : 0;
        if (q.includes("lakh") || q.includes("lacs")) amount = (amount || 1) * 100000;
        else if (q.match(/(\d+)k/)) amount = parseInt(q.match(/(\d+)k/)?.[1] || "0", 10) * 1000;
        
        if (amount === 0) {
          answer = `I'm not sure how much it costs. But with your current savings of ${settings.currency}${currentSavings.toLocaleString()}, make sure it fits within your surplus.`;
        } else if (currentSavings >= amount) {
          answer = `You can afford it, but it will reduce your monthly savings to ${settings.currency}${(currentSavings - amount).toLocaleString()}. You might want to wait unless it’s necessary.`;
        } else {
          answer = `This costs ${settings.currency}${amount.toLocaleString()}, but your current monthly surplus is only ${settings.currency}${currentSavings.toLocaleString()}. You shouldn't buy this right now.`;
        }
      }
      else if (q.includes("reach") || q.includes("when will") || q.includes("how long")) {
        const amountMatch = q.match(/[\d,]+/);
        let target = amountMatch ? parseInt(amountMatch[0].replace(/,/g, ''), 10) : 0;
        if (q.includes("lakh") || q.includes("lacs")) target = (target || 1) * 100000;
        else if (q.match(/(\d+)k/)) target = parseInt(q.match(/(\d+)k/)?.[1] || "0", 10) * 1000;

        if (target === 0) {
          answer = `Please specify the amount you want to reach. For example, "when will I reach 1 lakh".`;
        } else if (currentSavings <= 0) {
          answer = `You are currently not saving any money. You need to reduce your spending to reach ${settings.currency}${target.toLocaleString()}.`;
        } else {
          const months = Math.ceil(target / currentSavings);
          const fasterSavings = currentSavings + 2000;
          const fasterMonths = Math.ceil(target / fasterSavings);
          answer = `At your current savings of ${settings.currency}${currentSavings.toLocaleString()}/month, you’ll reach ${settings.currency}${target.toLocaleString()} in about ${months} months. Cutting ${settings.currency}2,000 in spending can reduce it to ${fasterMonths} months.`;
        }
      }
      else if (q.includes("where") || q.includes("overspending") || (q.includes("category") && !detectedCategory)) {
        const cats = transactions.filter(filterTime).reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);
        
        const top = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
        
        if (top) {
          answer = `Most of your spending is on ${top[0].toLowerCase()} (${settings.currency}${top[1].toLocaleString()}), which is higher than your other categories — that’s where you might want to optimize.`;
        } else {
          answer = `You haven't had any spending ${timeRangeName}.`;
        }
      } else if (q.includes("compare") || q.includes("vs") || q.includes("trend") || q.includes("comparison")) {
        const prevTimeRangeName = timeRangeName === "this month" ? "last month" : "previously";
        if (total > compareTotal) {
          answer = `You spent ${settings.currency}${total.toLocaleString()} on ${categoryName} ${timeRangeName}, up from ${settings.currency}${compareTotal.toLocaleString()} ${prevTimeRangeName}. You might want to watch your spending here.`;
        } else if (total < compareTotal) {
          answer = `You spent ${settings.currency}${total.toLocaleString()} on ${categoryName} ${timeRangeName}, down from ${settings.currency}${compareTotal.toLocaleString()} ${prevTimeRangeName} — nice improvement!`;
        } else {
          answer = `You spent ${settings.currency}${total.toLocaleString()} on ${categoryName} ${timeRangeName}, which is exactly the same as ${prevTimeRangeName}.`;
        }
      } else if (q.includes("waste") || q.includes("too much")) {
        if (total > 0) {
          answer = `You spent ${settings.currency}${total.toLocaleString()} on ${categoryName} ${timeRangeName}. That’s a bit on the higher side — you might want to cut down on frequent orders or purchases.`;
        } else {
          answer = `You haven't spent anything on ${categoryName} ${timeRangeName}. Great job holding back!`;
        }
      } else if (q.includes("how much") || q.includes("total") || q.includes("spend") || q.includes("spent")) {
        if (total > 0) {
          const cats = periodData.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
          }, {} as Record<string, number>);
          const topCats = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 2).map(c => c[0].toLowerCase()).join(" and ");
          
          answer = `You've spent ${settings.currency}${total.toLocaleString()} ${timeRangeName === 'this month' ? 'so far this month' : timeRangeName}, mostly on ${topCats || categoryName}.`;
          
          if (timeRangeName === "this month" && compareTotal > 0 && total > compareTotal * 0.8 && new Date().getDate() < 20) {
             answer += " You're slightly above your usual pace.";
          } else if (total > (settings.income ? settings.income * 0.3 : 10000)) {
             answer += " That's a bit high, keep an eye on it.";
          } else {
             answer += " Your spending seems well-controlled.";
          }
        } else {
          answer = `You haven't spent anything on ${categoryName} ${timeRangeName}. Excellent!`;
        }
      } else {
        // Fallback / Unclear
        answer = `I assumed you meant your total ${categoryName} spending ${timeRangeName}. You spent ${settings.currency}${total.toLocaleString()}. Let me know if you'd like something else.`;
      }

      setResponse(answer);
      setIsAnalyzing(false);
    }, 800);
  };

  return (
    <div className="interactive-card subtle-grid relative overflow-hidden rounded-[28px] border-white/10 p-8 text-white shadow-2xl sm:p-12" style={{ background: '#101828' }}>
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <span className="material-symbols-outlined text-[200px]">psychology</span>
      </div>
      
      <div className="relative z-10 space-y-8">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Finance Intelligence</h2>
          <p className="text-white/40 text-sm font-bold uppercase tracking-[0.3em] mt-2">Local Brain v2.0 / Zero Latency</p>
        </div>

        <div className="group flex flex-col gap-3 sm:relative z-10 group/input">
          <div className="absolute inset-0 -inset-x-2 -inset-y-2 rounded-[28px] bg-gradient-to-r from-secondary/0 via-secondary/30 to-secondary/0 opacity-0 blur-xl transition-opacity duration-700 group-focus-within/input:opacity-100 -z-10"></div>
          <div className="relative flex items-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 group-focus-within/input:border-secondary/50 group-focus-within/input:bg-white/10 group-focus-within/input:shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] w-full">
            <input 
              type="text" 
              placeholder="Ask about your finances... (e.g. 'What is my total spend?')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && analyzeData()}
              className="w-full bg-transparent py-5 pl-5 pr-5 text-base font-medium outline-none transition-all placeholder:text-white/20 sm:py-6 sm:pl-8 sm:pr-32 sm:text-lg"
            />
          </div>
          <button 
            onClick={() => analyzeData()}
            disabled={isAnalyzing}
            className="flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-4 text-sm font-bold uppercase pressable hover:bg-white hover:text-secondary disabled:opacity-60 sm:absolute sm:bottom-3 sm:right-3 sm:top-3 sm:py-0"
          >
            {isAnalyzing ? (
              <span className="animate-pulse">Thinking...</span>
            ) : (
              <>
                <span>Query</span>
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
              </>
            )}
          </button>
        </div>

        {response && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-sm">robot_2</span>
              </div>
              <p className="text-lg font-medium leading-relaxed opacity-90">{response}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4">
          {["Total Spend", "Top Category", "Average Entry", "Trend Logic"].map((chip) => (
            <button 
              key={chip}
              onClick={() => {
                const prompt = `What is my ${chip.toLowerCase()}?`;
                setQuery(prompt);
                analyzeData(prompt);
              }}
              className="rounded-full border border-white/10 px-4 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-white/50 pressable hover:bg-white/10 hover:text-white"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
