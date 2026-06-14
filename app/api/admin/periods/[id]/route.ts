import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError, getClientIp } from "@/lib/api";
import { requireAdminSession, logAudit } from "@/lib/auth";
import { periodUpdateSchema } from "@/validators";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    if (session.role !== "SUPER_ADMIN") {
      return apiError("Action réservée au Super Admin", 403);
    }

    const { id } = await context.params;
    const body: unknown = await request.json();
    const input = periodUpdateSchema.parse(body);

    try {
      const period = await prisma.$transaction(async (tx) => {
        // Activating this period? Deactivate all others first.
        if (input.isActive === true) {
          await tx.period.updateMany({
            where: { isActive: true, NOT: { id } },
            data: { isActive: false },
          });
        }
        return tx.period.update({
          where: { id },
          data: {
            ...(input.label !== undefined ? { label: input.label } : {}),
            ...(input.dueDate !== undefined
              ? { dueDate: input.dueDate === null ? null : new Date(input.dueDate) }
              : {}),
            ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
          },
        });
      });

      await logAudit({
        action: "PERIOD_UPDATE",
        entity: "Period",
        entityId: period.id,
        adminId: session.id,
        ipAddress: getClientIp(request),
      });

      return apiSuccess(period);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        return apiError("Période introuvable", 404);
      }
      throw e;
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    if (session.role !== "SUPER_ADMIN") {
      return apiError("Action réservée au Super Admin", 403);
    }

    const { id } = await context.params;

    // Refuse deletion if declarations exist for this period
    const counts = await prisma.period.findUnique({
      where: { id },
      select: {
        _count: { select: { importDeclarations: true, exportDeclarations: true } },
      },
    });
    if (!counts) return apiError("Période introuvable", 404);
    if (counts._count.importDeclarations + counts._count.exportDeclarations > 0) {
      return apiError(
        "Impossible de supprimer une période avec des déclarations existantes",
        400
      );
    }

    await prisma.period.delete({ where: { id } });
    await logAudit({
      action: "PERIOD_DELETE",
      entity: "Period",
      entityId: id,
      adminId: session.id,
      ipAddress: getClientIp(request),
    });

    return apiSuccess({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
