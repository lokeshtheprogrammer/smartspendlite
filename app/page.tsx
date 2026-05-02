"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "./lib/store";
import { useAuth } from "./lib/auth";

const FEATURES = [
  {
    icon: "account_balance_wallet",
    title: "Track Every Rupee",
    desc: "Log expenses in seconds. Just type 'spent 50 on chai' and we handle the rest.",
    color: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-400",
  },
  {
    icon: "bar_chart",
    title: "Smart Budget Alerts",
    desc: "Get real-time alerts when you're close to your monthly limit. Stay in control always.",
    color: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-400",
  },
  {
    icon: "insights",
    title: "AI Spending Insights",
    desc: "See where your money goes. Get tips to cut unnecessary spending every month.",
    color: "from-purple-500/20 to-purple-600/5",
    iconColor: "text-purple-400",
  },
  {
    icon: "schedule",
    title: "Budget Forecast",
    desc: "Know how many days your money will last at your current spending. Plan ahead.",
    color: "from-orange-500/20 to-orange-600/5",
    iconColor: "text-orange-400",
  },
  {
    icon: "flag",
    title: "Goal Planner",
    desc: "Set saving goals for phone, trip, or anything. Track your progress automatically.",
    color: "from-pink-500/20 to-pink-600/5",
    iconColor: "text-pink-400",
  },
  {
    icon: "download",
    title: "Export Anytime",
    desc: "Download your full transaction history as Excel/CSV anytime. Your data, your control.",
    color: "from-teal-500/20 to-teal-600/5",
    iconColor: "text-teal-400",
  },
];

const STATS = [
  { value: "₹0", label: "Always Free" },
  { value: "100%", label: "Private & Secure" },
  { value: "10k+", label: "Happy Users" },
  { value: "1 min", label: "Setup Time" },
];

const FAQS = [
  { q: "Is my data safe?", a: "Yes, your data is stored locally on your device and encrypted. We don't sell your data." },
  { q: "Is it really free?", a: "Yes, SuperSpend Lite is free forever. No hidden charges or premium subscriptions." },
  { q: "Can I use it on mobile?", a: "Absolutely! It works perfectly on all devices — phones, tablets, and laptops." },
];

