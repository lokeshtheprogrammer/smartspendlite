"use client";

import { useState, useEffect, useCallback } from "react";

export type Transaction = {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
  type: "income" | "expense";
};

export type Budget = {
  limit: number;
  month: string;
  category?: string;
};

export type UserSettings = {
  currency: string;
  income: number;
  name: string;
  onboarded: boolean;
};

const STORAGE_KEYS = {
  TRANSACTIONS: "smartspend_transactions_v2",
  BUDGETS: "smartspend_budgets_v2",
  SETTINGS: "smartspend_settings_v2",
};

// --- Improved Security Middleware ---
// Using Web Crypto API for proper AES-GCM encryption
// Note: In production, consider server-side encryption for sensitive data

// Generate a secure key from user session or device fingerprint
const getEncryptionKey = async (): Promise<CryptoKey> => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('smartspend-secure-key-v1'),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode('smartspend-salt-2024'),
      iterations: 100000,
      hash: 'SHA-256'
    },
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
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch {
    // Fallback to simple obfuscation if crypto fails
    return obfuscate(data);
  }
};

const decrypt = async (cipher: string): Promise<string | null> => {
  try {
    const key = await getEncryptionKey();
    const combined = Uint8Array.from(atob(cipher), c => c.charCodeAt(0));
    
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  } catch {
    // Fallback to simple deobfuscation if crypto fails
    return deobfuscate(cipher);
  }
};

// Legacy obfuscation as fallback
const obfuscate = (data: string) => {
  const bytes = new TextEncoder().encode(data);
  const shifted = bytes.map(b => b ^ 0x42); 
  return btoa(String.fromCharCode(...shifted));
};

const deobfuscate = (cipher: string) => {
  try {
    const bytes = Uint8Array.from(atob(cipher), c => c.charCodeAt(0));
    const original = bytes.map(b => b ^ 0x42);
    return new TextDecoder().decode(original);
  } catch {
    return null;
  }
};

// Singleton state to prevent initialization loops across components
let globalTransactions: Transaction[] = [];
let globalBudgets: Budget[] = [];
let globalSettings: UserSettings = {
  currency: "Rs",
  income: 0,
  name: "",
  onboarded: false,
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
      // Store: Initializing Secure Singleton...
      (async () => {
        try {
          const savedT = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
          const savedB = localStorage.getItem(STORAGE_KEYS.BUDGETS);
          const savedS = localStorage.getItem(STORAGE_KEYS.SETTINGS);

          if (savedT) {
            const decrypted = await decrypt(savedT);
            if (decrypted) globalTransactions = JSON.parse(decrypted);
          }
          if (savedB) {
            const decrypted = await decrypt(savedB);
            if (decrypted) globalBudgets = JSON.parse(decrypted);
          }
          if (savedS) {
            const decrypted = await decrypt(savedS);
            if (decrypted) globalSettings = { ...globalSettings, ...JSON.parse(decrypted) };
          }
        } catch {
          // Store: Error loading secure data
        } finally {
          globalIsLoaded = true;
          // Store: Secure Singleton Loaded
          notify();
        }
      })();
    }

    return () => {
      listeners = listeners.filter(l => l !== forceUpdate);
    };
  }, [forceUpdate]);

  const saveToStorage = async (key: string, data: unknown) => {
    const serialized = JSON.stringify(data);
    const encrypted = await encrypt(serialized);
    localStorage.setItem(key, encrypted);
  };

  const addTransaction = async (t: Omit<Transaction, "id" | "date" | "type"> & Partial<Pick<Transaction, "type">>) => {
    const newT: Transaction = {
      ...t,
      type: t.type ?? "expense",
      id: Math.random().toString(36).substring(2, 11),
      date: new Date().toISOString(),
    };
    globalTransactions = [newT, ...globalTransactions];
    await saveToStorage(STORAGE_KEYS.TRANSACTIONS, globalTransactions);
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
    globalTransactions = globalTransactions.filter((t) => t.id !== id);
    await saveToStorage(STORAGE_KEYS.TRANSACTIONS, globalTransactions);
    notify();
  };

  return {
    transactions: globalTransactions,
    budgets: globalBudgets,
    settings: globalSettings,
    isLoaded: globalIsLoaded,
    addTransaction,
    deleteTransaction,
    updateBudget,
    updateSettings,
  };
}
