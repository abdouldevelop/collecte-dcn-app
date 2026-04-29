import { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboardClient } from "./AdminDashboardClient";

export const metadata: Metadata = { title: "Dashboard Admin — Collecte DCN" };

export default async function AdminDashboardPage() {
  await requireAdminSession();

  const [
    totalCompanies,
    activeCompanies,
    pendingInvitations,
    totalUnits,
    recentInvitations,
    period,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.company.count({ where: { isActive: true } }),
    prisma.companyInvitation.count({ where: { status: "PENDING" } }),
    prisma.unit.count({ where: { isActive: true } }),
    prisma.companyInvitation.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { sentBy: { select: { firstName: true, lastName: true } } },
    }),
    prisma.period.findFirst({ where: { isActive: true } }),
  ]);

  let submittedImport = 0;
  let submittedExport = 0;
  let lateCompanies = 0;

  if (period) {
    [submittedImport, submittedExport] = await Promise.all([
      prisma.importDeclaration.count({ where: { periodId: period.id, status: "SUBMITTED" } }),
      prisma.exportDeclaration.count({ where: { periodId: period.id, status: "SUBMITTED" } }),
    ]);

    if (period.dueDate && new Date() > period.dueDate) {
      const notSubmittedIds = await prisma.company.findMany({
        where: { isActive: true },
        select: { id: true },
      });
      for (const c of notSubmittedIds) {
        const imp = await prisma.importDeclaration.findUnique({
          where: { companyId_periodId: { companyId: c.id, periodId: period.id } },
          select: { status: true },
        });
        if (!imp || imp.status !== "SUBMITTED") lateCompanies++;
      }
    }
  }

  const completionRate =
    activeCompanies > 0
      ? Math.round((submittedImport / activeCompanies) * 100)
      : 0;

  return (
    <AdminDashboardClient
      stats={{
        totalCompanies,
        activeCompanies,
        pendingInvitations,
        submittedImport,
        submittedExport,
        lateCompanies,
        completionRate,
        totalUnits,
      }}
      period={period ? { id: period.id, label: period.label, dueDate: period.dueDate } : null}
      recentInvitations={recentInvitations.map((inv) => ({
        id: inv.id,
        companyName: inv.companyName,
        email: inv.email,
        status: inv.status,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
        sentBy: `${inv.sentBy.firstName} ${inv.sentBy.lastName}`,
      }))}
    />
  );
}
