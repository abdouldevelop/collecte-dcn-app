"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, FileText, Clock, TrendingUp, Package,
  Plus, Upload, Send, RefreshCw, CheckCircle, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/ui/Card";
import { InvitationStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";

interface Stats {
  totalCompanies: number;
  activeCompanies: number;
  pendingInvitations: number;
  submittedImport: number;
  submittedExport: number;
  lateCompanies: number;
  completionRate: number;
  totalUnits: number;
}

interface Invitation {
  id: string;
  companyName: string;
  email: string;
  status: string;
  expiresAt: Date;
  createdAt: Date;
  sentBy: string;
}

interface Period {
  id: string;
  label: string;
  dueDate: Date | null;
}

interface AdminDashboardClientProps {
  stats: Stats;
  period: Period | null;
  recentInvitations: Invitation[];
}

export function AdminDashboardClient({ stats, period, recentInvitations }: AdminDashboardClientProps) {
  const router = useRouter();
  const [inviteModal, setInviteModal] = useState(false);
  const [unitModal, setUnitModal] = useState(false);
  const [inviteFile, setInviteFile] = useState<File | null>(null);
  const [unitFile, setUnitFile] = useState<File | null>(null);
  const [singleInvite, setSingleInvite] = useState({ companyName: "", email: "", rccm: "", ncc: "" });
  const [loading, setLoading] = useState(false);
  const [unitLoading, setUnitLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [unitMessage, setUnitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [importMode, setImportMode] = useState(false);

  const sendSingleInvitation = async () => {
    if (!singleInvite.companyName || !singleInvite.email) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(singleInvite),
      });
      const json = await res.json();
      if (!res.ok) { setMessage({ type: "error", text: json.error ?? "Erreur" }); return; }
      setMessage({ type: "success", text: "Invitation envoyée avec succès !" });
      setSingleInvite({ companyName: "", email: "", rccm: "", ncc: "" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const importInvitations = async () => {
    if (!inviteFile) return;
    setLoading(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("file", inviteFile);
      const res = await fetch("/api/admin/invitations/import", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) { setMessage({ type: "error", text: json.error ?? "Erreur" }); return; }
      setMessage({ type: "success", text: `${json.data.created} invitation(s) envoyée(s).` });
      setInviteFile(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const importUnits = async () => {
    if (!unitFile) return;
    setUnitLoading(true);
    setUnitMessage(null);
    try {
      const fd = new FormData();
      fd.append("file", unitFile);
      const res = await fetch("/api/admin/units/import", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) { setUnitMessage({ type: "error", text: json.error ?? "Erreur" }); return; }
      setUnitMessage({ type: "success", text: `${json.data.created} unité(s) importée(s).` });
      setUnitFile(null);
      router.refresh();
    } finally {
      setUnitLoading(false);
    }
  };

  const resendInvitation = async (id: string) => {
    await fetch(`/api/admin/invitations/${id}/resend`, { method: "POST" });
    router.refresh();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Tableau de bord</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            {period ? `Période active : ${period.label}` : "Aucune période active"}
            {period?.dueDate && ` — Échéance : ${formatDate(period.dueDate)}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setUnitModal(true)}>
            <Package className="w-4 h-4" />
            Importer unités
          </Button>
          <Button size="sm" onClick={() => setInviteModal(true)}>
            <Plus className="w-4 h-4" />
            Inviter entreprise
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Entreprises"
          value={stats.totalCompanies}
          subtitle={`${stats.activeCompanies} actives`}
          icon={<Building2 className="w-5 h-5" />}
          color="primary"
        />
        <StatCard
          title="Invitations en attente"
          value={stats.pendingInvitations}
          icon={<Clock className="w-5 h-5" />}
          color={stats.pendingInvitations > 0 ? "warning" : "success"}
        />
        <StatCard
          title="Déclarations Import"
          value={stats.submittedImport}
          subtitle={`sur ${stats.activeCompanies} entreprises`}
          icon={<FileText className="w-5 h-5" />}
          color="success"
        />
        <StatCard
          title="Taux de complétion"
          value={`${stats.completionRate}%`}
          subtitle={`${stats.lateCompanies} en retard`}
          icon={<TrendingUp className="w-5 h-5" />}
          color={stats.completionRate >= 80 ? "success" : stats.completionRate >= 50 ? "warning" : "danger"}
        />
      </div>

      {/* Progress */}
      {period && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] p-6">
          <h3 className="font-semibold text-[#1F2937] mb-4">Progression de la collecte</h3>
          <div className="space-y-4">
            {[
              { label: "Import", value: stats.submittedImport, total: stats.activeCompanies, color: "#496559" },
              { label: "Export", value: stats.submittedExport, total: stats.activeCompanies, color: "#f39221" },
            ].map((item) => {
              const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-[#1F2937]">{item.label}</span>
                    <span className="text-[#6B7280]">{item.value}/{item.total} — {pct}%</span>
                  </div>
                  <div className="h-2 bg-[#F1F3F5] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent invitations */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <h3 className="font-semibold text-[#1F2937]">Invitations récentes</h3>
          <Link href="/admin/companies" className="text-xs text-[#496559] font-semibold hover:underline">
            Voir toutes →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F1F3F5]">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Entreprise</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Envoyée le</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Expiration</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentInvitations.map((inv) => (
                <tr key={inv.id} className="border-t border-[#E9ECEF] hover:bg-[#F8F9FA] transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-[#1F2937]">{inv.companyName}</td>
                  <td className="px-4 py-3 text-sm text-[#6B7280]">{inv.email}</td>
                  <td className="px-4 py-3 text-sm text-[#6B7280]">{formatDate(inv.createdAt)}</td>
                  <td className="px-4 py-3 text-sm text-[#6B7280]">{formatDate(inv.expiresAt)}</td>
                  <td className="px-4 py-3">
                    <InvitationStatusBadge status={inv.status} />
                  </td>
                  <td className="px-4 py-3">
                    {inv.status === "PENDING" || inv.status === "EXPIRED" ? (
                      <button
                        onClick={() => resendInvitation(inv.id)}
                        className="inline-flex items-center gap-1 text-xs text-[#496559] font-medium hover:underline"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Renvoyer
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {recentInvitations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#9CA3AF] text-sm">
                    Aucune invitation
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite modal */}
      <Modal open={inviteModal} onClose={() => setInviteModal(false)} title="Inviter une entreprise" size="lg">
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setImportMode(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-colors ${!importMode ? "bg-[#496559] text-white border-[#496559]" : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8F9FA]"}`}
            >
              Invitation unitaire
            </button>
            <button
              onClick={() => setImportMode(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-colors ${importMode ? "bg-[#496559] text-white border-[#496559]" : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8F9FA]"}`}
            >
              Import en masse
            </button>
          </div>

          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${message.type === "success" ? "bg-[#16A34A]/10 text-[#16A34A]" : "bg-[#DC2626]/8 text-[#DC2626]"}`}>
              {message.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          {!importMode ? (
            <div className="space-y-4">
              {[
                { key: "companyName", label: "Nom de l'entreprise", required: true },
                { key: "email", label: "Email", required: true, type: "email" },
                { key: "rccm", label: "RCCM (optionnel)" },
                { key: "ncc", label: "NCC (optionnel)" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-1.5">
                    {f.label}
                    {f.required && <span className="text-[#DC2626] ml-1">*</span>}
                  </label>
                  <input
                    type={f.type ?? "text"}
                    value={singleInvite[f.key as keyof typeof singleInvite]}
                    onChange={(e) => setSingleInvite((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10"
                  />
                </div>
              ))}
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" size="sm" onClick={() => setInviteModal(false)}>Annuler</Button>
                <Button size="sm" loading={loading} onClick={sendSingleInvitation}>
                  <Send className="w-4 h-4" />
                  Envoyer invitation
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-[#6B7280]">
                Format requis : CSV ou XLSX avec colonnes <code className="bg-[#F1F3F5] px-1 rounded">nom_entreprise</code>, <code className="bg-[#F1F3F5] px-1 rounded">email</code>, rccm, ncc
              </p>
              <div
                className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-8 text-center cursor-pointer hover:border-[#496559] transition-colors"
                onClick={() => document.getElementById("invite-file")?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setInviteFile(f); }}
              >
                <Upload className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2" />
                <p className="text-sm text-[#6B7280]">
                  {inviteFile ? inviteFile.name : "Cliquez ou glissez votre fichier CSV/XLSX"}
                </p>
                <input id="invite-file" type="file" accept=".csv,.xlsx,.xls" className="hidden"
                  onChange={(e) => setInviteFile(e.target.files?.[0] ?? null)} />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" size="sm" onClick={() => setInviteModal(false)}>Annuler</Button>
                <Button size="sm" loading={loading} onClick={importInvitations} disabled={!inviteFile}>
                  <Upload className="w-4 h-4" />
                  Importer
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Unit import modal */}
      <Modal open={unitModal} onClose={() => setUnitModal(false)} title="Importer les unités" description="Colonnes requises : code_unite, libelle_unite" size="md">
        <div className="space-y-4">
          {unitMessage && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${unitMessage.type === "success" ? "bg-[#16A34A]/10 text-[#16A34A]" : "bg-[#DC2626]/8 text-[#DC2626]"}`}>
              {unitMessage.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {unitMessage.text}
            </div>
          )}

          <div className="bg-[#F8F9FA] rounded-xl p-3 text-xs text-[#6B7280] space-y-1">
            <p className="font-semibold text-[#1F2937]">Exemples d&apos;unités :</p>
            <p>02 — KILOGRAMME NET</p>
            <p>04 — TONNE NETTE</p>
            <p>10 — LITRE</p>
            <p>21 — UNITE</p>
          </div>

          <div
            className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-8 text-center cursor-pointer hover:border-[#496559] transition-colors"
            onClick={() => document.getElementById("unit-file")?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setUnitFile(f); }}
          >
            <Package className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2" />
            <p className="text-sm text-[#6B7280]">
              {unitFile ? unitFile.name : "Cliquez ou glissez votre fichier CSV/XLSX"}
            </p>
            <input id="unit-file" type="file" accept=".csv,.xlsx,.xls" className="hidden"
              onChange={(e) => setUnitFile(e.target.files?.[0] ?? null)} />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setUnitModal(false)}>Fermer</Button>
            <Button size="sm" loading={unitLoading} onClick={importUnits} disabled={!unitFile}>
              <Upload className="w-4 h-4" />
              Importer les unités
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