export default function Home() {
  const router = useRouter();
  const { settings, isLoaded } = useStore();
  const { user, loading: authLoading } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);

  // Auto-redirect logged-in users
  useEffect(() => {
    if (isLoaded && !authLoading && user) {
      const target = settings.onboarded ? "/dashboard" : "/onboarding";
      router.push(target);
    }
  }, [isLoaded, authLoading, user, settings.onboarded, router]);

  const handleGetStarted = () => {
    router.push("/login");
  };

  if (authLoading || (isLoaded && user)) {
    return (
      <div className="min-h-screen bg-[#03071d] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-white/10 border-t-[#0057c2] rounded-full animate-spin"></div>
          <p className="text-white/40 text-sm font-medium">Loading SuperSpend...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03071d] text-white font-sans antialiased overflow-x-hidden selection:bg-[#0057c2]/30">

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-2xl" style={{ backgroundColor: 'rgba(3,7,29,0.8)' }}>
        <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white shadow-sm flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="SuperSpend Lite" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-black tracking-tight">SuperSpend <span className="text-[#0057c2]">Lite</span></span>
          </div>
          <button
            onClick={handleGetStarted}
            className="bg-[#0057c2] hover:bg-[#0066e0] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#0057c2]/30"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#0057c2]/20 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full"></div>
          <div className="absolute top-[20%] left-[-10%] w-[300px] h-[300px] bg-blue-400/5 blur-[80px] rounded-full"></div>
        </div>

        {/* Floating badge */}
        <div className="relative z-10 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest">Free • No Ads • 100% Private</span>
        </div>

        {/* Logo + Headline */}
        <div className="relative z-10 flex flex-col items-center text-center gap-8 animate-in fade-in zoom-in-95 duration-1000">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#0057c2] blur-3xl opacity-30 rounded-full scale-150 animate-pulse"></div>
            <div className="relative w-28 h-28 md:w-36 md:h-36 bg-white rounded-[32px] flex items-center justify-center border border-white/20 shadow-2xl transition-all duration-700 hover:scale-110 hover:rotate-2 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="SuperSpend Lite" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
              Manage Money
              <span className="block text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #4f8cff, #0057c2)' }}>
                The Smart Way
              </span>
            </h1>
            <p className="text-[#afc6ff]/80 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed px-4">
              Track expenses, set budgets, and reach your saving goals — all in one simple app built for Indians.
            </p>
          </div>

          {/* CTA Section */}
          <div className="flex flex-col items-center gap-4 w-full max-w-sm px-4">
            <button
              onClick={handleGetStarted}
              className="w-full bg-[#0057c2] hover:bg-[#0066e0] text-white font-black text-xl py-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-[#0057c2]/40 flex items-center justify-center gap-3 group"
            >
              <span className="material-symbols-outlined text-2xl group-hover:animate-bounce">rocket_launch</span>
              Get Started Free
            </button>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-[#03071d] bg-slate-700 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-white/30 text-[11px] font-bold uppercase tracking-widest">Joined by 10k+ Indians</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-40">
          <span className="text-white text-[10px] font-bold uppercase tracking-widest">Discover More</span>
          <span className="material-symbols-outlined text-white text-xl">keyboard_arrow_down</span>
        </div>
      </section>

      {/* ─── APP PREVIEW ─── */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto relative group">
          <div className="absolute inset-0 bg-[#0057c2]/20 blur-[100px] rounded-full scale-75 opacity-50"></div>
          <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-4 md:p-8 shadow-2xl transform transition-transform duration-700 hover:scale-[1.01]">
            <div className="aspect-[16/9] bg-[#0d1424] rounded-[24px] overflow-hidden border border-white/5 flex flex-col">
              {/* Fake UI Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/40"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/40"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/40"></div>
                </div>
                <div className="w-32 h-2 bg-white/10 rounded-full"></div>
                <div className="w-8 h-8 rounded-full bg-white/10"></div>
              </div>
              {/* Fake UI Body */}
              <div className="flex-1 p-8 grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                  <div className="h-40 bg-gradient-to-br from-[#0057c2]/20 to-purple-600/10 rounded-3xl border border-white/10 p-6 flex flex-col justify-end">
                     <div className="w-24 h-2 bg-white/20 rounded-full mb-3"></div>
                     <div className="w-48 h-8 bg-white/40 rounded-xl"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-white/5 rounded-2xl border border-white/10"></div>
                    <div className="h-24 bg-white/5 rounded-2xl border border-white/10"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-full bg-white/5 rounded-3xl border border-white/10 p-6">
                    <div className="w-full h-4 bg-white/20 rounded-full mb-4"></div>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-white/10"></div>
                        <div className="flex-1 space-y-2">
                          <div className="w-full h-2 bg-white/10 rounded-full"></div>
                          <div className="w-1/2 h-2 bg-white/5 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Glass overlay with text */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#03071d] via-transparent to-transparent flex items-end justify-center pb-12">
                <p className="text-white/60 font-medium text-lg">Clean. Dark. Simple. Built for speed.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section className="py-16 border-y border-white/5" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label} className="space-y-2 group">
              <p className="text-4xl md:text-5xl font-black text-white transition-transform group-hover:scale-110 duration-500">{s.value}</p>
              <p className="text-[#0057c2] text-[10px] font-black uppercase tracking-[0.2em]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section className="py-32 px-6 max-w-6xl mx-auto relative">
        <div className="text-center mb-24 space-y-4">
          <p className="text-[#0057c2] text-xs font-black uppercase tracking-[0.3em]">Powerful Intelligence</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Everything for <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #4f8cff, #0057c2)' }}>Real India</span></h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">We stripped away the complexity to give you the most efficient money manager you'll ever use.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="group relative p-10 rounded-[40px] border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-default overflow-hidden"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`,
                animationDelay: `${i * 100}ms`,
                backdropFilter: 'blur(20px)'
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] rounded-full translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-1000"></div>
              <div className={`w-16 h-16 rounded-[20px] bg-gradient-to-br ${f.color} flex items-center justify-center mb-8 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-xl`}>
                <span className={`material-symbols-outlined text-3xl ${f.iconColor}`}>{f.icon}</span>
              </div>
              <h3 className="text-xl font-black text-white mb-4 tracking-tight">{f.title}</h3>
              <p className="text-white/40 text-base leading-relaxed font-medium group-hover:text-white/60 transition-colors">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECURITY SECTION ─── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-[#0057c2]/20 to-transparent rounded-[60px] p-12 md:p-24 border border-[#0057c2]/20 flex flex-col md:flex-row items-center gap-16 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,#0057c211,transparent)] pointer-events-none"></div>
          <div className="flex-1 space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest">
              <span className="material-symbols-outlined text-base">verified_user</span>
              100% Privacy Guaranteed
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Your data never leaves <span className="text-[#0057c2]">your device.</span></h2>
            <p className="text-white/50 text-xl leading-relaxed">We use AES-256 local encryption. No clouds, no spying, no selling your spending habits to advertisers. Your financial life is your business.</p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <span className="material-symbols-outlined text-emerald-400 text-xl">check_circle</span>
                <span className="text-xs font-bold">No Server Storage</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <span className="material-symbols-outlined text-emerald-400 text-xl">check_circle</span>
                <span className="text-xs font-bold">Local Encryption</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <span className="material-symbols-outlined text-emerald-400 text-xl">check_circle</span>
                <span className="text-xs font-bold">GDPR Ready</span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3 flex justify-center relative">
            <div className="w-64 h-64 bg-[#0057c2]/10 rounded-full absolute blur-[60px] animate-pulse"></div>
            <span className="material-symbols-outlined text-[180px] md:text-[240px] text-white/10 select-none relative z-10">shield_with_heart</span>
          </div>
        </div>
      </section>

      {/* ─── FAQ SECTION ─── */}
      <section className="py-32 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black tracking-tight">Common Questions</h2>
        </div>
        <div className="space-y-4">
          {FAQS.map((f, i) => (
            <div key={i} className="p-8 rounded-[30px] bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
              <h3 className="text-lg font-black text-white mb-2 flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-[#0057c2]/20 text-[#0057c2] flex items-center justify-center text-[10px]">Q</span>
                {f.q}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed pl-9 group-hover:text-white/60 transition-colors">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0057c2]/5 blur-[120px] rounded-full scale-50"></div>
        <div className="max-w-3xl mx-auto text-center space-y-10 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Take Control of <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #4f8cff, #0057c2)' }}>Your Wealth.</span>
          </h2>
          <p className="text-white/50 text-xl leading-relaxed">Join thousands of Indians who track their money smarter with SuperSpend Lite. It takes less than 60 seconds to start.</p>
          <button
            onClick={handleGetStarted}
            className="w-full max-w-sm mx-auto bg-[#0057c2] hover:bg-[#0066e0] text-white font-black text-2xl py-8 rounded-[32px] transition-all hover:scale-[1.05] active:scale-[0.95] shadow-2xl shadow-[#0057c2]/40 flex items-center justify-center gap-4 group"
          >
            <span className="material-symbols-outlined text-3xl group-hover:animate-bounce">rocket_launch</span>
            Get Started Now
          </button>
          <p className="text-white/20 text-xs font-bold uppercase tracking-widest">Free Forever • Open Source Spirit • Private by Design</p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                <img src="/logo.png" alt="SuperSpend Lite" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-black tracking-tight">SuperSpend <span className="text-[#0057c2]">Lite</span></span>
            </div>
            <p className="text-white/30 text-sm max-w-xs">Built for the next billion users in India. Simple, fast, and completely private.</p>
          </div>
          <div className="flex gap-12 text-center md:text-left">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#0057c2]">Links</p>
              <div className="flex flex-col gap-2 text-sm text-white/40 font-bold">
                <a href="#" onClick={handleGetStarted} className="hover:text-white transition-colors">Sign In</a>
                <a href="#" onClick={handleGetStarted} className="hover:text-white transition-colors">Sign Up</a>
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/20 text-xs font-medium">Made with ❤️ for India · © 2026 SuperSpend</p>
          <div className="flex gap-6">
             <span className="text-white/10 text-xs font-black uppercase tracking-widest hover:text-white/30 cursor-pointer transition-colors">Twitter</span>
             <span className="text-white/10 text-xs font-black uppercase tracking-widest hover:text-white/30 cursor-pointer transition-colors">GitHub</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
