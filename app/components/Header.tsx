"use client";

import { useAuth } from "../lib/auth";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import Link, { useLinkStatus } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import AddExpenseModal from "./AddExpenseModal";

function LinkPendingDot() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden
      className={`absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-secondary transition-opacity ${
        pending ? "opacity-100 pulse-dot" : "opacity-0"
      }`}
    />
  );
}

export default function Header() {
  const { data: session } = useSession();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    try {
      // 1. Sign out of Firebase
      await logout();
      
      // 2. Sign out of NextAuth (if session exists)
      if (session) {
        await nextAuthSignOut({ redirect: false });
      }
      
      // 3. Force redirect to splash
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
      // Fallback redirect
      window.location.href = "/";
    }
  };

  // Don't show header on splash or onboarding
  if (pathname === "/" || pathname === "/onboarding") return null;

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "space_dashboard" },
    { href: "/transactions", label: "History", icon: "history" },
    { href: "/analytics", label: "Analysis", icon: "bar_chart" },
    { href: "/budget", label: "Budget", icon: "tune" },
    { href: "/insights", label: "Tips", icon: "lightbulb" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/78 px-4 py-3 backdrop-blur-2xl transition-colors dark:border-white/10 dark:bg-[#0d1424]/82 sm:px-6 md:px-8 sm:py-4">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-3">
          <Link href="/dashboard" className="group flex shrink-0 items-center gap-2 rounded-2xl pr-2 pressable">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-lg transition-transform group-hover:rotate-6 sm:h-10 sm:w-10 bg-white">
              <Image src="/logo.png" alt="SuperSpend Lite Logo" width={40} height={40} unoptimized className="h-full w-full object-cover" />
            </div>
            <span className="hidden max-w-[200px] truncate text-lg font-black text-slate-900 dark:text-white sm:inline-block">
              SuperSpend
            </span>
          </Link>

        {/* Desktop Nav */}
        <div className="hidden min-w-0 items-center gap-1 rounded-2xl border border-slate-200/70 bg-slate-100/80 p-1 dark:border-white/10 dark:bg-white/5 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-w-11 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold pressable xl:min-w-0 xl:justify-start xl:px-4 ${
                isActive(item.href) 
                  ? "bg-white text-primary shadow-sm ring-1 ring-slate-200/50 dark:bg-white/10 dark:text-white" 
                  : "text-slate-500 hover:bg-white/70 hover:text-slate-800 dark:hover:bg-white/5 dark:hover:text-slate-200"
              }`}
            >
              <span className={`material-symbols-outlined text-xl flex-shrink-0 w-6 h-6 flex items-center justify-center overflow-hidden notranslate ${isActive(item.href) ? 'fill-1' : ''}`}>
                {item.icon}
              </span>
              <span className="hidden xl:inline whitespace-nowrap">{item.label}</span>
              <LinkPendingDot />
            </Link>
          ))}
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3 ml-auto lg:ml-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex min-w-0 shrink-0 items-center justify-center gap-2 rounded-xl bg-secondary px-3 py-2.5 text-white shadow-xl shadow-secondary/20 pressable glow-button hover:shadow-secondary/35 sm:rounded-2xl sm:px-6 sm:py-3 relative"
            title="Quick Capture"
          >
            <span className="material-symbols-outlined text-xl flex-shrink-0 w-6 h-6 flex items-center justify-center overflow-hidden notranslate">add_circle</span>
            <span className="hidden md:inline font-black text-sm whitespace-nowrap">Add Expense</span>
          </button>
          
          <div className="hidden h-8 w-[1px] bg-slate-200 dark:bg-white/10 sm:block"></div>

          <Link
            href="/profile"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 pressable hover:bg-slate-100 hover:text-primary dark:hover:bg-white/5 dark:hover:text-white sm:h-12 sm:w-12 sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5"
            title="Identity"
          >
            {user?.photoURL || session?.user?.image ? (
              <Image src={user?.photoURL || (session?.user?.image as string)} alt="Profile" width={48} height={48} className="h-full w-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-2xl flex-shrink-0 w-8 h-8 flex items-center justify-center overflow-hidden notranslate">account_circle</span>
            )}
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 pressable hover:bg-slate-100 hover:text-red-500 dark:hover:bg-white/5 sm:h-12 sm:w-12 sm:rounded-2xl"
            title="Sign Out"
          >
            <span className="material-symbols-outlined text-2xl flex-shrink-0 w-8 h-8 flex items-center justify-center overflow-hidden notranslate">logout</span>
          </button>
        </div>
        </div>
      </nav>

      <nav 
        className="fixed inset-x-3 bottom-3 z-40 rounded-3xl border border-white/70 bg-white/88 p-2 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#0d1424]/90 lg:hidden"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex h-14 flex-col items-center justify-center gap-0.5 rounded-2xl text-[10px] font-black pressable ${
                isActive(item.href)
                  ? "bg-primary text-white dark:bg-white dark:text-[#0d1424]"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${isActive(item.href) ? "fill-1" : ""}`}>
                {item.icon}
              </span>
              <span className="max-w-full truncate px-1">{item.label}</span>
              <LinkPendingDot />
            </Link>
          ))}
        </div>
      </nav>

      <AddExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
