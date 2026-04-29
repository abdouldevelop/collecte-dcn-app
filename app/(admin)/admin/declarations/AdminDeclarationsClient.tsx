"use client";

import { useState, useMemo } from "react";
import { FileText, Search, Download, CheckCircle2 } from "lucide-react";
import { DeclarationStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";

interface DeclarationRow {
  companyId: string;
  companyName: string;
  companyEmail: string;
  importStatus: string;
  importSubmittedAt: Date | null;
  importLinesCount: number;
  exportStatus: string;
  exportSubmittedAt: Date | null;
  exportLinesCount: number;
}

interface Period {
  id: string;
  label: string;
  isActive: boolean;
}

interface Props {
  data: DeclarationRow[];
  periods: Period[];
  activePeriodId: string | null;
}

export function AdminDeclarationsClient({ data, periods, activePeriodId }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedPeriodId, setSelectedPeriodId] = useState(activePeriodId ?? "");
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(() => {
    return data.filter((d) => {
      const matchSearch =
        d.companyName.toLowerCase().includes(search.toLowerCase()) ||
        d.companyEmail.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "SUBMITTED" && d.importStatus === "SUBMITTED" && d.exportStatus === "SUBMITTED") ||
        (statusFilter === "PARTIAL" && (d.importStatus === "SUBMITTED" || d.exportStatus === "SUBMITTED") && !(d.importStatus === "SUBMITTED" && d.exportStatus === "SUBMITTED")) ||
        (statusFilter === "DRAFT" && (d.importStatus === "DRAFT" || d.exportStatus === "DRAFT")) ||
        (statusFilter === "NONE" && d.importStatus === "NOT_STARTED" && d.exportStatus === "NOT_STARTED");
      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  const exportExcel = async () => {
    if (!selectedPeriodId) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/declarations/export?periodId=${selectedPeriodId}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const period = periods.find((p) => p.id === selectedPeriodId);
      a.download = `declarations_${period?.label ?? "export"}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const submittedBoth = data.filter((d) => d.importStatus === "SUBMITTED" && d.exportStatus === "SUBMITTED").length;
  const submittedImport = data.filter((d) => d.importStatus === "SUBMITTED").length;
  const submittedExport = data.filter((d) => d.exportStatus === "SUBMITTED").length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Supervision des Déclarations</h1>
          <p className="text-[#6B7280] text-sm mt-1">{data.length} entreprise(s) suivie(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#496559]"
          >
            <option value="">Période...</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>{p.label}{p.isActive ? " (active)" : ""}</option>
            ))}
          </select>
          <Button size="sm" loading={exporting} onClick={exportExcel} disabled={!selectedPeriodId} variant="secondary">
            <Download className="w-4 h-4" />
            Exporter Excel
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Import soumis", value: submittedImport, total: data.length, color: "#496559" },
          { label: "Export soumis", value: submittedExport, total: data.length, color: "#f39221" },
          { label: "Complets (2/2)", value: submittedBoth, total: data.length, color: "#16A34A" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[#6B7280]">{s.label}</p>
              <CheckCircle2 className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold text-[#1F2937]">{s.value}<span className="text-base font-normal text-[#9CA3AF]">/{s.total}</span></p>
            <div className="mt-2 h-1.5 bg-[#F1F3F5] rounded-full">
              <div className="h-full rounded-full transition-all" style={{ width: `${s.total > 0 ? (s.value / s.total) * 100 : 0}%`, backgroundColor: s.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Rechercher une entreprise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:border-[#496559]"
            />
          </div>
          <div className="flex gap-2">
            {["ALL", "SUBMITTED", "PARTIAL", "DRAFT", "NONE"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-[#496559] text-white" : "bg-[#F8F9FA] text-[#6B7280] hover:bg-[#E5E7EB]"}`}
              >
                {s === "ALL" ? "Tous" : s === "SUBMITTED" ? "Complets" : s === "PARTIAL" ? "Partiels" : s === "DRAFT" ? "Brouillon" : "Non commencés"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#9CA3AF]">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucune déclaration trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F1F3F5]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Entreprise</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Import — Statut</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Import — Lignes</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Import — Soumis</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Export — Statut</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Export — Lignes</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Export — Soumis</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.companyId} className="border-t border-[#E9ECEF] hover:bg-[#F8F9FA] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-[#1F2937]">{d.companyName}</p>
                      <p className="text-xs text-[#9CA3AF]">{d.companyEmail}</p>
                    </td>
                    <td className="px-4 py-3"><DeclarationStatusBadge status={d.importStatus} /></td>
                    <td className="px-4 py-3 text-sm text-[#1F2937]">{d.importLinesCount}</td>
                    <td className="px-4 py-3 text-sm text-[#6B7280]">
                      {d.importSubmittedAt ? formatDateTime(d.importSubmittedAt) : "—"}
                    </td>
                    <td className="px-4 py-3"><DeclarationStatusBadge status={d.exportStatus} /></td>
                    <td className="px-4 py-3 text-sm text-[#1F2937]">{d.exportLinesCount}</td>
                    <td className="px-4 py-3 text-sm text-[#6B7280]">
                      {d.exportSubmittedAt ? formatDateTime(d.exportSubmittedAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
