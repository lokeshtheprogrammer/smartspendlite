"use client";

import { useEffect, useState, useRef } from "react";

interface AnimatedMetricProps {
  value: number;
  previousValue?: number;
  label: string;
  prefix?: string;
  suffix?: string;
  trend?: "up" | "down" | "neutral";
  format?: "number" | "currency" | "percentage";
  className?: string;
  showTrend?: boolean;
  animated?: boolean;
}

export function AnimatedMetric({
  value,
  previousValue,
  label,
  prefix = "",
  suffix = "",
  trend,
  format = "number",
  className = "",
  showTrend = true,
  animated = true
}: AnimatedMetricProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const previousValueRef = useRef(value);

  useEffect(() => {
    if (value === previousValueRef.current) return;
    
    if (!animated) {
      // Use setTimeout to avoid synchronous setState
      const timer = setTimeout(() => {
        setDisplayValue(value);
        previousValueRef.current = value;
      }, 0);
      return () => clearTimeout(timer);
    }

    // Batch state updates to avoid multiple renders
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 0);
    
    const startValue = previousValueRef.current;
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (value - startValue) * easeOutQuart;
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        previousValueRef.current = value;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, animated]);

  const formatValue = (num: number) => {
    switch (format) {
      case "currency":
        return `${prefix}${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}${suffix}`;
      case "percentage":
        return `${num.toFixed(1)}%`;
      default:
        return `${prefix}${num.toLocaleString()}${suffix}`;
    }
  };

  const calculatedTrend = trend || (previousValue ? (value > previousValue ? "up" : value < previousValue ? "down" : "neutral") : "neutral");
  const trendPercentage = previousValue ? ((value - previousValue) / previousValue * 100) : 0;

  const TrendIcon = calculatedTrend === "up" ? "trending_up" : calculatedTrend === "down" ? "trending_down" : "minimize";
  const trendColor = calculatedTrend === "up" ? "text-emerald-500" : calculatedTrend === "down" ? "text-red-500" : "text-slate-400";

  return (
    <div className={`relative group ${className}`}>
      <div className="flex items-baseline gap-3">
        <div className={`text-3xl sm:text-4xl font-black bg-gradient-to-r bg-clip-text text-transparent ${
          calculatedTrend === "up" 
            ? "from-emerald-600 to-emerald-400" 
            : calculatedTrend === "down" 
            ? "from-red-600 to-red-400" 
            : "from-slate-900 to-slate-600 dark:from-white dark:to-slate-400"
        } ${isAnimating ? "animate-pulse" : ""}`}>
          {formatValue(Math.round(displayValue))}
        </div>
        
        {showTrend && calculatedTrend !== "neutral" && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${trendColor} bg-current/10`}>
            <span className="material-symbols-outlined text-sm">{TrendIcon}</span>
            <span className="text-xs font-bold">
              {Math.abs(trendPercentage).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-2">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {label}
        </span>
      </div>

      {/* Animated background effect */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${
        calculatedTrend === "up" 
          ? "from-emerald-500 to-cyan-500" 
          : calculatedTrend === "down" 
          ? "from-red-500 to-orange-500" 
          : "from-slate-500 to-slate-400"
      }`} />
    </div>
  );
}
