import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError, getClientIp } from "@/lib/api";
import { requireAdminSession, logAudit } from "@/lib/auth";
import { adminUpdateSchema } from "@/validators";

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
    const input = adminUpdateSchema.parse(body);

    const data: Prisma.AdminUpdateInput = {
      ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
      ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.password ? { passwordHash: await bcrypt.hash(input.password, 12) } : {}),
    };

    try {
      const admin = await prisma.admin.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await logAudit({
        action: "ADMIN_UPDATE",
        entity: "Admin",
        entityId: admin.id,
        adminId: session.id,
        ipAddress: getClientIp(request),
      });

      return apiSuccess(admin);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") return apiError("Email déjà utilisé", 409);
        if (e.code === "P2025") return apiError("Admin introuvable", 404);
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
    if (id === session.id) {
      return apiError("Vous ne pouvez pas supprimer votre propre compte", 400);
    }

    try {
      await prisma.admin.delete({ where: { id } });
      await logAudit({
        action: "ADMIN_DELETE",
        entity: "Admin",
        entityId: id,
        adminId: session.id,
        ipAddress: getClientIp(request),
      });
      return apiSuccess({ id });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        return apiError("Admin introuvable", 404);
      }
      throw e;
    }
  } catch (error) {
    return handleApiError(error);
  }
}
