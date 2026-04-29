"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 5000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

const toastConfig: Record<ToastType, { icon: typeof CheckCircle; bg: string; text: string }> = {
  success: { icon: CheckCircle, bg: "bg-[#16A34A]", text: "text-white" },
  error: { icon: AlertCircle, bg: "bg-[#DC2626]", text: "text-white" },
  warning: { icon: AlertCircle, bg: "bg-[#F59E0B]", text: "text-white" },
  info: { icon: Info, bg: "bg-[#496559]", text: "text-white" },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const { icon: Icon, bg, text } = toastConfig[toast.type];
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl shadow-lg text-sm",
        bg,
        text
      )}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold">{toast.title}</p>
        {toast.message && <p className="opacity-90 mt-0.5">{toast.message}</p>}
      </div>
      <button onClick={onDismiss} className="opacity-70 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
