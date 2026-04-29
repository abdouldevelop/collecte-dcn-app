import { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminCompaniesClient } from "./AdminCompaniesClient";

export const metadata: Metadata = { title: "Entreprises — Admin DCN" };

export default async function AdminCompaniesPage() {
  await requireAdminSession();

  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      focalPoint: { select: { firstName: true, lastName: true, email: true } },
      _count: {
        select: {
          importDeclarations: true,
          exportDeclarations: true,
          companyProducts: true,
        },
      },
    },
  });

  const period = await prisma.period.findFirst({ where: { isActive: true } });

  const companiesWithStatus = await Promise.all(
    companies.map(async (c) => {
      let importStatus = "NOT_STARTED";
      let exportStatus = "NOT_STARTED";
      if (period) {
        const [imp, exp] = await Promise.all([
          prisma.importDeclaration.findUnique({
            where: { companyId_periodId: { companyId: c.id, periodId: period.id } },
            select: { status: true },
          }),
          prisma.exportDeclaration.findUnique({
            where: { companyId_periodId: { companyId: c.id, periodId: period.id } },
            select: { status: true },
          }),
        ]);
        if (imp) importStatus = imp.status;
        if (exp) exportStatus = exp.status;
      }
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        rccm: c.rccm,
        ncc: c.ncc,
        isActive: c.isActive,
        isOnboarded: c.isOnboarded,
        createdAt: c.createdAt,
        focalPoint: c.focalPoint,
        productsCount: c._count.companyProducts,
        importStatus,
        exportStatus,
      };
    })
  );

  return <AdminCompaniesClient companies={companiesWithStatus} />;
}
