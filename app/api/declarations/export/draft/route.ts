import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";
import { requireCompanySession } from "@/lib/auth";

const lineSchema = z.object({
  companyProductId: z.string(),
  priceMin: z.number().nullable().optional(),
  priceMax: z.number().nullable().optional(),
  quantity: z.number().nullable().optional(),
  unitId: z.string().nullable().optional(),
  countryId: z.string().nullable().optional(),
});

const draftSchema = z.object({
  lines: z.array(lineSchema),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireCompanySession();
    const body: unknown = await request.json();
    const { lines } = draftSchema.parse(body);

    const activePeriod = await prisma.period.findFirst({ where: { isActive: true } });
    if (!activePeriod) return apiError("Aucune période active.", 404);

    let declaration = await prisma.exportDeclaration.findUnique({
      where: { companyId_periodId: { companyId: session.id, periodId: activePeriod.id } },
    });

    if (!declaration) {
      declaration = await prisma.exportDeclaration.create({
        data: { companyId: session.id, periodId: activePeriod.id, status: "DRAFT" },
      });
    } else if (declaration.status === "SUBMITTED") {
      return apiError("Cette déclaration a déjà été soumise et ne peut pas être modifiée.", 400);
    } else {
      declaration = await prisma.exportDeclaration.update({
        where: { id: declaration.id },
        data: { status: "DRAFT" },
      });
    }

    const upsertedLines = await Promise.all(
      lines.map(async (line) => {
        const companyProduct = await prisma.companyProduct.findFirst({
          where: { id: line.companyProductId, companyId: session.id },
        });
        if (!companyProduct) return null;

        return prisma.exportDeclarationLine.upsert({
          where: { declarationId_companyProductId: { declarationId: declaration.id, companyProductId: line.companyProductId } },
          create: {
            declarationId: declaration.id,
            companyProductId: line.companyProductId,
            priceMin: line.priceMin,
            priceMax: line.priceMax,
            quantity: line.quantity,
            unitId: line.unitId ?? null,
            countryId: line.countryId ?? null,
          },
          update: {
            priceMin: line.priceMin,
            priceMax: line.priceMax,
            quantity: line.quantity,
            unitId: line.unitId ?? null,
            countryId: line.countryId ?? null,
          },
        });
      })
    );

    return apiSuccess({
      declarationId: declaration.id,
      status: declaration.status,
      savedLines: upsertedLines.filter(Boolean).length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
