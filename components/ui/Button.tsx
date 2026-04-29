"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { forwardRef, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-[#496559] text-white hover:bg-[#324d42] active:bg-[#2a3d35] focus:ring-[#496559]",
      secondary: "border border-[#496559] text-[#496559] hover:bg-[#496559]/5 focus:ring-[#496559]",
      accent: "bg-[#f39221] text-white hover:bg-[#e08219] focus:ring-[#f39221]",
      ghost: "text-[#496559] hover:bg-[#496559]/5 focus:ring-[#496559]",
      danger: "bg-[#DC2626] text-white hover:bg-[#b91c1c] focus:ring-[#DC2626]",
    };

    const sizes = {
      sm: "text-sm px-3 py-1.5",
      md: "text-sm px-5 py-2.5",
      lg: "text-base px-7 py-3",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
