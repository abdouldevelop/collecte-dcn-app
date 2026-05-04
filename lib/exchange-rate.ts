import { prisma } from "@/lib/prisma";

const CURRENCIES = ["USD", "EUR"];
const TARGET = "xaf";

// fawazahmed0/currency-api — free, no API key, supports XAF, daily historical
// Primary CDN: jsdelivr, fallback: raw github
function apiUrl(date: string, currency: string) {
  const tag = date === "latest" ? "latest" : `@${date}`;
  return `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api${tag}/v1/currencies/${currency.toLowerCase()}.json`;
}

async function fetchRate(currency: string, date: string): Promise<{ rate: number; date: string } | null> {
  try {
    const res = await fetch(apiUrl(date, currency), { next: { revalidate: 0 } });
    if (!res.ok) return null;
    const data = await res.json() as Record<string, unknown>;
    const rates = data[currency.toLowerCase()] as Record<string, number> | undefined;
    const rate = rates?.[TARGET];
    if (!rate) return null;
    return { rate, date: data.date as string ?? date };
  } catch {
    return null;
  }
}

export async function syncTodayRates(): Promise<{ synced: number; errors: string[] }> {
  let synced = 0;
  const errors: string[] = [];

  for (const currency of CURRENCIES) {
    const result = await fetchRate(currency, "latest");
    if (!result) {
      errors.push(`Impossible de récupérer le taux ${currency}/XAF`);
      continue;
    }
    const dateObj = new Date(result.date);
    await prisma.exchangeRate.upsert({
      where: { currency_date: { currency, date: dateObj } },
      create: { currency, rate: result.rate, date: dateObj, source: "fawazahmed0" },
      update: { rate: result.rate, source: "fawazahmed0" },
    });
    synced++;
  }

  return { synced, errors };
}

export async function syncHistoricalRates(days = 365): Promise<{ synced: number; errors: string[] }> {
  let synced = 0;
  const errors: string[] = [];

  // Build list of dates to fetch (skip weekends)
  const today = new Date();
  const datesToFetch: string[] = [];
  for (let i = 0; i <= days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    datesToFetch.push(d.toISOString().split("T")[0]);
  }

  // Check which (currency, date) pairs already exist
  const fromDate = new Date(datesToFetch[datesToFetch.length - 1]);
  const existing = await prisma.exchangeRate.findMany({
    where: { currency: { in: CURRENCIES }, date: { gte: fromDate } },
    select: { currency: true, date: true },
  });
  const existingSet = new Set(existing.map((r) => `${r.currency}_${r.date.toISOString().split("T")[0]}`));

  for (const currency of CURRENCIES) {
    const missing = datesToFetch.filter((d) => !existingSet.has(`${currency}_${d}`));

    if (missing.length === 0) continue;

    let syncedForCurrency = 0;
    for (const date of missing) {
      const result = await fetchRate(currency, date);
      if (!result) continue;
      const dateObj = new Date(date);
      await prisma.exchangeRate.upsert({
        where: { currency_date: { currency, date: dateObj } },
        create: { currency, rate: result.rate, date: dateObj, source: "fawazahmed0" },
        update: { rate: result.rate, source: "fawazahmed0" },
      });
      synced++;
      syncedForCurrency++;
    }

    if (syncedForCurrency === 0) {
      errors.push(`Aucune donnée historique importée pour ${currency}/XAF`);
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
