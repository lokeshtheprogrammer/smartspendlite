"use client";

import { useStore } from "../lib/store";
import { useAuth } from "../lib/auth";
import StandardPageShell from "../components/StandardPageShell";
import { useRef, useState } from "react";

export default function Profile() {
  const { settings, isLoaded, transactions, updateSettings } = useStore();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const totalSpent = transactions.filter(t => t.type !== "income").reduce((acc, t) => acc + t.amount, 0);
  const healthScore = totalSpent > 0 ? 82 : 0;

  // Priority: saved custom photo → Google profile photo → initials fallback
  const photoSrc = settings.photoUrl || user?.photoURL || "";
  const displayName = settings.name || user?.displayName || "Member";
  const userEmail = user?.email || "";

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate: image only, max 2MB
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      updateSettings({ photoUrl: base64 });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  if (!isLoaded) return <div className="p-12 text-center text-gray-400">Loading your profile...</div>;

  return (
    <StandardPageShell
      title="My Profile"
      description="Your personal details and spending summary."
      showBack={true}
    >
      <div className="space-y-12">
        {/* Profile Header */}
        <section className="interactive-card rounded-[28px] p-12 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-secondary/5 to-transparent pointer-events-none"></div>

          {/* Profile Photo with tap-to-change */}
          <div className="relative z-10 group">
            <div className="w-40 h-40 rounded-full border-8 border-white dark:border-white/10 shadow-2xl overflow-hidden ring-4 ring-secondary/20 bg-slate-100 dark:bg-white/10">
              {photoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoSrc}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                // Initials fallback
                <div className="w-full h-full flex items-center justify-center bg-secondary text-white text-5xl font-black">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Change photo overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer"
            >
              {uploading ? (
                <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                  <span className="text-white text-[10px] font-bold uppercase tracking-widest">Change</span>
                </>
              )}
            </button>

            {/* Verified badge */}
            <div className="absolute bottom-1 right-1 w-12 h-12 bg-secondary text-white rounded-full border-4 border-white dark:border-[#1A1F36] flex items-center justify-center shadow-xl">
              <span className="material-symbols-outlined fill-1">verified</span>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />

          <div className="mt-8 space-y-1 z-10 min-w-0">
            <h2 className="text-4xl font-black text-[#1A1F36] dark:text-white truncate max-w-full">{displayName}</h2>
            {userEmail && (
              <p className="text-sm text-slate-400 font-medium">{userEmail}</p>
            )}
            <p className="text-xs font-bold text-secondary uppercase tracking-widest mt-1">Premium Member</p>
          </div>

          {/* Tap hint */}
          <p className="text-[10px] text-slate-400 mt-4 font-medium">Tap your photo to change it</p>
        </section>

        {/* Vital Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="interactive-card p-8 rounded-[28px] space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Health Score</p>
            <p className="text-4xl font-black text-secondary">{healthScore}</p>
          </div>
          <div className="interactive-card p-8 rounded-[28px] space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Spent</p>
            <p className="text-4xl font-black text-[#1A1F36] dark:text-white truncate max-w-full">{settings.currency}{(totalSpent / 1000).toFixed(1)}k</p>
          </div>
          <div className="interactive-card p-8 rounded-[28px] space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Consistency</p>
            <p className="text-4xl font-black text-[#22C55E]">94%</p>
          </div>
        </div>

        {/* Privacy / Security Status */}
        <section className="interactive-card p-10 rounded-[28px] text-white shadow-2xl shadow-secondary/20 flex flex-col md:flex-row items-center gap-10" style={{ backgroundColor: 'var(--secondary)' }}>
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-5xl">lock</span>
          </div>
          <div className="flex-1 space-y-2 min-w-0">
            <h3 className="text-2xl font-black truncate max-w-full">Your Data is Private</h3>
            <p className="text-white/80 text-sm leading-relaxed font-medium">All your data is saved only on your device. Nothing is shared with anyone.</p>
          </div>
          <div className="shrink-0 font-bold text-xs uppercase border border-white/30 px-6 py-3 rounded-full tracking-widest backdrop-blur-sm">Safe &amp; Secure</div>
        </section>
      </div>
    </StandardPageShell>
  );
}
