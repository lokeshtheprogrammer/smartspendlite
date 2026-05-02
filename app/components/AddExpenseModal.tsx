"use client";

import { useState, useEffect, useRef } from "react";
import { useStore } from "../lib/store";
import { parseTransactionInput } from "../lib/transactionParser";

type AddExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const CATEGORIES = [
  { id: "food", label: "Food", icon: "restaurant", color: "bg-orange-500/10 text-orange-600" },
  { id: "transport", label: "Travel", icon: "directions_car", color: "bg-blue-500/10 text-blue-600" },
  { id: "shopping", label: "Retail", icon: "shopping_bag", color: "bg-purple-500/10 text-purple-600" },
  { id: "utilities", label: "Bills", icon: "electric_bolt", color: "bg-yellow-500/10 text-yellow-600" },
  { id: "housing", label: "Living", icon: "home", color: "bg-green-500/10 text-green-600" },
  { id: "entertainment", label: "Fun", icon: "movie", color: "bg-red-500/10 text-red-600" },
  { id: "other", label: "Mix", icon: "more_horiz", color: "bg-slate-500/10 text-slate-600" },
  { id: "income", label: "Income", icon: "add_circle", color: "bg-emerald-500/10 text-emerald-600" },
];

export default function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  const { addTransaction, accounts, settings } = useStore();
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [note, setNote] = useState("");
  const [smartText, setSmartText] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || "");
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [isRecurring, setIsRecurring] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Run parser whenever smartText changes
  useEffect(() => {
    if (!smartText.trim()) return;
    const debounce = setTimeout(() => {
      const parsed = parseTransactionInput(smartText);
      if (parsed.amount > 0) setAmount(parsed.amount.toString());
      if (parsed.category && CATEGORIES.some(c => c.id === parsed.category)) {
        setSelectedCategory(parsed.category);
      }
      if (parsed.merchant) {
        setNote(parsed.merchant);
      }
      if (parsed.accountType) {
        const acc = accounts.find(a => a.type === parsed.accountType);
        if (acc) setSelectedAccountId(acc.id);
      }
    }, 400);
    return () => clearTimeout(debounce);
  }, [smartText, accounts]);

  useEffect(() => {
    if (isOpen) {
      const focusTimer = setTimeout(() => inputRef.current?.focus(), 400);
      return () => clearTimeout(focusTimer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) return;

    addTransaction({
      amount: parsedAmount,
      category: selectedCategory,
      note: note || "General Entry",
      type: selectedCategory === "income" ? "income" : "expense",
      accountId: selectedAccountId,
      receiptUrl: receiptUrl,
    });
    
    setAmount("");
    setNote("");
    setSmartText("");
    setReceiptUrl(undefined);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className="absolute inset-0 bg-[#03071d]/64 backdrop-blur-md" onClick={onClose} />

      <div className={`interactive-card relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[28px] bg-white shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] dark:bg-[#111827] sm:rounded-[32px] ${isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95"}`}>
        <form onSubmit={handleSubmit} className="p-8 sm:p-10">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">New Transaction</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Smart Ledger Integration</p>
            </div>
            <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-8">
            {/* Smart Input */}
            <div className="relative group/smart">
              <div className="absolute inset-0 -inset-x-1 -inset-y-1 rounded-[20px] bg-gradient-to-r from-[#0057c2]/0 via-[#0057c2]/10 to-[#0057c2]/0 opacity-0 blur-md transition-opacity duration-500 group-focus-within/smart:opacity-100 -z-10"></div>
              <div className="relative flex items-center rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent group-focus-within/smart:border-[#0057c2]/30 transition-all">
                <span className="material-symbols-outlined text-[#0057c2] ml-4">auto_awesome</span>
                <input
                  type="text"
                  placeholder="Try: '500 on dinner at Taj via cash'"
                  value={smartText}
                  onChange={(e) => setSmartText(e.target.value)}
                  className="w-full bg-transparent py-4 px-3 text-sm font-bold outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Amount Display */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-black text-slate-300">{settings.currency}</span>
                <input
                  ref={inputRef}
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="min-w-0 bg-transparent text-6xl sm:text-8xl font-black text-slate-900 dark:text-white w-full outline-none text-center placeholder:text-slate-50 dark:placeholder:text-white/5"
                />
              </div>
            </div>

            {/* Account Selector */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Account / Wallet</p>
              <div className="flex flex-wrap gap-2">
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setSelectedAccountId(acc.id)}
                    className={`flex-1 min-w-[100px] flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all ${selectedAccountId === acc.id ? 'bg-[#0057c2] border-[#0057c2] text-white shadow-lg' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 hover:border-slate-200'}`}
                  >
                    <span className="material-symbols-outlined text-lg">{acc.type === 'cash' ? 'payments' : acc.type === 'upi' ? 'qr_code_2' : 'account_balance'}</span>
                    <span className="text-[10px] font-black uppercase tracking-tighter">{acc.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Matrix */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</p>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${selectedCategory === cat.id ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 scale-105' : 'bg-slate-50 dark:bg-white/5 text-slate-400'}`}
                  >
                    <span className="material-symbols-outlined text-xl mb-1">{cat.icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-tighter">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Extras: Note & Receipt */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="relative group/note">
                  <input
                    type="text"
                    placeholder="Add a note..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 py-4 px-6 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-[#0057c2]/30"
                  />
               </div>
               <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-2xl border transition-all ${receiptUrl ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500'}`}
                  >
                    <span className="material-symbols-outlined text-xl">{receiptUrl ? 'check_circle' : 'receipt_long'}</span>
                    <span className="text-xs font-bold">{receiptUrl ? 'Receipt Added' : 'Add Receipt'}</span>
                  </button>
                  <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
               </div>
            </div>

            <button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full bg-[#0057c2] hover:bg-[#0066e0] text-white py-6 rounded-[24px] text-xl font-black shadow-2xl shadow-[#0057c2]/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-3"
            >
              <span>Authorize Entry</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
