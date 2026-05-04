import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExchangeRatesClient from "./ExchangeRatesClient";

async function getRates(currency: string, days: number) {
  const from = new Date();
  from.setDate(from.getDate() - days);

  const [rates, latest] = await Promise.all([
    prisma.exchangeRate.findMany({
      where: { currency, date: { gte: from } },
      orderBy: { date: "asc" },
      select: { id: true, currency: true, rate: true, date: true, source: true },
    }),
    prisma.exchangeRate.findFirst({
      where: { currency },
      orderBy: { date: "desc" },
    }),
  ]);

  return {
    rates: rates.map((r) => ({ ...r, rate: Number(r.rate), date: r.date.toISOString() })),
    latest: latest ? { currency: latest.currency, rate: Number(latest.rate), date: latest.date.toISOString() } : null,
  };
}

export default async function ExchangeRatesPage() {
  await requireAdminSession();

  const [usd, eur] = await Promise.all([getRates("USD", 90), getRates("EUR", 90)]);

  return (
    <ExchangeRatesClient
      initialUSD={usd.rates}
      initialEUR={eur.rates}
      latestUSD={usd.latest}
      latestEUR={eur.latest}
    />
  );
}
