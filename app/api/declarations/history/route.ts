import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api";
import { requireCompanySession } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  try {
    const session = await requireCompanySession();

    // Get all periods ordered by most recent first
    const periods = await prisma.period.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    const history = await Promise.all(
      periods.map(async (period) => {
        const [importDeclaration, exportDeclaration] = await Promise.all([
          prisma.importDeclaration.findUnique({
            where: {
              companyId_periodId: {
                companyId: session.id,
                periodId: period.id,
              },
            },
            select: {
              id: true,
              status: true,
              submittedAt: true,
              _count: { select: { lines: true } },
            },
          }),
          prisma.exportDeclaration.findUnique({
            where: {
              companyId_periodId: {
                companyId: session.id,
                periodId: period.id,
              },
            },
            select: {
              id: true,
              status: true,
              submittedAt: true,
              _count: { select: { lines: true } },
            },
          }),
        ]);

        return {
          period: {
            id: period.id,
            year: period.year,
            month: period.month,
            label: period.label,
            isActive: period.isActive,
            dueDate: period.dueDate,
          },
          importDeclaration: importDeclaration
            ? {
                id: importDeclaration.id,
                status: importDeclaration.status,
                submittedAt: importDeclaration.submittedAt,
                linesCount: importDeclaration._count.lines,
              }
            : { status: "NOT_STARTED" },
          exportDeclaration: exportDeclaration
            ? {
                id: exportDeclaration.id,
                status: exportDeclaration.status,
                submittedAt: exportDeclaration.submittedAt,
                linesCount: exportDeclaration._count.lines,
              }
            : { status: "NOT_STARTED" },
        };
      })
    );

    return apiSuccess(history);
  } catch (error) {
    return handleApiError(error);
  }
}
