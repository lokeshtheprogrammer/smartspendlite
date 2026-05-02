"use client";

import { useState } from "react";
import { useStore } from "../lib/store";
import StandardPageShell from "../components/StandardPageShell";

const GOAL_ICONS = ["flight", "smartphone", "directions_car", "home", "celebration", "shopping_bag", "restaurant"];
const GOAL_COLORS = ["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-indigo-500"];

export default function Goals() {
  const { goals, addGoal, deleteGoal, settings, isLoaded } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [type, setType] = useState<"saving" | "event">("saving");
  const [icon, setIcon] = useState(GOAL_ICONS[0]);
  const [color, setColor] = useState(GOAL_COLORS[0]);

  const handleAddGoal = () => {
    const targetAmt = parseFloat(target);
    if (!name || isNaN(targetAmt) || targetAmt <= 0) return;

    addGoal({
      name,
      targetAmount: targetAmt,
      type,
      icon,
      color,
    });
    
    setName("");
    setTarget("");
    setIsAdding(false);
  };

  if (!isLoaded) return <div className="p-12 text-center text-gray-400 font-bold">Loading your dreams...</div>;

  return (
    <StandardPageShell
      title="Goals & Events"
      description="Track specific savings for trips, gadgets, or set limits for today's outings."
      showBack={true}
    >
      <div className="flex justify-end mb-8">
        <button
          onClick={() => setIsAdding(true)}
          className="bg-[#0057c2] hover:bg-[#0066e0] text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-[#0057c2]/20 transition-all hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Create New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {goals.map((goal) => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          return (
            <div key={goal.id} className="interactive-card p-8 rounded-[32px] group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <button 
                  onClick={() => deleteGoal(goal.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 dark:bg-white/5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${goal.color} text-white shadow-lg`}>
                  <span className="material-symbols-outlined text-3xl">{goal.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">{goal.name}</h3>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    {goal.type === 'saving' ? 'Savings Target' : 'Event Limit'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-xl font-black">
                      {settings.currency}{goal.currentAmount.toLocaleString()} 
                      <span className="text-sm text-slate-300 font-bold ml-1">/ {settings.currency}{goal.targetAmount.toLocaleString()}</span>
                    </p>
                  </div>
                  <span className="text-2xl font-black text-slate-200">{Math.round(progress)}%</span>
                </div>

                <div className="h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${goal.color} rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <div className="pt-2">
                   <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                     {goal.type === 'saving' 
                        ? `${settings.currency}${Math.max(0, goal.targetAmount - goal.currentAmount).toLocaleString()} more needed to reach your goal.`
                        : goal.currentAmount > goal.targetAmount 
                           ? `You have exceeded your ${goal.name} budget by ${settings.currency}${(goal.currentAmount - goal.targetAmount).toLocaleString()}!`
                           : `You have ${settings.currency}${(goal.targetAmount - goal.currentAmount).toLocaleString()} left for this event.`
                     }
                   </p>
                </div>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && !isAdding && (
          <div className="lg:col-span-3 py-20 flex flex-col items-center text-center gap-6 opacity-30">
            <span className="material-symbols-outlined text-8xl">target</span>
            <div>
               <h3 className="text-2xl font-black">No Active Goals</h3>
               <p className="text-sm font-medium mt-1">Start tracking your dreams and events today.</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#03071d]/60 backdrop-blur-md" onClick={() => setIsAdding(false)}></div>
          <div className="relative bg-white dark:bg-[#111827] w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black mb-8">Create New Goal</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Goal Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Goa Trip, New Laptop, Wedding"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 py-4 px-6 rounded-2xl font-bold outline-none border border-transparent focus:border-[#0057c2]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Target Amount</label>
                  <input 
                    type="number" 
                    placeholder="50,000"
                    value={target}
                    onChange={e => setTarget(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 py-4 px-6 rounded-2xl font-bold outline-none border border-transparent focus:border-[#0057c2]/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Goal Type</label>
                  <select 
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-white/5 py-4 px-4 rounded-2xl font-bold outline-none border border-transparent focus:border-[#0057c2]/30 appearance-none"
                  >
                    <option value="saving">Saving Goal</option>
                    <option value="event">Event Limit</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Icon & Theme</label>
                <div className="flex flex-wrap gap-3">
                  {GOAL_ICONS.map(i => (
                    <button 
                      key={i} 
                      onClick={() => setIcon(i)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${icon === i ? 'bg-[#0057c2] text-white scale-110' : 'bg-slate-50 dark:bg-white/5 text-slate-400'}`}
                    >
                      <span className="material-symbols-outlined text-xl">{i}</span>
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  {GOAL_COLORS.map(c => (
                    <button 
                      key={c} 
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full ${c} transition-all ${color === c ? 'ring-4 ring-white dark:ring-white/20 scale-110' : ''}`}
                    ></button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button onClick={() => setIsAdding(false)} className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                <button onClick={handleAddGoal} className="flex-[2] bg-[#0057c2] text-white py-4 rounded-2xl font-black shadow-xl shadow-[#0057c2]/20 hover:scale-[1.02] active:scale-95 transition-all">Create Goal</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </StandardPageShell>
  );
}
