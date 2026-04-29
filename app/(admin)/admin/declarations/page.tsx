import { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDeclarationsClient } from "./AdminDeclarationsClient";

export const metadata: Metadata = { title: "Déclarations — Admin DCN" };

export default async function AdminDeclarationsPage() {
  await requireAdminSession();

  const period = await prisma.period.findFirst({ where: { isActive: true } });
  const periods = await prisma.period.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }] });

  const companies = await prisma.company.findMany({
    where: { isOnboarded: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

  const importDeclarations = period
    ? await prisma.importDeclaration.findMany({
        where: { periodId: period.id },
        include: {
          company: { select: { id: true, name: true, email: true } },
          _count: { select: { lines: true } },
        },
        orderBy: { company: { name: "asc" } },
      })
    : [];

  const exportDeclarations = period
    ? await prisma.exportDeclaration.findMany({
        where: { periodId: period.id },
        include: {
          company: { select: { id: true, name: true, email: true } },
          _count: { select: { lines: true } },
        },
        orderBy: { company: { name: "asc" } },
      })
    : [];

  const data = companies.map((c) => {
    const imp = importDeclarations.find((d) => d.companyId === c.id);
    const exp = exportDeclarations.find((d) => d.companyId === c.id);
    return {
      companyId: c.id,
      companyName: c.name,
      companyEmail: c.email,
      importStatus: imp?.status ?? "NOT_STARTED",
      importSubmittedAt: imp?.submittedAt ?? null,
      importLinesCount: imp?._count.lines ?? 0,
      exportStatus: exp?.status ?? "NOT_STARTED",
      exportSubmittedAt: exp?.submittedAt ?? null,
      exportLinesCount: exp?._count.lines ?? 0,
    };
  });

  return (
    <AdminDeclarationsClient
      data={data}
      periods={periods.map((p) => ({ id: p.id, label: p.label, isActive: p.isActive }))}
      activePeriodId={period?.id ?? null}
    />
  );
}
