import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiNotFound, apiError, handleApiError } from "@/lib/api";
import { requireCompanySession } from "@/lib/auth";

const observationSchema = z.object({
  observation: z.string().max(1000, "Observation trop longue").nullable(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireCompanySession();
    const { id } = await params;
    const body: unknown = await request.json();
    const { observation } = observationSchema.parse(body);

    // Find the CompanyProduct, ensuring it belongs to this company
    const companyProduct = await prisma.companyProduct.findFirst({
      where: { id, companyId: session.id },
      include: { product: true },
    });

    if (!companyProduct) {
      return apiNotFound("Produit entreprise");
    }

    // For ADMIN products: only observation is editable
    // For COMPANY products: observation acts as description update
    if (companyProduct.product.source !== "ADMIN" && companyProduct.product.source !== "COMPANY") {
      return apiError("Opération non autorisée", 403);
    }

    const updated = await prisma.companyProduct.update({
      where: { id },
      data: { observation },
      include: {
        product: {
          select: {
            code: true,
            designation: true,
            type: true,
            source: true,
          },
        },
      },
    });

    return apiSuccess({
      companyProductId: updated.id,
      observation: updated.observation,
      product: updated.product,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
