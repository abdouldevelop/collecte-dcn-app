"use client";

import { useState, useMemo } from "react";

interface Country { id: string; code: string; name: string; continent: string }
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

const CONTINENT_ORDER = ["Afrique", "Europe", "Asie", "Ameriques", "Oceanie", "Autre"];
const CONTINENT_FLAGS: Record<string, string> = {
  Afrique: "🌍", Europe: "🌍", Asie: "🌏", Ameriques: "🌎", Oceanie: "🌏", Autre: "🌐",
};

export default function CountriesClient({
  initialCompanyCountries,
  allCountries,
}: {
  initialCompanyCountries: CompanyCountry[];
  allCountries: Country[];
}) {
  const [companyCountries, setCompanyCountries] = useState(initialCompanyCountries);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedFlow, setSelectedFlow] = useState("IMPORT_EXPORT");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const alreadyAdded = useMemo(() => new Set(companyCountries.map((c) => c.country.id)), [companyCountries]);

  const available = useMemo(() =>
    allCountries.filter((c) => !alreadyAdded.has(c.id)),
    [allCountries, alreadyAdded]
  );

  const filtered = useMemo(() =>
    available.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    ),
    [available, search]
  );

  const byContinent = useMemo(() => {
    const groups: Record<string, Country[]> = {};
    for (const c of filtered) {
      if (!groups[c.continent]) groups[c.continent] = [];
      groups[c.continent].push(c);
    }
    return groups;
  }, [filtered]);

  const sortedContinents = CONTINENT_ORDER.filter((c) => byContinent[c]?.length > 0);

  function toggleCountry(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleContinent(continent: string) {
    const ids = byContinent[continent]?.map((c) => c.id) ?? [];
    const allSelected = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(filtered.map((c) => c.id)));
  }

  function clearAll() {
    setSelected(new Set());
  }

  async function handleAdd() {
    if (selected.size === 0) return;
    setLoading(true);
    setError("");
    try {
      const results = await Promise.all(
        Array.from(selected).map((countryId) =>
          fetch("/api/company/countries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ countryId, flowType: selectedFlow }),
          }).then((r) => r.json())
        )
      );
      const added = results.filter((r) => r.data).map((r) => r.data);
      setCompanyCountries((prev) => [...prev, ...added]);
      setShowModal(false);
      setSelected(new Set());
      setSearch("");
      setSuccess(`${added.length} pays ajouté${added.length > 1 ? "s" : ""} avec succès`);
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
    if (res.ok) setCompanyCountries((prev) => prev.map((c) => (c.id === id ? json.data : c)));
  }

  async function handleRemove(id: string) {
    const res = await fetch(`/api/company/countries/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCompanyCountries((prev) => prev.filter((c) => c.id !== id));
      setSuccess("Pays retiré");
      setTimeout(() => setSuccess(""), 2000);
    }
  }

  const byCompanyContinent = useMemo(() => {
    const groups: Record<string, CompanyCountry[]> = {};
    for (const cc of companyCountries) {
      const cont = cc.country.continent;
      if (!groups[cont]) groups[cont] = [];
      groups[cont].push(cc);
    }
    return groups;
  }, [companyCountries]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pays partenaires</h1>
          <p className="text-sm text-gray-500 mt-1">
            {companyCountries.length} pays — définissez les flux Import / Export par pays.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2"
          style={{ backgroundColor: "#496559" }}
        >
          + Ajouter des pays
        </button>
      </div>

      {success && <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 text-green-700 text-sm">{success}</div>}
      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

      {/* Modal sélection */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Sélectionner des pays</h2>
                <p className="text-sm text-gray-500">{selected.size} pays sélectionné{selected.size > 1 ? "s" : ""} / {available.length} disponibles</p>
              </div>
              <button onClick={() => { setShowModal(false); setSelected(new Set()); setSearch(""); }} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {/* Recherche + actions rapides */}
            <div className="px-6 py-3 border-b border-gray-100 space-y-2">
              <input
                type="text"
                placeholder="Rechercher un pays..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#496559]"
              />
              <div className="flex items-center gap-3 text-xs">
                <button onClick={selectAll} className="text-[#496559] hover:underline font-medium">Tout sélectionner</button>
                <span className="text-gray-300">|</span>
                <button onClick={clearAll} className="text-gray-500 hover:underline">Tout désélectionner</button>
              </div>
            </div>

            {/* Liste par continent */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {sortedContinents.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Aucun pays disponible</p>
              ) : (
                sortedContinents.map((continent) => {
                  const countries = byContinent[continent];
                  const allSel = countries.every((c) => selected.has(c.id));
                  const someSel = countries.some((c) => selected.has(c.id));
                  return (
                    <div key={continent}>
                      {/* Continent header */}
                      <label className="flex items-center gap-2 cursor-pointer mb-2 select-none">
                        <input
                          type="checkbox"
                          checked={allSel}
                          ref={(el) => { if (el) el.indeterminate = someSel && !allSel; }}
                          onChange={() => toggleContinent(continent)}
                          className="w-4 h-4 rounded accent-[#496559]"
                        />
                        <span className="font-semibold text-gray-800 text-sm">
                          {CONTINENT_FLAGS[continent]} {continent}
                        </span>
                        <span className="text-xs text-gray-400">({countries.length})</span>
                      </label>

                      {/* Countries grid */}
                      <div className="ml-6 grid grid-cols-2 sm:grid-cols-3 gap-1">
                        {countries.map((c) => (
                          <label key={c.id} className="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-gray-50 select-none">
                            <input
                              type="checkbox"
                              checked={selected.has(c.id)}
                              onChange={() => toggleCountry(c.id)}
                              className="w-3.5 h-3.5 rounded accent-[#496559]"
                            />
                            <span className="text-sm text-gray-700 truncate">{c.name}</span>
                            <span className="text-xs text-gray-400 ml-auto">{c.code}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Flux pour les pays sélectionnés</label>
                <select
                  value={selectedFlow}
                  onChange={(e) => setSelectedFlow(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#496559]"
                >
                  <option value="IMPORT_EXPORT">Import & Export</option>
                  <option value="IMPORT">Import uniquement</option>
                  <option value="EXPORT">Export uniquement</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => { setShowModal(false); setSelected(new Set()); setSearch(""); }}
                  className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-600 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAdd}
                  disabled={loading || selected.size === 0}
                  className="px-5 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                  style={{ backgroundColor: "#496559" }}
                >
                  {loading ? "Ajout..." : `Ajouter ${selected.size > 0 ? `(${selected.size})` : ""}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des pays ajoutés */}
      {companyCountries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🌍</div>
          <p className="font-medium text-gray-600">Aucun pays partenaire défini</p>
          <p className="text-sm mt-1">Cliquez sur &quot;Ajouter des pays&quot; pour commencer.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {CONTINENT_ORDER.filter((c) => byCompanyContinent[c]?.length > 0).map((continent) => (
            <div key={continent}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                {CONTINENT_FLAGS[continent]} {continent}
                <span className="text-xs normal-case text-gray-400">({byCompanyContinent[continent].length})</span>
              </h3>
              <div className="grid gap-2">
                {byCompanyContinent[continent].map((cc) => (
                  <div key={cc.id} className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-gray-400 w-8">{cc.country.code}</span>
                      <span className="text-sm font-medium text-gray-900">{cc.country.name}</span>
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
                      <button onClick={() => handleRemove(cc.id)} className="text-red-300 hover:text-red-500 text-sm ml-1" title="Retirer">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
