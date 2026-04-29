import { Metadata } from "next";
import { requireCompanySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DeclarationForm } from "../DeclarationForm";

export const metadata: Metadata = { title: "Déclaration Import — Collecte DCN" };

export default async function ImportDeclarationPage() {
  const session = await requireCompanySession();

  const period = await prisma.period.findFirst({ where: { isActive: true } });
  if (!period) {
    return (
      <div className="p-8 text-center text-[#6B7280]">
        <p className="text-lg font-medium">Aucune période active</p>
        <p className="text-sm mt-2">L&apos;administration n&apos;a pas encore ouvert la période de collecte.</p>
      </div>
    );
  }

  const units = await prisma.unit.findMany({ where: { isActive: true }, orderBy: { code: "asc" } });

  const declaration = await prisma.importDeclaration.findUnique({
    where: { companyId_periodId: { companyId: session.id, periodId: period.id } },
    include: {
      lines: {
        include: {
          companyProduct: { include: { product: true } },
          unit: true,
        },
      },
    },
  });

  const companyProducts = await prisma.companyProduct.findMany({
    where: {
      companyId: session.id,
      isActive: true,
      product: { type: { in: ["IMPORT", "IMPORT_EXPORT"] } },
    },
    include: { product: true },
    orderBy: { product: { code: "asc" } },
  });

  const lines = companyProducts.map((cp) => {
    const existingLine = declaration?.lines.find((l) => l.companyProductId === cp.id);
    return {
      companyProductId: cp.id,
      productCode: cp.product.code,
      productDesignation: cp.product.designation,
      observation: cp.observation,
      priceMin: existingLine?.priceMin ? Number(existingLine.priceMin) : null,
      priceMax: existingLine?.priceMax ? Number(existingLine.priceMax) : null,
      quantity: existingLine?.quantity ? Number(existingLine.quantity) : null,
      unitId: existingLine?.unitId ?? null,
      lastModified: existingLine?.updatedAt ?? null,
    };
  });

  return (
    <DeclarationForm
      type="import"
      declarationId={declaration?.id ?? null}
      status={declaration?.status ?? "NOT_STARTED"}
      submittedAt={declaration?.submittedAt ?? null}
      period={period}
      lines={lines}
      units={units.map((u) => ({ id: u.id, code: u.code, label: u.label }))}
    />
  );
}
