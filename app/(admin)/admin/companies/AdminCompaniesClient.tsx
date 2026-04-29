"use client";

import { useState, useMemo } from "react";
import { Building2, Search, Eye } from "lucide-react";
import { Badge, DeclarationStatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Company {
  id: string;
  name: string;
  email: string;
  rccm: string | null;
  ncc: string | null;
  isActive: boolean;
  isOnboarded: boolean;
  createdAt: Date;
  focalPoint: { firstName: string; lastName: string; email: string } | null;
  productsCount: number;
  importStatus: string;
  exportStatus: string;
}

export function AdminCompaniesClient({ companies }: { companies: Company[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.rccm ?? "").toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && c.isActive) ||
        (statusFilter === "INACTIVE" && !c.isActive) ||
        (statusFilter === "ONBOARDED" && c.isOnboarded) ||
        (statusFilter === "PENDING" && !c.isOnboarded);
      return matchSearch && matchStatus;
    });
  }, [companies, search, statusFilter]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Gestion des Entreprises</h1>
        <p className="text-[#6B7280] text-sm mt-1">{companies.length} entreprise(s) enregistrée(s)</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, RCCM..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10"
            />
          </div>
          <div className="flex gap-2">
            {["ALL", "ACTIVE", "ONBOARDED", "PENDING"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-[#496559] text-white" : "bg-[#F8F9FA] text-[#6B7280] hover:bg-[#E5E7EB]"}`}
              >
                {s === "ALL" ? "Tous" : s === "ACTIVE" ? "Actifs" : s === "ONBOARDED" ? "Inscrits" : "En attente"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(73,101,89,0.08)] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#9CA3AF]">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucune entreprise trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F1F3F5]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Entreprise</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Point Focal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Produits</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Import</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Export</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Statut</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Membre depuis</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t border-[#E9ECEF] hover:bg-[#F8F9FA] transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-[#1F2937]">{c.name}</p>
                        <p className="text-xs text-[#9CA3AF]">{c.email}</p>
                        {c.rccm && <p className="text-xs text-[#9CA3AF] font-mono">{c.rccm}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {c.focalPoint ? (
                        <div>
                          <p className="text-sm text-[#1F2937]">{c.focalPoint.firstName} {c.focalPoint.lastName}</p>
                          <p className="text-xs text-[#9CA3AF]">{c.focalPoint.email}</p>
                        </div>
                      ) : (
                        <Badge variant="warning">Non défini</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#1F2937] font-medium">{c.productsCount}</td>
                    <td className="px-4 py-3">
                      <DeclarationStatusBadge status={c.importStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <DeclarationStatusBadge status={c.exportStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Badge variant={c.isActive ? "success" : "danger"}>
                          {c.isActive ? "Actif" : "Inactif"}
                        </Badge>
                        {!c.isOnboarded && <Badge variant="warning">Non inscrit</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6B7280]">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/companies/${c.id}`}
                        className="inline-flex items-center gap-1.5 text-xs text-[#496559] font-medium hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Voir fiche
                      </Link>
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
