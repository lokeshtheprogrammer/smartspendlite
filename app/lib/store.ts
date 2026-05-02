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

export type RecurringTransaction = {
  id: string;
  amount: number;
  category: string;
  note: string;
  frequency: "monthly" | "weekly";
  type: "income" | "expense";
  lastTriggered?: string; // Date string
};

export type UserSettings = {
  currency: string;
  income: number;
  name: string;
  onboarded: boolean;
  photoUrl?: string;
};

const STORAGE_KEYS = {
  TRANSACTIONS: "smartspend_transactions_v3",
  BUDGETS: "smartspend_budgets_v3",
  SETTINGS: "smartspend_settings_v3",
  ACCOUNTS: "smartspend_accounts_v3",
  RECURRING: "smartspend_recurring_v3",
};

// --- Security Middleware ---
const getEncryptionKey = async (): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('smartspend-secure-key-v1'),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: new TextEncoder().encode('smartspend-salt-2024'), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

const encrypt = async (data: string): Promise<string> => {
  try {
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(data);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
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
let globalSettings: UserSettings = {
  currency: "Rs", income: 0, name: "", onboarded: false, photoUrl: "",
};
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

          const t = await load(STORAGE_KEYS.TRANSACTIONS);
          if (t) globalTransactions = t;
          const b = await load(STORAGE_KEYS.BUDGETS);
          if (b) globalBudgets = b;
          const s = await load(STORAGE_KEYS.SETTINGS);
          if (s) globalSettings = { ...globalSettings, ...s };
          const a = await load(STORAGE_KEYS.ACCOUNTS);
          if (a) globalAccounts = a;
          const r = await load(STORAGE_KEYS.RECURRING);
          if (r) globalRecurring = r;

        } catch (e) {
          console.error("Store load error", e);
        } finally {
          globalIsLoaded = true;
          notify();
        }
      })();
    }
    return () => { listeners = listeners.filter(l => l !== forceUpdate); };
  }, [forceUpdate]);

  const saveToStorage = async (key: string, data: unknown) => {
    const encrypted = await encrypt(JSON.stringify(data));
    localStorage.setItem(key, encrypted);
  };

  const addTransaction = async (t: Omit<Transaction, "id" | "date" | "type"> & Partial<Pick<Transaction, "type" | "date" | "accountId" | "receiptUrl">>) => {
    const newT: Transaction = {
      ...t,
      type: t.type ?? "expense",
      id: Math.random().toString(36).substring(2, 11),
      date: t.date ?? new Date().toISOString(),
    };
    globalTransactions = [newT, ...globalTransactions];
    
    // Update account balance
    if (t.accountId) {
      const acc = globalAccounts.find(a => a.id === t.accountId);
      if (acc) {
        acc.balance += (newT.type === "income" ? newT.amount : -newT.amount);
        await saveToStorage(STORAGE_KEYS.ACCOUNTS, globalAccounts);
      }
    }

    await saveToStorage(STORAGE_KEYS.TRANSACTIONS, globalTransactions);
    notify();
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    globalAccounts = globalAccounts.map(a => a.id === id ? { ...a, ...updates } : a);
    await saveToStorage(STORAGE_KEYS.ACCOUNTS, globalAccounts);
    notify();
  };

  const addRecurring = async (rt: Omit<RecurringTransaction, "id">) => {
    const newRT: RecurringTransaction = { ...rt, id: Math.random().toString(36).substring(2, 11) };
    globalRecurring = [...globalRecurring, newRT];
    await saveToStorage(STORAGE_KEYS.RECURRING, globalRecurring);
    notify();
  };

  const deleteRecurring = async (id: string) => {
    globalRecurring = globalRecurring.filter(r => r.id !== id);
    await saveToStorage(STORAGE_KEYS.RECURRING, globalRecurring);
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

  const deleteTransaction = async (id: string) => {
    const t = globalTransactions.find(x => x.id === id);
    if (t?.accountId) {
      const acc = globalAccounts.find(a => a.id === t.accountId);
      if (acc) {
        acc.balance -= (t.type === "income" ? t.amount : -t.amount);
        await saveToStorage(STORAGE_KEYS.ACCOUNTS, globalAccounts);
      }
    }
    globalTransactions = globalTransactions.filter((t) => t.id !== id);
    await saveToStorage(STORAGE_KEYS.TRANSACTIONS, globalTransactions);
    notify();
  };

  return {
    transactions: globalTransactions,
    budgets: globalBudgets,
    accounts: globalAccounts,
    recurring: globalRecurring,
    settings: globalSettings,
    isLoaded: globalIsLoaded,
    addTransaction,
    deleteTransaction,
    updateBudget,
    updateSettings,
    updateAccount,
    addRecurring,
    deleteRecurring,
  };
}
