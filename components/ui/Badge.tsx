import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "accent";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  success: "bg-[#16A34A]/12 text-[#16A34A]",
  warning: "bg-[#F59E0B]/12 text-[#F59E0B]",
  danger: "bg-[#DC2626]/12 text-[#DC2626]",
  info: "bg-[#496559]/12 text-[#496559]",
  neutral: "bg-[#6B7280]/12 text-[#6B7280]",
  accent: "bg-[#f39221]/12 text-[#f39221]",
};

export function Badge({ variant = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function DeclarationStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: BadgeVariant }> = {
    NOT_STARTED: { label: "Non commencé", variant: "neutral" },
    DRAFT: { label: "Brouillon", variant: "warning" },
    SUBMITTED: { label: "Soumis", variant: "success" },
  };
  const { label, variant } = config[status] ?? { label: status, variant: "neutral" };
  return <Badge variant={variant}>{label}</Badge>;
}

export function InvitationStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: BadgeVariant }> = {
    PENDING: { label: "En attente", variant: "warning" },
    USED: { label: "Utilisé", variant: "success" },
    EXPIRED: { label: "Expiré", variant: "danger" },
    CANCELLED: { label: "Annulé", variant: "neutral" },
  };
  const { label, variant } = config[status] ?? { label: status, variant: "neutral" };
  return <Badge variant={variant}>{label}</Badge>;
}
