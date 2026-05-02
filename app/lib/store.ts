"use client";

import { useState, useEffect, useCallback } from "react";

export type Transaction = {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
  type: "income" | "expense";
  accountId?: string;
  receiptUrl?: string;
  goalId?: string; // Link to a specific goal
};

export type Budget = {
  limit: number;
  month: string;
  category?: string;
};

export type Account = {
  id: string;
  name: string;
  type: "cash" | "bank" | "upi";
  balance: number;
};

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  type: "saving" | "event"; // saving (accumulate) or event (spending limit)
  deadline?: string;
  icon: string;
  color: string;
};

export type RecurringTransaction = {
  id: string;
  amount: number;
  category: string;
  note: string;
  frequency: "monthly" | "weekly";
  type: "income" | "expense";
  lastTriggered?: string;
};

export type UserSettings = {
  currency: string;
  income: number;
  name: string;
  onboarded: boolean;
  photoUrl?: string;
};

const STORAGE_KEYS = {
  TRANSACTIONS: "smartspend_transactions_v4",
  BUDGETS: "smartspend_budgets_v4",
  SETTINGS: "smartspend_settings_v4",
  ACCOUNTS: "smartspend_accounts_v4",
  RECURRING: "smartspend_recurring_v4",
  GOALS: "smartspend_goals_v4",
};

// --- Security ---
const getEncryptionKey = async (): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode('smartspend-secure-key-v1'), 'PBKDF2', false, ['deriveBits', 'deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: new TextEncoder().encode('smartspend-salt-2024'), iterations: 100000, hash: 'SHA-256' }, keyMaterial, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
};

const encrypt = async (data: string): Promise<string> => {
  try {
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(data));
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv); combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
  } catch { return btoa(data); }
};

