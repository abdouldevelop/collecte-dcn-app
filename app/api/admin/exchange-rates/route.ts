import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";
import { syncTodayRates, syncHistoricalRates } from "@/lib/exchange-rate";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(request.url);
    const currency = searchParams.get("currency") ?? "USD";
    const days = Math.min(Number(searchParams.get("days") ?? 90), 365);

    const from = new Date();
    from.setDate(from.getDate() - days);

    const rates = await prisma.exchangeRate.findMany({
      where: { currency, date: { gte: from } },
      orderBy: { date: "asc" },
      select: { id: true, currency: true, rate: true, date: true, source: true },
    });

    const latest = await prisma.exchangeRate.findFirst({
      where: { currency },
      orderBy: { date: "desc" },
    });

    return apiSuccess({
      rates: rates.map((r) => ({ ...r, rate: Number(r.rate) })),
      latest: latest ? { ...latest, rate: Number(latest.rate) } : null,
      currency,
      days,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();

    const body = await request.json().catch(() => ({})) as { historical?: boolean; days?: number };
    const historical = body.historical === true;
    const days = body.days ?? 365;

    let result;
    if (historical) {
      result = await syncHistoricalRates(days);
    } else {
      result = await syncTodayRates();
    }

    if (result.synced === 0 && result.errors.length > 0) {
      return apiError(result.errors.join(", "), 502);
    }

    return apiSuccess({ ...result, historical });
  } catch (error) {
    return handleApiError(error);
  }
}
