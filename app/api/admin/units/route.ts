import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  try {
    await requireAdminSession();

    const units = await prisma.unit.findMany({
      orderBy: { code: "asc" },
    });

    return apiSuccess(units);
  } catch (error) {
    return handleApiError(error);
  }
}
