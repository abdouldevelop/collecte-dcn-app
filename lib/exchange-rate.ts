import { prisma } from "@/lib/prisma";

const CURRENCIES = ["USD", "EUR"];
const TARGET = "XAF";
const API_BASE = "https://api.frankfurter.app";

interface FrankfurterResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

async function fetchRateForDate(currency: string, date: string): Promise<number | null> {
  try {
    const res = await fetch(`${API_BASE}/${date}?from=${currency}&to=${TARGET}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data: FrankfurterResponse = await res.json();
    return data.rates[TARGET] ?? null;
  } catch {
    return null;
  }
}

async function fetchRatesRange(currency: string, from: string, to: string): Promise<Record<string, number>> {
  try {
    const res = await fetch(`${API_BASE}/${from}..${to}?from=${currency}&to=${TARGET}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) return {};
    const data = await res.json() as { rates: Record<string, Record<string, number>> };
    const result: Record<string, number> = {};
    for (const [date, rates] of Object.entries(data.rates)) {
      if (rates[TARGET]) result[date] = rates[TARGET];
    }
    return result;
  } catch {
    return {};
  }
}

export async function syncTodayRates(): Promise<{ synced: number; errors: string[] }> {
  const today = new Date().toISOString().split("T")[0];
  let synced = 0;
  const errors: string[] = [];

  for (const currency of CURRENCIES) {
    const rate = await fetchRateForDate(currency, "latest");
    if (rate === null) {
      errors.push(`Impossible de récupérer le taux ${currency}/${TARGET}`);
      continue;
    }
    await prisma.exchangeRate.upsert({
      where: { currency_date: { currency, date: new Date(today) } },
      create: { currency, rate, date: new Date(today), source: "API" },
      update: { rate, source: "API" },
    });
    synced++;
  }

  return { synced, errors };
}

export async function syncHistoricalRates(days = 365): Promise<{ synced: number; errors: string[] }> {
  const to = new Date().toISOString().split("T")[0];
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  const from = fromDate.toISOString().split("T")[0];

  let synced = 0;
  const errors: string[] = [];

  for (const currency of CURRENCIES) {
    const rates = await fetchRatesRange(currency, from, to);
    if (Object.keys(rates).length === 0) {
      errors.push(`Aucune donnée historique pour ${currency}/${TARGET}`);
      continue;
    }

    for (const [date, rate] of Object.entries(rates)) {
      await prisma.exchangeRate.upsert({
        where: { currency_date: { currency, date: new Date(date) } },
        create: { currency, rate, date: new Date(date), source: "API" },
        update: { rate, source: "API" },
      });
      synced++;
    }
  }

  return { synced, errors };
}

export async function getLatestRates(): Promise<Record<string, number>> {
  const rates = await prisma.exchangeRate.findMany({
    where: { currency: { in: CURRENCIES } },
    orderBy: { date: "desc" },
    distinct: ["currency"],
  });

  const result: Record<string, number> = {};
  for (const r of rates) {
    result[r.currency] = Number(r.rate);
  }
  return result;
}
