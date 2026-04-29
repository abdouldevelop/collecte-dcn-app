import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";
import { DeclarationStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
    const statusParam = searchParams.get("status") ?? "";
    const periodId = searchParams.get("periodId") ?? "";
    const companyId = searchParams.get("companyId") ?? "";
    const type = searchParams.get("type") ?? ""; // "import" | "export" | ""

    const skip = (page - 1) * limit;

    const declarationWhere = {
      ...(statusParam ? { status: statusParam as DeclarationStatus } : {}),
      ...(periodId ? { periodId } : {}),
      ...(companyId ? { companyId } : {}),
    };

    if (type === "export") {
      const [declarations, total] = await Promise.all([
        prisma.exportDeclaration.findMany({
          where: declarationWhere,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            company: { select: { id: true, name: true, email: true } },
            period: true,
            _count: { select: { lines: true } },
          },
        }),
        prisma.exportDeclaration.count({ where: declarationWhere }),
      ]);

      return apiSuccess({
        declarations: declarations.map((d) => ({ ...d, type: "EXPORT" })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    if (type === "import") {
      const [declarations, total] = await Promise.all([
        prisma.importDeclaration.findMany({
          where: declarationWhere,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            company: { select: { id: true, name: true, email: true } },
            period: true,
            _count: { select: { lines: true } },
          },
        }),
        prisma.importDeclaration.count({ where: declarationWhere }),
      ]);

      return apiSuccess({
        declarations: declarations.map((d) => ({ ...d, type: "IMPORT" })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    // Both types combined (paginate separately then merge)
    const halfLimit = Math.floor(limit / 2);
    const halfSkip = Math.floor(skip / 2);

    const [importDeclarations, exportDeclarations, importTotal, exportTotal] =
      await Promise.all([
        prisma.importDeclaration.findMany({
          where: declarationWhere,
          skip: halfSkip,
          take: halfLimit,
          orderBy: { createdAt: "desc" },
          include: {
            company: { select: { id: true, name: true, email: true } },
            period: true,
            _count: { select: { lines: true } },
          },
        }),
        prisma.exportDeclaration.findMany({
          where: declarationWhere,
          skip: halfSkip,
          take: halfLimit,
          orderBy: { createdAt: "desc" },
          include: {
            company: { select: { id: true, name: true, email: true } },
            period: true,
            _count: { select: { lines: true } },
          },
        }),
        prisma.importDeclaration.count({ where: declarationWhere }),
        prisma.exportDeclaration.count({ where: declarationWhere }),
      ]);

    const declarations = [
      ...importDeclarations.map((d) => ({ ...d, type: "IMPORT" })),
      ...exportDeclarations.map((d) => ({ ...d, type: "EXPORT" })),
    ].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return apiSuccess({
      declarations,
      pagination: {
        page,
        limit,
        total: importTotal + exportTotal,
        totalPages: Math.ceil((importTotal + exportTotal) / limit),
        importTotal,
        exportTotal,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
