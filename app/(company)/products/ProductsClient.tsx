"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Package, Plus, Search, MessageSquare, Upload, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type ProductType = "IMPORT" | "EXPORT";
type ProductSource = "ADMIN" | "COMPANY";

interface CompanyProductRow {
  id: string;
  productId: string;
  code: string;
  designation: string;
  type: ProductType;
  source: ProductSource;
  observation: string | null;
}

interface AdminProduct {
  id: string;
  code: string;
  designation: string;
  type: ProductType;
}

interface ProductsClientProps {
  companyId: string;
  companyProducts: CompanyProductRow[];
  availableAdminProducts: AdminProduct[];
}

const typeLabels: Record<ProductType, { label: string; variant: "info" | "success" }> = {
  IMPORT: { label: "Import", variant: "info" },
  EXPORT: { label: "Export", variant: "success" },
};

export function ProductsClient({ companyId: _companyId, companyProducts: initialProducts, availableAdminProducts: _availableAdminProducts }: ProductsClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const [observationModal, setObservationModal] = useState<CompanyProductRow | null>(null);
  const [observationText, setObservationText] = useState("");
  const [savingObs, setSavingObs] = useState(false);

  const [addModal, setAddModal] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDesignation, setNewDesignation] = useState("");
  const [newType, setNewType] = useState<ProductType>("IMPORT");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const [importModal, setImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; errors: string[] } | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.designation.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "ALL" || p.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [products, search, typeFilter]);

  const openObservation = (p: CompanyProductRow) => {
    setObservationModal(p);
    setObservationText(p.observation ?? "");
  };

  const saveObservation = async () => {
    if (!observationModal) return;
    setSavingObs(true);
    try {
      const res = await fetch(`/api/company/products/${observationModal.id}/observation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observation: observationText }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === observationModal.id ? { ...p, observation: observationText } : p
          )
        );
        setObservationModal(null);
      }
    } finally {
      setSavingObs(false);
    }
  };

  const addProduct = async () => {
    if (!newCode || !newDesignation) { setAddError("Code et désignation requis."); return; }
    setAdding(true);
    setAddError("");
    try {
      const res = await fetch("/api/company/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: newCode, designation: newDesignation, type: newType }),
      });
      const json = await res.json();
      if (!res.ok) { setAddError(json.error ?? "Erreur"); return; }
      router.refresh();
      setAddModal(false);
      setNewCode(""); setNewDesignation(""); setNewType("IMPORT");
    } finally {
      setAdding(false);
    }
  };

  const importProducts = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const fd = new FormData();
      fd.append("file", importFile);
      const res = await fetch("/api/company/products/import", { method: "POST", body: fd });
      const json = await res.json();
      if (json.success) {
        setImportResult(json.data);
        router.refresh();
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Catalogue Produits</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            {products.length} produit(s) dans votre catalogue
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => setImportModal(true)}>
            <Upload className="w-4 h-4" />
            Importer
          </Button>
          <Button size="sm" onClick={() => setAddModal(true)}>
            <Plus className="w-4 h-4" />
            Ajouter un produit
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Rechercher par code ou désignation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10"
            />
          </div>
          <div className="flex gap-2">
            {["ALL", "IMPORT", "EXPORT"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  typeFilter === t
                    ? "bg-[#496559] text-white"
                    : "bg-[#F8F9FA] text-[#6B7280] hover:bg-[#E5E7EB]"
                }`}
              >
                {t === "ALL" ? "Tous" : t === "IMPORT" ? "Import" : "Export"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-[0px_4px_20px_rgba(73,101,89,0.08)]">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#9CA3AF]">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucun produit trouvé</p>
            <p className="text-sm mt-1">Modifiez vos filtres ou ajoutez un produit</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F1F3F5]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Code</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Désignation</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Observation</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t border-[#E9ECEF] hover:bg-[#F8F9FA] transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-[#496559] font-semibold">{p.code}</td>
                    <td className="px-4 py-3 text-sm text-[#1F2937]">{p.designation}</td>
                    <td className="px-4 py-3">
                      <Badge variant={typeLabels[p.type].variant}>{typeLabels[p.type].label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.source === "ADMIN" ? "info" : "neutral"}>
                        {p.source === "ADMIN" ? "Administration" : "Entreprise"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6B7280] max-w-xs truncate">
                      {p.observation || <span className="text-[#9CA3AF] italic">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openObservation(p)}
                        className="inline-flex items-center gap-1.5 text-xs text-[#496559] font-medium hover:underline"
                        title="Ajouter/modifier observation"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {p.source === "ADMIN" ? "Observation" : <Edit2 className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Observation modal */}
      <Modal
        open={!!observationModal}
        onClose={() => setObservationModal(null)}
        title="Observation entreprise"
        description={observationModal ? `${observationModal.code} — ${observationModal.designation}` : ""}
      >
        <div className="space-y-4">
          <textarea
            value={observationText}
            onChange={(e) => setObservationText(e.target.value)}
            placeholder="Saisissez votre observation sur ce produit..."
            rows={4}
            className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10 resize-none"
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setObservationModal(null)}>
              Annuler
            </Button>
            <Button size="sm" loading={savingObs} onClick={saveObservation}>
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add product modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Ajouter un produit" size="md">
        <div className="space-y-4">
          {addError && <p className="text-sm text-[#DC2626] bg-[#DC2626]/8 p-3 rounded-xl">{addError}</p>}
          <div>
            <label className="block text-sm font-semibold text-[#1F2937] mb-1.5">Code produit *</label>
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="Ex: 1234"
              className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1F2937] mb-1.5">Désignation *</label>
            <input
              type="text"
              value={newDesignation}
              onChange={(e) => setNewDesignation(e.target.value)}
              placeholder="Description du produit"
              className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1F2937] mb-1.5">Type *</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as ProductType)}
              className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10"
            >
              <option value="IMPORT">Import</option>
              <option value="EXPORT">Export</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={() => setAddModal(false)}>Annuler</Button>
            <Button size="sm" loading={adding} onClick={addProduct}>Ajouter</Button>
          </div>
        </div>
      </Modal>

      {/* Import modal */}
      <Modal open={importModal} onClose={() => setImportModal(false)} title="Importer des produits" description="Format requis : CSV ou XLSX avec colonnes code, designation, type" size="md">
        <div className="space-y-4">
          {importResult ? (
            <div className="space-y-3">
              <div className="p-3 bg-[#16A34A]/8 rounded-xl text-sm text-[#16A34A] font-medium">
                ✓ {importResult.created} produit(s) importé(s)
              </div>
              {importResult.errors.length > 0 && (
                <div className="p-3 bg-[#DC2626]/8 rounded-xl text-sm text-[#DC2626]">
                  <p className="font-medium mb-1">{importResult.errors.length} erreur(s) :</p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs">
                    {importResult.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
              <Button onClick={() => { setImportModal(false); setImportResult(null); setImportFile(null); }} className="w-full">
                Fermer
              </Button>
            </div>
          ) : (
            <>
              <div
                className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-8 text-center cursor-pointer hover:border-[#496559] transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setImportFile(f); }}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <Upload className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2" />
                <p className="text-sm text-[#6B7280]">
                  {importFile ? importFile.name : "Cliquez ou glissez votre fichier CSV/XLSX ici"}
                </p>
                <input
                  id="file-input"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" size="sm" onClick={() => setImportModal(false)}>Annuler</Button>
                <Button size="sm" loading={importing} onClick={importProducts} disabled={!importFile}>
                  Importer
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
