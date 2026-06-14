import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError, getClientIp } from "@/lib/api";
import {
  requireAdminSession,
  signAdminToken,
  setAdminCookie,
  logAudit,
} from "@/lib/auth";
import { adminProfileSchema } from "@/validators";

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const body: unknown = await request.json();
    const input = adminProfileSchema.parse(body);

    const data: Prisma.AdminUpdateInput = {};

    if (input.firstName !== undefined) data.firstName = input.firstName;
    if (input.lastName !== undefined) data.lastName = input.lastName;
    if (input.email !== undefined) data.email = input.email;

    if (input.newPassword) {
      // Verify current password
      const current = await prisma.admin.findUnique({
        where: { id: session.id },
        select: { passwordHash: true },
      });
      if (!current) return apiError("Compte introuvable", 404);
      const ok = await bcrypt.compare(input.currentPassword ?? "", current.passwordHash);
      if (!ok) return apiError("Mot de passe actuel incorrect", 400);
      data.passwordHash = await bcrypt.hash(input.newPassword, 12);
    }

    try {
      const updated = await prisma.admin.update({
        where: { id: session.id },
        data,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      // Refresh session cookie if identity changed
      if (input.firstName || input.lastName || input.email) {
        const token = await signAdminToken({
          id: updated.id,
          email: updated.email,
          firstName: updated.firstName,
          lastName: updated.lastName,
          role: updated.role as "ADMIN" | "SUPER_ADMIN",
        });
        await setAdminCookie(token);
      }

      await logAudit({
        action: "ADMIN_PROFILE_UPDATE",
        entity: "Admin",
        entityId: updated.id,
        adminId: session.id,
        ipAddress: getClientIp(request),
      });

      return apiSuccess(updated);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return apiError("Email déjà utilisé par un autre compte", 409);
      }
      throw e;
    }
  } catch (error) {
    return handleApiError(error);
  }
}
