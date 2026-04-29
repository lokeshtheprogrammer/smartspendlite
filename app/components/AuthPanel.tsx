"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthPanel() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result?.ok) {
      router.push("/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="interactive-card flex w-full max-w-md flex-col items-center justify-center rounded-[28px] px-8 py-12">
      <div className="w-full">
        <h2 className="mb-2 text-2xl font-black text-gray-900">Welcome back</h2>
        <p className="mb-8 text-sm text-gray-600">Please enter your details to sign in.</p>

        <button
          onClick={handleGoogleSignIn}
          className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl bg-gray-100 px-4 py-3 font-bold text-gray-900 pressable hover:bg-gray-200"
        >
          <span className="material-symbols-outlined text-lg">login</span>
          Continue with Google
        </button>

        <button
          disabled
          className="mb-4 flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl bg-gray-100 px-4 py-3 font-bold text-gray-900 opacity-50"
        >
          <span className="material-symbols-outlined text-lg">phone_iphone</span>
          Login with Phone
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">OR</span>
          </div>
        </div>

        <form onSubmit={handleEmailSubmit}>
          <label className="mb-2 block text-xs font-semibold text-gray-700">
            EMAIL ADDRESS
          </label>
          <input
            type="email"
            placeholder="name@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full rounded-xl bg-gray-100 px-4 py-3 text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full rounded-xl bg-gray-900 py-3 font-bold text-white pressable hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Continue"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-700">
          Don&apos;t have an account?{" "}
          <a href="#" className="font-semibold text-blue-600 hover:underline">
            Create one
          </a>
        </p>

        <p className="mt-4 text-center text-xs text-gray-500">
          By continuing, you agree to our{" "}
          <a href="#" className="underline hover:no-underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:no-underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
