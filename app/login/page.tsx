"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth";
import { useStore } from "../lib/store";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithGoogle, user } = useAuth();
  const { settings } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  // If user is already logged in, redirect based on onboarding status
  if (user) {
    const target = settings.onboarded ? "/dashboard" : "/onboarding";
    router.push(target);
    return null;
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // On success, the 'user' dependency in the redirect check above will trigger,
      // but let's be explicit here too.
      const target = settings.onboarded ? "/dashboard" : "/onboarding";
      router.push(target);
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#03071d] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl flex flex-col items-center gap-8">
          {/* Logo Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20 shadow-xl overflow-hidden">
              <Image src="/logo.png" alt="Logo" width={64} height={64} unoptimized className="object-contain" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter">SmartSpend</h1>
            <p className="text-slate-400 text-sm font-medium text-center px-4">
              Access your financial atelier with secure cloud sync.
            </p>
          </div>

          {/* Action Section */}
          <div className="w-full flex flex-col gap-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white text-[#03071d] font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 shadow-xl"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#03071d]/30 border-t-[#03071d] rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <div className="flex items-center gap-4 my-2">
              <div className="h-[1px] bg-white/10 flex-1"></div>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Or</span>
              <div className="h-[1px] bg-white/10 flex-1"></div>
            </div>

            <button
              onClick={() => {}} // We'll add Email auth later if needed
              className="w-full bg-white/5 border border-white/10 text-white font-semibold py-4 rounded-2xl transition-all hover:bg-white/10"
            >
              Continue with Email
            </button>
          </div>

          <div className="text-[10px] text-white/20 uppercase font-bold tracking-[0.2em] mt-4">
            Secured by Firebase Cloud
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-white/40 text-[11px] mt-8 px-6 leading-relaxed">
          By signing in, you agree to our Terms of Service and Privacy Policy. 
          Your financial data remains encrypted and private.
        </p>
      </div>
    </div>
  );
}
