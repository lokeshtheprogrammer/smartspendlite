"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { initAnalytics } from "./lib/firebase";
import { AuthProvider } from "./lib/auth";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <SessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}
