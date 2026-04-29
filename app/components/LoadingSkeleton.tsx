"use client";

export function CardSkeleton() {
  return (
    <div className="interactive-card p-6 sm:p-8 rounded-2xl animate-pulse">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>
      <div className="space-y-3">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
      </div>
    </div>
  );
}

export function TransactionSkeleton() {
  return (
    <div className="ml-6 sm:ml-10 group relative flex items-center justify-between p-4 sm:p-5 rounded-3xl animate-pulse">
      <div className="flex items-center gap-4 sm:gap-6 min-w-0">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
        <div className="min-w-0 flex-1">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2"></div>
          <div className="flex items-center gap-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
      </div>
    </div>
  );
}

export function MetricSkeleton() {
  return (
    <div className="interactive-card p-6 sm:p-8 rounded-2xl animate-pulse">
      <div className="flex justify-between items-start gap-4 mb-6">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>
      <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-4"></div>
      <div className="flex items-center gap-2">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-96"></div>
      </div>
      
      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <MetricSkeleton />
            <MetricSkeleton />
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
            <div className="space-y-4">
              <TransactionSkeleton />
              <TransactionSkeleton />
              <TransactionSkeleton />
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

export function ButtonSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`h-12 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse ${className}`}>
      <div className="h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
    </div>
  );
}
