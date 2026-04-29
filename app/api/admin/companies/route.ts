import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
    const search = searchParams.get("search") ?? "";
    const isActive = searchParams.get("isActive");

    const skip = (page - 1) * limit;

    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
              { rccm: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(isActive !== null && isActive !== ""
        ? { isActive: isActive === "true" }
        : {}),
    };

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          rccm: true,
          ncc: true,
          sector: true,
          isActive: true,
          isOnboarded: true,
          createdAt: true,
          focalPoint: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          _count: {
            select: {
              importDeclarations: true,
              exportDeclarations: true,
            },
          },
        },
      }),
      prisma.company.count({ where }),
    ]);

    return apiSuccess({
      companies,
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
