import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    const [usd, eur] = await Promise.all([
      prisma.exchangeRate.findFirst({ where: { currency: "USD" }, orderBy: { date: "desc" } }),
      prisma.exchangeRate.findFirst({ where: { currency: "EUR" }, orderBy: { date: "desc" } }),
    ]);

    return apiSuccess({
      USD: usd ? { rate: Number(usd.rate), date: usd.date } : null,
      EUR: eur ? { rate: Number(eur.rate), date: eur.date } : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
