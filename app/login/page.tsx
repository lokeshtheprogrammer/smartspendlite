"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth";
import { useStore } from "../lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, user } = useAuth();
  const { settings } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  // Redirect logged-in users using useEffect (avoids setState-in-render warning)
  useEffect(() => {
    if (user) {
      const target = settings.onboarded ? "/dashboard" : "/onboarding";
      router.push(target);
    }
  }, [user, settings.onboarded, router]);

  if (user) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      console.error("Email auth failed", err);
      setError(err.message || "Authentication failed. Please check your credentials.");
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
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter">SuperSpend</h1>
            <p className="text-slate-400 text-sm font-medium text-center px-4">
              {showEmailForm 
                ? (isSignUp ? "Create your account" : "Sign in with email") 
                : "Sign in to manage your money smartly and securely."}
            </p>
          </div>

          {/* Action Section */}
          <div className="w-full flex flex-col gap-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl text-center font-medium">
                {error}
              </div>
            )}

            {!showEmailForm ? (
              <>
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
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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
                  onClick={() => setShowEmailForm(true)}
                  className="w-full bg-white/5 border border-white/10 text-white font-semibold py-4 rounded-2xl transition-all hover:bg-white/10"
                >
                  Continue with Email
                </button>
              </>
            ) : (
              <form onSubmit={handleEmailAuth} className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                  ) : (
                    isSignUp ? "Create Account" : "Sign In"
                  )}
                </button>

                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-xs text-blue-400 font-bold hover:text-blue-300 transition-colors"
                  >
                    {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowEmailForm(false);
                      setError("");
                    }}
                    className="text-xs text-slate-500 font-bold hover:text-slate-400 transition-colors"
                  >
                    ← Back to all options
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="text-[10px] text-white/20 uppercase font-bold tracking-[0.2em] mt-4">
            Safe & Secure • Local-First
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-white/40 text-[11px] mt-8 px-6 leading-relaxed">
          By signing in, you agree to our Terms of Service and Privacy Policy. 
          Your financial data remains private and stored on your device.
        </p>
      </div>
    </div>
  );
}
