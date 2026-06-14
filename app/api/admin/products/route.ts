import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api";
import { requireAdminSession, logAudit } from "@/lib/auth";
import { productSchema } from "@/validators";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
    const search = searchParams.get("search") ?? "";
    const source = searchParams.get("source") ?? "";
    const type = searchParams.get("type") ?? "";

    const skip = (page - 1) * limit;

    const where = {
      ...(search
        ? {
            OR: [
              { code: { contains: search, mode: "insensitive" as const } },
              { designation: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(source ? { source: source as "ADMIN" | "COMPANY" } : {}),
      ...(type ? { type: type as "IMPORT" | "EXPORT" } : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ source: "asc" }, { code: "asc" }],
        include: {
          _count: { select: { companyProducts: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return apiSuccess({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const body: unknown = await request.json();
    const input = productSchema.parse(body);

    // Check if product code already exists
    const existing = await prisma.product.findUnique({
      where: { code: input.code },
    });
    if (existing) {
      return apiError("Un produit avec ce code existe déjà.", 400);
    }

    const product = await prisma.product.create({
      data: {
        code: input.code,
        designation: input.designation,
        type: input.type,
        source: "ADMIN",
        isActive: true,
      },
    });

    await logAudit({
      action: "ADMIN_PRODUCT_CREATED",
      entity: "Product",
      entityId: product.id,
      adminId: session.id,
      details: { code: product.code, designation: product.designation },
    });

    return apiSuccess(product, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
