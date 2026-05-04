import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";
import { requireCompanySession } from "@/lib/auth";
import { z } from "zod";
import { FlowType } from "@prisma/client";

const updateSchema = z.object({
  flowType: z.enum(["IMPORT", "EXPORT", "IMPORT_EXPORT"]),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireCompanySession();
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const record = await prisma.companyCountry.findFirst({
      where: { id, companyId: session.id },
    });
    if (!record) return apiError("Pays non trouvé", 404);

    const updated = await prisma.companyCountry.update({
      where: { id },
      data: { flowType: data.flowType as FlowType },
      include: { country: true },
    });
    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireCompanySession();
    const { id } = await params;

    const record = await prisma.companyCountry.findFirst({
      where: { id, companyId: session.id },
    });
    if (!record) return apiError("Pays non trouvé", 404);

    await prisma.companyCountry.update({ where: { id }, data: { isActive: false } });
    return apiSuccess({ message: "Pays retiré" });
  } catch (error) {
    return handleApiError(error);
  }
}
