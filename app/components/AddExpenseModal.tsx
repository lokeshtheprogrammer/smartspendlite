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
  const { addTransaction, settings } = useStore();
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [note, setNote] = useState("");
  const [smartText, setSmartText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Run parser whenever smartText changes
  useEffect(() => {
    if (!smartText.trim()) return;
    const debounce = setTimeout(() => {
      const parsed = parseTransactionInput(smartText);
      if (parsed.amount > 0) setAmount(parsed.amount.toString());
      if (parsed.category !== "income" && CATEGORIES.some(c => c.id === parsed.category)) {
        setSelectedCategory(parsed.category);
      } else if (parsed.type === "income") {
        setSelectedCategory("income");
      }
      if (parsed.merchant) {
        setNote(parsed.merchant + (parsed.type === "income" ? " (Income)" : ""));
      } else if (parsed.type === "income") {
        setNote("Income");
      }
    }, 400);
    return () => clearTimeout(debounce);
  }, [smartText]);

  useEffect(() => {
    if (isOpen) {
      const focusTimer = setTimeout(() => inputRef.current?.focus(), 400);
      return () => clearTimeout(focusTimer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) return;

    addTransaction({
      amount: parsedAmount,
      category: selectedCategory,
      note: note || "General Entry",
      type: selectedCategory === "income" ? "income" : "expense",
    });
    setAmount("");
    setNote("");
    setSmartText("");
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Premium Backdrop */}
      <div 
        className="absolute inset-0 bg-[#03071d]/64 backdrop-blur-md" 
        onClick={onClose}
      />

      {/* Modal Content - Atelier Style */}
      <div
        className={`interactive-card relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[28px] bg-white shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] dark:bg-[#111827] sm:rounded-[24px] ${
          isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95"
        }`}
      >
        <form onSubmit={handleSubmit} className="p-8 sm:p-10">
          <div className="flex items-start justify-between gap-4 mb-10">
            <div className="min-w-0">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white ui-safe-text">Record Transaction</h2>
              <p className="text-slate-400 text-xs font-bold uppercase mt-1">Portfolio Ledger v1.0</p>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/50 bg-slate-100 text-slate-500 pressable hover:bg-slate-200 dark:border-white/10 dark:bg-white/5"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-10">
            {/* Smart Parse Input */}
            <div className="relative group/smart z-10">
              <div className="absolute inset-0 -inset-x-1 -inset-y-1 rounded-[20px] bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 opacity-0 blur-md transition-opacity duration-500 group-focus-within/smart:opacity-100 -z-10"></div>
              <div className="relative flex items-center rounded-2xl border border-transparent bg-purple-50/50 dark:bg-purple-900/10 transition-all duration-300 group-focus-within/smart:border-purple-500/50 shadow-[0_2px_10px_rgba(0,0,0,0.01)] w-full">
                <div className="absolute left-6">
                  <span className="material-symbols-outlined text-purple-400 text-xl">auto_awesome</span>
                </div>
                <input
                  type="text"
                  placeholder="Paste SMS or type '200 swiggy' to auto-fill..."
                  value={smartText}
                  onChange={(e) => setSmartText(e.target.value)}
                  className="w-full bg-transparent py-4 pl-14 pr-6 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none placeholder:text-purple-400/50"
                />
              </div>
            </div>
            {/* Fluid Amount Input */}
            <div className="text-center relative group">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl sm:text-3xl font-black text-secondary/40 shrink-0">{settings.currency}</span>
                <input
                  ref={inputRef}
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="min-w-0 bg-transparent text-5xl sm:text-7xl font-black text-slate-900 dark:text-white w-full outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-slate-100 dark:placeholder:text-white/5"
                />
              </div>
              <div className="h-[1px] w-24 mx-auto bg-slate-100 dark:bg-white/10 mt-4 group-focus-within:w-full group-focus-within:bg-secondary transition-all duration-700"></div>
            </div>

            {/* Redesigned Category Matrix */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Classification Type</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-3 rounded-2xl border p-3 pressable ${
                      selectedCategory === cat.id
                        ? "bg-secondary border-secondary text-white shadow-lg shadow-secondary/20 scale-[1.02]"
                        : "bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 hover:border-slate-200 dark:hover:border-white/10"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedCategory === cat.id ? 'bg-white/20' : cat.color}`}>
                      <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                    </div>
                    <span className="text-xs font-bold truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Note & CTA Group */}
            <div className="space-y-6">
              <div className="relative group/input z-10">
                <div className="absolute inset-0 -inset-x-1 -inset-y-1 rounded-[20px] bg-gradient-to-r from-secondary/0 via-secondary/20 to-secondary/0 opacity-0 blur-md transition-opacity duration-500 group-focus-within/input:opacity-100 -z-10"></div>
                <div className="relative flex items-center rounded-2xl border border-transparent bg-slate-50 dark:bg-white/5 transition-all duration-300 group-focus-within/input:border-secondary/50 group-focus-within/input:bg-white dark:group-focus-within/input:bg-[#0d1424] shadow-[0_2px_10px_rgba(0,0,0,0.01)] group-focus-within/input:shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] w-full">
                  <div className="absolute left-6">
                    <span className="material-symbols-outlined text-slate-400 text-xl group-focus-within/input:text-secondary transition-colors">edit_note</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Transaction details..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-transparent py-5 pl-14 pr-6 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!amount || parseFloat(amount) <= 0}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-secondary py-6 text-lg font-black text-white shadow-2xl shadow-secondary/30 pressable hover:shadow-secondary/50 disabled:scale-100 disabled:opacity-20 disabled:grayscale"
              >
                <span>Authorize Transaction</span>
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        input::placeholder {
          transition: opacity 0.3s;
        }
        input:focus::placeholder {
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
