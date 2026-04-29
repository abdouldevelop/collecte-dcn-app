"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquare, Plus, ChevronDown, CheckCircle } from "lucide-react";
import { supportTicketSchema, SupportTicketInput } from "@/validators";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  response: string | null;
  createdAt: Date;
}

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "info" | "neutral" }> = {
  OPEN: { label: "Ouvert", variant: "warning" },
  IN_PROGRESS: { label: "En cours", variant: "info" },
  RESOLVED: { label: "Résolu", variant: "success" },
  CLOSED: { label: "Fermé", variant: "neutral" },
};

const priorityConfig: Record<string, { label: string; variant: "danger" | "warning" | "info" | "neutral" }> = {
  LOW: { label: "Basse", variant: "neutral" },
  MEDIUM: { label: "Moyenne", variant: "info" },
  HIGH: { label: "Haute", variant: "warning" },
  URGENT: { label: "Urgente", variant: "danger" },
};

export function SupportClient({ tickets: initialTickets }: { tickets: Ticket[] }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [newModal, setNewModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupportTicketInput>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: { priority: "MEDIUM" },
  });

  const onSubmit = async (data: SupportTicketInput) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Erreur"); return; }
      setSuccess(true);
      setTickets((t) => [json.data, ...t]);
      reset();
      setTimeout(() => { setNewModal(false); setSuccess(false); }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Support & Assistance</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            Contactez l&apos;administration pour toute question ou problème.
          </p>
        </div>
        <Button onClick={() => setNewModal(true)}>
          <Plus className="w-4 h-4" />
          Nouveau ticket
        </Button>
      </div>

      {/* Tickets list */}
      {tickets.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF] bg-white rounded-2xl border border-[#E5E7EB]">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucun ticket ouvert</p>
          <p className="text-sm mt-1">Créez un ticket pour contacter l&apos;administration.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#F8F9FA] transition-colors"
                onClick={() => setExpanded(expanded === t.id ? null : t.id)}
              >
                <div className="flex items-center gap-3 text-left flex-1 min-w-0">
                  <MessageSquare className="w-5 h-5 text-[#496559] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1F2937] truncate">{t.subject}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{formatDate(t.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={priorityConfig[t.priority]?.variant ?? "neutral"}>
                    {priorityConfig[t.priority]?.label ?? t.priority}
                  </Badge>
                  <Badge variant={statusConfig[t.status]?.variant ?? "neutral"}>
                    {statusConfig[t.status]?.label ?? t.status}
                  </Badge>
                  <ChevronDown
                    className={`w-4 h-4 text-[#9CA3AF] transition-transform ${expanded === t.id ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {expanded === t.id && (
                <div className="px-6 pb-4 border-t border-[#E5E7EB]">
                  <div className="pt-4 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
                        Votre message
                      </p>
                      <p className="text-sm text-[#1F2937] bg-[#F8F9FA] rounded-xl p-4">{t.message}</p>
                    </div>
                    {t.response && (
                      <div>
                        <p className="text-xs font-semibold text-[#496559] uppercase tracking-wider mb-2">
                          Réponse de l&apos;administration
                        </p>
                        <p className="text-sm text-[#1F2937] bg-[#496559]/5 border border-[#496559]/20 rounded-xl p-4">
                          {t.response}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New ticket modal */}
      <Modal open={newModal} onClose={() => setNewModal(false)} title="Nouveau ticket de support" size="md">
        {success ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <CheckCircle className="w-12 h-12 text-[#16A34A]" />
            <p className="font-semibold text-[#1F2937]">Ticket créé avec succès !</p>
            <p className="text-sm text-[#6B7280]">L&apos;administration vous répondra dans les meilleurs délais.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <p className="text-sm text-[#DC2626] bg-[#DC2626]/8 p-3 rounded-xl">{error}</p>}

            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-1.5">
                Sujet <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                placeholder="Résumé de votre problème"
                {...register("subject")}
                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10"
              />
              {errors.subject && <p className="mt-1 text-xs text-[#DC2626]">{errors.subject.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-1.5">Priorité</label>
              <select
                {...register("priority")}
                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10"
              >
                <option value="LOW">Basse</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="HIGH">Haute</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-1.5">
                Message <span className="text-[#DC2626]">*</span>
              </label>
              <textarea
                rows={5}
                placeholder="Décrivez votre problème en détail..."
                {...register("message")}
                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10 resize-none"
              />
              {errors.message && <p className="mt-1 text-xs text-[#DC2626]">{errors.message.message}</p>}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => setNewModal(false)}>
                Annuler
              </Button>
              <Button size="sm" type="submit" loading={loading}>
                Envoyer
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
