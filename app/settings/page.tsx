"use client";

import { useState } from "react";
import { useStore } from "../lib/store";
import { useAuth } from "../lib/auth";
import StandardPageShell from "../components/StandardPageShell";

export default function Settings() {
  const { settings, transactions, recurring, updateSettings, isLoaded, addRecurring, deleteRecurring } = useStore();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [income, setIncome] = useState("");
  const [currency, setCurrency] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Recurring Bill state
  const [recNote, setRecNote] = useState("");
  const [recAmount, setRecAmount] = useState("");
  const [recCategory, setRecCategory] = useState("utilities");
  const [recFreq, setRecFreq] = useState<"monthly" | "weekly">("monthly");

  // Photo: saved custom > Google profile > initials
  const photoSrc = settings.photoUrl || user?.photoURL || "";

  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleSave = () => {
    const nextIncome = parseFloat(income || settings.income.toString());
    updateSettings({
      name: name || settings.name || "Member",
      income: Number.isFinite(nextIncome) ? nextIncome : settings.income,
      currency: currency || settings.currency
    });
    setIsEditing(false);
  };

  const handleResetData = () => {
    if (confirm("Are you sure you want to delete all your local data? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleExport = () => {
    const headers = ["Date", "Category", "Note", "Amount", "Type"];
    const escapeCsv = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.category,
      t.note,
      t.amount,
      t.type
    ]);
    const csvContent = headers.join(",") + "\n"
      + rows.map(e => e.map(escapeCsv).join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `smartspend_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isLoaded) return <div className="p-12 text-center text-gray-400">Loading profile...</div>;

  const activeName = name || settings.name || "Member";
  const activeIncome = income || settings.income.toString();
  const activeCurrency = currency || settings.currency;

  return (
    <StandardPageShell
      title="My Profile"
      description="Update your name, income, and app settings."
      showBack={true}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Profile Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <section className="interactive-card rounded-[28px] p-10 flex flex-col items-center">
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-secondary/10 to-transparent"></div>
            
            <div className="relative group z-10">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-white/10 shadow-2xl bg-slate-100 dark:bg-white/10">
                {photoSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoSrc} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary text-white text-4xl font-black">
                    {(settings.name || user?.displayName || "M").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-secondary text-white rounded-full border-4 border-white dark:border-[#1A1F36] flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">verified</span>
              </div>
            </div>

            <div className="mt-8 text-center z-10 w-full">
              {isEditing ? (
                <input 
                  value={activeName}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-50 dark:bg-white/5 text-2xl font-black text-[#1A1F36] dark:text-white text-center w-full rounded-xl py-2 outline-none border-2 border-secondary/20 focus:border-secondary"
                />
              ) : (
                <h2 className="text-3xl font-black text-[#1A1F36] dark:text-white ui-safe-text">{activeName}</h2>
              )}
              <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Premium Member</p>
              
              <button 
                onClick={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setName(settings.name || "Member");
                    setIncome(settings.income.toString());
                    setCurrency(settings.currency);
                    setIsDark(document.documentElement.classList.contains("dark"));
                    setIsEditing(true);
                  }
                }}
                className="w-full mt-10 py-4 rounded-2xl bg-secondary text-white font-bold text-sm shadow-xl shadow-secondary/20 pressable"
              >
                {isEditing ? "Save Changes" : "Edit Profile"}
              </button>
            </div>
          </section>

          <section className="interactive-card bg-secondary/5 rounded-[28px] p-8 border-secondary/10">
            <span className="material-symbols-outlined text-secondary text-4xl mb-4">auto_awesome</span>
            <h3 className="text-lg font-black text-secondary tracking-tight">AI Strategy Active</h3>
            <p className="text-xs text-secondary/60 mt-2 leading-relaxed">Your data is currently being processed by the local-first intelligence engine for outlier detection.</p>
          </section>
        </div>

        {/* Configuration Area */}
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">Your Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monthly Income Setting */}
              <div className="interactive-card p-8 rounded-[24px] space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Income</p>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-secondary">{activeCurrency}</span>
                  <input 
                    type="number"
                    value={activeIncome}
                    onChange={(e) => setIncome(e.target.value)}
                    disabled={!isEditing}
                    className="min-w-0 bg-transparent text-3xl font-black text-[#1A1F36] dark:text-white outline-none w-full disabled:cursor-not-allowed disabled:opacity-70"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Currency Setting */}
              <div className="interactive-card p-8 rounded-[24px] space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Regional Currency</p>
                <select 
                  value={activeCurrency}
                  onChange={(e) => setCurrency(e.target.value)}
                  disabled={!isEditing}
                  className="bg-transparent text-3xl font-black text-[#1A1F36] dark:text-white outline-none w-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <option value="Rs">INR (Rs)</option>
                  <option value="$">USD ($)</option>
                  <option value="EUR">EUR (EUR)</option>
                  <option value="GBP">GBP (GBP)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">Recurring Bills</h3>
            <div className="interactive-card p-8 rounded-[32px] space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    placeholder="Bill Name (e.g. Rent)"
                    value={recNote}
                    onChange={e => setRecNote(e.target.value)}
                    className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl text-sm font-bold outline-none"
                  />
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      placeholder="Amount"
                      value={recAmount}
                      onChange={e => setRecAmount(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl text-sm font-bold outline-none"
                    />
                    <button 
                      onClick={() => {
                        const amt = parseFloat(recAmount);
                        if (recNote && amt > 0) {
                          addRecurring({ note: recNote, amount: amt, category: recCategory, frequency: recFreq, type: "expense" });
                          setRecNote(""); setRecAmount("");
                        }
                      }}
                      className="px-6 bg-secondary text-white rounded-2xl font-black text-xs uppercase"
                    >Add</button>
                  </div>
               </div>

               <div className="space-y-3">
                 {recurring.map(r => (
                   <div key={r.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-secondary/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                          <span className="material-symbols-outlined text-xl">auto_renew</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{r.note}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase">{r.frequency} • {settings.currency}{r.amount}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteRecurring(r.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                   </div>
                 ))}
                 {recurring.length === 0 && (
                   <p className="text-center py-6 text-xs text-slate-400 italic">No recurring bills set up yet.</p>
                 )}
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">App Settings</h3>
            
            <div className="space-y-4">
              <div className="interactive-card p-8 rounded-[24px] flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#1A1F36] dark:text-white">Immersive Dark Mode</p>
                  <p className="text-[10px] text-slate-400 font-medium lowercase">Switch to dark background</p>
                </div>
                <button 
                  onClick={toggleDarkMode}
                  className="w-14 h-8 bg-slate-100 dark:bg-secondary rounded-full relative p-1 pressable"
                >
                  <div className={`w-6 h-6 bg-white dark:bg-primary rounded-full shadow-md flex items-center justify-center transition-all ${isDark ? 'translate-x-6' : 'translate-x-0'}`}>
                    <span className="material-symbols-outlined text-xs dark:text-white">{isDark ? 'dark_mode' : 'light_mode'}</span>
                  </div>
                </button>
              </div>

              <button 
                onClick={handleExport}
                className="interactive-card w-full flex items-center justify-between p-6 rounded-2xl group text-left"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    <span className="material-symbols-outlined">download</span>
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-bold text-[#1A1F36] dark:text-white">Download My Data</p>
                    <p className="text-[10px] text-slate-400 font-medium">Download transaction history as CSV</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>

              <button 
                onClick={handleSave}
                className="interactive-card w-full flex items-center justify-between p-6 rounded-2xl group text-left"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <span className="material-symbols-outlined">sync</span>
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-bold text-[#1A1F36] dark:text-white">Save Settings</p>
                    <p className="text-[10px] text-slate-400 font-medium">Save all your current profile changes</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>

              <button 
                onClick={handleResetData}
                className="w-full flex items-center justify-between p-6 bg-red-500/5 rounded-2xl border border-red-500/10 hover:bg-red-500 hover:text-white pressable group text-left"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 group-hover:bg-white/20 group-hover:text-white flex items-center justify-center">
                    <span className="material-symbols-outlined">delete_sweep</span>
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-bold">Delete All Data</p>
                    <p className="text-[10px] font-medium opacity-60">Permanently clear all saved data from this device</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-red-500 group-hover:text-white group-hover:translate-x-1 transition-transform">warning</span>
              </button>
            </div>
          </div>

          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] pt-12">
            SmartSpend Lite v2.5.0 — Made with ❤️ for India
          </p>
        </div>
      </div>
    </StandardPageShell>
  );
}
