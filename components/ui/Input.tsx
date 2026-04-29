"use client";

import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helper, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-[#1F2937] mb-1.5">
            {label}
            {props.required && <span className="text-[#DC2626] ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-[#1F2937]",
            "placeholder:text-[#9CA3AF] transition-all duration-150",
            "focus:outline-none focus:ring-2",
            error
              ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/10"
              : "border-[#E5E7EB] focus:border-[#496559] focus:ring-[#496559]/10",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-[#DC2626]">{error}</p>}
        {helper && !error && <p className="mt-1 text-xs text-[#6B7280]">{helper}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
