import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiNotFound, handleApiError } from "@/lib/api";
import { requireAdminSession, logAudit } from "@/lib/auth";

const updateCompanySchema = z.object({
  isActive: z.boolean(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        focalPoint: true,
        companyProducts: {
          where: { isActive: true },
          include: {
            product: {
              select: {
                id: true,
                code: true,
                designation: true,
                type: true,
                source: true,
              },
            },
          },
        },
        importDeclarations: {
          orderBy: { createdAt: "desc" },
          include: {
            period: true,
            _count: { select: { lines: true } },
          },
        },
        exportDeclarations: {
          orderBy: { createdAt: "desc" },
          include: {
            period: true,
            _count: { select: { lines: true } },
          },
        },
        invitation: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            expiresAt: true,
            usedAt: true,
          },
        },
        supportTickets: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!company) return apiNotFound("Entreprise");

    // Remove passwordHash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...companyData } = company;

    return apiSuccess(companyData);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    const { id } = await params;
    const body: unknown = await request.json();
    const input = updateCompanySchema.parse(body);

    const existing = await prisma.company.findUnique({ where: { id } });
    if (!existing) return apiNotFound("Entreprise");

    const updated = await prisma.company.update({
      where: { id },
      data: { isActive: input.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        isOnboarded: true,
        updatedAt: true,
      },
    });

    await logAudit({
      action: input.isActive ? "COMPANY_ACTIVATED" : "COMPANY_DEACTIVATED",
      entity: "Company",
      entityId: id,
      adminId: session.id,
      details: { isActive: input.isActive },
    });

    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
