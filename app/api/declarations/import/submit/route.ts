import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError, getClientIp } from "@/lib/api";
import { requireCompanySession, logAudit } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await requireCompanySession();

    // Find active period
    const activePeriod = await prisma.period.findFirst({
      where: { isActive: true },
    });

    if (!activePeriod) {
      return apiError("Aucune période active.", 404);
    }

    // Find declaration
    const declaration = await prisma.importDeclaration.findUnique({
      where: {
        companyId_periodId: {
          companyId: session.id,
          periodId: activePeriod.id,
        },
      },
      include: {
        lines: { include: { unit: true } },
      },
    });

    if (!declaration) {
      return apiError("Déclaration introuvable. Veuillez d'abord enregistrer un brouillon.", 404);
    }

    if (declaration.status === "SUBMITTED") {
      return apiError("Cette déclaration a déjà été soumise.", 400);
    }

    // Validate all lines
    const invalidLines: string[] = [];
    for (const line of declaration.lines) {
      if (
        line.priceMin !== null &&
        line.priceMax !== null &&
        Number(line.priceMin) > Number(line.priceMax)
      ) {
        invalidLines.push(`Ligne ${line.id}: prix min > prix max`);
      }
      if (
        line.quantity !== null &&
        Number(line.quantity) > 0 &&
        !line.unitId
      ) {
        invalidLines.push(`Ligne ${line.id}: unité obligatoire si quantité > 0`);
      }
    }

    if (invalidLines.length > 0) {
      return apiError(`Validation échouée: ${invalidLines.join("; ")}`, 422);
    }

    // Submit declaration
    const submitted = await prisma.importDeclaration.update({
      where: { id: declaration.id },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });

    await logAudit({
      action: "IMPORT_DECLARATION_SUBMITTED",
      entity: "ImportDeclaration",
      entityId: declaration.id,
      companyId: session.id,
      details: {
        periodId: activePeriod.id,
        periodLabel: activePeriod.label,
        linesCount: declaration.lines.length,
      },
      ipAddress: getClientIp(request),
    });

    return apiSuccess({
      declarationId: submitted.id,
      status: submitted.status,
      submittedAt: submitted.submittedAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
