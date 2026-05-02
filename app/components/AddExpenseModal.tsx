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
  const { addTransaction, accounts, goals, settings } = useStore();
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [note, setNote] = useState("");
  const [smartText, setSmartText] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || "");
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
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
      if (parsed.goalName) {
        const goal = goals.find(g => g.name.toLowerCase().includes(parsed.goalName!.toLowerCase()));
        if (goal) setSelectedGoalId(goal.id);
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
      goalId: selectedGoalId || undefined,
      receiptUrl: receiptUrl,
    });
    
    setAmount("");
    setNote("");
    setSmartText("");
    setSelectedGoalId("");
    setReceiptUrl(undefined);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className="absolute inset-0 bg-[#03071d]/64 backdrop-blur-md" onClick={onClose} />
      {/* Modal Content - Compact & Clean */}
      <div
        className={`interactive-card relative max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] dark:bg-[#111827] sm:rounded-3xl ${
          isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95"
        }`}
      >
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">New Entry</h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Smart Ledger</p>
            </div>
            <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <div className="space-y-6">
            {/* Smart Input */}
            <div className="relative group/smart">
              <div className="relative flex items-center rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent group-focus-within/smart:border-[#0057c2]/30 transition-all">
                <span className="material-symbols-outlined text-[#0057c2] ml-3 text-lg">auto_awesome</span>
                <input
                  type="text"
                  placeholder="e.g. '500 on dinner'"
                  value={smartText}
                  onChange={(e) => setSmartText(e.target.value)}
                  className="w-full bg-transparent py-3 px-2 text-sm font-bold outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Amount Display */}
            <div className="text-center py-2">
              <div className="flex items-center justify-center gap-2 group/amt">
                <span className="text-2xl font-black text-slate-300">{settings.currency}</span>
                <input
                  ref={inputRef}
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
                  className="min-w-0 bg-transparent text-5xl font-black text-slate-900 dark:text-white w-full outline-none text-center placeholder:text-slate-50 dark:placeholder:text-white/5"
                />
                <button 
                  type="submit"
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="absolute right-0 p-2 bg-secondary text-white rounded-full shadow-lg opacity-0 group-focus-within/amt:opacity-100 transition-opacity disabled:opacity-0"
                >
                  <span className="material-symbols-outlined">check</span>
                </button>
              </div>
            </div>

            {/* Account Selector */}
            <div className="space-y-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Account</p>
              <div className="flex gap-2">
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setSelectedAccountId(acc.id)}
                    className={`flex-1 flex flex-col items-center gap-0.5 p-2 rounded-xl border transition-all ${selectedAccountId === acc.id ? 'bg-[#0057c2] border-[#0057c2] text-white shadow-md' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500'}`}
                  >
                    <span className="material-symbols-outlined text-sm">{acc.type === 'cash' ? 'payments' : acc.type === 'upi' ? 'qr_code_2' : 'account_balance'}</span>
                    <span className="text-[9px] font-black uppercase">{acc.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Matrix */}
            <div className="space-y-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</p>
              <div className="grid grid-cols-4 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${selectedCategory === cat.id ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-50 dark:bg-white/5 text-slate-400'}`}
                  >
                    <span className="material-symbols-outlined text-base mb-0.5">{cat.icon}</span>
                    <span className="text-[8px] font-black uppercase">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Link & Extras */}
            <div className="space-y-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Link to Goal (Optional)</p>
              <div className="flex gap-2">
                <select 
                  value={selectedGoalId}
                  onChange={e => setSelectedGoalId(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-white/5 py-3 px-4 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-[#0057c2]/30 appearance-none"
                >
                  <option value="">No Goal</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.type})</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="flex-[2] bg-slate-50 dark:bg-white/5 py-3 px-4 rounded-xl text-xs font-bold outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border text-[10px] font-bold ${receiptUrl ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500'}`}
              >
                <span className="material-symbols-outlined text-base">{receiptUrl ? 'check' : 'receipt'}</span>
                {receiptUrl ? 'Bill Added' : 'Bill'}
              </button>
              <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            </div>

            <button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full bg-[#0057c2] hover:bg-[#0066e0] text-white py-4 rounded-2xl text-base font-black shadow-xl shadow-[#0057c2]/20 transition-all active:scale-95 disabled:opacity-30"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
