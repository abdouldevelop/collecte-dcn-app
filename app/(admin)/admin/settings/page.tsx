import { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./SettingsClient";

export const metadata: Metadata = { title: "Paramètres — Admin DCN" };

export default async function AdminSettingsPage() {
  const session = await requireAdminSession();
  if (session.role !== "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }

  const periods = await prisma.period.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: {
      _count: {
        select: { importDeclarations: true, exportDeclarations: true },
      },
    },
  });

  const [companiesCount, productsCount, unitsCount] = await Promise.all([
    prisma.company.count(),
    prisma.product.count(),
    prisma.unit.count(),
  ]);

  return (
    <SettingsClient
      session={{
        id: session.id,
        email: session.email,
        firstName: session.firstName,
        lastName: session.lastName,
        role: session.role,
      }}
      initialPeriods={periods.map((p) => ({
        id: p.id,
        year: p.year,
        month: p.month,
        label: p.label,
        isActive: p.isActive,
        dueDate: p.dueDate?.toISOString() ?? null,
        declarationsCount: p._count.importDeclarations + p._count.exportDeclarations,
      }))}
      stats={{
        companiesCount,
        productsCount,
        unitsCount,
        periodsCount: periods.length,
      }}
    />
  );
}
