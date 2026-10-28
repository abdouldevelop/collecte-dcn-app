import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";
import { requireCompanySession } from "@/lib/auth";
import { productSchema } from "@/validators";

export async function GET(_request: NextRequest) {
  try {
    const session = await requireCompanySession();

    // Get all company products (admin + company-added) via CompanyProduct join
    const companyProducts = await prisma.companyProduct.findMany({
      where: { companyId: session.id, isActive: true },
      include: {
        product: {
          select: {
            id: true,
            code: true,
            designation: true,
            type: true,
            source: true,
            isActive: true,
          },
        },
      },
      orderBy: [
        { product: { source: "asc" } },
        { product: { code: "asc" } },
      ],
    });

    const result = companyProducts.map((cp) => ({
      companyProductId: cp.id,
      productId: cp.product.id,
      code: cp.customCode ?? cp.product.code,
      designation: cp.customDesignation ?? cp.product.designation,
      type: cp.customType ?? cp.product.type,
      source: cp.product.source,
      observation: cp.observation,
      isActive: cp.isActive,
    }));

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireCompanySession();
    const body: unknown = await request.json();
    const input = productSchema.parse(body);

    // Check if product code already exists
    const existing = await prisma.product.findUnique({
      where: { code: input.code },
    });

    if (existing) {
      const companyProduct = await prisma.companyProduct.upsert({
        where: { companyId_productId: { companyId: session.id, productId: existing.id } },
        update: { isActive: true },
        create: { companyId: session.id, productId: existing.id },
      });
      return apiSuccess({
        companyProductId: companyProduct.id,
        productId: existing.id,
        code: existing.code,
        designation: existing.designation,
        type: existing.type,
        source: existing.source,
        observation: companyProduct.observation,
      }, 201);
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          code: input.code,
          designation: input.designation,
          type: input.type,
          source: "COMPANY",
        },
      });

      const companyProduct = await tx.companyProduct.create({
        data: {
          companyId: session.id,
          productId: product.id,
        },
      });

      return {
        companyProductId: companyProduct.id,
        productId: product.id,
        code: product.code,
        designation: product.designation,
        type: product.type,
        source: product.source,
        observation: companyProduct.observation,
      };
    });

    return apiSuccess(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
