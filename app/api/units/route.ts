import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api";

export async function GET(_request: NextRequest) {
  try {
    const units = await prisma.unit.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
      select: {
        id: true,
        code: true,
        label: true,
        isActive: true,
      },
    });

    return apiSuccess(units);
  } catch (error) {
    return handleApiError(error);
  }
}
