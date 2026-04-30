"use client";

import { useStore } from "../lib/store";
import StandardPageShell from "../components/StandardPageShell";
import Image from "next/image";

export default function Profile() {
  const { settings, isLoaded, transactions } = useStore();

  const totalSpent = transactions.filter(t => t.type !== "income").reduce((acc, t) => acc + t.amount, 0);
  const healthScore = totalSpent > 0 ? 82 : 0;

  if (!isLoaded) return <div className="p-12 text-center text-gray-400">Loading identity...</div>;

  return (
    <StandardPageShell
      title="Identity"
      description="Personalized financial signature and health metrics."
      showBack={true}
    >
      <div className="space-y-12">
        {/* Profile Header */}
        <section className="interactive-card rounded-[28px] p-12 flex flex-col items-center text-center">
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-secondary/5 to-transparent"></div>
            
            <div className="relative z-10">
                <div className="w-40 h-40 rounded-full border-8 border-white dark:border-white/10 shadow-2xl overflow-hidden ring-4 ring-secondary/20">
                    <Image 
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300" 
                        alt="Profile" width={160} height={160} className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute bottom-2 right-2 w-12 h-12 bg-secondary text-white rounded-full border-4 border-white dark:border-[#1A1F36] flex items-center justify-center shadow-xl">
                    <span className="material-symbols-outlined fill-1">verified</span>
                </div>
            </div>

            <div className="mt-8 space-y-2 z-10 min-w-0">
                <h2 className="text-4xl font-black text-[#1A1F36] dark:text-white truncate max-w-full">{settings.name || "Member"}</h2>
                <p className="text-xs font-bold text-secondary uppercase tracking-widest">Atelier Tier I</p>
            </div>
        </section>

        {/* Vital Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="interactive-card p-8 rounded-[28px] space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Health Score</p>
                <p className="text-4xl font-black text-secondary">{healthScore}</p>
            </div>
            <div className="interactive-card p-8 rounded-[28px] space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Wealth Volume</p>
                <p className="text-4xl font-black text-[#1A1F36] dark:text-white truncate max-w-full">{settings.currency}{(totalSpent / 1000).toFixed(1)}k</p>
            </div>
            <div className="interactive-card p-8 rounded-[28px] space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Consistency</p>
                <p className="text-4xl font-black text-[#22C55E]">94%</p>
            </div>
        </div>

        {/* Verification / Security Status */}
        <section className="interactive-card p-10 rounded-[28px] text-white shadow-2xl shadow-secondary/20 flex flex-col md:flex-row items-center gap-10" style={{ backgroundColor: 'var(--secondary)' }}>
            <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-5xl">lock</span>
            </div>
            <div className="flex-1 space-y-2 min-w-0">
                <h3 className="text-2xl font-black truncate max-w-full">Zero-Knowledge Storage</h3>
                <p className="text-white/80 text-sm leading-relaxed font-medium">Your data is currently fortified with client-side obfuscation. No financial records ever leave this physical device.</p>
            </div>
            <div className="shrink-0 font-bold text-xs uppercase border border-white/30 px-6 py-3 rounded-full tracking-widest backdrop-blur-sm">Active Protection</div>
        </section>
      </div>
    </StandardPageShell>
  );
}
