"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Send, Search, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DeclarationStatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatDate, formatDateTime } from "@/lib/utils";
import Link from "next/link";

interface Country { id: string; code: string; name: string }
interface Unit { id: string; code: string; label: string }
interface Period { id: string; label: string; dueDate: Date | null; year: number; month: number }

interface DeclarationLine {
  companyProductId: string;
  productCode: string;
  productDesignation: string;
  observation: string | null;
  priceMin: number | null;
  priceMax: number | null;
  quantity: number | null;
  unitId: string | null;
  countryId: string | null;
  lastModified: Date | null;
}

interface DeclarationFormProps {
  type: "import" | "export";
  declarationId: string | null;
  status: string;
  submittedAt: Date | null;
  period: Period;
  lines: DeclarationLine[];
  units: Unit[];
  countries: Country[];
  freightAmount?: number | null;
  insuranceAmount?: number | null;
}

interface LineErrors {
  priceMax?: string;
  unitId?: string;
}

export function DeclarationForm({
  type,
  declarationId: _declarationId,
  status,
  submittedAt,
  period,
  lines: initialLines,
  units,
  countries,
  freightAmount: initialFreight = null,
  insuranceAmount: initialInsurance = null,
}: DeclarationFormProps) {
  const router = useRouter();
  const [lines, setLines] = useState(initialLines);
  const [lineErrors, setLineErrors] = useState<Record<string, LineErrors>>({});
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [submitModal, setSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [globalError, setGlobalError] = useState("");
  const [freightAmount, setFreightAmount] = useState<number | null>(initialFreight ?? null);
  const [insuranceAmount, setInsuranceAmount] = useState<number | null>(initialInsurance ?? null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSubmitted = currentStatus === "SUBMITTED";
  const endpoint = type === "import" ? "import" : "export";
  const typeLabel = type === "import" ? "Import" : "Export";
  const typeColor = type === "import" ? "#496559" : "#f39221";

  const validateLine = (line: DeclarationLine): LineErrors => {
    const errors: LineErrors = {};
    if (line.priceMin !== null && line.priceMax !== null && line.priceMin > line.priceMax) {
      errors.priceMax = "Prix max doit être ≥ prix min";
    }
    if (line.quantity !== null && line.quantity > 0 && !line.unitId) {
      errors.unitId = "Unité requise si quantité > 0";
    }
    return errors;
  };

  const hasErrors = () => lines.some((l) => Object.keys(validateLine(l)).length > 0);

  const updateLine = useCallback(
    (cpId: string, field: keyof DeclarationLine, value: number | string | null) => {
      setLines((prev) => {
        const updated = prev.map((l) => (l.companyProductId === cpId ? { ...l, [field]: value } : l));
        const line = updated.find((l) => l.companyProductId === cpId);
        if (line) setLineErrors((e) => ({ ...e, [cpId]: validateLine(line) }));
        return updated;
      });
      setSaveSuccess(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => autoSave(), 2000);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const buildPayload = () => ({
    lines: lines.map((l) => ({
      companyProductId: l.companyProductId,
      priceMin: l.priceMin,
      priceMax: l.priceMax,
      quantity: l.quantity,
      unitId: l.unitId,
      countryId: l.countryId,
    })),
    ...(type === "import" ? { freightAmount, insuranceAmount } : {}),
  });

  const autoSave = async () => {
    if (isSubmitted) return;
    await fetch(`/api/declarations/${endpoint}/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload()),
    });
  };

  const saveDraft = async () => {
    if (isSubmitted || hasErrors()) return;
    setSaving(true);
    setGlobalError("");
    try {
      const res = await fetch(`/api/declarations/${endpoint}/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (res.ok) {
        setSaveSuccess(true);
        if (currentStatus === "NOT_STARTED") setCurrentStatus("DRAFT");
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      setGlobalError("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const submitDeclaration = async () => {
    if (hasErrors()) return;
    setSubmitting(true);
    setGlobalError("");
    try {
      const res = await fetch(`/api/declarations/${endpoint}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const json = await res.json();
      if (!res.ok) { setGlobalError(json.error ?? "Erreur lors de la soumission."); return; }
      setCurrentStatus("SUBMITTED");
      setSubmitModal(false);
      router.refresh();
    } catch {
      setGlobalError("Erreur réseau.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLines = lines.filter(
    (l) =>
      l.productCode.toLowerCase().includes(search.toLowerCase()) ||
      l.productDesignation.toLowerCase().includes(search.toLowerCase())
  );

  const filledLines = lines.filter((l) => l.quantity !== null || l.priceMin !== null).length;

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white border-b border-[#E5E7EB] px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link href="/declarations" className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#1F2937]">Déclaration {typeLabel}</h1>
                <DeclarationStatusBadge status={currentStatus} />
              </div>
              <p className="text-xs text-[#9CA3AF]">
                {period.label} — {filledLines}/{lines.length} lignes renseignées
                {submittedAt && ` — Soumis le ${formatDateTime(submittedAt)}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-xs text-[#16A34A] font-medium">
                <CheckCircle2 className="w-4 h-4" /> Sauvegardé
              </span>
            )}
            {!isSubmitted && (
              <>
                <Button variant="secondary" size="sm" loading={saving} onClick={saveDraft}>
                  <Save className="w-4 h-4" /> Enregistrer brouillon
                </Button>
                <Button size="sm" onClick={() => setSubmitModal(true)} disabled={hasErrors()} style={{ backgroundColor: typeColor }}>
                  <Send className="w-4 h-4" /> Soumettre
                </Button>
              </>
            )}
          </div>
        </div>

        {globalError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-[#DC2626] bg-[#DC2626]/8 border border-[#DC2626]/20 rounded-lg px-3 py-2">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {globalError}
          </div>
        )}
        {isSubmitted && (
          <div className="mt-3 flex items-center gap-2 text-sm text-[#16A34A] bg-[#16A34A]/8 border border-[#16A34A]/20 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Déclaration soumise le {formatDate(submittedAt)}. En lecture seule.
          </div>
        )}
      </div>

      {/* Pays info banner */}
      {countries.length === 0 && (
        <div className="px-6 py-2 bg-amber-50 border-b border-amber-200 text-sm text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Aucun pays partenaire défini. <Link href="/countries" className="underline font-medium">Ajouter des pays</Link> pour sélectionner l&apos;origine/destination par ligne.
        </div>
      )}

      {/* Search */}
      <div className="px-6 py-3 bg-[#F8F9FA] border-b border-[#E5E7EB]">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:border-[#496559] focus:ring-2 focus:ring-[#496559]/10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {lines.length === 0 ? (
          <div className="text-center py-16 text-[#9CA3AF]">
            <p className="font-medium">Aucun produit {typeLabel.toLowerCase()} dans votre catalogue</p>
            <p className="text-sm mt-2">
              <Link href="/products" className="text-[#496559] underline">Ajoutez des produits</Link> pour commencer à déclarer.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="sticky top-0 z-10 bg-[#F1F3F5]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-24">Code</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Désignation</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-40">Pays</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-36">Prix Min (FCFA)</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-36">Prix Max (FCFA)</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-28">Quantité</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-44">Unité</th>
                </tr>
              </thead>
              <tbody>
                {filteredLines.map((line) => {
                  const errors = lineErrors[line.companyProductId] ?? {};
                  const hasValue = line.quantity !== null || line.priceMin !== null;
                  return (
                    <tr
                      key={line.companyProductId}
                      className={`border-t border-[#E9ECEF] transition-colors ${hasValue ? "bg-[#496559]/3" : "hover:bg-[#F8F9FA]"}`}
                    >
                      <td className="px-4 py-2.5 text-sm font-mono text-[#496559] font-semibold">{line.productCode}</td>
                      <td className="px-4 py-2.5 text-sm text-[#1F2937]">
                        {line.productDesignation}
                        {line.observation && <p className="text-xs text-[#9CA3AF] truncate max-w-[200px]">{line.observation}</p>}
                      </td>
                      {/* Pays selector */}
                      <td className="px-4 py-2">
                        {countries.length === 0 ? (
                          <span className="text-xs text-[#C4C9D4] italic">— Aucun pays —</span>
                        ) : countries.length === 1 ? (
                          <span className="text-sm text-[#1F2937]">{countries[0].name}</span>
                        ) : (
                          <select
                            disabled={isSubmitted}
                            value={line.countryId ?? ""}
                            onChange={(e) => updateLine(line.companyProductId, "countryId", e.target.value || null)}
                            className="w-full bg-white border border-[#E5E7EB] rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#496559] focus:ring-1 focus:ring-[#496559]/10 disabled:bg-[#F8F9FA] disabled:text-[#9CA3AF]"
                          >
                            <option value="">— Sélectionner —</option>
                            {countries.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number" min="0" step="any" disabled={isSubmitted} value={line.priceMin ?? ""}
                          onChange={(e) => updateLine(line.companyProductId, "priceMin", e.target.value === "" ? null : Number(e.target.value))}
                          className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#496559] focus:ring-1 focus:ring-[#496559]/10 disabled:bg-[#F8F9FA] disabled:text-[#9CA3AF]"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number" min="0" step="any" disabled={isSubmitted} value={line.priceMax ?? ""}
                          onChange={(e) => updateLine(line.companyProductId, "priceMax", e.target.value === "" ? null : Number(e.target.value))}
                          className={`w-full bg-white border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 disabled:bg-[#F8F9FA] disabled:text-[#9CA3AF] ${errors.priceMax ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/10" : "border-[#E5E7EB] focus:border-[#496559] focus:ring-[#496559]/10"}`}
                          placeholder="0"
                        />
                        {errors.priceMax && <p className="text-[10px] text-[#DC2626] mt-0.5">{errors.priceMax}</p>}
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number" min="0" step="any" disabled={isSubmitted} value={line.quantity ?? ""}
                          onChange={(e) => updateLine(line.companyProductId, "quantity", e.target.value === "" ? null : Number(e.target.value))}
                          className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#496559] focus:ring-1 focus:ring-[#496559]/10 disabled:bg-[#F8F9FA] disabled:text-[#9CA3AF]"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          disabled={isSubmitted} value={line.unitId ?? ""}
                          onChange={(e) => updateLine(line.companyProductId, "unitId", e.target.value || null)}
                          className={`w-full bg-white border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 disabled:bg-[#F8F9FA] disabled:text-[#9CA3AF] ${errors.unitId ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/10" : "border-[#E5E7EB] focus:border-[#496559] focus:ring-[#496559]/10"}`}
                        >
                          <option value="">— Sélectionner —</option>
                          {units.map((u) => <option key={u.id} value={u.id}>{u.code} - {u.label}</option>)}
                        </select>
                        {errors.unitId && <p className="text-[10px] text-[#DC2626] mt-0.5">{errors.unitId}</p>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fret & Assurance — import uniquement */}
      {type === "import" && lines.length > 0 && (
        <div className="border-t border-[#E5E7EB] bg-white px-6 py-4">
          <h3 className="text-sm font-semibold text-[#1F2937] mb-3">Coûts additionnels</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-[#6B7280] mb-1">Montant Fret (FCFA)</label>
              <input
                type="number" min="0" step="any" disabled={isSubmitted}
                value={freightAmount ?? ""}
                onChange={(e) => {
                  setFreightAmount(e.target.value === "" ? null : Number(e.target.value));
                  if (debounceRef.current) clearTimeout(debounceRef.current);
                  debounceRef.current = setTimeout(() => autoSave(), 2000);
                }}
                className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#496559] focus:ring-1 focus:ring-[#496559]/10 disabled:bg-[#F8F9FA] disabled:text-[#9CA3AF]"
                placeholder="0"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-[#6B7280] mb-1">Montant Assurance (FCFA)</label>
              <input
                type="number" min="0" step="any" disabled={isSubmitted}
                value={insuranceAmount ?? ""}
                onChange={(e) => {
                  setInsuranceAmount(e.target.value === "" ? null : Number(e.target.value));
                  if (debounceRef.current) clearTimeout(debounceRef.current);
                  debounceRef.current = setTimeout(() => autoSave(), 2000);
                }}
                className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#496559] focus:ring-1 focus:ring-[#496559]/10 disabled:bg-[#F8F9FA] disabled:text-[#9CA3AF]"
                placeholder="0"
              />
            </div>
            {(freightAmount || insuranceAmount) && (
              <div className="flex-1 min-w-[200px] bg-[#496559]/5 rounded-lg px-3 py-2 flex items-center">
                <div>
                  <p className="text-xs text-[#6B7280]">Total coûts additionnels</p>
                  <p className="text-base font-bold text-[#496559]">
                    {((freightAmount ?? 0) + (insuranceAmount ?? 0)).toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit modal */}
      <Modal
        open={submitModal}
        onClose={() => setSubmitModal(false)}
        title={`Soumettre la déclaration ${typeLabel}`}
        description="Cette action est définitive. Vérifiez vos données avant de soumettre."
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8F9FA] rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-[#1F2937]">{lines.length}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Produits total</p>
            </div>
            <div className="bg-[#496559]/8 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-[#496559]">{filledLines}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Lignes renseignées</p>
            </div>
            {type === "import" && (freightAmount || insuranceAmount) && (
              <div className="bg-[#F8F9FA] rounded-xl p-3 col-span-2">
                <p className="text-xs text-[#6B7280] mb-1">Coûts additionnels</p>
                <div className="flex gap-4 text-sm">
                  <span>Fret : <strong>{(freightAmount ?? 0).toLocaleString("fr-FR")} FCFA</strong></span>
                  <span>Assurance : <strong>{(insuranceAmount ?? 0).toLocaleString("fr-FR")} FCFA</strong></span>
                </div>
              </div>
            )}
          </div>

          {hasErrors() && (
            <div className="flex items-center gap-2 p-3 bg-[#DC2626]/8 rounded-xl text-sm text-[#DC2626]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Des erreurs de validation doivent être corrigées avant la soumission.
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setSubmitModal(false)}>
              <X className="w-4 h-4" /> Annuler
            </Button>
            <Button className="flex-1" loading={submitting} disabled={hasErrors()} onClick={submitDeclaration} style={{ backgroundColor: typeColor }}>
              <Send className="w-4 h-4" /> Confirmer la soumission
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
