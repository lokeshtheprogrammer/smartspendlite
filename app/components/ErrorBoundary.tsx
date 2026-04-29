"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service in production
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md mx-auto">
            <div className="relative group mb-8">
              <div className="absolute inset-0 bg-red-500/10 rounded-full blur-xl scale-150 transition-transform group-hover:scale-[2]"></div>
              <div className="relative w-20 h-20 bg-red-50 dark:bg-red-500/10 backdrop-blur-xl rounded-[28px] flex items-center justify-center shadow-inner border border-red-100 dark:border-red-500/20 mx-auto">
                <span className="material-symbols-outlined text-4xl text-red-500 dark:text-red-400">error_outline</span>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Something went wrong
            </h2>
            
            <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              We encountered an unexpected error. Please try refreshing the page or contact support if the issue persists.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 text-white font-medium pressable hover:bg-secondary/90 transition-colors"
              >
                <span className="material-symbols-outlined">refresh</span>
                Refresh Page
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-6 py-3 text-slate-700 dark:text-slate-200 font-medium pressable hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Try Again
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-mono text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-300 overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
