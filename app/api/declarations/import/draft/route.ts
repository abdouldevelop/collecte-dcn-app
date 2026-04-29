import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";
import { requireCompanySession } from "@/lib/auth";
import { declarationLineSchema } from "@/validators";

const draftSchema = z.object({
  lines: z.array(declarationLineSchema),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireCompanySession();
    const body: unknown = await request.json();
    const { lines } = draftSchema.parse(body);

    // Find active period
    const activePeriod = await prisma.period.findFirst({
      where: { isActive: true },
    });

    if (!activePeriod) {
      return apiError("Aucune période active.", 404);
    }

    // Find or create declaration
    let declaration = await prisma.importDeclaration.findUnique({
      where: {
        companyId_periodId: {
          companyId: session.id,
          periodId: activePeriod.id,
        },
      },
    });

    if (!declaration) {
      declaration = await prisma.importDeclaration.create({
        data: {
          companyId: session.id,
          periodId: activePeriod.id,
          status: "DRAFT",
        },
      });
    } else if (declaration.status === "SUBMITTED") {
      return apiError("Cette déclaration a déjà été soumise et ne peut pas être modifiée.", 400);
    } else {
      declaration = await prisma.importDeclaration.update({
        where: { id: declaration.id },
        data: { status: "DRAFT" },
      });
    }

    // Upsert each line
    const upsertedLines = await Promise.all(
      lines.map(async (line) => {
        // Verify companyProduct belongs to this company
        const companyProduct = await prisma.companyProduct.findFirst({
          where: { id: line.companyProductId, companyId: session.id },
        });
        if (!companyProduct) return null;

        return prisma.importDeclarationLine.upsert({
          where: {
            declarationId_companyProductId: {
              declarationId: declaration.id,
              companyProductId: line.companyProductId,
            },
          },
          create: {
            declarationId: declaration.id,
            companyProductId: line.companyProductId,
            priceMin: line.priceMin,
            priceMax: line.priceMax,
            quantity: line.quantity,
            unitId: line.unitId,
          },
          update: {
            priceMin: line.priceMin,
            priceMax: line.priceMax,
            quantity: line.quantity,
            unitId: line.unitId,
          },
        });
      })
    );

    const savedLines = upsertedLines.filter(Boolean);

    return apiSuccess({
      declarationId: declaration.id,
      status: declaration.status,
      savedLines: savedLines.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
