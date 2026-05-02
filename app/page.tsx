"use client";

import { useEffect, useState, useRef } from "react";
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
  { value: "6+", label: "Smart Features" },
  { value: "1 min", label: "Setup Time" },
];

export default function Home() {
  const router = useRouter();
  const { settings, isLoaded } = useStore();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);

  // Auto-redirect logged-in users
  useEffect(() => {
    if (isLoaded && !authLoading && user) {
      const target = settings.onboarded ? "/dashboard" : "/onboarding";
      router.push(target);
    }
  }, [isLoaded, authLoading, user, settings.onboarded, router]);

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    setError("");
    try {
      await signInWithGoogle();
    } catch {
      setError("Sign-in failed. Please try again.");
      setIsSigningIn(false);
    }
  };

  const handleGetStarted = () => {
    setShowLogin(true);
    setTimeout(() => {
      heroRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  if (authLoading || (isLoaded && user)) {
    return (
      <div className="min-h-screen bg-[#03071d] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-white/10 border-t-[#0057c2] rounded-full animate-spin"></div>
          <p className="text-white/40 text-sm font-medium">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03071d] text-white font-sans antialiased overflow-x-hidden">

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-2xl" style={{ backgroundColor: 'rgba(3,7,29,0.8)' }}>
        <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
            Get Started Free
          </button>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#0057c2]/20 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full"></div>
        </div>

        {/* Floating badge */}
        <div className="relative z-10 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest">Free • No Ads • 100% Private</span>
        </div>

        {/* Logo + Headline */}
        <div className="relative z-10 flex flex-col items-center text-center gap-6 animate-in fade-in zoom-in-95 duration-1000">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#0057c2] blur-3xl opacity-30 rounded-full scale-150 animate-pulse"></div>
            <div className="relative w-28 h-28 md:w-36 md:h-36 bg-white rounded-[32px] flex items-center justify-center border border-white/20 shadow-2xl transition-all duration-700 hover:scale-105 hover:rotate-2 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="SuperSpend Lite" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
              Manage Money
              <span className="block text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #4f8cff, #0057c2)' }}>
                The Smart Way
              </span>
            </h1>
            <p className="text-[#afc6ff]/80 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
              Track expenses, set budgets, and reach your saving goals — all in one simple app built for Indians.
            </p>
          </div>

          {/* CTA — Get Started / Login */}
          <div className="mt-4 flex flex-col items-center gap-4 w-full max-w-sm">
            {!showLogin ? (
              <button
                onClick={handleGetStarted}
                className="w-full bg-[#0057c2] hover:bg-[#0066e0] text-white font-black text-lg py-5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-[#0057c2]/40 flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                Get Started — It's Free
              </button>
            ) : (
              <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-white/50 text-sm font-medium text-center">Sign in to access your account</p>
                <button
                  onClick={handleGoogleLogin}
                  disabled={isSigningIn}
                  className="w-full bg-white text-[#1a1f36] font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shadow-2xl"
                >
                  {isSigningIn ? (
                    <div className="w-5 h-5 border-2 border-[#1a1f36]/30 border-t-[#1a1f36] rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>

                <div className="flex items-center gap-4 my-1">
                  <div className="h-[1px] bg-white/10 flex-1"></div>
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Or</span>
                  <div className="h-[1px] bg-white/10 flex-1"></div>
                </div>

                <button
                  onClick={() => router.push("/login")}
                  className="w-full bg-white/5 border border-white/10 text-white font-semibold py-4 rounded-2xl transition-all hover:bg-white/10 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-xl">mail</span>
                  Continue with Email
                </button>
                {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}
                <button
                  onClick={() => setShowLogin(false)}
                  className="w-full text-white/30 text-sm py-2 hover:text-white/60 transition-colors"
                >
                  ← Go back
                </button>
              </div>
            )}

            {!showLogin && (
              <p className="text-white/30 text-xs font-medium">No credit card required • Works on all devices</p>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">See Features</span>
          <span className="material-symbols-outlined text-white/20 text-xl">keyboard_arrow_down</span>
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section className="py-10 border-y border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label} className="space-y-1">
              <p className="text-3xl md:text-4xl font-black text-white">{s.value}</p>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-3">
          <p className="text-[#0057c2] text-xs font-black uppercase tracking-[0.3em]">Everything You Need</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Built for <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #4f8cff, #0057c2)' }}>Real India</span></h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">All the tools you need to take control of your money — simple, fast, and free.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="group relative p-8 rounded-[28px] border border-white/8 hover:border-white/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl cursor-default"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)`,
                animationDelay: `${i * 100}ms`,
                backdropFilter: 'blur(20px)'
              }}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110`}>
                <span className={`material-symbols-outlined text-2xl ${f.iconColor}`}>{f.icon}</span>
              </div>
              <h3 className="text-lg font-black text-white mb-3 tracking-tight">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 px-6 border-t border-white/5" style={{ background: 'rgba(0,87,194,0.05)' }}>
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-16">
          <p className="text-[#0057c2] text-xs font-black uppercase tracking-[0.3em]">Super Easy Setup</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Start in 3 Steps</h2>
        </div>
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { step: "01", icon: "login", title: "Sign In", desc: "Login with your Google account. No forms, no passwords." },
            { step: "02", icon: "tune", title: "Set Your Budget", desc: "Enter your monthly income and spending limit. Takes 1 minute." },
            { step: "03", icon: "track_changes", title: "Start Tracking", desc: "Log expenses by typing naturally. See insights instantly." },
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-[#0057c2]/20 border border-[#0057c2]/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#4f8cff] text-2xl">{s.icon}</span>
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#0057c2] text-white text-[10px] font-black flex items-center justify-center">{s.step}</span>
              </div>
              <h3 className="text-lg font-black text-white">{s.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed font-medium">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Ready to save more <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #4f8cff, #0057c2)' }}>every month?</span>
          </h2>
          <p className="text-white/50 text-lg leading-relaxed">Join thousands of Indians who track their money smarter with SuperSpend Lite.</p>
          <button
            onClick={handleGetStarted}
            className="w-full max-w-sm mx-auto bg-[#0057c2] hover:bg-[#0066e0] text-white font-black text-xl py-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-[#0057c2]/40 flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined text-2xl">rocket_launch</span>
            Get Started for Free
          </button>
          <p className="text-white/20 text-xs font-medium">No credit card · No ads · Works on phone and laptop</p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="w-6 h-6 rounded overflow-hidden bg-white flex items-center justify-center shrink-0 opacity-60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="SuperSpend Lite" className="w-full h-full object-cover" />
            </div>
            <span className="text-white/40 text-sm font-bold">SuperSpend Lite</span>
          </div>
          <p className="text-white/20 text-xs font-medium">Made with ❤️ for India · Free forever · Your data stays with you</p>
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
