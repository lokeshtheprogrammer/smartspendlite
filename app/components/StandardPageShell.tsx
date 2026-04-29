"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Header from "./Header";

type StandardPageShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  maxWidthClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  showBack?: boolean;
};

export default function StandardPageShell({
  title,
  description,
  children,
  maxWidthClassName = "max-w-[1600px]",
  contentClassName = "px-4 sm:px-8 lg:px-12 pb-32 sm:pb-24 lg:pb-24 pt-8 sm:pt-12",
  headerClassName = "mb-12 space-y-4",
  titleClassName = "text-4xl sm:text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-400 dark:from-white dark:via-white/90 dark:to-white/40 leading-tight truncate max-w-full tracking-tighter pb-1",
  showBack = false,
}: StandardPageShellProps) {
  const router = useRouter();

  return (
    <div className="app-stage flex min-h-screen flex-col relative overflow-hidden">
      {/* Premium Aurora Background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none opacity-60 dark:opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/30 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-emerald-500/20 blur-[120px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] rounded-full bg-purple-500/20 blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }}></div>
      </div>
      <Header />
      <main className={`${contentClassName} flex-1 pt-24 sm:pt-28 pb-32 lg:pb-12`}>
        <div className={`${maxWidthClassName} mx-auto`}>
          <header className={headerClassName}>
            <div className="flex items-center gap-4 flex-wrap">
              {showBack && (
                <button 
                  onClick={() => router.back()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 pressable hover:bg-slate-50 dark:border-white/10 dark:bg-white/5"
                  title="Back"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
              )}
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-secondary tracking-widest">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary pulse-dot"></span>
                  SmartSpend OS
                </div>
                <h1 className={titleClassName}>{title}</h1>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg font-medium leading-relaxed max-w-2xl ui-safe-text">
              {description}
            </p>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
