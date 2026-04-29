"use client";

import { ReactNode, useState } from "react";

interface EnhancedCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "glass" | "neon" | "gradient";
  hover?: boolean;
  glow?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function EnhancedCard({ 
  children, 
  className = "", 
  variant = "default",
  hover = true,
  glow = false,
  interactive = false,
  onClick,
  style
}: EnhancedCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses = "relative overflow-hidden rounded-2xl transition-all duration-500";
  
  const variantClasses = {
    default: "bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/10 shadow-xl",
    glass: "bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl",
    neon: "bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20",
    gradient: "bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/20 shadow-2xl"
  };

  const hoverClasses = hover ? [
    "hover:scale-[1.02] hover:shadow-2xl",
    variant === "neon" && "hover:shadow-cyan-500/40",
    variant === "gradient" && "hover:shadow-purple-500/30"
  ].filter(Boolean).join(" ") : "";

  const interactiveClasses = interactive ? "cursor-pointer active:scale-[0.98]" : "";

  const glowEffect = glow && isHovered && (
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/20 to-purple-400/20 blur-xl animate-pulse" />
  );

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={style}
    >
      {glowEffect}
      {variant === "glass" && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      )}
      {variant === "neon" && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
