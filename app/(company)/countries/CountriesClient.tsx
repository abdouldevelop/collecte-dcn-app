"use client";

import { useState } from "react";

interface Country { id: string; code: string; name: string }
interface CompanyCountry { id: string; flowType: string; country: Country }

const FLOW_LABELS: Record<string, string> = {
  IMPORT: "Import",
  EXPORT: "Export",
  IMPORT_EXPORT: "Import & Export",
};

const FLOW_COLORS: Record<string, string> = {
  IMPORT: "bg-blue-100 text-blue-800",
  EXPORT: "bg-green-100 text-green-800",
  IMPORT_EXPORT: "bg-orange-100 text-orange-800",
};

export default function CountriesClient({
  initialCompanyCountries,
  allCountries,
}: {
  initialCompanyCountries: CompanyCountry[];
  allCountries: Country[];
}) {
  const [companyCountries, setCompanyCountries] = useState(initialCompanyCountries);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedFlow, setSelectedFlow] = useState("IMPORT_EXPORT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const alreadyAdded = new Set(companyCountries.map((c) => c.country.id));
  const available = allCountries.filter((c) => !alreadyAdded.has(c.id));

  async function handleAdd() {
    if (!selectedCountryId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/company/countries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryId: selectedCountryId, flowType: selectedFlow }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Erreur"); return; }
      setCompanyCountries((prev) => [...prev, json.data]);
      setShowAdd(false);
      setSelectedCountryId("");
      setSelectedFlow("IMPORT_EXPORT");
      setSuccess("Pays ajouté avec succès");
      setTimeout(() => setSuccess(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateFlow(id: string, flowType: string) {
    const res = await fetch(`/api/company/countries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flowType }),
    });
    const json = await res.json();
    if (res.ok) {
      setCompanyCountries((prev) => prev.map((c) => (c.id === id ? json.data : c)));
    }
  }

  async function handleRemove(id: string) {
    const res = await fetch(`/api/company/countries/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCompanyCountries((prev) => prev.filter((c) => c.id !== id));
      setSuccess("Pays retiré");
      setTimeout(() => setSuccess(""), 3000);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pays partenaires</h1>
          <p className="text-sm text-gray-500 mt-1">
            Définissez les pays avec lesquels vous travaillez et le sens des flux.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: "#496559" }}
        >
          + Ajouter un pays
        </button>
      </div>

      {success && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 text-green-700 text-sm">{success}</div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {showAdd && (
        <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-800 mb-3">Ajouter un pays partenaire</h3>
          <div className="flex gap-3 flex-wrap">
            <select
              value={selectedCountryId}
              onChange={(e) => setSelectedCountryId(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#496559]"
            >
              <option value="">Sélectionner un pays...</option>
              {available.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
            <select
              value={selectedFlow}
              onChange={(e) => setSelectedFlow(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#496559]"
            >
              <option value="IMPORT">Import uniquement</option>
              <option value="EXPORT">Export uniquement</option>
              <option value="IMPORT_EXPORT">Import & Export</option>
            </select>
            <button
              onClick={handleAdd}
              disabled={loading || !selectedCountryId}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: "#496559" }}
            >
              {loading ? "..." : "Confirmer"}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {companyCountries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🌍</div>
          <p className="font-medium">Aucun pays partenaire défini</p>
          <p className="text-sm mt-1">Ajoutez les pays avec lesquels vous travaillez.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {companyCountries.map((cc) => (
            <div
              key={cc.id}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌍</span>
                <div>
                  <p className="font-semibold text-gray-900">{cc.country.name}</p>
                  <p className="text-xs text-gray-400">{cc.country.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={cc.flowType}
                  onChange={(e) => handleUpdateFlow(cc.id, e.target.value)}
                  className={`px-2 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${FLOW_COLORS[cc.flowType]}`}
                >
                  <option value="IMPORT">Import</option>
                  <option value="EXPORT">Export</option>
                  <option value="IMPORT_EXPORT">Import & Export</option>
                </select>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${FLOW_COLORS[cc.flowType]}`}>
                  {FLOW_LABELS[cc.flowType]}
                </span>
                <button
                  onClick={() => handleRemove(cc.id)}
                  className="text-red-400 hover:text-red-600 text-sm ml-2"
                  title="Retirer ce pays"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
