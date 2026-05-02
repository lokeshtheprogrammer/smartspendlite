"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "./lib/store";
import { useAuth } from "./lib/auth";

export default function Home() {
  const router = useRouter();
  const { settings, isLoaded } = useStore();
  const { user, loading: authLoading } = useAuth();
  const [redirected, setRedirected] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Wait for both store and auth to be ready
    if (isLoaded && !authLoading && !redirected && !timerRef.current) {
      
      timerRef.current = setTimeout(() => {
        let target = "/login";
        
        if (user) {
          target = settings.onboarded ? "/dashboard" : "/onboarding";
        }
        
        setRedirected(true);
        
        try {
          router.push(target);
        } catch {
          window.location.assign(target);
        }
      }, 800); // Give it a bit more time for the splash feel
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isLoaded, authLoading, user, settings.onboarded, router, redirected]);

  return (
    <div className="bg-[#03071d] text-white font-sans antialiased overflow-hidden min-h-screen relative flex flex-col items-center justify-center">
      {/* Ghost Header for Splash Feel */}
      <header className="fixed top-0 w-full z-50 bg-transparent">
        <div className="flex justify-between items-center px-12 py-6 max-w-[1600px] mx-auto">
          <div className="text-2xl font-semibold tracking-tighter text-white opacity-20 transition-opacity hover:opacity-100">SmartSpend</div>
          <nav className="hidden md:flex gap-8 opacity-20">
            <span className="text-slate-400 font-normal text-sm tracking-tight">Dashboard</span>
            <span className="text-slate-400 font-normal text-sm tracking-tight">Savings</span>
            <span className="text-slate-400 font-normal text-sm tracking-tight">Reports</span>
            <span className="text-slate-400 font-normal text-sm tracking-tight">Budget</span>
            <span className="text-slate-400 font-normal text-sm tracking-tight">Tips</span>
          </nav>
          <div className="flex gap-4 opacity-20">
            <span className="material-symbols-outlined text-white">notifications</span>
            <span className="material-symbols-outlined text-white">account_circle</span>
          </div>
        </div>
      </header>

      {/* Main Splash Container */}
      <main className="relative h-screen w-full flex flex-col items-center justify-center" style={{ 
        background: 'linear-gradient(135deg, #1A1F36 0%, #0057c2 100%)' 
      }}>
        {/* Depth & Glass Gradient */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at center, rgba(79, 140, 255, 0.15) 0%, rgba(26, 31, 54, 0) 70%)'
        }}></div>

        <div className="relative z-10 flex flex-col items-center gap-12 px-6 text-center max-w-4xl mx-auto animate-in zoom-in-95 fade-in duration-1000">
          <div className="relative group">
            <div className="absolute inset-0 blur-3xl bg-[#0057c2] opacity-40 rounded-full scale-150 transition-transform duration-1000 group-hover:scale-[2]"></div>
            <div className="relative w-32 h-32 md:w-48 md:h-48 bg-white/10 backdrop-blur-2xl rounded-[48px] flex items-center justify-center border border-white/20 shadow-2xl transition-all duration-700 hover:rotate-3 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="SmartSpend" className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl" />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-sm px-4">
              SmartSpend
            </h1>
            <p className="text-[#afc6ff] text-lg md:text-xl font-medium tracking-wide opacity-90 max-w-xl mx-auto leading-relaxed px-6 uppercase" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
              "Money is the defence to solve or face many problems."
            </p>
          </div>

          <div className="w-64 md:w-80 mt-4 flex flex-col items-center gap-6">
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative shadow-inner">
              <div className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)] animate-loading absolute left-0" style={{ width: '30%' }}></div>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="text-[#afc6ff]/60 text-[10px] font-bold tracking-[0.3em] uppercase">
                {isLoaded ? "App Ready" : "Loading..."}
              </div>
              
              {isLoaded && !authLoading && (
                <button 
                  onClick={() => {
                    let target = "/login";
                    if (user) {
                      target = settings.onboarded ? "/dashboard" : "/onboarding";
                    }
                    window.location.assign(target);
                  }}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 rounded-full px-8 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-all hover:scale-105 active:scale-95"
                >
                  Open App
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Brand Anchor */}
        <div className="absolute bottom-12 text-white/40 text-[11px] font-semibold tracking-widest uppercase flex items-center gap-3">
          <span className="w-8 h-[1px] bg-white/20"></span>
          Your Smart Money App
          <span className="w-8 h-[1px] bg-white/20"></span>
        </div>
      </main>

      <style jsx global>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .animate-loading {
          animation: loading-bar 2.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
