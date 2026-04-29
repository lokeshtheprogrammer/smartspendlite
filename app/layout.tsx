import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartSpend - Financial Management",
  description: "Elevate your financial clarity with SmartSpend",
};

export const viewport: Viewport = {
  themeColor: "#03071d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

import { TransactionAlerts } from "./components/TransactionAlerts";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
      </head>
      <body className="antialiased font-sans">
        <ErrorBoundary>
          <Providers>
            {children}
            <TransactionAlerts />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
