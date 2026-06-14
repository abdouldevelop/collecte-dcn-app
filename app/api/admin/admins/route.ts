import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError, getClientIp } from "@/lib/api";
import { requireAdminSession, logAudit } from "@/lib/auth";
import { adminCreateSchema } from "@/validators";

export async function GET() {
  try {
    await requireAdminSession();

    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: "desc" },
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

    return apiSuccess(admins);
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
    const input = adminCreateSchema.parse(body);

    const passwordHash = await bcrypt.hash(input.password, 12);

    try {
      const admin = await prisma.admin.create({
        data: {
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          role: input.role,
          passwordHash,
        },
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
        action: "ADMIN_CREATE",
        entity: "Admin",
        entityId: admin.id,
        adminId: session.id,
        ipAddress: getClientIp(request),
      });

      return apiSuccess(admin, 201);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return apiError("Un admin avec cet email existe déjà", 409);
      }
      throw e;
    }
  } catch (error) {
    return handleApiError(error);
  }
}