const decrypt = async (cipher: string): Promise<string | null> => {
  try {
    const key = await getEncryptionKey();
    const combined = Uint8Array.from(atob(cipher), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
    return new TextDecoder().decode(decrypted);
  } catch { try { return atob(cipher); } catch { return null; } }
};

// Singleton state
let globalTransactions: Transaction[] = [];
let globalBudgets: Budget[] = [];
let globalAccounts: Account[] = [
  { id: "cash", name: "Cash", type: "cash", balance: 0 },
  { id: "bank", name: "Bank", type: "bank", balance: 0 },
  { id: "upi", name: "UPI / Wallet", type: "upi", balance: 0 },
];
let globalRecurring: RecurringTransaction[] = [];
let globalGoals: Goal[] = [];
let globalSettings: UserSettings = { currency: "Rs", income: 0, name: "", onboarded: false, photoUrl: "" };
let globalIsLoaded = false;
let listeners: Array<() => void> = [];

const notify = () => listeners.forEach(l => l());

export function useStore() {
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    listeners.push(forceUpdate);
    if (!globalIsLoaded) {
      (async () => {
        try {
          const load = async (key: string) => {
            const val = localStorage.getItem(key);
            if (val) {
              const d = await decrypt(val);
              return d ? JSON.parse(d) : null;
            }
            return null;
          };
          const t = await load(STORAGE_KEYS.TRANSACTIONS); if (t) globalTransactions = t;
          const b = await load(STORAGE_KEYS.BUDGETS); if (b) globalBudgets = b;
          const s = await load(STORAGE_KEYS.SETTINGS); if (s) globalSettings = { ...globalSettings, ...s };
          const a = await load(STORAGE_KEYS.ACCOUNTS); if (a) globalAccounts = a;
          const r = await load(STORAGE_KEYS.RECURRING); if (r) globalRecurring = r;
          const g = await load(STORAGE_KEYS.GOALS); if (g) globalGoals = g;
        } catch (e) { console.error(e); } finally { globalIsLoaded = true; notify(); }
      })();
    }
    return () => { listeners = listeners.filter(l => l !== forceUpdate); };
  }, [forceUpdate]);

  const saveToStorage = async (key: string, data: unknown) => {
    const encrypted = await encrypt(JSON.stringify(data));
    localStorage.setItem(key, encrypted);
  };

  const addTransaction = async (t: Omit<Transaction, "id" | "date" | "type"> & Partial<Pick<Transaction, "type" | "date" | "accountId" | "receiptUrl" | "goalId">>) => {
    const newT: Transaction = {
      ...t,
      type: t.type ?? "expense",
      id: Math.random().toString(36).substring(2, 11),
      date: t.date ?? new Date().toISOString(),
    };
    globalTransactions = [newT, ...globalTransactions];
    
    if (t.accountId) {
      const acc = globalAccounts.find(a => a.id === t.accountId);
      if (acc) {
        acc.balance += (newT.type === "income" ? newT.amount : -newT.amount);
        await saveToStorage(STORAGE_KEYS.ACCOUNTS, globalAccounts);
      }
    }

    if (t.goalId) {
      globalGoals = globalGoals.map(g => {
        if (g.id === t.goalId) {
          const delta = newT.type === "income" ? newT.amount : -newT.amount;
          return { ...g, currentAmount: Math.max(0, g.currentAmount + delta) };
        }
        return g;
      });
      await saveToStorage(STORAGE_KEYS.GOALS, globalGoals);
    }

    await saveToStorage(STORAGE_KEYS.TRANSACTIONS, globalTransactions);
    notify();
  };

  const deleteTransaction = async (id: string) => {
    const t = globalTransactions.find(x => x.id === id);
    if (!t) return;

    if (t.accountId) {
      const acc = globalAccounts.find(a => a.id === t.accountId);
      if (acc) {
        acc.balance -= (t.type === "income" ? t.amount : -t.amount);
        await saveToStorage(STORAGE_KEYS.ACCOUNTS, globalAccounts);
      }
    }

    if (t.goalId) {
      globalGoals = globalGoals.map(g => {
        if (g.id === t.goalId) {
          const delta = t.type === "income" ? -t.amount : t.amount;
          return { ...g, currentAmount: Math.max(0, g.currentAmount + delta) };
        }
        return g;
      });
      await saveToStorage(STORAGE_KEYS.GOALS, globalGoals);
    }

    globalTransactions = globalTransactions.filter(x => x.id !== id);
    await saveToStorage(STORAGE_KEYS.TRANSACTIONS, globalTransactions);
    notify();
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    globalAccounts = globalAccounts.map(a => a.id === id ? { ...a, ...updates } : a);
    await saveToStorage(STORAGE_KEYS.ACCOUNTS, globalAccounts);
    notify();
  };

  const addGoal = async (goal: Omit<Goal, "id" | "currentAmount">) => {
    const newGoal: Goal = { ...goal, id: Math.random().toString(36).substring(2, 11), currentAmount: 0 };
    globalGoals = [...globalGoals, newGoal];
    await saveToStorage(STORAGE_KEYS.GOALS, globalGoals);
    notify();
  };

  const deleteGoal = async (id: string) => {
    globalGoals = globalGoals.filter(g => g.id !== id);
    await saveToStorage(STORAGE_KEYS.GOALS, globalGoals);
    notify();
  };

  const updateBudget = async (limit: number, month: string, category?: string) => {
    globalBudgets = globalBudgets.filter((b) => !(b.month === month && b.category === category));
    globalBudgets.push({ limit, month, category });
    await saveToStorage(STORAGE_KEYS.BUDGETS, globalBudgets);
    notify();
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    globalSettings = { ...globalSettings, ...newSettings };
    await saveToStorage(STORAGE_KEYS.SETTINGS, globalSettings);
    notify();
  };

  const addRecurring = async (r: Omit<RecurringTransaction, "id">) => {
    const newR = { ...r, id: Math.random().toString(36).substring(2, 11) };
    globalRecurring = [...globalRecurring, newR];
    await saveToStorage(STORAGE_KEYS.RECURRING, globalRecurring);
    notify();
  };

  const deleteRecurring = async (id: string) => {
    globalRecurring = globalRecurring.filter(r => r.id !== id);
    await saveToStorage(STORAGE_KEYS.RECURRING, globalRecurring);
    notify();
  };

  return {
    transactions: globalTransactions,
    budgets: globalBudgets,
    accounts: globalAccounts,
    recurring: globalRecurring,
    goals: globalGoals,
    settings: globalSettings,
    isLoaded: globalIsLoaded,
    addTransaction,
    deleteTransaction,
    updateBudget,
    updateSettings,
    updateAccount,
    addGoal,
    deleteGoal,
    addRecurring,
    deleteRecurring,
  };
}
