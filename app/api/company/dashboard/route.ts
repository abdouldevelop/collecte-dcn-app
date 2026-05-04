import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api";
import { requireCompanySession } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  try {
    const session = await requireCompanySession();

    // Get active period
    const activePeriod = await prisma.period.findFirst({
      where: { isActive: true },
    });

    // Get focal point
    const focalPoint = await prisma.focalPoint.findFirst({
      where: { companyId: session.id, isActive: true },
    });

    // Get current period declarations
    let importDeclaration = null;
    let exportDeclaration = null;

    if (activePeriod) {
      importDeclaration = await prisma.importDeclaration.findUnique({
        where: {
          companyId_periodId: {
            companyId: session.id,
            periodId: activePeriod.id,
          },
        },
        include: {
          _count: { select: { lines: true } },
        },
      });

      exportDeclaration = await prisma.exportDeclaration.findUnique({
        where: {
          companyId_periodId: {
            companyId: session.id,
            periodId: activePeriod.id,
          },
        },
        include: {
          _count: { select: { lines: true } },
        },
      });
    }

    // Recent history: last 3 periods with status
    const recentPeriods = await prisma.period.findMany({
      where: { isActive: false },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 3,
      select: { id: true, year: true, month: true, label: true },
    });

    const history = await Promise.all(
      recentPeriods.map(async (period) => {
        const [imp, exp] = await Promise.all([
          prisma.importDeclaration.findUnique({
            where: {
              companyId_periodId: {
                companyId: session.id,
                periodId: period.id,
              },
            },
            select: { status: true },
          }),
          prisma.exportDeclaration.findUnique({
            where: {
              companyId_periodId: {
                companyId: session.id,
                periodId: period.id,
              },
            },
            select: { status: true },
          }),
        ]);
        return {
          period,
          importStatus: imp?.status ?? "NOT_STARTED",
          exportStatus: exp?.status ?? "NOT_STARTED",
        };
      })
    );

    // Unread notifications
    const unreadNotifications = await prisma.notification.findMany({
      where: { companyId: session.id, isRead: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Total products count
    const productsCount = await prisma.companyProduct.count({
      where: { companyId: session.id, isActive: true },
    });

    return apiSuccess({
      activePeriod,
      importDeclaration: importDeclaration
        ? {
            id: importDeclaration.id,
            status: importDeclaration.status,
            submittedAt: importDeclaration.submittedAt,
            linesCount: importDeclaration._count.lines,
          }
        : null,
      exportDeclaration: exportDeclaration
        ? {
            id: exportDeclaration.id,
            status: exportDeclaration.status,
            submittedAt: exportDeclaration.submittedAt,
            linesCount: exportDeclaration._count.lines,
          }
        : null,
      focalPointExists: focalPoint !== null,
      recentHistory: history,
      unreadNotifications,
      productsCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
