"use client";

import { useState } from "react";
import { useStore } from "../lib/store";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const { settings, updateSettings } = useStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: settings.name || "",
    income: settings.income || 0,
    currency: settings.currency || "Rs",
  });

  const nextStep = () => setStep(step + 1);
  
  const finishOnboarding = () => {
    updateSettings({ ...formData, onboarded: true });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen text-white font-sans antialiased flex flex-col items-center justify-center p-6 relative overflow-hidden" 
         style={{ background: 'linear-gradient(135deg, #03071d 0%, #1A1F36 100%)' }}>
      
      {/* Decorative background elements to match Splash */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at center, rgba(79, 140, 255, 0.08) 0%, rgba(26, 31, 54, 0) 70%)'
      }}></div>

      <div className="max-w-md w-full space-y-12 relative z-10">
        {/* Progress System */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-2xl font-black text-white opacity-40">SmartSpend</div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-1 rounded-full transition-all duration-700 ${step === s ? 'w-10 bg-[#afc6ff]' : 'w-4 bg-white/10'}`}
              ></div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">Welcome to your <span className="text-[#afc6ff]">Financial Atelier</span></h1>
              <p className="text-[#afc6ff]/60 text-base sm:text-lg">A space designed for precision and clarity. What is your name?</p>
            </div>
            <div className="space-y-4">
              <input 
                type="text"
                placeholder="Ex. Julian"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-xl sm:text-2xl outline-none focus:border-[#afc6ff] focus:bg-white/10 transition-all text-white placeholder:text-white/20"
              />
              <button 
                onClick={nextStep}
                disabled={!formData.name}
                className="w-full bg-white text-[#03071d] rounded-3xl py-6 font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 shadow-2xl shadow-white/5"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">Set your <span className="text-[#afc6ff]">Base Economy</span></h1>
              <p className="text-[#afc6ff]/60 text-base sm:text-lg">Select your currency and monthly income baseline.</p>
            </div>
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                {["Rs", "$", "EUR", "GBP"].map((c) => (
                  <button 
                    key={c}
                    onClick={() => setFormData({ ...formData, currency: c })}
                    className={`rounded-2xl border p-4 text-base font-bold pressable sm:p-5 sm:text-xl ${formData.currency === c ? 'bg-[#0057c2] border-[#afc6ff] text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="relative group">
                <span className="absolute left-5 sm:left-8 top-1/2 -translate-y-1/2 text-[#afc6ff] text-xl sm:text-2xl font-bold opacity-60 group-focus-within:opacity-100 transition-opacity">{formData.currency}</span>
                <input 
                  type="number"
                  placeholder="0.00"
                  value={formData.income || ""}
                  onChange={(e) => setFormData({ ...formData, income: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 pl-24 sm:pl-28 text-2xl sm:text-3xl font-black outline-none focus:border-[#afc6ff] focus:bg-white/10 transition-all text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <button 
                onClick={nextStep}
                disabled={!formData.income}
                className="w-full bg-white text-[#03071d] rounded-3xl py-6 font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30"
              >
                Define Budget
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-12 animate-in zoom-in-95 duration-1000">
            <div className="relative inline-block group">
              <div className="absolute inset-0 bg-[#0057c2] blur-3xl opacity-30 rounded-full scale-150 animate-pulse"></div>
              <div className="w-40 h-40 bg-white/10 backdrop-blur-3xl rounded-[40px] border border-white/20 flex items-center justify-center relative z-10">
                <span className="material-symbols-outlined text-8xl text-[#afc6ff] fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
            </div>
            <div className="space-y-6">
              <h1 className="text-5xl font-extrabold">Everything Is <span className="text-[#afc6ff]">Set</span></h1>
              <p className="text-[#afc6ff]/60 text-xl leading-relaxed px-4">Your wealth intelligence is now configured. Welcome to the modern era of asset management.</p>
            </div>
            <button 
              onClick={finishOnboarding}
              className="w-full bg-[#0057c2] text-white rounded-[32px] py-8 font-black text-2xl shadow-2xl shadow-[#0057c2]/40 hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/10"
            >
              Enter Dashboard
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-12 text-[#afc6ff]/30 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-4">
        <div className="w-1.5 h-1.5 rounded-full bg-[#afc6ff]/40"></div>
        Encrypted Local Storage / Financial Atelier v1.0
      </div>
    </div>
  );
}
