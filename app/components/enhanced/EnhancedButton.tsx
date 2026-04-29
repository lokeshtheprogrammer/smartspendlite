"use client";

import { ReactNode, useState } from "react";

interface EnhancedButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "neon" | "gradient";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string;
}

export function EnhancedButton({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  onClick,
  className = ""
}: EnhancedButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = "relative inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-12 py-6 text-xl"
  };

  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl focus:ring-blue-500",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 focus:ring-slate-500",
    ghost: "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-500",
    neon: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 focus:ring-cyan-500",
    gradient: "bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white hover:from-purple-700 hover:via-pink-700 hover:to-red-700 shadow-lg hover:shadow-xl focus:ring-purple-500"
  };

  const widthClasses = fullWidth ? "w-full" : "";

  const transformClasses = isPressed ? "scale-95" : "hover:scale-105";

  const buttonContent = (
    <>
      {loading && (
        <span className="material-symbols-outlined animate-spin" style={{ fontSize: size === "sm" ? 16 : size === "lg" ? 24 : 20 }}>refresh</span>
      )}
      <div className={`flex items-center gap-2 ${loading ? "opacity-0" : ""}`}>
        {icon && iconPosition === "left" && icon}
        <span>{children}</span>
        {icon && iconPosition === "right" && icon}
      </div>
    </>
  );

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClasses} ${transformClasses} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {buttonContent}
    </button>
  );
}
