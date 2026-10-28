import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiNotFound, handleApiError } from "@/lib/api";
import { requireCompanySession } from "@/lib/auth";

const updateSchema = z.object({
  code: z.string().trim().min(1).max(100),
  designation: z.string().trim().min(1).max(500),
  type: z.enum(["IMPORT", "EXPORT"]),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireCompanySession();
    const { id } = await params;
    const input = updateSchema.parse(await request.json());
    const current = await prisma.companyProduct.findFirst({ where: { id, companyId: session.id, isActive: true } });
    if (!current) return apiNotFound("Produit entreprise");
    const updated = await prisma.companyProduct.update({
      where: { id },
      data: { customCode: input.code, customDesignation: input.designation, customType: input.type },
    });
    return apiSuccess({ id: updated.id, ...input });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireCompanySession();
    const { id } = await params;
    const current = await prisma.companyProduct.findFirst({ where: { id, companyId: session.id, isActive: true } });
    if (!current) return apiNotFound("Produit entreprise");
    await prisma.companyProduct.update({ where: { id }, data: { isActive: false } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
