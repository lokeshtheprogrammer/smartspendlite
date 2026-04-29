"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EnhancedCard } from "./EnhancedCard";

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  onClick: () => void;
  shortcut?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
  onOpenExpenseModal?: () => void;
  onExport?: () => void;
  onPanic?: () => void;
}

export function QuickActions({ actions, className = "", onOpenExpenseModal, onPanic }: QuickActionsProps) {
  const [pressedAction, setPressedAction] = useState<string | null>(null);
  const router = useRouter();

  const handleActionClick = (actionId: string, onClick: () => void) => {
    setPressedAction(actionId);
    setTimeout(() => setPressedAction(null), 150);
    onClick();
  };

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {actions.map((action) => (
        <EnhancedCard
          key={action.id}
          variant="glass"
          hover={true}
          glow={pressedAction === action.id}
          interactive={true}
          onClick={() => handleActionClick(action.id, action.onClick)}
          className={`p-4 text-center transition-all duration-200 ${
            pressedAction === action.id ? "scale-95" : "hover:scale-105"
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div 
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${action.color}`}
            >
              <span className="material-symbols-outlined text-2xl">{action.icon}</span>
            </div>
            
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {action.label}
              </span>
              
              {action.shortcut && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                  {action.shortcut}
                </span>
              )}
            </div>
          </div>
        </EnhancedCard>
      ))}
    </div>
  );
}

// Preset quick actions for common financial tasks
export const createQuickActions = (onOpenExpenseModal?: () => void, onExport?: () => void, onPanic?: () => void): QuickAction[] => [
  {
    id: "panic-mode",
    label: "Panic Mode",
    icon: "emergency",
    color: "bg-red-500 text-white animate-pulse",
    onClick: () => onPanic?.(),
    shortcut: "⌘P"
  },
  {
    id: "add-expense",
    label: "Quick Capture",
    icon: "bolt",
    color: "bg-blue-500 text-white",
    onClick: () => onOpenExpenseModal?.(),
    shortcut: "⌘E"
  },
  {
    id: "view-budget",
    label: "Budget",
    icon: "account_balance",
    color: "bg-emerald-500 text-white",
    onClick: () => window.location.href = "/budget",
    shortcut: "⌘B"
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "analytics",
    color: "bg-purple-500 text-white",
    onClick: () => window.location.href = "/transactions",
    shortcut: "⌘A"
  },
  {
    id: "export",
    label: "Export",
    icon: "download",
    color: "bg-orange-500 text-white",
    onClick: () => {
      if (onExport) {
        onExport();
      } else {
        window.location.href = "/settings";
      }
    },
    shortcut: "⌘⇧E"
  }
];

// Legacy export for backward compatibility
export const defaultQuickActions: QuickAction[] = createQuickActions();
