import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";
import { requireCompanySession } from "@/lib/auth";
import { z } from "zod";
import { FlowType } from "@prisma/client";

const addCountrySchema = z.object({
  countryId: z.string().min(1),
  flowType: z.enum(["IMPORT", "EXPORT", "IMPORT_EXPORT"]).default("IMPORT_EXPORT"),
});

export async function GET() {
  try {
    const session = await requireCompanySession();
    const companyCountries = await prisma.companyCountry.findMany({
      where: { companyId: session.id, isActive: true },
      include: { country: true },
      orderBy: { country: { name: "asc" } },
    });
    return apiSuccess(companyCountries);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireCompanySession();
    const body = await request.json();
    const data = addCountrySchema.parse(body);

    const existing = await prisma.companyCountry.findUnique({
      where: { companyId_countryId: { companyId: session.id, countryId: data.countryId } },
    });
    if (existing) {
      if (!existing.isActive) {
        const updated = await prisma.companyCountry.update({
          where: { id: existing.id },
          data: { isActive: true, flowType: data.flowType as FlowType },
          include: { country: true },
        });
        return apiSuccess(updated);
      }
      return apiError("Ce pays est déjà dans votre liste", 409);
    }

    const companyCountry = await prisma.companyCountry.create({
      data: { companyId: session.id, countryId: data.countryId, flowType: data.flowType as FlowType },
      include: { country: true },
    });
    return apiSuccess(companyCountry, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
