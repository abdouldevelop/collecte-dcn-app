import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, code: true, name: true },
    });
    return apiSuccess(countries);
  } catch (error) {
    return handleApiError(error);
  }
}
