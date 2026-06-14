import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";
import { requireCompanySession } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  try {
    const session = await requireCompanySession();

    const activePeriod = await prisma.period.findFirst({ where: { isActive: true } });
    if (!activePeriod) return apiError("Aucune période active. Veuillez contacter l'administration.", 404);

    let declaration = await prisma.exportDeclaration.findUnique({
      where: { companyId_periodId: { companyId: session.id, periodId: activePeriod.id } },
      include: {
        lines: {
          include: {
            companyProduct: { include: { product: { select: { id: true, code: true, designation: true, type: true, source: true } } } },
            unit: true,
            country: { select: { id: true, code: true, name: true } },
          },
        },
      },
    });

    if (!declaration) {
      declaration = await prisma.exportDeclaration.create({
        data: { companyId: session.id, periodId: activePeriod.id, status: "NOT_STARTED" },
        include: {
          lines: {
            include: {
              companyProduct: { include: { product: { select: { id: true, code: true, designation: true, type: true, source: true } } } },
              unit: true,
              country: { select: { id: true, code: true, name: true } },
            },
          },
        },
      });
    }

    const companyProducts = await prisma.companyProduct.findMany({
      where: { companyId: session.id, isActive: true, product: { isActive: true, type: "EXPORT" } },
      include: { product: { select: { id: true, code: true, designation: true, type: true, source: true } } },
      orderBy: { product: { code: "asc" } },
    });

    const units = await prisma.unit.findMany({ where: { isActive: true }, orderBy: { code: "asc" } });

    const countries = await prisma.companyCountry.findMany({
      where: { companyId: session.id, isActive: true, flowType: "EXPORT" },
      include: { country: { select: { id: true, code: true, name: true } } },
      orderBy: { country: { name: "asc" } },
    });

    const linesMap = new Map(declaration.lines.map((l) => [l.companyProductId, l]));

    const linesWithProducts = companyProducts.map((cp) => {
      const existingLine = linesMap.get(cp.id);
      return {
        companyProductId: cp.id,
        product: cp.product,
        observation: cp.observation,
        line: existingLine
          ? {
              id: existingLine.id,
              priceMin: existingLine.priceMin,
              priceMax: existingLine.priceMax,
              quantity: existingLine.quantity,
              unitId: existingLine.unitId,
              unit: existingLine.unit,
              countryId: existingLine.countryId,
              country: existingLine.country,
            }
          : null,
      };
    });

    return apiSuccess({
      declaration: {
        id: declaration.id,
        status: declaration.status,
        submittedAt: declaration.submittedAt,
        period: activePeriod,
      },
      lines: linesWithProducts,
      units,
      countries: countries.map((cc) => cc.country),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
