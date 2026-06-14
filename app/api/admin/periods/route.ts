import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError, getClientIp } from "@/lib/api";
import { requireAdminSession, logAudit } from "@/lib/auth";
import { periodCreateSchema } from "@/validators";

const MONTH_LABELS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export async function GET() {
  try {
    await requireAdminSession();

    const periods = await prisma.period.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }],
      include: {
        _count: {
          select: { importDeclarations: true, exportDeclarations: true },
        },
      },
    });

    return apiSuccess(periods);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (session.role !== "SUPER_ADMIN") {
      return apiError("Action réservée au Super Admin", 403);
    }

    const body: unknown = await request.json();
    const input = periodCreateSchema.parse(body);

    const label = input.label ?? `${MONTH_LABELS_FR[input.month - 1]} ${input.year}`;

    try {
      const period = await prisma.$transaction(async (tx) => {
        // If creating an active period, deactivate any other active one
        if (input.isActive) {
          await tx.period.updateMany({
            where: { isActive: true },
            data: { isActive: false },
          });
        }
        return tx.period.create({
          data: {
            year: input.year,
            month: input.month,
            label,
            isActive: input.isActive ?? false,
            dueDate: input.dueDate ? new Date(input.dueDate) : null,
          },
        });
      });

      await logAudit({
        action: "PERIOD_CREATE",
        entity: "Period",
        entityId: period.id,
        adminId: session.id,
        ipAddress: getClientIp(request),
      });

      return apiSuccess(period, 201);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return apiError("Une période existe déjà pour ce mois", 409);
      }
      throw e;
    }
  } catch (error) {
    return handleApiError(error);
  }
}
