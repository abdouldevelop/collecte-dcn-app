import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  try {
    await requireAdminSession();

    // Get active period
    const activePeriod = await prisma.period.findFirst({
      where: { isActive: true },
    });

    // KPI counts
    const [
      totalCompanies,
      activeCompanies,
      pendingInvitations,
      submittedImport,
      submittedExport,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { isActive: true } }),
      prisma.companyInvitation.count({ where: { status: "PENDING" } }),
      activePeriod
        ? prisma.importDeclaration.count({
            where: { periodId: activePeriod.id, status: "SUBMITTED" },
          })
        : 0,
      activePeriod
        ? prisma.exportDeclaration.count({
            where: { periodId: activePeriod.id, status: "SUBMITTED" },
          })
        : 0,
    ]);

    const submittedDeclarations = submittedImport + submittedExport;

    // Late companies: active period past due date + company has not submitted either declaration
    let lateCompanies = 0;
    if (
      activePeriod &&
      activePeriod.dueDate &&
      activePeriod.dueDate < new Date()
    ) {
      const allActiveCompanies = await prisma.company.findMany({
        where: { isActive: true, isOnboarded: true },
        select: { id: true },
      });

      const lateCount = await Promise.all(
        allActiveCompanies.map(async (company) => {
          const [imp, exp] = await Promise.all([
            prisma.importDeclaration.findUnique({
              where: {
                companyId_periodId: {
                  companyId: company.id,
                  periodId: activePeriod.id,
                },
              },
              select: { status: true },
            }),
            prisma.exportDeclaration.findUnique({
              where: {
                companyId_periodId: {
                  companyId: company.id,
                  periodId: activePeriod.id,
                },
              },
              select: { status: true },
            }),
          ]);
          const importLate = !imp || imp.status !== "SUBMITTED";
          const exportLate = !exp || exp.status !== "SUBMITTED";
          return (importLate || exportLate) ? 1 as const : 0 as const;
        })
      );
      lateCompanies = lateCount.reduce<number>((a, b) => a + b, 0);
    }

    // Completion rate: (companies with both declarations submitted / total active onboarded) * 100
    const onboardedCount = await prisma.company.count({
      where: { isActive: true, isOnboarded: true },
    });
    const completionRate =
      onboardedCount > 0 && activePeriod
        ? Math.round(
            (Math.min(submittedImport, submittedExport) / onboardedCount) * 100
          )
        : 0;

    // Recent invitations
    const recentInvitations = await prisma.companyInvitation.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        sentBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    return apiSuccess({
      kpis: {
        totalCompanies,
        activeCompanies,
        pendingInvitations,
        submittedDeclarations,
        lateCompanies,
        completionRate,
        onboardedCompanies: onboardedCount,
      },
      activePeriod,
      recentInvitations,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
