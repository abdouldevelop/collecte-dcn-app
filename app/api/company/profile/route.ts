import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiNotFound, handleApiError } from "@/lib/api";
import { requireCompanySession } from "@/lib/auth";
import { profileUpdateSchema } from "@/validators";

export async function GET(_request: NextRequest) {
  try {
    const session = await requireCompanySession();

    const company = await prisma.company.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        rccm: true,
        ncc: true,
        phone: true,
        address: true,
        sector: true,
        isActive: true,
        isOnboarded: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!company) return apiNotFound("Entreprise");

    return apiSuccess(company);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireCompanySession();
    const body: unknown = await request.json();
    const input = profileUpdateSchema.parse(body);

    const company = await prisma.company.update({
      where: { id: session.id },
      data: {
        phone: input.phone,
        address: input.address,
        sector: input.sector,
      },
      select: {
        id: true,
        name: true,
        email: true,
        rccm: true,
        ncc: true,
        phone: true,
        address: true,
        sector: true,
        isActive: true,
        isOnboarded: true,
        updatedAt: true,
      },
    });

    return apiSuccess(company);
  } catch (error) {
    return handleApiError(error);
  }
}
