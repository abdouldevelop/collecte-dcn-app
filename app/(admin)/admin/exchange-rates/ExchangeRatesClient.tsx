"use client";

import { useState, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Rate { id: string; currency: string; rate: number; date: string; source: string }
interface LatestRate { currency: string; rate: number; date: string }

interface Props {
  initialUSD: Rate[];
  initialEUR: Rate[];
  latestUSD: LatestRate | null;
  latestEUR: LatestRate | null;
}

const PERIODS = [
  { label: "1 mois", days: 30 },
  { label: "3 mois", days: 90 },
  { label: "6 mois", days: 180 },
  { label: "1 an", days: 365 },
];

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function formatRate(r: number) {
  return r.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function monthKey(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-");
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
}

interface MonthSummary {
  key: string;
  label: string;
  usd: { date: string; rate: number; delta: number | null }[];
  eur: { date: string; rate: number; delta: number | null }[];
  usdChanges: number;
  eurChanges: number;
  usdMin: number | null;
  usdMax: number | null;
  eurMin: number | null;
  eurMax: number | null;
}

function buildMonthlySummary(
  usdRates: Rate[],
  eurRates: Rate[],
): MonthSummary[] {
  // Group by month
  const usdByMonth = new Map<string, Rate[]>();
  const eurByMonth = new Map<string, Rate[]>();

  for (const r of usdRates) {
    const k = monthKey(r.date);
    if (!usdByMonth.has(k)) usdByMonth.set(k, []);
    usdByMonth.get(k)!.push(r);
  }
  for (const r of eurRates) {
    const k = monthKey(r.date);
    if (!eurByMonth.has(k)) eurByMonth.set(k, []);
    eurByMonth.get(k)!.push(r);
  }

  const allKeys = Array.from(new Set([...usdByMonth.keys(), ...eurByMonth.keys()])).sort().reverse();

  return allKeys.map((key) => {
    const usdEntries = (usdByMonth.get(key) ?? []).sort((a, b) => a.date.localeCompare(b.date));
    const eurEntries = (eurByMonth.get(key) ?? []).sort((a, b) => a.date.localeCompare(b.date));

    const usdWithDelta = usdEntries.map((r, i) => ({
      date: r.date,
      rate: r.rate,
      delta: i === 0 ? null : r.rate - usdEntries[i - 1].rate,
    }));
    const eurWithDelta = eurEntries.map((r, i) => ({
      date: r.date,
      rate: r.rate,
      delta: i === 0 ? null : r.rate - eurEntries[i - 1].rate,
    }));

    const usdChanges = usdWithDelta.filter((r) => r.delta !== null && r.delta !== 0).length;
    const eurChanges = eurWithDelta.filter((r) => r.delta !== null && r.delta !== 0).length;

    const usdValues = usdEntries.map((r) => r.rate);
    const eurValues = eurEntries.map((r) => r.rate);

    return {
      key,
      label: monthLabel(key),
      usd: usdWithDelta,
      eur: eurWithDelta,
      usdChanges,
      eurChanges,
      usdMin: usdValues.length ? Math.min(...usdValues) : null,
      usdMax: usdValues.length ? Math.max(...usdValues) : null,
      eurMin: eurValues.length ? Math.min(...eurValues) : null,
      eurMax: eurValues.length ? Math.max(...eurValues) : null,
    };
  });
}

export default function ExchangeRatesClient({ initialUSD, initialEUR, latestUSD, latestEUR }: Props) {
  const [usdRates, setUsdRates] = useState(initialUSD);
  const [eurRates, setEurRates] = useState(initialEUR);
  const [latestUSDState, setLatestUSD] = useState(latestUSD);
  const [latestEURState, setLatestEUR] = useState(latestEUR);
  const [period, setPeriod] = useState(90);
  const [syncing, setSyncing] = useState(false);
  const [syncingHistory, setSyncingHistory] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  const showMessage = (msg: string, type: "success" | "error" = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  const loadRates = useCallback(async (days: number) => {
    const [resUSD, resEUR] = await Promise.all([
      fetch(`/api/admin/exchange-rates?currency=USD&days=${days}`).then((r) => r.json()),
      fetch(`/api/admin/exchange-rates?currency=EUR&days=${days}`).then((r) => r.json()),
    ]);
    if (resUSD.data) { setUsdRates(resUSD.data.rates); setLatestUSD(resUSD.data.latest); }
    if (resEUR.data) { setEurRates(resEUR.data.rates); setLatestEUR(resEUR.data.latest); }
  }, []);

  async function handlePeriodChange(days: number) {
    setPeriod(days);
    await loadRates(days);
  }

  async function handleSyncToday() {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/exchange-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historical: false }),
      });
      const json = await res.json();
      if (!res.ok) { showMessage(json.error || "Erreur de synchronisation", "error"); return; }
      showMessage(`Taux du jour mis à jour (${json.data.synced} devises)`);
      await loadRates(period);
    } finally {
      setSyncing(false);
    }
  }

  async function handleSyncHistory() {
    setSyncingHistory(true);
    try {
      const res = await fetch("/api/admin/exchange-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historical: true, days: 365 }),
      });
      const json = await res.json();
      if (!res.ok) { showMessage(json.error || "Erreur", "error"); return; }
      showMessage(`Historique importé : ${json.data.synced} enregistrements`);
      await loadRates(period);
    } finally {
      setSyncingHistory(false);
    }
  }

  function toggleMonth(key: string) {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Merge USD and EUR for chart
  const chartData = (() => {
    const map = new Map<string, { date: string; USD?: number; EUR?: number }>();
    for (const r of usdRates) {
      const d = r.date.split("T")[0];
      map.set(d, { ...map.get(d), date: d, USD: r.rate });
    }
    for (const r of eurRates) {
      const d = r.date.split("T")[0];
      map.set(d, { ...map.get(d), date: d, EUR: r.rate });
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  })();

  const usdChange = usdRates.length >= 2
    ? ((usdRates[usdRates.length - 1].rate - usdRates[0].rate) / usdRates[0].rate) * 100
    : 0;
  const eurChange = eurRates.length >= 2
    ? ((eurRates[eurRates.length - 1].rate - eurRates[0].rate) / eurRates[0].rate) * 100
    : 0;

  const monthlySummary = buildMonthlySummary(usdRates, eurRates);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Taux de change</h1>
          <p className="text-sm text-gray-500 mt-1">USD / XAF et EUR / XAF — Source : fawazahmed0/currency-api</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleSyncToday}
            disabled={syncing}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            style={{ backgroundColor: "#496559" }}
          >
            {syncing ? "⏳ Sync..." : "🔄 Taux du jour"}
          </button>
          <button
            onClick={handleSyncHistory}
            disabled={syncingHistory}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-[#496559] text-[#496559] hover:bg-[#496559]/5 disabled:opacity-50 flex items-center gap-2"
          >
            {syncingHistory ? "⏳ Import..." : "📥 Importer historique (1 an)"}
          </button>
        </div>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${messageType === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message}
        </div>
      )}

      {/* Cards taux actuels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "USD / XAF", latest: latestUSDState, change: usdChange, color: "#496559" },
          { label: "EUR / XAF", latest: latestEURState, change: eurChange, color: "#f39221" },
        ].map(({ label, latest, change, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-500">{label}</span>
              {latest && (
                <span className="text-xs text-gray-400">au {formatDate(String(latest.date))}</span>
              )}
            </div>
            {latest ? (
              <>
                <p className="text-3xl font-bold" style={{ color }}>
                  {formatRate(latest.rate)} <span className="text-lg font-normal text-gray-400">FCFA</span>
                </p>
                <p className={`text-sm mt-1 font-medium ${change >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)}% sur la période
                </p>
              </>
            ) : (
              <p className="text-gray-400 text-sm">Aucune donnée — cliquez sur &quot;Taux du jour&quot;</p>
            )}
          </div>
        ))}
      </div>

      {/* Graphique */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-semibold text-gray-800">Évolution historique (→ FCFA)</h2>
          <div className="flex gap-1">
            {PERIODS.map((p) => (
              <button
                key={p.days}
                onClick={() => handlePeriodChange(p.days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  period === p.days
                    ? "bg-[#496559] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
            Aucune donnée — importez l&apos;historique pour afficher le graphique
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                domain={["auto", "auto"]}
              />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => [`${formatRate(Number(value ?? 0))} FCFA`, `${String(name)}/XAF`]}
                labelFormatter={(label) => `Date : ${formatDate(String(label))}`}
                contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "12px" }}
              />
              <Legend formatter={(v) => `${v} / XAF`} />
              <Line type="monotone" dataKey="USD" stroke="#496559" strokeWidth={2} dot={false} name="USD" />
              <Line type="monotone" dataKey="EUR" stroke="#f39221" strokeWidth={2} dot={false} name="EUR" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Résumé mensuel */}
      {monthlySummary.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Variations par mois</h2>
            <p className="text-xs text-gray-400 mt-0.5">Nombre de changements de taux et valeurs associées par période mensuelle</p>
          </div>

          <div className="divide-y divide-gray-50">
            {monthlySummary.map((month) => {
              const isOpen = expandedMonths.has(month.key);
              const totalChanges = month.usdChanges + month.eurChanges;

              return (
                <div key={month.key}>
                  {/* En-tête mois */}
                  <button
                    onClick={() => toggleMonth(month.key)}
                    className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="text-gray-400">
                      {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </span>
                    <span className="font-semibold text-gray-800 w-36">{month.label}</span>

                    {/* USD résumé */}
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs font-medium text-[#496559] bg-[#496559]/10 px-2 py-0.5 rounded">USD</span>
                      <span className="text-xs text-gray-500">
                        {month.usd.length} relevé{month.usd.length > 1 ? "s" : ""}
                      </span>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${month.usdChanges > 0 ? "bg-orange-50 text-orange-600" : "bg-gray-100 text-gray-400"}`}>
                        {month.usdChanges} variation{month.usdChanges > 1 ? "s" : ""}
                      </span>
                      {month.usdMin !== null && month.usdMax !== null && (
                        <span className="text-xs text-gray-400 hidden sm:inline">
                          {formatRate(month.usdMin)} → {formatRate(month.usdMax)} FCFA
                        </span>
                      )}
                    </div>

                    {/* EUR résumé */}
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs font-medium text-[#f39221] bg-[#f39221]/10 px-2 py-0.5 rounded">EUR</span>
                      <span className="text-xs text-gray-500">
                        {month.eur.length} relevé{month.eur.length > 1 ? "s" : ""}
                      </span>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${month.eurChanges > 0 ? "bg-orange-50 text-orange-600" : "bg-gray-100 text-gray-400"}`}>
                        {month.eurChanges} variation{month.eurChanges > 1 ? "s" : ""}
                      </span>
                      {month.eurMin !== null && month.eurMax !== null && (
                        <span className="text-xs text-gray-400 hidden sm:inline">
                          {formatRate(month.eurMin)} → {formatRate(month.eurMax)} FCFA
                        </span>
                      )}
                    </div>

                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${totalChanges > 0 ? "bg-[#496559] text-white" : "bg-gray-100 text-gray-400"}`}>
                      {totalChanges} chgt{totalChanges > 1 ? "s" : ""}
                    </span>
                  </button>

                  {/* Détail déroulant */}
                  {isOpen && (
                    <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        {/* USD détail */}
                        <div>
                          <p className="text-xs font-semibold text-[#496559] mb-2 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#496559] inline-block" />
                            USD / XAF — {month.usd.length} entrées
                          </p>
                          <div className="space-y-1">
                            {month.usd.length === 0 ? (
                              <p className="text-xs text-gray-400">Aucune donnée</p>
                            ) : (
                              month.usd.slice().reverse().map((entry, i) => (
                                <div key={i} className="flex items-center justify-between py-1 px-2 rounded-lg bg-white border border-gray-100">
                                  <span className="text-xs text-gray-500">{formatDate(entry.date)}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-semibold text-[#496559]">
                                      {formatRate(entry.rate)} FCFA
                                    </span>
                                    {entry.delta !== null && entry.delta !== 0 && (
                                      <span className={`text-xs font-medium ${entry.delta > 0 ? "text-green-500" : "text-red-400"}`}>
                                        {entry.delta > 0 ? "▲" : "▼"} {Math.abs(entry.delta).toFixed(2)}
                                      </span>
                                    )}
                                    {entry.delta === 0 && (
                                      <span className="text-xs text-gray-300">—</span>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* EUR détail */}
                        <div>
                          <p className="text-xs font-semibold text-[#f39221] mb-2 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#f39221] inline-block" />
                            EUR / XAF — {month.eur.length} entrées
                          </p>
                          <div className="space-y-1">
                            {month.eur.length === 0 ? (
                              <p className="text-xs text-gray-400">Aucune donnée</p>
                            ) : (
                              month.eur.slice().reverse().map((entry, i) => (
                                <div key={i} className="flex items-center justify-between py-1 px-2 rounded-lg bg-white border border-gray-100">
                                  <span className="text-xs text-gray-500">{formatDate(entry.date)}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-semibold text-[#f39221]">
                                      {formatRate(entry.rate)} FCFA
                                    </span>
                                    {entry.delta !== null && entry.delta !== 0 && (
                                      <span className={`text-xs font-medium ${entry.delta > 0 ? "text-green-500" : "text-red-400"}`}>
                                        {entry.delta > 0 ? "▲" : "▼"} {Math.abs(entry.delta).toFixed(2)}
                                      </span>
                                    )}
                                    {entry.delta === 0 && (
                                      <span className="text-xs text-gray-300">—</span>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tableau historique complet */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Historique détaillé</h2>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">1 USD → XAF</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">1 EUR → XAF</th>
              </tr>
            </thead>
            <tbody>
              {chartData.slice().reverse().map((row) => {
                const idx = chartData.indexOf(row);
                const usdPrev = chartData[idx - 1]?.USD;
                const eurPrev = chartData[idx - 1]?.EUR;
                return (
                  <tr key={row.date} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-2.5 text-gray-700 font-medium">{formatDate(row.date)}</td>
                    <td className="px-5 py-2.5 text-right">
                      {row.USD ? (
                        <span className="font-mono font-semibold text-[#496559]">
                          {formatRate(row.USD)}
                          {usdPrev && (
                            <span className={`ml-2 text-xs ${row.USD > usdPrev ? "text-green-500" : row.USD < usdPrev ? "text-red-400" : "text-gray-400"}`}>
                              {row.USD > usdPrev ? "▲" : row.USD < usdPrev ? "▼" : "—"}
                            </span>
                          )}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      {row.EUR ? (
                        <span className="font-mono font-semibold text-[#f39221]">
                          {formatRate(row.EUR)}
                          {eurPrev && (
                            <span className={`ml-2 text-xs ${row.EUR > eurPrev ? "text-green-500" : row.EUR < eurPrev ? "text-red-400" : "text-gray-400"}`}>
                              {row.EUR > eurPrev ? "▲" : row.EUR < eurPrev ? "▼" : "—"}
                            </span>
                          )}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
