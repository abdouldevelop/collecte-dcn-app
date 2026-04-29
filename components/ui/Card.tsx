import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
}

export function Card({ className, padding = "md", children, ...props }: CardProps) {
  const paddings = { sm: "p-4", md: "p-6", lg: "p-8" };
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-[#E5E7EB]",
        "shadow-[0px_4px_20px_rgba(73,101,89,0.08)]",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-semibold text-[#1F2937]", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "primary",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: "primary" | "success" | "warning" | "danger" | "accent";
}) {
  const colors = {
    primary: "bg-[#496559]/8 text-[#496559]",
    success: "bg-[#16A34A]/8 text-[#16A34A]",
    warning: "bg-[#F59E0B]/8 text-[#F59E0B]",
    danger: "bg-[#DC2626]/8 text-[#DC2626]",
    accent: "bg-[#f39221]/8 text-[#f39221]",
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#6B7280] font-medium">{title}</p>
          <p className="text-3xl font-bold text-[#1F2937] mt-1">{value}</p>
          {subtitle && <p className="text-xs text-[#9CA3AF] mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colors[color])}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
